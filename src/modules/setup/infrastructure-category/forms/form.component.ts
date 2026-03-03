import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TextInputComponent } from 'components/text-field/text-field.component';
import { SubmitButtonComponent } from 'components/submit-button/submit-button.component';
import { InfrastructureCategory } from 'modules/setup/infrastructure-category/infrastructure-category';
import { InfrastructureCategoryService } from 'modules/setup/infrastructure-category/infrastructure-category.service';

@Component({
  selector: 'app-infrastructure-category-form',
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
      <app-text-input label="Code" name="code" formControlName="code" />

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
  selectedItems: InfrastructureCategory[] = [];
  isSubmitting = false;
  @Output() onSubmit = new EventEmitter<string>();

  constructor(
    private fb: FormBuilder,
    public categoryService: InfrastructureCategoryService,
  ) {
    this.form = this.categoryService.form;
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
