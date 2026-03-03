import { Component, EventEmitter, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TextInputComponent } from 'components/text-field/text-field.component';
import { SubmitButtonComponent } from 'components/submit-button/submit-button.component';
import { CompanyType } from '../company-type';
import { CompanyTypeService } from '../company-type.service';
import { SelectComponent } from "../../../../components/select/select.component";



@Component({
  selector: 'app-company-type-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    TextInputComponent,
    SubmitButtonComponent,
    SelectComponent
],
  template: `
    <form [formGroup]="form" class="space-y-4">
      <app-text-input label="Name" name="name" formControlName="name" />
      <app-text-input label="Code" name="code" formControlName="code" />
      <app-select
        label="Is Active"
        name="isActive"
        formControlName="isActive"
        [options]="activeOptions"
      />
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
  selectedItems: CompanyType[] = [];
  isSubmitting = false;
  @Output() onSubmit = new EventEmitter<string>();

  activeOptions = [
    { id: 'true', name: 'Yes' },
    { id: 'false', name: 'No' },
  ];

  constructor(public service: CompanyTypeService) {
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
