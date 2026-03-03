import { ApplicationConfig, inject, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {
  HttpClient,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { provideToastr } from 'ngx-toastr';
import { httpInterceptor } from 'app/interceptors/http/http.interceptor';
import { provideNgIconLoader } from '@ng-icons/core';
import { DatePipe } from '@angular/common';
import { IConfig, provideEnvironmentNgxMask } from 'ngx-mask';
import { preloaderInterceptor } from './interceptors/preloader/preloader.interceptor';
import { AuthService } from 'services/auth.service';
import { CompanyDialogService } from 'modules/portal/company/services/company-dialog.service';
import { Router } from '@angular/router';

const maskConfig: Partial<IConfig> = {
  validation: true,
  leadZero: true,
  allowNegativeNumbers: false,
  keepCharacterPositions: true,
};

// App initializer to check company requirement on app start
function initializeApp(
  authService: AuthService,
  companyDialogService: CompanyDialogService,
  router: Router
): () => Promise<void> {
  return () => {
    return new Promise<void>((resolve) => {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        // Check login status and company requirement
        authService.checkLoginStatus();
        
        const currentUser = authService.getCurrentUser();
        if (currentUser && currentUser.user && currentUser.user.isClient && !currentUser.user.companyId) {
          // Get current URL to use as return URL
          const currentUrl = router.url || '/manage-listings';
          companyDialogService.openDialog(currentUrl, true);
        }
        
        resolve();
      }, 100);
    });
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([httpInterceptor, preloaderInterceptor]),
    ),
    provideToastr(),
    provideAnimationsAsync(),
    provideNgIconLoader((name) => {
      const http = inject(HttpClient);
      return http.get(`/assets/icons/${name}.svg`, { responseType: 'text' });
    }),
    DatePipe,
    provideEnvironmentNgxMask(maskConfig),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [AuthService, CompanyDialogService, Router],
      multi: true,
    },
  ],
};
