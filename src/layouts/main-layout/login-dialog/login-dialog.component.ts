import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { DialogComponent } from 'components/dialog/dialog.component';
import { LoginService } from 'modules/login/login.service';
import { Subscription } from 'rxjs';
import { ToastService } from 'components/toast/toast.service';
import { LoginFormComponent } from 'modules/login/forms/login.form.component';

@Component({
  selector: 'app-login-dialog',
  standalone: true,
  imports: [
    DialogComponent,
    LoginFormComponent,
    CommonModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
  ],
  template: `
    <app-dialog
      [open]="isOpen"
      (onClose)="handleClose($event)"
      width="520px"
      title="Token Expired: Please Log in to continue"
    >
      <ng-template>
        <div class="login-form-container p-4">
          <app-login-form
            (onSubmit)="handleFormSubmit($event)"
            [isLoading]="isLoading"
          />
        </div>
      </ng-template>
    </app-dialog>
  `,
  styles: [
    `
      .login-form-container {
        min-height: 200px;
      }
    `,
  ],
})
export class LoginDialogComponent implements OnInit, OnDestroy {
  isOpen = false;
  isLoading = false;
  private subscription: Subscription = new Subscription();

  constructor(
    private loginService: LoginService,
    private cdr: ChangeDetectorRef,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.subscription.add(
      this.loginService.dialogEvent$.subscribe((isOpen) => {
        console.log('Dialog state changed to:', isOpen);
        this.isOpen = isOpen;
        this.cdr.detectChanges();
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  handleClose(event: any): void {
    console.log('Dialog close event received');
    this.isOpen = false;
    this.loginService.emitDialogState(false);
    this.cdr.detectChanges();
  }

  async handleFormSubmit(formValue: any): Promise<void> {
    console.log('Form submitted with:', formValue);
    this.isLoading = true;

    try {
      const response = await this.loginService.login(formValue);
      console.log('Login response:', response);

      if (response && response.data) {
        const { access_token: token, expires_in, user } = response.data;
        const { email, id, menu_items, permissions, roles } = user;

        const payload = {
          token,
          expires_in,
          id,
          email,
          menu_items,
          permissions,
          roles,
          created_at: new Date().toISOString(),
        };

        const isUserSet = this.loginService.setupUser(payload);

        if ((isUserSet && response.status === 200) || response.status === 201) {
          console.log('Login successful, closing dialog');
          this.isOpen = false;
          this.loginService.emitDialogState(false);
          this.toast.success('Login Successful', 'Welcome back!');

          // Force view update
          this.cdr.detectChanges();

          // Reload current page to refresh data
          window.location.reload();
        }
      }
    } catch (e) {
      console.error('Login failed', e);
      this.toast.error(
        'Login Failed',
        'Please check your credentials and try again.',
      );
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }
}
