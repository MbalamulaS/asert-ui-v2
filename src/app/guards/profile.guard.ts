import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { CustomRouteData } from 'app/type-interface';
import { CompanyDialogService } from 'modules/portal/company/services/company-dialog.service';
import { AuthService } from 'services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class CompanyProfileGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService,
    private companyDialogService: CompanyDialogService,
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): boolean {
    const routeData = route.data as CustomRouteData;

    if (routeData && routeData.publicRoute) {
      return true;
    }

    // Get current user
    const currentUser = this.authService.getCurrentUser();

    // Check if user is logged in, is a client, and doesn't have a company yet
    if (currentUser && currentUser.user && currentUser.user.isClient) {
      // If the user doesn't have a companyId, open the company dialog as required
      if (!currentUser.user.companyId) {
        this.companyDialogService.openDialog(state.url, true);
        return true; // Still allow route access, but dialog will be shown
      }
    }

    // Allow access if not a client user or has a company
    return true;
  }
}
