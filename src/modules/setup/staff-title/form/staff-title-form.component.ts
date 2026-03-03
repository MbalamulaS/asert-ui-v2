import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TextInputComponent } from 'components/text-field/text-field.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RadioButtonComponent } from 'components/radio/radio.component';
import { StaffTitleService } from '../staff-title.service';

interface Item {
  id: number;
  name: string;
  code: string;
}

interface Option {
  id: string | number | boolean;
  name: string;
  [key: string]: any;
}

@Component({
  selector: 'staff-title-form',
  standalone: true,
  template: `
    <form [formGroup]="form">
      <div class="flex flex-col">
        <app-text-input
          label="Staff Title Name"
          name="name"
          formControlName="name"
        />

        <app-text-input
          label="Staff Title Code"
          name="code"
          formControlName="code"
        />

        <app-radio-button
          label="Is a medical Staff :  "
          name="isMedicalStaff"
          formControlName="isMedicalStaff"
          [options]="options"
        />

        <div class="mt-4 flex flex-row justify-between">
          <div></div>
          <button
            mat-raised-button
            color="primary"
            type="button"
            [disabled]="!form.dirty || form.invalid || isSubmitting"
            (click)="submitForm()"
          >
            <mat-spinner *ngIf="isSubmitting" diameter="20"></mat-spinner>
            <span *ngIf="!isSubmitting">
              {{ form.get('id')?.value ? 'UPDATE' : 'CREATE' }}
            </span>
          </button>
        </div>
      </div>
    </form>
  `,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    TextInputComponent,
    MatProgressSpinnerModule,
    RadioButtonComponent,
  ],
})
export class StaffTitleFormComponent {
  form: FormGroup;
  selectedItems: Item[] = [];
  isSubmitting = false;
  @Output() onSubmit = new EventEmitter<string>();
  options: any[] = [];

  constructor(
    private fb: FormBuilder,
    public staffTitleService: StaffTitleService,
  ) {
    this.form = this.staffTitleService.form;
    this.options = [
      { value: true, label: 'Yes' },
      { value: false, label: 'No' },
    ];
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

  handleOptionSelected(event: any) {}

  onSelectionChanged(selectedItems: any[]): void {
    this.selectedItems = selectedItems;
  }
}
