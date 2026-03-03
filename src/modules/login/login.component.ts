import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { LoginService } from 'modules/login/login.service';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { TextInputComponent } from 'components/text-field/text-field.component';
import { StorageKey } from './storage.model';
import { StorageService } from './storage.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    HttpClientModule,
    TextInputComponent,
  ],
  template: `
    <div class="flex items-center min-h-screen justify-center bg-gray-300 p-4">
      <div
        class="bg-white overflow-hidden rounded-lg shadow-lg flex flex-col sm:flex-row w-full max-w-screen-lg ring-4 ring-primary-200"
      >
        <div class="hidden sm:block w-full sm:w-1/2">
          <img
            class="object-cover w-full h-full"
            src="assets/mwinyi.png"
            alt="Login Image"
          />
        </div>

        <div class="p-8 w-full sm:w-1/2 flex flex-col justify-center">
          <form
            [formGroup]="loginForm"
            (ngSubmit)="onSubmit()"
            class="space-y-6"
          >
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
              <mat-error
                *ngIf="loginForm.controls['password'].hasError('required')"
              >
                Password is required
              </mat-error>
            </mat-form-field>

            <div class="flex-1">
              <button
                class="w-full py-4 bg-blue-500 text-white font-semibold rounded-md"
                type="submit"
                [disabled]="loginForm.invalid"
              >
                Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  loginForm: FormGroup;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private loginService: LoginService,
    private storageService: StorageService,
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  public async onSubmit(): Promise<any> {
    try {
      const response = await this.loginService.login(this.loginForm.value);
      const { access_token, expires_in, user } = response;

      const payload = {
        token: access_token,
        expires_in,
        user,
      };

      const isUserSet = await this.loginService.setupUser(payload);

      // localStorage.setItem('notifications', JSON.stringify(User.notifications));
      // const notificationStr = JSON.stringify(User.notifications);
      const { USER_NOTIFICATIONS } = StorageKey;
      this.storageService.save(USER_NOTIFICATIONS, payload.user.notifications);
      if (!isUserSet) {
        throw new Error('User not set');
      } else {
        let url = '';
        await this.router.navigate([url]);
      }
    } catch (e) {
      this.loginError(e);
    }
  }

  private loginError(e: any): void {
    console.error(e);
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }
}
