import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TextInputComponent } from 'components/text-field/text-field.component';
import { SubmitButtonComponent } from 'components/submit-button/submit-button.component';
import { FinancialYearService } from '../financial-year.service';
import { DatepickerComponent } from 'components/datepicker/datepicker.component';
import { CheckboxComponent } from 'components/checkbox/checkbox.component';

interface Item {
  id: number;
  name: string;
}

@Component({
  selector: 'financial-year-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    TextInputComponent,
    SubmitButtonComponent,
    DatepickerComponent,
    CheckboxComponent,
  ],
  template: `
    <form [formGroup]="form" class="space-y-4">
      <app-text-input
        label="Financial Year Name"
        name="name"
        formControlName="name"
      />

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <app-datepicker
          label="Start Date"
          name="startDate"
          formControlName="startDate"
        />
        <app-datepicker
          label="End Date"
          name="endDate"
          formControlName="endDate"
        />
      </div>
      <div class="grid grid-cols-1">
        <app-checkbox
          formControlName="isCurrent"
          label="This is the current financial year"
          name="isCurrent"
        />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4"></div>

      <div class="mt-4 flex justify-end">
        <submit-button
          [isDisabled]="!form.dirty || form.invalid || isSubmitting"
          [isSubmitting]="isSubmitting"
          [buttonText]="form.get('id')?.value ? 'UPDATE' : 'CREATE'"
          (action)="submitForm()"
        />
      </div>
      <!--<pre>{{ form.value | json }}</pre>-->
    </form>
  `,
})
export class FinancialYearFormComponent {
  form: FormGroup;
  selectedItems: Item[] = [];
  isSubmitting = false;
  @Output() onSubmit = new EventEmitter<string>();

  constructor(
    private fb: FormBuilder,
    public service: FinancialYearService,
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

  handleOptionSelected(event: any) {
    this.selectedItems = event;
  }

  onSelectionChanged(selectedItems: any[]): void {
    this.selectedItems = selectedItems;
  }
}
