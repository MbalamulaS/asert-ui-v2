import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { SubmitButtonComponent } from 'components/submit-button/submit-button.component';
import { TextInputComponent } from "components/text-field/text-field.component";
import { TextPhoneInputComponent } from "components/text-field-phone/text-field.component";
import { AssessorReferenceService } from "modules/assessment/assessor-reference.service";

interface Item {
  id: number;
  name: string;
}

@Component({
  selector: 'app-assessor-reference-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    SubmitButtonComponent,
    TextInputComponent,
    TextPhoneInputComponent,

  ],
  template: `
    <form [formGroup]="form" class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
        <app-text-input
          label="Name"
          name="name"
          formControlName="name"
        />
        <app-text-input
          label="Relationship"
          name="relationship"
          formControlName="relationship"
        />
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
        <app-phone-number
          label="Phone#"
          name="phone"
          formControlName="phone"
        ></app-phone-number>
        <app-text-input
          label="Email"
          name="email"
          formControlName="email"
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
export class AssessorReferenceFormComponent {
  form: FormGroup;
  isSubmitting = false;
  @Output() onSubmit = new EventEmitter<string>();

  constructor(
    private fb: FormBuilder,
    public service: AssessorReferenceService,
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
