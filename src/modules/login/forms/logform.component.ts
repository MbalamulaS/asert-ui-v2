import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { TextInputComponent } from 'components/text-field/text-field.component';
import { MatInputModule } from '@angular/material/input';
import { SubmitButtonComponent } from 'components/submit-button/submit-button.component';
import { LoginService } from 'modules/login/login.service';
import { PortalService } from 'layouts/portal-layout/services/portal.service';
import { lastValueFrom } from 'rxjs';
import { UserService } from 'modules/user/user.service';

@Component({
  standalone: true,
  selector: 'login-form',
  template: `
    <form [formGroup]="form" class="space-y-6">
      <app-text-input
        label="Enter Your Username"
        name="username"
        formControlName="username"
      />

      <mat-form-field class="w-full" appearance="outline">
        <mat-label>Password</mat-label>
        <input
          matInput
          [type]="hidePassword ? 'password' : 'text'"
          formControlName="password"
          placeholder="Enter your password"
        />
        <button
          mat-icon-button
          matSuffix
          (click)="togglePasswordVisibility()"
          type="button"
        >
          <mat-icon>{{
            hidePassword ? 'visibility_off' : 'visibility'
          }}</mat-icon>
        </button>
        <mat-error *ngIf="form.controls['password'].hasError('required')">
          Password is required
        </mat-error>
      </mat-form-field>

      <div class="mt-4 flex justify-end">
        <submit-button
          [isDisabled]="!form.dirty || form.invalid || isSubmitting"
          [isSubmitting]="isSubmitting"
          [buttonText]="'LOGIN'"
          (action)="submitForm()"
        />
      </div>
    </form>
  `,
  imports: [
    MatFormFieldModule,
    CommonModule,
    ReactiveFormsModule,
    TextInputComponent,
    MatIconModule,
    MatInputModule,
    SubmitButtonComponent,
  ],
})
export class LoginFormComponent implements OnInit {
  @Output() onSubmit = new EventEmitter<string>();
  form: FormGroup;
  hidePassword = true;
  isOpen: any;
  isRegisterOpen: any;
  isDialogOpen = false;
  title: any;
  message: any;
  constructor(
    private service: LoginService,
    private portalService: PortalService,
    private userService: UserService,
  ) {
    this.form = this.service.createLoginForm();
  }

  isSubmitting = false;

  ngOnInit(): void {
    this.portalService.event$.subscribe((isOpen) => {
      this.isRegisterOpen = isOpen;
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

  private loginError(e: any): void {
    console.error(e);
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  handleClose() {
    this.isRegisterOpen = false;
  }

  openRegisterModal(event) {
    this.portalService.emitEvent(true);
  }

  openConfirmDialog(data: any) {
    this.title = data.username;
    this.message = data.password;
    this.isDialogOpen = true;
  }

  closeConfirmDialog(event: any) {
    this.isDialogOpen = false;
  }

  async handleConfirm() {}

  async saveData(data: any) {
    const payload = {
      ...data,
      isActive: true,
    };
    try {
      await lastValueFrom(this.userService.register(payload));
      this.isRegisterOpen = false;
      const userCredential = {
        username: data.email,
        password: 'Z@nHfr2024',
      };
      this.openConfirmDialog(userCredential);
    } catch (error) {
      // Handle error
      console.log(error);
    }
  }
}
