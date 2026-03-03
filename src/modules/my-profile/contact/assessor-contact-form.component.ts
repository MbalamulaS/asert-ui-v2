import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {FormGroup, ReactiveFormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {MatFormFieldModule} from '@angular/material/form-field';
import {TextInputComponent} from 'components/text-field/text-field.component';
import {SubmitButtonComponent} from 'components/submit-button/submit-button.component';
import {AssessorService} from "modules/assessment/assessor.service";
import {ImageCropperModule} from "ngx-image-cropper";
import {environment} from "environment/environment";
import {User} from "modules/user/user.service";
import {AutocompleteComponent} from "components/autocomplete/autocomplete.component";
import {TextPhoneInputComponent} from "components/text-field-phone/text-field.component";
import {FetcherComponent} from "components/fetcher/fetcher.component";
import {Assessor} from "modules/assessment/assessment";

@Component({
  selector: 'app-assessor-contact-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    TextInputComponent,
    SubmitButtonComponent,
    ImageCropperModule,
    AutocompleteComponent,
    TextPhoneInputComponent,
    FetcherComponent
  ],
  template: `
    <form [formGroup]="form" class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
        <app-phone-number
          label="Phone#"
          name="phone"
          formControlName="phone"
        ></app-phone-number>
        <app-text-input
          label="Email"
          name="email"
          formControlName="email"
        />
      </div>
      <app-fetcher
        api="admin-hierarchies/get-regions"
        [defaultParams]="{ size: '100' }"
        loadingLabel="Fetching Cities.."
      >
        <ng-template let-response>
          <div *ngIf="response; else noData">
            <app-autocomplete
              label="Select City"
              formControlName="locationId"
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
export class AssessorContactFormComponent implements OnInit {
  form: FormGroup;
  isSubmitting = false;

  user: User;

  assessor: Assessor | undefined = undefined;

  @Output() onSubmit = new EventEmitter<string>();

  constructor(
    public service: AssessorService
  ) {
    this.form = this.service.contactForm;
    const currentUser = localStorage.getItem(environment.ASERT_USER);
    const parsed = currentUser ? JSON.parse(currentUser) : null;
    this.user = parsed.user as User;
    this.form.get('phone').setValue(this.user.phoneNumber);
    this.form.get('email').setValue(this.user.email);
  }

  ngOnInit() {
    this.loadData();
  }

  loadData(): void {
    this.service.getCurrentUserAssessorData().subscribe({
      next: response => {
        this.assessor = response.data;
        if (this.assessor) {
          this.form.get('id').setValue(this.assessor.id);
          this.form.get('uuid').setValue(this.assessor.uuid);
          this.form.get('phone').setValue(this.assessor.phone);
          this.form.get('email').setValue(this.assessor.email);
          this.form.get('locationId').setValue(this.assessor.locationId);
        }
      }
    });
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
