import { CommonModule } from "@angular/common";
import { Component, inject, OnInit } from "@angular/core";
import { ReactiveFormsModule, FormGroup } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { TextInputComponent } from "components/text-field/text-field.component";
import { PortalService } from "layouts/portal-layout/services/portal.service";
import { ResetPasswordService } from "./reset-password.service";
import { lastValueFrom } from "rxjs";
import { Router, ActivatedRoute } from "@angular/router";

@Component({
  standalone: true,
  selector: 'app-reset-password-form',
  template: `
    <div class="w-full mx-auto max-w-xl items-center justify-center p-4">
      <div class="shadow-xl p-8 rounded-lg">
        <div class="text-gray-700 font-medium text-2xl text-center pt-4 pb-8">
          Reset Password
        </div>
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
      </div>
    </div>
  `,
  imports: [
    MatFormFieldModule,
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    TextInputComponent,
  ],
})
export class ResetPasswordFormComponent implements OnInit {
  form: FormGroup;
  hidePassword = true;
  isSubmitting = false;
  hideConfirmPassword = true;
  title: any;
  message: any;
  portalService = inject(PortalService);
  token: string;

  constructor(
    private service: ResetPasswordService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.service.form;
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

  ngOnInit(): void {
    this.portalService.setLayoutConfig({
      contentWidth: 'w-full',
    });
    this.token = this.route.snapshot.paramMap.get('token');
  }

  async submitForm() {
    if (this.form.invalid) {
      return;
    }

    this.isSubmitting = true;

    try {
      const formData = this.form.value;
      delete formData.passwordConfirm;
      formData.token = this.token;
      await lastValueFrom(this.service.resetPassword(formData));
      this.service.clearForm();
      this.router.navigate([`/`]);
    } catch (error) {
    } finally {
      this.isSubmitting = false;
    }
  }
}
