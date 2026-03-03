import { CustomRoutes } from 'app/type-interface';

export const portalRoutes: CustomRoutes = [
  {
    path: '',
    loadComponent: () =>
      import('modules/portal/home/home.component').then(
        (m) => m.PortalHomeComponent,
      ),
    data: { publicRoute: true },
  },
  
];
