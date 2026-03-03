import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from 'services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class PublicRouteGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService,
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    // If the user is already logged in and tries to access login/register pages,
    // redirect them based on their user type
    if (this.authService.isLoggedIn) {
      if (this.authService.isClient) {
        this.router.navigate(['/manage-listings']);
      } else {
        this.router.navigate(['/dashboard']);
      }
      return false;
    }

    // Allow access to public routes
    return true;
  }
}
