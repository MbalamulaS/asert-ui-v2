import { CustomRoutes } from 'app/type-interface';

export const gradedFacilityRoutes: CustomRoutes = [
  {
    path: 'graded-facilities',
    loadComponent: () =>
      import('modules/portal/facility/graded-facility.component').then(
        (m) => m.GradedFacilitiesComponent
      ),
    data: { publicRoute: true },
  },
  {
    path: 'preview-graded-facility/:id',
    loadComponent: () =>
      import('modules/portal/facility/preview-graded-facility.component').then(
        (m) => m.PreviewGradedFacilityComponent
      ),
    data: { publicRoute: true },
  },
];
