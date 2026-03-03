import { AuthGuard } from 'app/guards/auth.guard';
import { CustomRoutes } from 'app/type-interface';

export const apiKeyRoutes: CustomRoutes = [
  {
    path: 'manage-api-keys',
    canActivate: [AuthGuard],
    data: { backofficeOnly: true },
    loadComponent: () =>
      import('modules/api-keys/api-key.component').then(
        (m) => m.ApiKeyComponent,
      ),
  },
];
