import {Component, EventEmitter, Output} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {MatFormFieldModule} from '@angular/material/form-field';
import {SubmitButtonComponent} from 'components/submit-button/submit-button.component';
import {AssessorEducationBackgroundService} from "modules/assessment/assessor-education-background.service";
import {DatepickerComponent} from "components/datepicker/datepicker.component";
import {CheckboxComponent} from "components/checkbox/checkbox.component";
import {TextInputComponent} from "components/text-field/text-field.component";
import {AutocompleteComponent} from "components/autocomplete/autocomplete.component";
import {FetcherComponent} from "components/fetcher/fetcher.component";

interface Item {
  id: number;
  name: string;
}

@Component({
  selector: 'app-assessor-education-background-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    SubmitButtonComponent,
    DatepickerComponent,
    CheckboxComponent,
    TextInputComponent,
    AutocompleteComponent,
    FetcherComponent,
  ],
  template: `
    <form [formGroup]="form" class="space-y-4">
      <app-fetcher
        api="education-levels"
        [defaultParams]="{ size: '100' }"
        loadingLabel="Fetching Education Levels.."
      >
        <ng-template let-response>
          <div *ngIf="response; else noData">
            <app-autocomplete
              label="Select Education Level"
              formControlName="educationLevelId"
              [displayLabel]="'name'"
              [options]="response.data"
            />
          </div>
          <ng-template #noData>No data available</ng-template>
        </ng-template>
      </app-fetcher>
      <app-text-input
        label="Institution"
        name="institution"
        formControlName="institution"
      />

      <app-text-input
        label="Course"
        name="course"
        formControlName="course"
      />

      <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
        <app-datepicker
          [form]="form"
          formControlName="fromDate"
          label="From"
          name="fromDate"
        ></app-datepicker>
        <app-datepicker
          [form]="form"
          formControlName="toDate"
          label="To"
          name="toDate"
        ></app-datepicker>
      </div>
      <app-checkbox
        formControlName="graduated"
        label="Gradudated"
        name="Gradudated"
      ></app-checkbox>
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
export class AssessorEducationBackgroundFormComponent {
  form: FormGroup;
  isSubmitting = false;
  @Output() onSubmit = new EventEmitter<string>();

  constructor(
    private fb: FormBuilder,
    public service: AssessorEducationBackgroundService,
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
