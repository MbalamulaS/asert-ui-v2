import { AuthGuard } from 'app/guards/auth.guard';
import { CustomRoutes } from 'app/type-interface';

export const facilityRoutes: CustomRoutes = [
  {
    path: 'manage-establishments',
    canActivate: [AuthGuard],
    data: { backofficeOnly: true },
    loadComponent: () =>
      import('modules/facility/facility.component').then(
        (m) => m.FacilityComponent,
      ),
  },
  {
    path: 'establishment-details',
    canActivate: [AuthGuard],
    data: { backofficeOnly: true },
    loadComponent: () =>
      import('modules/facility/components/facility-details.component').then(
        (m) => m.HotelDetailsComponent,
      ),
  },
  {
    path: 'establishment-details/assessment/:id',
    canActivate: [AuthGuard],
    data: { backofficeOnly: true },
    loadComponent: () =>
      import('modules/facility/components/assessment-form.component').then(
        (m) => m.HotelAssessmentFormComponent,
      ),
  },
  {
    path: 'establishment-assessment-results/:id',
    canActivate: [AuthGuard],
    data: { backofficeOnly: true },
    loadComponent: () =>
      import('modules/facility/components/hotel-results.component').then(
        (m) => m.HotelResultsComponent,
      ),
  },
];
