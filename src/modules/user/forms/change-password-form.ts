import { CommonModule } from "@angular/common";
import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { ReactiveFormsModule, FormGroup } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { UserService } from "../user.service";
import { TextInputComponent } from "components/text-field/text-field.component";

@Component({
  standalone: true,
  selector: 'app-change-password-form',
  template: `
    <form [formGroup]="form" (ngSubmit)="submitForm()">
      <div class="flex flex-col space-y-6">
        <app-text-input
          [form]="form"
          formControlName="newPassword"
          label="New Password"
          placeholder="New Password"
          name="newPassword"
          [type]="getPasswordInputType()"
          (iconClick)="togglePasswordVisibility()"
          [icon]="hidePassword ? 'visibility' : 'visibility_off'"
          iconAriaLabel="Toggle password visibility"
        />
        <app-text-input
          [form]="form"
          type="password"
          formControlName="passwordConfirm"
          label="Confirm password"
          placeholder="Confirm password"
          name="passwordConfirm"
        />
      </div>
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
export class ChangePasswordFormComponent implements OnInit {
  @Output() onSubmit = new EventEmitter<string>();
  form: FormGroup;
  hidePassword = true;
  hideConfirmPassword = true;
  title: any;
  message: any;
  constructor(private service: UserService) {
    this.form = this.service.changePasswordForm;
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

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  getPasswordInputType(): string {
    return this.hidePassword ? 'password' : 'text';
  }

  toggleConfirmPasswordVisibility(): void {
    this.hideConfirmPassword = !this.hideConfirmPassword;
  }

  getConfirmPasswordInputType(): string {
    return this.hideConfirmPassword ? 'password' : 'text';
  }

  async handleConfirm() {}
}
