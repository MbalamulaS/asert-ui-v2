import { AuthGuard } from 'app/guards/auth.guard';
import { CustomRoutes } from 'app/type-interface';

export const hotelRoutes: CustomRoutes = [
  {
    path: 'manage-listings',
    canActivate: [AuthGuard],
    data: { publicRoute: true },
    loadComponent: () =>
      import('modules/portal/hotels/hotel.component').then(
        (m) => m.HotelComponent,
      ),
  },
  {
    path: 'preview-listing/:id',
    canActivate: [AuthGuard],
    data: { publicRoute: true },
    loadComponent: () =>
      import('modules/portal/hotels/components/preview-listing.component').then(
        (m) => m.PreviewListingComponent,
      ),
  },
  {
    path: 'edit-listing/:id',
    canActivate: [AuthGuard],
    data: { publicRoute: true },
    loadComponent: () =>
      import('modules/portal/hotels/components/edit-listing.component').then(
        (m) => m.EditListingComponent,
      ),
  },
  {
    path: 'listing-details/:id',
    canActivate: [AuthGuard],
    data: { publicRoute: true },
    loadComponent: () =>
      import('modules/portal/hotels/components/hotel-details.component').then(
        (m) => m.HotelDetailsComponent,
      ),
  },
  {
    path: 'listing-assessment-results/:id',
    canActivate: [AuthGuard],
    data: { publicRoute: true },
    loadComponent: () =>
      import('modules/portal/hotels/components/hotel-results.component').then(
        (m) => m.HotelResultsComponent,
      ),
  },
  {
    path: 'preview-listing/:id/self-assessment',
    canActivate: [AuthGuard],
    data: { publicRoute: true },
    loadComponent: () =>
      import('modules/facility/components/assessment-form.component').then(
        (m) => m.HotelAssessmentFormComponent,
      ),
  },
];
