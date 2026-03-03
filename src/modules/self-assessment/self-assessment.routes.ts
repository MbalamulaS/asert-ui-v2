import { Routes } from '@angular/router';
import { AuthGuard } from 'app/guards/auth.guard';

export const selfAssessmentRoutes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    data: { title: 'Self-Assessments', publicRoute: true },
    loadComponent: () =>
      import('./components/self-assessment-dashboard.component').then(
        (m) => m.SelfAssessmentDashboardComponent,
      ),
  },
  {
    path: ':uuid/form',
    canActivate: [AuthGuard],
    data: { title: 'Complete Self-Assessment', publicRoute: true },
    loadComponent: () =>
      import('./components/self-assessment-form-wrapper.component').then(
        (m) => m.SelfAssessmentFormWrapperComponent,
      ),
  },
  {
    path: ':uuid/results',
    canActivate: [AuthGuard],
    data: { title: 'Self-Assessment Results', publicRoute: true },
    loadComponent: () =>
      import('./components/self-assessment-results.component').then(
        (m) => m.SelfAssessmentResultsComponent,
      ),
  },
  // TODO: Add routes for:
  // - /:uuid/compare - Compare with official assessment
];
