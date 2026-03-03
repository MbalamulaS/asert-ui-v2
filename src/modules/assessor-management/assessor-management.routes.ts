import { AuthGuard } from 'app/guards/auth.guard';
import { CustomRoutes } from 'app/type-interface';

export const assessorManagementRoutes: CustomRoutes = [
  {
    path: 'assessor-management/new-applications',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import(
        'modules/assessor-management/assessor-new-application.component'
      ).then((m) => m.AssessorNewApplicationComponent),
    data: { backofficeOnly: true },
  },
  {
    path: 'assessor-management/approved-applications',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import(
        'modules/assessor-management/assessor-approved-application.component'
      ).then((m) => m.AssessorApprovedApplicationComponent),
    data: { backofficeOnly: true },
  },
  {
    path: 'assessor-management/rejected-applications',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import(
        'modules/assessor-management/assessor-rejected-application.component'
      ).then((m) => m.AssessorRejectedApplicationComponent),
    data: { backofficeOnly: true },
  },
];
