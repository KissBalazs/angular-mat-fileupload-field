import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import {MatFileuploadFieldComponent} from './mat-fileupload-field/mat-fileupload-field.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatButtonModule, MatCardModule, MatChipsModule, MatIconModule,  MatFormFieldModule} from '@angular/material';

export const MATERIAL_COMPONENTS = [MatButtonModule, MatCardModule, MatChipsModule, MatIconModule,
  MatFormFieldModule];

@NgModule({
  declarations: [
    AppComponent, MatFileuploadFieldComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MATERIAL_COMPONENTS,
    MatFormFieldModule
  ],
  providers: [MatFileuploadFieldComponent],
  bootstrap: [AppComponent]
})
export class AppModule { }
