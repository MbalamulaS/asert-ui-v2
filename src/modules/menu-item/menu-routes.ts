import { AuthGuard } from 'app/guards/auth.guard';
import { CustomRoutes } from 'app/type-interface';

export const menuRoutes: CustomRoutes = [
  {
    path: 'manage-menu-items',
    canActivate: [AuthGuard],
    data: { backofficeOnly: true },
    loadComponent: () =>
      import('modules/menu-item/menu-item.component').then(
        (m) => m.MenuItemComponent,
      ),
  },
  {
    path: 'manage-menu-groups',
    canActivate: [AuthGuard],
    data: { backofficeOnly: true },
    loadComponent: () =>
      import('modules/menu-group/menu-group.component').then(
        (m) => m.MenuGroupComponent,
      ),
  },
];
