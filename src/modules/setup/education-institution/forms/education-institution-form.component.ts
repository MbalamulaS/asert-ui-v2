import {Component, EventEmitter, Output} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {MatFormFieldModule} from '@angular/material/form-field';
import {TextInputComponent} from 'components/text-field/text-field.component';
import {SubmitButtonComponent} from 'components/submit-button/submit-button.component';
import {EducationInstitutionService} from "modules/setup/education-institution/education-institution.service";
import {AutocompleteComponent} from "components/autocomplete/autocomplete.component";
import {FetcherComponent} from "components/fetcher/fetcher.component";

interface Item {
  id: number;
  name: string;
}

@Component({
  selector: 'app-education-institution-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    TextInputComponent,
    SubmitButtonComponent,
    AutocompleteComponent,
    FetcherComponent,
  ],
  template: `
    <form [formGroup]="form" class="space-y-4">
      <app-text-input label="Name" name="name" formControlName="name"/>
      <app-fetcher
        api="admin-hierarchies/get-countries"
        loadingLabel="Fetching Countries.."
      >
        <ng-template let-response>
          <div *ngIf="response; else noData">
            <app-autocomplete
              label="Select Country"
              formControlName="countryId"
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
export class EducationInstitutionFormComponent {
  form: FormGroup;
  isSubmitting = false;
  @Output() onSubmit = new EventEmitter<string>();

  constructor(
    private fb: FormBuilder,
    public service: EducationInstitutionService,
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
}
