import { AuthGuard } from 'app/guards/auth.guard';
import { CustomRoutes } from 'app/type-interface';

export const bedTypeRoutes: CustomRoutes = [
  {
    path: 'manage-bed-types',
    canActivate: [AuthGuard],
    data: { backofficeOnly: true },
    loadComponent: () =>
      import('modules/bed-type/bed-type.component').then(
        (m) => m.BedTypeComponent,
      ),
  },
];
