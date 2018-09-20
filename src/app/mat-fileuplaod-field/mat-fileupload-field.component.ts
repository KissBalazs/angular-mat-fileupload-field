import {Component, ElementRef, HostBinding, HostListener, Input, OnDestroy, OnInit, Optional, Self, ViewChild} from '@angular/core';
import {MatFormFieldControl} from '@angular/material';
import {Subject} from 'rxjs';
import {ControlValueAccessor, FormBuilder, NgControl} from '@angular/forms';
import {FocusMonitor} from '@angular/cdk/a11y';
import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {MyFileListInput} from './my-file-list.input';

/**
 * Upload view segment for uploading files for a form.
 * This works with formGroup!
 *
 * @example
 *  <mat-form-field>
 *               <mat-fileupload-field formControlName="files"></mat-fileupload-field>
 *  </mat-form-field>
 */
@Component({
  selector: 'mat-fileupload-field',
  templateUrl: './mat-fileupload-field.component.html',
  styleUrls: ['./mat-fileupload-field.component.css'],
  providers: [
    {
      provide: MatFormFieldControl,
      useExisting: MatFileuploadFieldComponent
    },
  ],
})
export class MatFileuploadFieldComponent implements ControlValueAccessor, OnInit, OnDestroy, MatFormFieldControl<MyFileListInput> {
  static nextId = 0;

  @Input() singleFileMode = false;

  /**
   * A hidden <input type="file" ...> field, that we use to trigger the file browsing
   */
  @ViewChild('fileInputElement') fileInputElement;

  /**
   * Local file object store. We use the MyFileListInput to wrap it outside this class.
   * @type {Set<any>}
   */
  public files: Set<File> = new Set();

  /**
   * MatFormField required object: tell the parent to run changeDetection
   * @type {Subject<void>}
   */
  stateChanges = new Subject<void>();

  /**
   * formControl required object: tell the controlGroup, that data is refreshed (so poll it)
   */
  _onChange: (_: any) => void;

  /**
   * MatFormField must have: custom ID generation
   * @type {number}
   */
  @HostBinding() id = `app-file-upload-area${MatFileuploadFieldComponent.nextId++}`;

  /**
   * MatFormField (required) self-explaining attributes
   */
  readonly autofilled: boolean;
  readonly placeholder: string;
  private _disabled = false;
  focused = false;
  errorState = false;
  controlType = 'app-file-upload-area';

  /**
   * If this component is registered in a formComponent, the _onChange value is overwritten.
   * If not used in a formComponent (not controlled with a formControlName to be precise) then we need to know that.
   * @type {boolean}
   */
  onChangeIsRegistered = false;

  @HostBinding('attr.aria-describedby') describedBy = '';
  private _required = false;

  /**
   * Value setter and getter
   *
   * We need to implement stateChanges (Material) and call the formControl callback on change as well.
   * @returns {Set<File>}
   */
  @Input()
  get value() {
    // return this.files;
    return new MyFileListInput(this.files);
  }

  set value(val: MyFileListInput) {
    this.files = val.files;

    this.stateChanges.next();
    if (this.onChangeIsRegistered) {
      this._onChange(this.files);
    }
  }

  /**
   * Return empty for Material
   * @returns {boolean}
   */
  get empty() {
    return (this.files.size < 1);
  }

  /**
   * The Material "floating label" effect, we do not really use this.
   * @returns {boolean}
   */
  @HostBinding('class.floating')
  get shouldLabelFloat() {
    return this.focused || !this.empty;
  }

  @Input()
  get required() {
    return this._required;
  }

  set required(req) {
    this._required = coerceBooleanProperty(req);
    this.stateChanges.next();
  }

  @Input()
  get disabled() {
    return this._disabled;
  }

  set disabled(dis) {
    this._disabled = coerceBooleanProperty(dis);
    this.stateChanges.next();
  }

  setDescribedByIds(ids: string[]) {
    this.describedBy = ids.join(' ');
  }

  onContainerClick(event: MouseEvent) {
  }

