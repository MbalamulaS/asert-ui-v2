import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  UrlTree,
} from '@angular/router';
import { LoginService } from 'modules/login/login.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BackofficeGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: LoginService,
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    const currentUser = this.authService.getCurrentUser();

    // If user is logged in and is not a client, allow access to backoffice
    if (currentUser && !currentUser.user?.isClient) {
      return true;
    }

    // If user is logged in but is a client, redirect to portal home
    if (currentUser) {
      this.router.navigate(['/manage-listings']);
      return false;
    }

    // If not logged in, let the AuthGuard handle the redirection
    return true;
  }
}
