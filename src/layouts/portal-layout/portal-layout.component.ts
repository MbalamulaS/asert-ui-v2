import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { PortalLayoutFooterComponent } from 'layouts/portal-layout/portal-layout.footer.component';
import { filter, lastValueFrom, Subscription } from 'rxjs';
import { PortalNavComponent } from './components/portal-nav';
import { DialogComponent } from 'components/dialog/dialog.component';
import { LoginFormComponent } from 'modules/login/forms/login.form.component';
import { PortalService } from './services/portal.service';
import { PreloaderComponent } from 'components/preloader/preloader.component';
import { UserRegistrationFormComponent } from 'modules/user/forms/user-registration-form.component';
import { UserService } from 'modules/user/user.service';
import { PortalHomeComponent } from './components/credential-info.component';
import { ToastService } from 'app/toast.service';
import { AuthService } from 'services/auth.service';
import { CompanyService } from 'modules/portal/company/services/company.service';
import { CompanyDialogService } from 'modules/portal/company/services/company-dialog.service';
import { StorageKey } from 'modules/login/storage.model';
import { CompanyFormComponent } from 'modules/portal/company/forms/company-form.component';
import { ForgotPasswordFormComponent } from 'modules/user/forms/forgot-password-form';

const { ASERT_USER } = StorageKey;

@Component({
  standalone: true,
  selector: 'app-portal-layout',
  template: `
    <div class="min-h-screen flex flex-col">
      <portal-nav [currentUser]="currentUser" [navbarColor]="navbarColor" />
      <div class="mt-0 w-full flex-grow flex items-center justify-center">
        <div [ngClass]="contentWidthClass">
          <router-outlet></router-outlet>
        </div>
        <preloader size="16" textColor="gray-500" />
      </div>
      <portal-layout-footer />

      <!-- Company Profile Dialog -->
      <app-dialog
        [open]="isCompanyDialogOpen"
        [disableClose]="isCompanyDialogRequired"
        (onClose)="handleCompanyDialogClose()"
        width="800px"
        title="Complete Your Company Profile"
      >
        <ng-template>
          <div class="p-4">
            <p class="mb-4 text-base text-gray-600">
              Please complete your company profile to continue.
            </p>
            <company-form (onSubmit)="handleCompanySubmit($event)" />
          </div>
        </ng-template>
      </app-dialog>

      <!-- Login/Register Dialog -->
      <app-dialog
        [open]="isOpen"
        (onClose)="handleClose()"
        [style.width]="showRegistrationForm ? '840px' : '540px'"
        title="Login/Register"
      >
        <ng-template>
          @if (showRegistrationForm) {
          <user-registration-form (onSubmit)="registerUser($event)" />
          <div class="mr-4 relative -top-8 right-0">
            Already Registered?
            <button
              (click)="toggleRegistrationForm()"
              class="text-primary-500 !font-medium hover:underline mt-2"
            >
              Login
            </button>
          </div>
          } @else {
          <app-login-form
            (onSubmit)="handleLogin($event)"
            [isLoading]="isLoading"
          />
          <div class="flex mt-2 justify-between">
            <div class="">
              Not Registered yet?
              <button
                (click)="toggleRegistrationForm()"
                class="text-primary-500 !font-medium hover:underline mt-2"
              >
                Create an Account
              </button>
            </div>
            <div class="">
              <button
                (click)="toggleForgotPasswordForm()"
                class="text-primary-500 !font-medium hover:underline mt-2"
              >
                Forgot your password?
              </button>
            </div>
          </div>
          }
        </ng-template>
      </app-dialog>

      <!-- Credentials Info Dialog -->
      <app-dialog
        [open]="isCredentialOpen"
        (onClose)="handleClose()"
        width="740px"
        title="User Credential"
      >
        <ng-template>
          <credential-info-component />
          <div class="mr-4 relative -top-8 right-0">
            Successfully Registered?
            <button
              (click)="toggleLoginForm()"
              class="text-primary-500 !font-semibold hover:underline mt-2"
            >
              Login
            </button>
          </div>
        </ng-template>
      </app-dialog>
      <!-- forgot password dialog -->
      <app-dialog
        [open]="isForgotPwdOpen"
        (onClose)="handleForgotPwdClose()"
        width="540px"
        title="Forgot Password"
      >
        <ng-template>
          <app-forgot-password-form (onSubmit)="saveData($event)" />
        </ng-template>
      </app-dialog>
    </div>
  `,
  imports: [
    RouterOutlet,
    CommonModule,
    PortalLayoutFooterComponent,
    PortalNavComponent,
    DialogComponent,
    LoginFormComponent,
    PreloaderComponent,
    UserRegistrationFormComponent,
    PortalHomeComponent,
    CompanyFormComponent,
    ForgotPasswordFormComponent,
  ],
})
export class PortalLayoutComponent implements OnInit, OnDestroy {
  private eventSubscription: Subscription[] = [];
  isCompanyDialogOpen = false;
  isCompanyDialogRequired = false;
  currentUser: any = null;
  isOpen: boolean = false;
  title: 'Login/Register';
  showRegistrationForm = false;
  isCredentialOpen: boolean = false;
  isLoading = false;
  returnUrl: string | null = null;

