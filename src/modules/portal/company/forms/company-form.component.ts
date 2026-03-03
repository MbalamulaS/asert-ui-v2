import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TextInputComponent } from 'components/text-field/text-field.component';
import { SubmitButtonComponent } from 'components/submit-button/submit-button.component';
import { RadioButtonComponent } from 'components/radio/radio.component';
import { FetcherComponent } from 'components/fetcher/fetcher.component';
import { CompanyService } from '../services/company.service';
import { SelectComponent } from 'components/select/select.component';
import { AuthService } from 'services/auth.service';

@Component({
  selector: 'company-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    TextInputComponent,
    SubmitButtonComponent,
    RadioButtonComponent,
    FetcherComponent,
    SelectComponent,
  ],
  template: `
    <form [formGroup]="form" class="space-y-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4">
        <app-text-input
          label="Company Name"
          name="name"
          formControlName="name"
        />
        <app-text-input label="Email" name="email" formControlName="email" />

        <app-fetcher
          api="company-types"
          [defaultParams]="{ size: '100' }"
          loadingLabel="Fetching Company Types.."
        >
          <ng-template let-response>
            <div *ngIf="response; else noData">
              <app-select
                label="Select Company Type"
                formControlName="companyTypeId"
                [options]="response.data"
                (onOptionSelected)="handleOptionSelected($event)"
              />
            </div>
            <ng-template #noData>No data available</ng-template>
          </ng-template>
        </app-fetcher>

        <app-text-input
          label="Certificate Registration Number"
          name="certificateRegistrationNumber"
          formControlName="certificateRegistrationNumber"
        />
        <app-text-input
          label="Trading Name"
          name="tradingName"
          formControlName="tradingName"
        />
        <app-text-input label="TIN" name="tin" formControlName="tin" />

        <app-radio-button
          label="Is Active?"
          name="isActive"
          formControlName="isActive"
          [options]="activeOptions"
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
export class CompanyFormComponent implements OnInit {
  form: FormGroup;
  isSubmitting = false;
  currentUser: any;

  activeOptions = [
    { value: true, label: 'Yes' },
    { value: false, label: 'No' },
  ];

  deletedOptions = [
    { id: true, name: 'Yes' },
    { id: false, name: 'No' },
  ];

  @Output() onSubmit = new EventEmitter<string>();

  constructor(
    private fb: FormBuilder,
    public companyService: CompanyService,
    private authService: AuthService,
  ) {
    this.form = this.companyService.form;
  }

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    console.log('current user', user);
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
