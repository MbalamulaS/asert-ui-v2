import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TextInputComponent } from 'components/text-field/text-field.component';
import { FetcherComponent } from 'components/fetcher/fetcher.component';
import { SubmitButtonComponent } from 'components/submit-button/submit-button.component';
import { AutocompleteComponent } from 'components/autocomplete/autocomplete.component';
import { FacilityOwnershipAuthority } from 'modules/setup/facility-ownership-authority/facility-ownership-authority';
import { FacilityOwnershipAuthorityService } from 'modules/setup/facility-ownership-authority/facility-ownership-authority.service';

@Component({
  selector: 'app-facility-ownership-authority-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    TextInputComponent,
    FetcherComponent,
    SubmitButtonComponent,
    AutocompleteComponent,
  ],
  template: `
    <form [formGroup]="form" class="space-y-4">
      <app-text-input label="Name" name="name" formControlName="name"/>
      <app-text-input label="Code" name="code" formControlName="code"/>
      <app-fetcher
        api="facility-ownership-categories"
        [defaultParams]="{ size: '100' }"
        loadingLabel="Fetching Categories.."
      >
        <ng-template let-response>
          <div *ngIf="response; else noData">
            <app-autocomplete
              label="Select Category"
              formControlName="categoryId"
              [displayLabel]="'name'"
              [options]="response.data"
            />
          </div>
          <ng-template #noData>No data available</ng-template>
        </ng-template>
      </app-fetcher>
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
  selectedItems: FacilityOwnershipAuthority[] = [];
  isSubmitting = false;
  @Output() onSubmit = new EventEmitter<string>();

  constructor(
    private fb: FormBuilder,
    public categoryService: FacilityOwnershipAuthorityService
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
