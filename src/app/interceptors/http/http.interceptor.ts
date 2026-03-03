import {
  HttpErrorResponse,
  HttpEvent,
  HttpInterceptorFn,
  HttpResponse,
} from '@angular/common/http';
import { environment } from 'environment/environment';
import { catchError, map, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { inject } from '@angular/core';
import { ToastService } from 'components/toast/toast.service';
import { LoginService } from 'modules/login/login.service';

export const httpInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);
  const router = inject(Router);
  const loginService = inject(LoginService);

  const user = localStorage.getItem(environment.ASERT_USER);
  const parsed = user ? JSON.parse(user) : null;
  if (parsed) {
    req = req.clone({
      headers: req.headers.set(
        'Authorization',
        `Bearer ${parsed.access_token}`,
      ),
    });
  }

  req = req.clone({ headers: req.headers.set('Accept', 'application/json') });

  return next(req).pipe(
    map((event: HttpEvent<any>) => {
      const validMethods = ['POST', 'PUT', 'DELETE'];
      const validResponseStatuses = [200, 201, 202, 204];
      const httpMethod = req.method;

      // loginService.emitDialogState(true);

      if (event instanceof HttpResponse) {
        // Skip toast messages for draft-related endpoints
        const isDraftEndpoint = req.url.includes('/form-drafts');

        if (
          validMethods.includes(httpMethod) &&
          validResponseStatuses.includes(event.status) &&
          !isDraftEndpoint
        ) {
          const successMessage =
            event.body?.message?.trim() || 'Operation successful';
          toast.success('Success', successMessage.toUpperCase());
        }
      }

      return event;
    }),
    catchError((error: HttpErrorResponse) => {
      if (error.status === 419) {
        localStorage.removeItem(environment.ASERT_USER);
        localStorage.removeItem('token');
        toast.error('Session Expired', 'Please log in again.');
        loginService.emitDialogState(true);
      } else if (error.status === 401) {
        console.log('error', error);
        toast.error(`${error.status}:${error.statusText}`, error.error.message);
      } else if (error.status === 400) {
        const errorMessage =
          error.error.errors || error.error.message || 'Invalid input';
        toast.error('Bad Request', errorMessage);
      } else {
        const errorMessage =
          error.error.detail ||
          error.error.errors ||
          error.error.title ||
          error.message ||
          'An unexpected error occurred';
        toast.error('Error', errorMessage);
      }

      return throwError(() => error);
    }),
  );
};
