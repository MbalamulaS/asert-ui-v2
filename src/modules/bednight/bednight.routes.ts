import { CustomRoutes } from 'app/type-interface';

export const bednightRoutes: CustomRoutes = [
  {
    path: 'manage-visitors',
    loadComponent: () =>
      import('modules/bednight/visitor/visitor.component').then(
        (m) => m.VisitorComponent
      ),
  },
  {
    path: 'manage-reservations',
    loadComponent: () =>
      import('modules/bednight/reservation/reservation.component').then(
        (m) => m.ReservationComponent
      ),
  },
  {
    path: 'manage-reservations/view',
    loadComponent: () =>
      import('modules/bednight/reservation/reservation-view.component').then(
        (m) => m.ReservationViewComponent
      ),
  },
];
