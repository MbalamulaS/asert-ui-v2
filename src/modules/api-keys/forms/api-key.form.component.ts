import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatChipsModule } from '@angular/material/chips';
import { SubmitButtonComponent } from 'components/submit-button/submit-button.component';
import { TextInputComponent } from 'components/text-field/text-field.component';
import { ApiKeyService } from '../api-key.service';

@Component({
  selector: 'api-key-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TextInputComponent,
    SubmitButtonComponent,
    MatChipsModule,
  ],
  template: `
    <form [formGroup]="form" class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <app-text-input
          label="System Name"
          name="systemName"
          formControlName="systemName"
        />

        <app-text-input
          label="Contact Email"
          name="contactEmail"
          formControlName="contactEmail"
          type="email"
        />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 md:gap-4">
        <app-text-input
          label="Description"
          name="description"
          formControlName="description"
        />
        <app-text-input
          formControlName="systemIp"
          label="IP Address"
          name="systemIp"
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
      <!--<pre>{{ form.value | json }}</pre>-->
      <!--<pre>{{ service.getFormErrors() | json }}</pre>-->
    </form>
  `,
})
export class ApiKeyFormComponent implements OnInit {
  form: FormGroup;
  isSubmitting = false;
  @Output() onSubmit = new EventEmitter<string>();

  constructor(public service: ApiKeyService) {
    this.form = this.service.form;
  }

  ngOnInit(): void {}

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

  displayCurrentLocation(type: string, name: string): string {
    return `${type}: ${name}`;
  }

  handleUploadSuccess(data: any) {
    console.log('Uploaded files:', data);
  }
}
