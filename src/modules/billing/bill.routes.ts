import { AuthGuard } from 'app/guards/auth.guard';
import { CustomRoutes } from 'app/type-interface';

export const billRoutes: CustomRoutes = [
  {
    path: 'manage-bills',
    canActivate: [AuthGuard],
    data: { backofficeOnly: false },
    loadComponent: () =>
      import('modules/billing/bill.component').then((m) => m.BillComponent),
  },
  {
    path: 'manage-payments',
    canActivate: [AuthGuard],
    data: { backofficeOnly: false },
    loadComponent: () =>
      import('modules/payment/payment.component').then(
        (m) => m.PaymentComponent,
      ),
  },
];
