import {Component, EventEmitter, Output} from '@angular/core';
import {FormGroup, ReactiveFormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {MatFormFieldModule} from '@angular/material/form-field';
import {TextInputComponent} from 'components/text-field/text-field.component';
import {SubmitButtonComponent} from 'components/submit-button/submit-button.component';
import {EducationLevelService} from "modules/setup/education-level/education-level.service";

interface Item {
  id: number;
  name: string;
}

@Component({
  selector: 'app-education-level-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    TextInputComponent,
    SubmitButtonComponent,

  ],
  template: `
    <form [formGroup]="form" class="space-y-4">
      <app-text-input label="Education Level" name="name" formControlName="name"/>
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
export class EducationLevelFormComponent {
  form: FormGroup;
  isSubmitting = false;
  @Output() onSubmit = new EventEmitter<string>();

  constructor(
    public service: EducationLevelService,
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
