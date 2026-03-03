import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { PortalService } from './portal.service';
import { Injectable } from '@angular/core';
import { filter } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LayoutManagerService {
  constructor(
    private portalService: PortalService,
    private router: Router,
  ) {
    // Listen for route changes and apply layout from route data
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        const route = this.router.routerState.root;
        this.applyLayoutFromRoute(route);
      });
  }

  private applyLayoutFromRoute(route: ActivatedRoute): void {
    // Find the child route with layout data
    let currentRoute = route;
    let layoutConfig = null;

    while (currentRoute.firstChild) {
      currentRoute = currentRoute.firstChild;
      if (currentRoute.snapshot.data['layout']) {
        layoutConfig = currentRoute.snapshot.data['layout'];
        break;
      }
    }

    // Apply layout config if found in route data
    if (layoutConfig) {
      this.portalService.setLayoutConfig(layoutConfig);
    } else {
      // Use default layout if no specific config found
      this.portalService.resetLayoutConfig();
    }
  }
}