  /**
   * Here is the constructor, with the ngControl value accessor manual providing. (read the guide for more)
   * @param {NgControl} ngControl
   * @param {FormBuilder} fb
   * @param {FocusMonitor} fm
   * @param {ElementRef} elRef
   */
  constructor(@Optional() @Self() public ngControl: NgControl,
              fb: FormBuilder, private fm: FocusMonitor, private elRef: ElementRef) {
    fm.monitor(elRef.nativeElement, true).subscribe(origin => {
      this.focused = !!origin;
      this.stateChanges.next();
    });

    // // Setting the value accessor directly (instead of using
    // // the providers) to avoid running into a circular import.
    if (this.ngControl != null) {
      this.ngControl.valueAccessor = this;
    }
  }

  ngOnInit() {
  }

  /**
   * Gets called when the user adds files to the input field.
   * We also trigger change detection here.
   */
  onFilesAdded() {
    console.log('adding natvie files');
    const files: { [key: string]: File } = this.fileInputElement.nativeElement.files;

    if (this.singleFileMode) {
      this.files.clear();
    }

    for (const key in files) {
      if (!isNaN(parseInt(key, 10))) {
        this.files.add(files[key]);
      }
    }
    this.stateChanges.next();
    if (this.onChangeIsRegistered) {
      this._onChange(this.files);
    }
  }

  /**
   * The real input is hidden: this button click calls it.
   */
  addFiles() {
    this.fileInputElement.nativeElement.click();
  }

  /**
   * Users can remove files via their chip X icons.
   * Triggering Change detection too
   * @param file
   */
  removeFile(file): void {
    const index = this.files.delete(file);
    this.stateChanges.next();
    if (this.onChangeIsRegistered) {
      this._onChange(this.files);
    }
  }

  ngOnDestroy() {
    this.stateChanges.complete();
    this.fm.stopMonitoring(this.elRef.nativeElement);
  }


  /**
   * Some must-have functions for formControl .
   * @param {(_: any) => void} fn
   */
  registerOnChange(fn: (_: any) => void): void {
    this._onChange = fn;
    this.onChangeIsRegistered = true;
  }

  registerOnTouched(fn: any): void {
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  writeValue(obj: any): void {
  }

  /**
   *   drag and drop functions
   */
  buttonBackground = ButtonColors.basicColor;
  fileAreaBackground = BackgroundColors.basicColor;
  currentHoverStatus = HoverStatus.noHoverPresent;
  buttonLabel = 'Upload file';

  @HostListener('dragover', ['$event'])
  onDragOver(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    if (this.currentHoverStatus !== HoverStatus.hoveringOverButton) {
      this.currentHoverStatus = HoverStatus.hoveringOverButton;
      this.buttonBackground = ButtonColors.highlightColor;
      this.fileAreaBackground = BackgroundColors.highlightColor;
    }
  }

  @HostListener('dragleave', ['$event'])
  public onDragLeave(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    this.currentHoverStatus = HoverStatus.noHoverPresent;
    this.buttonBackground = ButtonColors.basicColor;
    this.fileAreaBackground = BackgroundColors.basicColor;
    this.buttonLabel = 'idp.fileLookup';
  }

  @HostListener('drop', ['$event'])
  public onDrop(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    this.currentHoverStatus = HoverStatus.noHoverPresent;
    this.buttonBackground = ButtonColors.basicColor;
    this.fileAreaBackground = BackgroundColors.basicColor;
    this.buttonLabel = 'idp.fileLookup';

    const files = evt.dataTransfer.files;

    if (files.length > 0) {
      for (const key in files) {
        if (!isNaN(parseInt(key, 10))) {
          if (this.singleFileMode) {
            this.files.clear();
          }
          this.files.add(files[key]);
        }
      }
    }
  }
}

export enum ButtonColors {
  basicColor = '#3f51b5',
  highlightColor = '#5269f5'
}

export enum BackgroundColors {
  basicColor = '#ffffff',
  highlightColor = '#5269f5',
}

export enum HoverStatus {
  hoveringOverButton,
  noHoverPresent
}