  contentWidthClass: string = 'container mx-auto max-w-4xl';
  navbarColor: string = 'default';
  isForgotPwdOpen: boolean = false;

  constructor(
    private portalService: PortalService,
    private userService: UserService,
    private authService: AuthService,
    private companyService: CompanyService,
    private companyDialogService: CompanyDialogService,
    private cdr: ChangeDetectorRef,
    private toast: ToastService,
    private router: Router
  ) {}

  ngOnDestroy(): void {
    this.eventSubscription.forEach((sub) => sub.unsubscribe());
  }

  toggleRegistrationForm() {
    this.userService.clearRegistrationFormNew();
    this.showRegistrationForm = !this.showRegistrationForm;
  }

  toggleLoginForm() {
    this.showRegistrationForm = false;
    this.isOpen = true;
  }

  toggleForgotPasswordForm() {
    this.isForgotPwdOpen = true;
    this.isOpen = false;
  }

  handleForgotPwdClose(){
    this.isForgotPwdOpen = false;
  };

  async registerUser(data) {
    const response = await lastValueFrom(this.userService.register(data));
    if (response.status === 201) {
      this.toggleRegistrationForm();
      this.isOpen = false;
      this.portalService.emitCredentialEvent({
        type: 'OPEN_INFO_DIALOG',
        value: true,
      });
    }
  }

  ngOnInit(): void {
    // Get initial user data
    const item = this.authService.getCurrentUser();
    this.currentUser = item && item.user ? item.user : null;

    // Check if company dialog should be shown on init (for page refresh scenarios)
    this.checkCompanyRequirement();

    // Subscribe to router events to update layout
    this.eventSubscription.push(
      this.router.events
        .pipe(filter((event) => event instanceof NavigationEnd))
        .subscribe(() => {
          // Apply layout from route data
          this.updateLayoutFromRoute();
        })
    );

    this.updateLayoutFromRoute();

    // Subscribe to auth service for user updates
    this.eventSubscription.push(
      this.authService.currentUser$.subscribe((user) => {
        this.currentUser = user;
        this.cdr.detectChanges();
      })
    );

    // Subscribe to logout events to update UI
    this.eventSubscription.push(
      this.authService.logout$.subscribe(() => {
        this.currentUser = null;
        this.cdr.detectChanges();
      })
    );

    // Subscribe to company dialog state
    this.eventSubscription.push(
      this.companyDialogService.dialogState$.subscribe((isOpen) => {
        this.isCompanyDialogOpen = isOpen;
        this.cdr.detectChanges();
      })
    );

    // Subscribe to company dialog required state
    this.eventSubscription.push(
      this.companyDialogService.isRequired$.subscribe((isRequired) => {
        this.isCompanyDialogRequired = isRequired;
        this.cdr.detectChanges();
      })
    );

    // Get return URL from company dialog service
    this.eventSubscription.push(
      this.companyDialogService.returnUrl$.subscribe((url) => {
        this.returnUrl = url;
      })
    );

    // Dialog event subscriptions
    this.eventSubscription.push(
      this.portalService.dialogEvent$.subscribe((isOpen) => {
        this.isOpen = isOpen;
      })
    );

    this.eventSubscription.push(
      this.portalService.event$.subscribe((isOpen) => {
        this.isCredentialOpen = isOpen.value;
      })
    );

    this.eventSubscription.push(
      this.portalService.layoutConfig$.subscribe((config) => {
        this.contentWidthClass =
          config.contentWidth || 'container mx-auto max-w-4xl';
        this.navbarColor = config.navbarColor || 'default';
        this.cdr.detectChanges();
      })
    );
  }

