import {Component, EventEmitter, Output} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {MatFormFieldModule} from '@angular/material/form-field';
import {SubmitButtonComponent} from 'components/submit-button/submit-button.component';
import {DatepickerComponent} from "components/datepicker/datepicker.component";
import {TextInputComponent} from "components/text-field/text-field.component";
import {AssessorCertificationService} from "modules/assessment/assessor-certification.service";
import {TextAreaComponent} from "components/text-area/text-area.component";

@Component({
  selector: 'app-assessor-certification-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    SubmitButtonComponent,
    DatepickerComponent,
    TextInputComponent,
    TextAreaComponent,

  ],
  template: `
    <form [formGroup]="form" class="space-y-4">
      <app-text-input
        label="Title/Course"
        name="title"
        formControlName="title"
      />

      <app-text-input
        label="Issuer"
        name="issuer"
        formControlName="issuer"
      />

      <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
        <app-datepicker
          [form]="form"
          formControlName="issueDate"
          label="Issue Date"
          name="issueDate"
        ></app-datepicker>
        <app-datepicker
          [form]="form"
          formControlName="expiryDate"
          label="Expiry Date"
          name="expiryDate"
        ></app-datepicker>
      </div>
      <app-text-area
        label="Description"
        name="description"
        formControlName="description"
      />
      <!--<pre>{{ form.value | json }}</pre>-->
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
export class AssessorCertificationFormComponent {
  form: FormGroup;
  isSubmitting = false;
  @Output() onSubmit = new EventEmitter<string>();

  constructor(
    private fb: FormBuilder,
    public service: AssessorCertificationService,
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

  protected readonly JSON = JSON;
}
