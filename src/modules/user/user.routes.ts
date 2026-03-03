import { AuthGuard } from 'app/guards/auth.guard';
import { CustomRoutes } from 'app/type-interface';

export const userRoutes: CustomRoutes = [
  {
    path: 'manage-users',
    canActivate: [AuthGuard],
    data: { backofficeOnly: true },
    loadComponent: () =>
      import('modules/user/user.component').then((m) => m.UserComponent),
  },
];
