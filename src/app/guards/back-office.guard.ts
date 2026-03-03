import { Injectable } from '@angular/core';
import {
  Router,
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { AuthService } from 'services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class BackofficeGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService,
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const currentUser = this.authService.getCurrentUser();

    // If user is logged in and is not a client, allow access to backoffice
    if (currentUser && !currentUser.user?.isClient) {
      return true;
    }

    // If user is logged in but is a client, redirect to portal home
    if (currentUser) {
      this.router.navigate(['/']);
      return false;
    }

    // If not logged in, let the AuthGuard handle the redirection
    return true;
  }
}
