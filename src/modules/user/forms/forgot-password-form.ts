import { CommonModule } from "@angular/common";
import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { ReactiveFormsModule, FormGroup } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { UserService } from "../user.service";
import { TextInputComponent } from "components/text-field/text-field.component";

@Component({
  standalone: true,
  selector: 'app-forgot-password-form',
  template: `
    <form [formGroup]="form" (ngSubmit)="submitForm()">
      <div class="pb-6 text-base font-normal text-gray-700">
        Enter email address you use to sign in
      </div>
      <app-text-input
        [form]="form"
        formControlName="email"
        label="Email address"
        placeholder="Email address"
        name="email"
      />

      <div class="mt-8">
        <button
          class="w-full py-4 text-lg font-medium rounded transition-colors flex items-center justify-center"
          type="submit"
          [ngClass]="{
            'text-gray-400 bg-gray-200': isSubmitting,
            'text-gray-400 bg-gray-200': form.invalid,
            'bg-primary-400 text-white hover:bg-primary-500': form.valid
          }"
          [disabled]="!form.dirty || form.invalid || isSubmitting"
        >
          Submit
        </button>
      </div>
    </form>
  `,
  imports: [
    MatFormFieldModule,
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    TextInputComponent,
  ],
})
export class ForgotPasswordFormComponent implements OnInit {
  @Output() onSubmit = new EventEmitter<string>();
  form: FormGroup;
  title: any;
  message: any;
  constructor(private service: UserService) {
    this.form = this.service.forgotPasswordForm;
  }

  isSubmitting = false;

  ngOnInit(): void {}

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
