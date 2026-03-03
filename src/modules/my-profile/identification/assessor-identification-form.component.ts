import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {FormGroup, ReactiveFormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {MatFormFieldModule} from '@angular/material/form-field';
import {SubmitButtonComponent} from 'components/submit-button/submit-button.component';
import {AssessorService} from "modules/assessment/assessor.service";
import {ImageCropperModule} from "ngx-image-cropper";
import {Assessor} from "modules/assessment/assessment";
import {RadioButtonComponent} from "components/radio/radio.component";
import {TextInputComponent} from "components/text-field/text-field.component";

@Component({
  selector: 'app-assessor-identification-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    SubmitButtonComponent,
    ImageCropperModule,
    RadioButtonComponent,
    TextInputComponent
  ],
  template: `
    <form [formGroup]="form" class="space-y-4">
      <app-radio-button
        label="ID Type"
        name="identificationType"
        formControlName="identificationType"
        [options]="idOptions"
      />
      <app-text-input
        label="ID Number"
        name="identificationId"
        formControlName="identificationId"
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
export class AssessorIdentificationFormComponent implements OnInit {
  form: FormGroup;
  isSubmitting = false;

  idOptions = [
    {value: 'NIN', label: 'NIDA'},
    {value: 'PASSPORT', label: 'Passport Number'},
  ];

  assessor: Assessor | undefined = undefined;

  @Output() onSubmit = new EventEmitter<string>();

  constructor(
    public service: AssessorService
  ) {
    this.form = this.service.idForm;
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
          this.form.get('identificationId').setValue(this.assessor.identificationId);
          this.form.get('identificationType').setValue(this.assessor.identificationType);
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
