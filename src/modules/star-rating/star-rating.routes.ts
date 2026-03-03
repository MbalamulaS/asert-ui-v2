import { AuthGuard } from 'app/guards/auth.guard';
import { CustomRoutes } from 'app/type-interface';

export const starRatingRoutes: CustomRoutes = [
  {
    path: 'manage-star-ratings',
    canActivate: [AuthGuard],
    data: { backofficeOnly: true },
    loadComponent: () =>
      import('modules/star-rating/star-rating.component').then(
        (m) => m.StarRatingComponent,
      ),
  },
];
