import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TextInputComponent } from 'components/text-field/text-field.component';
import { SubmitButtonComponent } from 'components/submit-button/submit-button.component';
import { FacilityLevelGroupService } from 'modules/setup/facility-level-group/facility-level-group.service';

@Component({
  selector: 'app-facility-level-group-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TextInputComponent,
    SubmitButtonComponent,
  ],
  template: `
    <form [formGroup]="form" class="space-y-4">
      <div class="grid grid-cols-1 gap-x-4 gap-y-2">
        <app-text-input label="Name" name="name" formControlName="name"/>

        <app-text-input label="Code" name="code" formControlName="code"/>
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
export class FormComponent {
  form: FormGroup;
  isSubmitting = false;
  @Output() onSubmit = new EventEmitter<any>();

  constructor(
    private fb: FormBuilder,
    public facilityLevelGroupService: FacilityLevelGroupService
  ) {
    this.form = this.facilityLevelGroupService.formGroup;
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
}
