import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TextInputComponent } from 'components/text-field/text-field.component';
import { SubmitButtonComponent } from 'components/submit-button/submit-button.component';
import { EquipmentCategoryService } from 'modules/setup/equipment-category/equipment-category.service';

interface Item {
  id: number;
  name: string;
}

@Component({
  selector: 'equipment-category-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    TextInputComponent,
    SubmitButtonComponent,
  ],
  template: `
    <form [formGroup]="form" class="space-y-4">
      <app-text-input label="Name" name="name" formControlName="name" />
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <app-text-input label="Code" name="code" formControlName="code" />
        <app-text-input label="Icon" name="code" formControlName="icon" />
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
export class EquipmentCategoryFormComponent {
  form: FormGroup;
  selectedItems: Item[] = [];
  isSubmitting = false;
  @Output() onSubmit = new EventEmitter<string>();

  constructor(
    private fb: FormBuilder,
    public service: EquipmentCategoryService,
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
