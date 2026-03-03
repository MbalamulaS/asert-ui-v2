import { AuthGuard } from 'app/guards/auth.guard';
import { CustomRoutes } from 'app/type-interface';

export const assessmentRoutes: CustomRoutes = [
  {
    path: 'assessment-requests',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('modules/assessment/components/assessment-request.component').then(
        (m) => m.AssessmentRequestComponent,
      ),
    data: { backofficeOnly: true },
  },
  {
    path: 'assessment-variance-resolutions',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('modules/assessment/variance/components/variance-list/variance-list.component').then(
        (m) => m.VarianceListComponent,
      ),
    data: { backofficeOnly: true },
  },
  {
    path: 'dt-approvals',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('modules/assessment/variance/components/dt-approval-dashboard/dt-approval-dashboard.component').then(
        (m) => m.DtApprovalDashboardComponent,
      ),
    data: { backofficeOnly: true },
  },
  {
    path: 'variance-configurations',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('modules/assessment/variance/components/variance-threshold-config/variance-threshold-config.component').then(
        (m) => m.VarianceThresholdConfigComponent,
      ),
    data: { backofficeOnly: true },
  },
];
