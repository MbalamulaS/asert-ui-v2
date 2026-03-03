import { AuthGuard } from 'app/guards/auth.guard';
import { CustomRoutes } from 'app/type-interface';

export const dashboardRoutes: CustomRoutes = [
  {
    path: 'dashboard',
    canActivate: [AuthGuard],
    data: { backofficeOnly: true },
    loadComponent: () =>
      import('modules/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent,
      ),
  },
];
