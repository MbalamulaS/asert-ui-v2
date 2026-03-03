import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TextInputComponent } from 'components/text-field/text-field.component';
import { SubmitButtonComponent } from 'components/submit-button/submit-button.component';
import { AssessorService } from 'modules/assessment/assessor.service';
import { ImageCropperModule } from 'ngx-image-cropper';
import { DatepickerComponent } from 'components/datepicker/datepicker.component';
import { environment } from 'environment/environment';
import { User } from 'modules/user/user.service';
import { RadioButtonComponent } from 'components/radio/radio.component';
import { AutocompleteComponent } from 'components/autocomplete/autocomplete.component';
import { TextPhoneInputComponent } from 'components/text-field-phone/text-field.component';
import { FetcherComponent } from 'components/fetcher/fetcher.component';
import { Assessor } from 'modules/assessment/assessment';
import { SelectComponent } from 'components/select/select.component';

@Component({
  selector: 'app-assessor-personal-info-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    TextInputComponent,
    SubmitButtonComponent,
    ImageCropperModule,
    DatepickerComponent,
    RadioButtonComponent,
    AutocompleteComponent,
    TextPhoneInputComponent,
    FetcherComponent,
    SelectComponent,
  ],
  template: `
    <form [formGroup]="form" class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
        <app-autocomplete
          label="Title"
          formControlName="title"
          [displayLabel]="'name'"
          [options]="titleOptions"
        />
        <app-text-input
          label="First Name"
          name="firstName"
          formControlName="firstName"
        />
        <app-text-input
          label="Middle Name"
          name="middleName"
          formControlName="middleName"
        />
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
        <app-text-input
          label="Last Name"
          name="lastName"
          formControlName="lastName"
        />

        <app-datepicker
          [form]="form"
          formControlName="dob"
          label="Date of Birth"
          name="dob"
        ></app-datepicker>
      </div>
      <app-radio-button
        label="Sex"
        name="sex"
        formControlName="sex"
        [options]="sexOptions"
      />
      <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
        <app-phone-number
          label="Phone#"
          name="phone"
          formControlName="phone"
        ></app-phone-number>
        <app-text-input label="Email" name="email" formControlName="email" />
      </div>
      <app-fetcher
        api="admin-hierarchies/get-regions"
        [defaultParams]="{ size: '100' }"
        loadingLabel="Fetching Locations.."
      >
        <ng-template let-response>
          <div *ngIf="response; else noData">
            <app-select
              label="Location"
              formControlName="locationId"
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
export class AssessorPersonalInfoFormComponent implements OnInit {
  form: FormGroup;
  isSubmitting = false;

  user: User;

  sexOptions = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
  ];

  titleOptions = [
    { id: 'Mr.', name: 'Mr.' },
    { id: 'Ms.', name: 'Ms.' },
    { id: 'Mrs.', name: 'Mrs.' },
    { id: 'Dr.', name: 'Dr.' },
    { id: 'Prof.', name: 'Prof.' },
    { id: 'Eng.', name: 'Eng.' },
    { id: 'Hon.', name: 'Hon.' },
    { id: 'Rev.', name: 'Rev.' },
    { id: 'Capt.', name: 'Capt.' },
    { id: 'Sir', name: 'Sir' },
    { id: 'Madam', name: 'Madam' },
    { id: 'CPA', name: 'CPA' },
  ];

  assessor: Assessor | undefined = undefined;

  @Output() onSubmit = new EventEmitter<string>();

  constructor(public service: AssessorService) {
    this.form = this.service.personalInfoForm;
    const currentUser = localStorage.getItem(environment.ASERT_USER);
    const parsed = currentUser ? JSON.parse(currentUser) : null;
    this.user = parsed.user as User;
    this.form.get('firstName').setValue(this.user.firstName);
    this.form.get('middleName').setValue(this.user.middleName);
    this.form.get('lastName').setValue(this.user.lastName);
    this.form.get('phone').setValue(this.user.phoneNumber);
    this.form.get('email').setValue(this.user.email);
  }

  ngOnInit() {
    this.loadData();
  }

  loadData(): void {
    this.service.getCurrentUserAssessorData().subscribe({
      next: (response) => {
        this.assessor = response.data;
        if (this.assessor) {
          this.form.get('id').setValue(this.assessor.id);
          this.form.get('uuid').setValue(this.assessor.uuid);
          this.form.get('title').setValue(this.assessor.title);
          this.form.get('firstName').setValue(this.assessor.firstName);
          this.form.get('middleName').setValue(this.assessor.middleName);
          this.form.get('lastName').setValue(this.assessor.lastName);
          this.form.get('phone').setValue(this.assessor.phone);
          this.form.get('email').setValue(this.assessor.email);
          this.form.get('dob').setValue(this.assessor.dob);
          this.form.get('locationId').setValue(this.assessor.locationId);
          this.form.get('sex').setValue(this.assessor.sex);
        }
      },
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
