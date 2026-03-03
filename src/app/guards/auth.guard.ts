import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { LoginService } from 'modules/login/login.service';
import { CustomRouteData } from 'app/type-interface';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
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

    if (currentUser) {
      // Get properly typed route data
      const routeData = route.data as CustomRouteData;

      // Check if the route requires a specific user type
      if (routeData?.clientOnly && !currentUser.user?.isClient) {
        this.router.navigate(['/dashboard']);
        return false;
      }

      if (routeData?.backofficeOnly && currentUser.user?.isClient) {
        this.router.navigate(['/']);
        return false;
      }

      return true;
    }

    // Not logged in, redirect to login with return URL
    this.router.navigate(['/'], { queryParams: { returnUrl: state.url } });
    return false;
  }
}