  async handleLogin(formValue: any): Promise<void> {
    this.isLoading = true;

    try {
      const response = await this.authService.login(formValue);

      if (response && response.access_token) {
        this.currentUser = response.user;
        this.isOpen = false;
        this.authService.emitDialogState(false);

        // Check if the user needs to complete company profile
        if (response.user.isClient && !response.user.companyId) {
          this.companyDialogService.openDialog('/manage-listings', true);
        }

        // Force view update
        this.cdr.detectChanges();
      }
    } catch (e) {
      console.error('Login failed', e);
      this.toast.error(
        'Login Failed',
        'Please check your credentials and try again.'
      );
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  handleClose() {
    this.isOpen = false;
    this.isCredentialOpen = false;
  }

  handleCompanyDialogClose() {
    // Only allow closing if not required
    if (!this.isCompanyDialogRequired) {
      this.companyDialogService.closeDialog();
    }
  }

  async handleCompanySubmit(companyData: any): Promise<void> {
    try {
      // Call the company service to create/update company
      const payload = {
        ...companyData,
        isActive: true,
      };

      const response = await this.companyService.createCompanyProfile(payload);

      if (response) {
        this.toast.success('Success', 'Company profile created successfully');

        // Force close the dialog (even if required)
        this.companyDialogService.forceCloseDialog();

        // Update user's companyId in localStorage and auth service
        const currentUser = this.authService.getCurrentUser();
        if (currentUser && currentUser.user) {
          currentUser.user.companyId = response.data.uuid;
          localStorage.setItem(ASERT_USER, JSON.stringify(currentUser));
          this.authService.updateCurrentUser(currentUser.user);
        }

        // Navigate to the return URL if available
        if (this.returnUrl) {
          this.router.navigateByUrl(this.returnUrl);
          this.companyDialogService.clearReturnUrl();
        }
      }
    } catch (error) {
      console.error('Error creating company:', error);
      this.toast.error('Error', 'Failed to create company profile');
    }
  }

  // Method to update layout based on current route
  private updateLayoutFromRoute(): void {
    let currentRoute = this.router.routerState.root;
    let layoutConfig = null;

    // Traverse the route tree to find the active route
    while (currentRoute.firstChild) {
      currentRoute = currentRoute.firstChild;
      if (currentRoute.snapshot.data && currentRoute.snapshot.data['layout']) {
        layoutConfig = currentRoute.snapshot.data['layout'];
        break;
      }
    }

    // Apply layout config if found
    if (layoutConfig) {
      this.portalService.setLayoutConfig(layoutConfig);
    } else {
      // Default to constrained width if no specific config
      this.portalService.setLayoutConfig({
        contentWidth: 'mx-auto max-w-4xl',
        navbarColor: 'default',
      });
    }

    // Force change detection to update the view
    this.cdr.detectChanges();
  }

  private checkCompanyRequirement(): void {
    // Only proceed if we have a current user
    if (!this.currentUser) {
      return;
    }

    // Check if user is a client without a company
    if (this.currentUser.isClient && !this.currentUser.companyId) {
      // Only open dialog if it's not already open
      if (!this.isCompanyDialogOpen) {
        // For new clients, always redirect to manage-listings to complete company profile first
        const currentUrl = '/manage-listings';
        this.companyDialogService.openDialog(currentUrl, true);
      }
    } else {
      // User has a company or is not a client, ensure dialog is closed
      if (this.isCompanyDialogOpen) {
        this.companyDialogService.forceCloseDialog();
      }
    }
  }

  async saveData(data: any) {
    try {
      await lastValueFrom(this.userService.forgotPassword(data));
      this.isForgotPwdOpen = false;
      this.userService.clearForgotPasswordForm();
    } catch (error) {
      // Handle error
      console.log(error);
    }
  }
}
