import { CustomRoutes } from 'app/type-interface';

export const resetPasswordRoutes: CustomRoutes = [
  {
    path: 'reset-password/:token',
    loadComponent: () =>
      import('modules/portal/reset-password/reset-password-form').then(
        (m) => m.ResetPasswordFormComponent
      ),
    data: { publicRoute: true },
  },
];
