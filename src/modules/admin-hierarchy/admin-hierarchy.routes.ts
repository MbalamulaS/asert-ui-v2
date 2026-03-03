import { AuthGuard } from 'app/guards/auth.guard';
import { CustomRoutes } from 'app/type-interface';

export const adminHierarchyRoutes: CustomRoutes = [
  {
    path: 'manage-admin-hierarchy-levels',
    canActivate: [AuthGuard],
    data: { backofficeOnly: true },
    loadComponent: () =>
      import(
        'modules/admin-hierarchy/hierarchy-level/admin-hierarchy-level.component'
      ).then((m) => m.AdminHierarchyLevelComponent),
  },
  {
    path: 'manage-admin-hierarchies',
    canActivate: [AuthGuard],
    data: { backofficeOnly: true },
    loadComponent: () =>
      import('modules/admin-hierarchy/area/admin-hierarchy.component').then(
        (m) => m.AdminHierarchyComponent,
      ),
  },
];
