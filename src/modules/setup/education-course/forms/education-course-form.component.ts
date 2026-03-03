import {Component, EventEmitter, Output} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {MatFormFieldModule} from '@angular/material/form-field';
import {TextInputComponent} from 'components/text-field/text-field.component';
import {SubmitButtonComponent} from 'components/submit-button/submit-button.component';
import {AutocompleteComponent} from "components/autocomplete/autocomplete.component";
import {FetcherComponent} from "components/fetcher/fetcher.component";
import {EducationCourseService} from "modules/setup/education-course/education-course.service";

interface Item {
  id: number;
  name: string;
}

@Component({
  selector: 'app-education-course-form',
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
        api="education-levels"
        [defaultParams]="{size:1000}"
        loadingLabel="Fetching Education Levels..."
      >
        <ng-template let-response>
          <div *ngIf="response; else noData">
            <app-autocomplete
              label="Select Education Level"
              formControlName="educationLevelId"
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
export class EducationCourseFormComponent {
  form: FormGroup;
  isSubmitting = false;
  @Output() onSubmit = new EventEmitter<string>();

  constructor(
    private fb: FormBuilder,
    public service: EducationCourseService,
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
