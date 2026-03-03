import { AuthGuard } from 'app/guards/auth.guard';
import { CustomRoutes } from 'app/type-interface';

export const roleRoutes: CustomRoutes = [
  {
    path: 'manage-roles',
    canActivate: [AuthGuard],
    data: { backofficeOnly: true },
    loadComponent: () =>
      import('modules/role/role.component').then((m) => m.RoleComponent),
  },
  {
    path: 'manage-roles/permissions',
    canActivate: [AuthGuard],
    data: { backofficeOnly: true },
    loadComponent: () =>
      import('modules/role/components/role-permission.component').then(
        (m) => m.RolePermissionsComponent,
      ),
  },
];
