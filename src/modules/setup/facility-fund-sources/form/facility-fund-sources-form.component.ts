import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TextInputComponent } from 'components/text-field/text-field.component';
import { FacilityFundSource } from '../facility-fund-sources';
import { FacilityFundSourcesService } from '../facility-fund-sources.service';
import { SubmitButtonComponent } from 'components/submit-button/submit-button.component';

@Component({
  selector: 'app-facility-fund-sources-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    TextInputComponent,
    SubmitButtonComponent,
  ],
  template: `
    <form [formGroup]="form" class="space-y-4">
      <div class="grid grid-cols-1 gap-x-4 gap-y-2">
        <app-text-input label="Name" name="name" formControlName="name" />

        <app-text-input label="Code" name="code" formControlName="code" />
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
export class FacilityFundSourcesFormComponent {
  form: FormGroup;
  isSubmitting = false;
  @Output() onSubmit = new EventEmitter<FacilityFundSource>();

  constructor(
    private fb: FormBuilder,
    public facilityFundSourceservice: FacilityFundSourcesService,
  ) {
    this.form = this.facilityFundSourceservice.formGroup;
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
