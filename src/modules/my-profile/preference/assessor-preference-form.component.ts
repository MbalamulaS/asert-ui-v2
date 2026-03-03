import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { SubmitButtonComponent } from 'components/submit-button/submit-button.component';
import { AssessorPreferenceService } from "modules/assessment/assessor-preference.service";
import { FetcherComponent } from "components/fetcher/fetcher.component";
import { SelectComponent } from "components/select/select.component";

interface Item {
  id: number;
  name: string;
}

@Component({
  selector: 'app-assessor-preference-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    SubmitButtonComponent,
    FetcherComponent,
    SelectComponent,

  ],
  template: `
    <form [formGroup]="form" class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
        <app-fetcher
          api="hotels/get-types"
          [defaultParams]="{ size: '100' }"
          loadingLabel="Fetching Preferences.."
        >
          <ng-template let-response>
            <div *ngIf="response; else noData">
              <app-select
                label="Preference"
                formControlName="preference"
                [options]="response.data"
              />
            </div>
            <ng-template #noData>No data available</ng-template>
          </ng-template>
        </app-fetcher>
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
export class AssessorPreferenceFormComponent {
  form: FormGroup;
  isSubmitting = false;
  @Output() onSubmit = new EventEmitter<string>();

  constructor(
    private fb: FormBuilder,
    public service: AssessorPreferenceService,
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
