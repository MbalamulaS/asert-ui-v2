import { CustomRoutes } from 'app/type-interface';

export const accreditedAssessorRoutes: CustomRoutes = [
  {
    path: 'accredited-assessors',
    loadComponent: () =>
      import(
        'modules/portal/accredited-assessor-list/accredited-assessor-list.component'
      ).then((m) => m.AccreditedAssessorListComponent),
    data: { publicRoute: true },
  },
];
