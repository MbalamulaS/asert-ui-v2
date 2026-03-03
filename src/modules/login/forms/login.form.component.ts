import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TextInputComponent } from 'components/text-field/text-field.component';
import { LoginService } from 'modules/login/login.service';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    TextInputComponent,
  ],
  template: `
    <form [formGroup]="loginForm" (ngSubmit)="submit()" class="flex flex-col">
      <!-- Email Input -->
      <app-text-input
        [form]="loginForm"
        label="Email"
        name="email"
        placeholder="admin@server.com"
      ></app-text-input>

      <!-- Password Input with Toggle Icon -->
      <app-text-input
        [form]="loginForm"
        label="Password"
        placeholder="Password"
        name="password"
        [type]="getPasswordInputType()"
        (iconClick)="togglePasswordVisibility()"
        [icon]="hidePassword ? 'visibility' : 'visibility_off'"
        iconAriaLabel="Toggle password visibility"
      ></app-text-input>

      <!-- Sign In Button -->
      <button
        type="submit"
        class="bg-primary-400 text-white py-3 rounded font-semibold hover:bg-primary-500 transition-colors flex items-center justify-center"
        [disabled]="loginForm.invalid || isLoading"
      >
        <span *ngIf="!isLoading">Sign in</span>
        <mat-spinner
          *ngIf="isLoading"
          diameter="24"
          class="text-white"
        ></mat-spinner>
      </button>
    </form>
  `,
})
export class LoginFormComponent implements OnInit {
  @Input() isLoading = false;
  @Output() onSubmit = new EventEmitter<any>();

  hidePassword = true;
  loginForm = this.loginService.createLoginForm();

  constructor(private loginService: LoginService) {}

  ngOnInit(): void {
    console.log('LoginForm initialized');
  }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  submit(): void {
    if (this.loginForm.valid && !this.isLoading) {
      console.log('Submitting form:', this.loginForm.value);
      this.onSubmit.emit(this.loginForm.value);
    }
  }

  getPasswordInputType(): string {
    return this.hidePassword ? 'password' : 'text';
  }
}
