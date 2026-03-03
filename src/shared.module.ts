import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { TableComponent } from 'components/table/table.component';
import { FlatTableComponent } from 'components/table/flat-table.component';
import { AutocompleteComponent } from 'components/autocomplete/autocomplete.component';
import { SelectComponent } from 'components/select/select.component';
import { DialogComponent } from 'components/dialog/dialog.component';
import { TextInputComponent } from 'components/text-field/text-field.component';
import { ContainerComponent } from 'components/container/container.component';
import { WrapperComponent } from 'components/wrapper/wrapper.component';
import { ConfirmDialogComponent } from 'components/confirm/confirm.dialog';
import { DualMultiSelectComponent } from 'components/dual-multiselect/dual-multiselect.component';
import { FetcherComponent } from 'components/fetcher/fetcher.component';
import { HeaderComponent } from 'components/header/header.component';
import { IconButtonComponent } from 'components/icon-button/icon-button.component';
import { RadioButtonComponent } from 'components/radio/radio.component';
import { SearchComponent } from 'components/search/search.component';
import { SubmitButtonComponent } from 'components/submit-button/submit-button.component';

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatMomentDateModule,
    FormsModule,
    ReactiveFormsModule,
    NgFor,
    NgIf,
    TableComponent,
    FlatTableComponent,
    AutocompleteComponent,
    SelectComponent,
    DialogComponent,
    TextInputComponent,
    ContainerComponent,
    WrapperComponent,
    ConfirmDialogComponent,
    DualMultiSelectComponent,
    FetcherComponent,
    HeaderComponent,
    IconButtonComponent,
    RadioButtonComponent,
    SearchComponent,
    SubmitButtonComponent,
  ],
  providers: [],
})
export class SharedModule {}
