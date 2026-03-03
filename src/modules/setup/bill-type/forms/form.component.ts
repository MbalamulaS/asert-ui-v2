import { Component, EventEmitter, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TextInputComponent } from 'components/text-field/text-field.component';
import { BillTypeService } from '../bill-type.service';
import { SubmitButtonComponent } from 'components/submit-button/submit-button.component';
import { DatepickerComponent } from 'components/datepicker/datepicker.component';
import { CheckboxComponent } from 'components/checkbox/checkbox.component';
import { BillType } from 'modules/setup/bill-type/bill-type';
import { AutocompleteComponent } from 'components/autocomplete/autocomplete.component';
import { TextAreaComponent } from 'components/text-area/text-area.component';

@Component({
  selector: 'app-bill-type-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    TextInputComponent,
    SubmitButtonComponent,
    DatepickerComponent,
    CheckboxComponent,
    AutocompleteComponent,
    TextAreaComponent,
  ],
  template: `
    <form [formGroup]="form" (ngSubmit)="onFormSubmit($event)">
      <div class="grid grid-cols-1 gap-x-4 gap-y-2">
        <app-text-input label="Name" name="name" formControlName="name" />
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
        <app-text-input label="Code" name="code" formControlName="code" />
        <app-text-input
          label="Rate"
          name="rate"
          type="number"
          formControlName="rate"
        />
        <app-datepicker
          [form]="form"
          formControlName="expirationDate"
          label="Expiration Date"
          name="expirationDate"
        />
        <app-datepicker
          [form]="form"
          formControlName="effectiveDate"
          label="Effective Date"
          name="effectiveDate"
        />
      </div>
      <div class="grid grid-cols-1 gap-x-4 gap-y-2">
        <app-autocomplete
          label="Select Status"
          name="status"
          formControlName="status"
          [displayLabel]="'name'"
          [options]="statusList"
        />
      </div>
      <div class="grid grid-cols-1 gap-x-4 gap-y-2">
        <app-text-area
          label="Description"
          name="description"
          [form]="form"
          [rows]="2"
          formControlName="description"
        />
        <app-checkbox
          formControlName="isPartial"
          label="Is Partial"
          name="isPartial"
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

      <!--<pre>{{ form.value|json }}</pre>-->
    </form>
  `,
})
export class FormComponent {
  form: FormGroup;
  selectedItems: BillType[] = [];
  isSubmitting = false;
  @Output() onSubmit = new EventEmitter<string>();
  statusList: any[] = [
    { name: 'ACTIVE', id: 'ACTIVE' },
    { name: 'INACTIVE', id: 'INACTIVE' },
    { name: 'DEPRECATED', id: 'DEPRECATED' },
  ];

  constructor(
    public service: BillTypeService,
    private datePipe: DatePipe,
  ) {
    this.form = this.service.form;
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
      formData.effectiveDate = this.datePipe.transform(
        formData.effectiveDate,
        'yyyy-MM-dd',
      );
      formData.expirationDate = this.datePipe.transform(
        formData.expirationDate,
        'yyyy-MM-dd',
      );
      this.onSubmit.emit(formData);
    } catch (error) {
    } finally {
      this.isSubmitting = false;
    }
  }
}
