import { AuthGuard } from 'app/guards/auth.guard';
import { CustomRoutes } from 'app/type-interface';

export const formRoutes: CustomRoutes = [
  {
    path: 'manage-forms',
    canActivate: [AuthGuard],
    data: { backofficeOnly: true },
    loadComponent: () =>
      import('modules/forms/form-list.component').then(
        (m) => m.FormListComponent,
      ),
  },
  {
    path: 'forms/create',
    canActivate: [AuthGuard],
    data: { backofficeOnly: true },
    loadComponent: () =>
      import('modules/forms/components/form-builder.component').then(
        (m) => m.FormBuilderComponent,
      ),
  },
  {
    path: 'forms/edit/:id',
    canActivate: [AuthGuard],
    data: { backofficeOnly: true },
    loadComponent: () =>
      import('modules/forms/components/form-builder.component').then(
        (m) => m.FormBuilderComponent,
      ),
  },
  {
    path: 'forms/fill/:id',
    canActivate: [AuthGuard],
    data: { backofficeOnly: true },
    loadComponent: () =>
      import('modules/forms/components/form-wizard.component').then(
        (m) => m.FormWizardComponent,
      ),
  },
   {
     path: 'forms/:uuid/submissions',
     canActivate: [AuthGuard],
     data: { backofficeOnly: true },
     loadComponent: () =>
       import('modules/forms/components/form-submissions.component').then(
         (m) => m.FormSubmissionsListComponent,
       ),
   },
  {
    path: 'submissions/:uuid',
    canActivate: [AuthGuard],
    data: { backofficeOnly: true },
    loadComponent: () =>
      import('modules/forms/components/form-submission.detail.component').then(
        (m) => m.FormSubmissionDetailComponent,
      ),
  },
  {
    path: 'submissions-pending-approval',
    canActivate: [AuthGuard],
    data: { backofficeOnly: true },
    loadComponent: () =>
      import('modules/forms/components/submissions-approval.component').then(
        (m) => m.SubmissionsApprovalComponent,
      ),
  },
];
