import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TextInputComponent } from 'components/text-field/text-field.component';
import { SubmitButtonComponent } from 'components/submit-button/submit-button.component';
import { AdminHierarchyLevelService } from 'modules/admin-hierarchy/hierarchy-level/admin-hierarchy-level.service';
import { SelectComponent } from 'components/select/select.component';

export type Position = {
  id: number;
  name: string;
};

@Component({
  selector: 'admin-hierarchy-level-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TextInputComponent,
    SubmitButtonComponent,
    SelectComponent,
  ],
  template: `
    <form [formGroup]="form" class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <app-text-input label="Name" name="name" formControlName="name" />
        <app-text-input label="Code" name="code" formControlName="code" />
      </div>

      <app-select
        label="Select Position"
        formControlName="position"
        [options]="positions"
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
export class AdminHierarchyLevelFormComponent {
  form: FormGroup;
  isSubmitting = false;
  @Output() onSubmit = new EventEmitter<string>();
  @Input() positions: Position[];

  constructor(
    private fb: FormBuilder,
    public levelService: AdminHierarchyLevelService,
  ) {
    this.form = this.levelService.form;
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
