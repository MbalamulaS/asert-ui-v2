import { Component, EventEmitter, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TextInputComponent } from 'components/text-field/text-field.component';
import { SubmitButtonComponent } from 'components/submit-button/submit-button.component';
import { Visitor } from '../visitor';
import { VisitorService } from '../visitor.service';
import { AutocompleteComponent } from 'components/autocomplete/autocomplete.component';
import { CountryService } from 'modules/setup/country/country.service';
import { IdentificationTypeService } from 'modules/setup/identification-type/identification-type.service';
import { SelectComponent } from 'components/select/select.component';
import { DatepickerComponent } from 'components/datepicker/datepicker.component';
import { FetcherComponent } from 'components/fetcher/fetcher.component';

@Component({
  selector: 'app-visitor-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    TextInputComponent,
    SubmitButtonComponent,
    AutocompleteComponent,
    SelectComponent,
    DatepickerComponent,
    FetcherComponent,
  ],
  template: `
    <form [formGroup]="form" class="space-y-4">
      <div>
        <app-text-input
          label="Full Name"
          name="fullName"
          formControlName="fullName"
        />
      </div>
      <div class="flex md:flex-row flex-col md:gap-x-4">
        <app-fetcher
          class="flex-1"
          api="countries"
          [defaultParams]="{ size: 20 }"
          loadingLabel="Fetching Country.."
        >
          <ng-template let-response>
            <div *ngIf="response; else noData">
              <app-autocomplete
                [form]="form"
                name="countryId"
                formControlName="countryId"
                label="Select Country"
                [displayLabel]="'name'"
                [options]="response.data"
              ></app-autocomplete>
            </div>
            <ng-template #noData>No data available</ng-template>
          </ng-template>
        </app-fetcher>
        <app-fetcher
          class="flex-1"
          api="identification-types"
          [defaultParams]="{ size: 20 }"
          loadingLabel="Fetching Identification type.."
        >
          <ng-template let-response>
            <div *ngIf="response; else noData">
              <app-autocomplete
                [form]="form"
                name="identificationTypeId"
                formControlName="identificationTypeId"
                label="Select Identification type"
                [displayLabel]="'name'"
                [options]="response.data"
              ></app-autocomplete>
            </div>
            <ng-template #noData>No data available</ng-template>
          </ng-template>
        </app-fetcher>
      </div>
      <div class="flex md:flex-row flex-col md:gap-x-4">
        <app-text-input
          class="flex-1"
          label="ID number"
          name="idNumber"
          formControlName="idNumber"
        />
        <app-select
          class="flex-1"
          label="Gender"
          formControlName="gender"
          [options]="genders"
        />
      </div>
      <div class="flex md:flex-row flex-col md:gap-x-4">
        <app-text-input
          class="flex-1"
          label="Mobile number"
          name="mobileNumber"
          formControlName="mobileNumber"
        />
        <app-datepicker
          [form]="form"
          class="flex-1"
          label="Date of birth"
          name="dateOfBirth"
        />
      </div>
      <div class="flex md:flex-row flex-col md:gap-x-4">
        <app-text-input
          class="flex-1"
          label="Place of birth"
          name="placeOfBirth"
          formControlName="placeOfBirth"
        />
        <app-text-input
          class="flex-1"
          label="Permanent physical address"
          name="permanentPhysicalAddress"
          formControlName="permanentPhysicalAddress"
        />
      </div>
      <div class="mt-4 flex justify-end">
        <submit-button
          [isDisabled]="!form.dirty || form.invalid || isSubmitting"
          [isSubmitting]="isSubmitting"
          [buttonText]="form.get('id')?.value ? 'UPDATE' : 'CREATE'"
          (action)="submitForm()"
        />
      </div>
    </form>
  `,
})
export class FormComponent {
  form: FormGroup;
  selectedItems: Visitor[] = [];
  isSubmitting = false;
  genders = [
    { id: 'M', name: 'Male' },
    { id: 'F', name: 'Female' },
  ];
  @Output() onSubmit = new EventEmitter<string>();

  constructor(
    public service: VisitorService,
    public countryService: CountryService,
    public identificationTypeService: IdentificationTypeService,
  ) {
    this.form = this.service.form;
  }

  async submitForm() {
    if (this.form.invalid) {
      return;
    }

    this.isSubmitting = true;

    try {
      const formData = this.form.value;
      this.onSubmit.emit(formData);
    } catch (error) {
    } finally {
      this.isSubmitting = false;
    }
  }
}
