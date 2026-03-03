import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TextInputComponent } from 'components/text-field/text-field.component';
import { FacilityTypeService } from '../facility-type.service';
import { SubmitButtonComponent } from 'components/submit-button/submit-button.component';

interface Item {
  id: number;
  name: string;
  code: string;
}

@Component({
  selector: 'facility-type-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    TextInputComponent,
    SubmitButtonComponent,
  ],
  template: `
    <form [formGroup]="form" (ngSubmit)="onFormSubmit($event)">
      <div class="grid grid-cols-1 gap-x-4 gap-y-2">
        <app-text-input
          label="Facility Type Name"
          name="name"
          formControlName="name"
        />

        <app-text-input
          label="Facility Type Code"
          name="code"
          formControlName="code"
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
export class FacilityTypeFormComponent {
  form: FormGroup;
  selectedItems: Item[] = [];
  isSubmitting = false;
  @Output() onSubmit = new EventEmitter<string>();

  constructor(
    private fb: FormBuilder,
    public facilityTypeService: FacilityTypeService,
  ) {
    this.form = this.facilityTypeService.form;
  }

  onFormSubmit(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.submitForm();
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
