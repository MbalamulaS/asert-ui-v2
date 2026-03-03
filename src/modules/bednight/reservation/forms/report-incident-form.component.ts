import { Component, EventEmitter, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TextInputComponent } from 'components/text-field/text-field.component';
import { SubmitButtonComponent } from 'components/submit-button/submit-button.component';
import { ReservationService } from '../reservation.service';
import { CountryService } from 'modules/setup/country/country.service';
import { FetcherComponent } from '../../../../components/fetcher/fetcher.component';
import { RadioButtonComponent } from "../../../../components/radio/radio.component";
import { DatepickerComponent } from "../../../../components/datepicker/datepicker.component";

@Component({
  selector: 'app-report-incident-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    TextInputComponent,
    SubmitButtonComponent,
    FetcherComponent,
    RadioButtonComponent,
    DatepickerComponent,
  ],
  template: `
    <form [formGroup]="form" class="space-y-4">
      <div class="flex md:flex-row flex-col md:gap-x-4 pb-6">
        <app-fetcher
          class="flex-1"
          api="incident-report-types"
          [defaultParams]="{ size: 20 }"
          loadingLabel="Fetching Incident Type.."
        >
          <ng-template let-response>
            <div *ngIf="response; else noData">
              <app-radio-button
                label="Incident Type"
                name="incidentTypeId"
                formControlName="incidentTypeId"
                [options]="response.data"
              ></app-radio-button>
            </div>
            <ng-template #noData>No data available</ng-template>
          </ng-template>
        </app-fetcher>
      </div>
      <app-datepicker
        [form]="form"
        class="flex-1"
        label="Incident date"
        name="incidentDate"
        [maxDate]="maxDate"
      />
      <app-text-input
        class="flex-1"
        label="Comment"
        name="comment"
        formControlName="comment"
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
export class ReportIncidentFormComponent {
  form: FormGroup;
  isSubmitting = false;
  maxDate: Date = new Date();
  @Output() onSubmitIncident = new EventEmitter<string>();

  constructor(
    public service: ReservationService,
    public countryService: CountryService
  ) {
    this.form = this.service.reportIncidentForm;
  }

  async submitForm() {
    if (this.form.invalid) {
      return;
    }

    this.isSubmitting = true;

    try {
      const formData = this.form.value;
      this.onSubmitIncident.emit(formData);
    } catch (error) {
    } finally {
      this.isSubmitting = false;
    }
  }
}
