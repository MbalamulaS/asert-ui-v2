import {Component, EventEmitter, Output} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {MatFormFieldModule} from '@angular/material/form-field';
import {SubmitButtonComponent} from 'components/submit-button/submit-button.component';
import {DatepickerComponent} from "components/datepicker/datepicker.component";
import {TextInputComponent} from "components/text-field/text-field.component";
import {AssessorEmploymentHistoryService} from "modules/assessment/assessor-employment-history.service";

interface Item {
  id: number;
  name: string;
}

@Component({
  selector: 'app-assessor-employment-history-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    SubmitButtonComponent,
    DatepickerComponent,
    TextInputComponent,

  ],
  template: `
    <form [formGroup]="form" class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
        <app-text-input
          label="Company"
          name="company"
          formControlName="company"
        />

        <app-text-input
          label="Position Held"
          name="positionHeld"
          formControlName="positionHeld"
        />
      </div>

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
export class AssessorEmploymentHistoryFormComponent {
  form: FormGroup;
  isSubmitting = false;
  @Output() onSubmit = new EventEmitter<string>();

  constructor(
    private fb: FormBuilder,
    public service: AssessorEmploymentHistoryService,
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
