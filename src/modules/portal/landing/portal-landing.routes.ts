import { AuthGuard } from 'app/guards/auth.guard';
import { CustomRoutes } from 'app/type-interface';

export const portalLandingRoutes: CustomRoutes = [
  {
    path: 'manage',
    canActivate: [AuthGuard],
    data: { publicRoute: true },
    loadComponent: () =>
      import('modules/portal/landing/portal-landing.component').then(
        (m) => m.PortalManagementComponent,
      ),
  },
];
