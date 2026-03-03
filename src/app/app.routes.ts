import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MainLayoutComponent } from 'layouts/main-layout/main-layout.component';
import { userRoutes } from 'modules/user/user.routes';
import { dashboardRoutes } from 'modules/dashboard/dashboard.routes';
import { roleRoutes } from 'modules/role/role.routes';
import { AuthGuard } from 'app/guards/auth.guard';
import { setupRoutes } from 'modules/setup/setup.routes';
import { menuRoutes } from 'modules/menu-item/menu-routes';
import { adminHierarchyRoutes } from 'modules/admin-hierarchy/admin-hierarchy.routes';
import { facilityRoutes } from 'modules/facility/facility.routes';
import { billRoutes } from 'modules/billing/bill.routes';
import { PortalLayoutComponent } from 'layouts/portal-layout/portal-layout.component';
import { portalRoutes } from 'modules/portal/portal.routes';
import { apiKeyRoutes } from 'modules/api-keys/api.key.routes';
import { formRoutes } from 'modules/forms/form.routes';
import { BackofficeGuard } from './guards/back-office.guard';
import { CustomRoutes } from './type-interface';
import { myProfileRoutes } from 'modules/my-profile/my-profile.routes';
import { assessorManagementRoutes } from 'modules/assessor-management/assessor-management.routes';
import { hotelRoutes } from 'modules/portal/hotels/hotel.routes';
import { assessmentAssignmentRoutes } from 'modules/assessment-assignment/assessment-assignment.routes';
import { assessmentRoutes } from 'modules/assessment/assessment.routes';
import { bedTypeRoutes } from 'modules/bed-type/bed-type.routes';
import { portalLandingRoutes } from 'modules/portal/landing/portal-landing.routes';
import { accreditedAssessorRoutes } from 'modules/portal/accredited-assessor-list/accredited-assessor.routes';
import { gradedFacilityRoutes } from 'modules/portal/facility/graded-facility.routes';
import { bednightRoutes } from 'modules/bednight/bednight.routes';
import { starRatingRoutes } from 'modules/star-rating/star-rating.routes';
import { resetPasswordRoutes } from 'modules/portal/reset-password/reset-password.routes';
import { criteriaGuidelineRoutes } from 'modules/portal/criteria-guideline/criteria-guideline.routes';
import { selfAssessmentRoutes } from 'modules/self-assessment/self-assessment.routes';

const modifiedPortalRoutes = portalRoutes.map((route) => {
  if (route.path === '') {
    return {
      ...route,
      data: {
        ...route.data,
        layout: {
          contentWidth: 'w-full',
          navbarColor: 'default',
        },
      },
    };
  }
  return route;
});

const largeWidthPortalRoutes = accreditedAssessorRoutes.map((route) => {
  return {
    ...route,
    data: {
      ...route.data,
      layout: {
        contentWidth: 'w-full',
        navbarColor: 'primary',
      },
    },
  };
});
const largeWidthPortalFacilityRoutes = gradedFacilityRoutes.map((route) => {
  return {
    ...route,
    data: {
      ...route.data,
      layout: {
        contentWidth: 'w-full',
        navbarColor: 'primary',
      },
    },
  };
});

const largeWidthPortalResetPasswordRoutes = resetPasswordRoutes.map((route) => {
  return {
    ...route,
    data: {
      ...route.data,
      layout: {
        contentWidth: 'w-full',
        navbarColor: 'primary',
      },
    },
  };
});

const largeWidthPortalCriteriaGuidelineRoutes = criteriaGuidelineRoutes.map((route) => {
  return {
    ...route,
    data: {
      ...route.data,
      layout: {
        contentWidth: 'w-full',
        navbarColor: 'primary',
      },
    },
  };
});

const constrainedWidthRoutes = [
  ...hotelRoutes,
  ...portalLandingRoutes,
  ...bednightRoutes,
].map((route) => ({
  ...route,
  data: {
    ...route.data,
    layout: {
      contentWidth: 'container mt-20 pb-10 mx-auto max-w-[80%]',
      navbarColor: 'primary',
    },
  },
}));

const selfAssessmentRoutesWithLayout = selfAssessmentRoutes.map((route) => ({
  ...route,
  path: `self-assessment/${route.path}`,
  data: {
    ...route.data,
    layout: {
      contentWidth: 'container mt-20 pb-10 mx-auto max-w-[80%]',
      navbarColor: 'primary',
    },
  },
}));

export const routes: CustomRoutes = [
  {
    path: '',
    component: PortalLayoutComponent,
    children: [
      ...modifiedPortalRoutes,
      ...constrainedWidthRoutes,
      ...selfAssessmentRoutesWithLayout,
      ...largeWidthPortalRoutes,
      ...largeWidthPortalFacilityRoutes,
      ...largeWidthPortalResetPasswordRoutes,
      ...largeWidthPortalCriteriaGuidelineRoutes
    ],
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard, BackofficeGuard],
    children: [
      ...dashboardRoutes,
      ...userRoutes,
      ...roleRoutes,
      ...bedTypeRoutes,
      ...setupRoutes,
      ...menuRoutes,
      ...adminHierarchyRoutes,
      ...facilityRoutes,
      ...billRoutes,
      ...apiKeyRoutes,
      ...formRoutes,
      ...myProfileRoutes,
      ...assessorManagementRoutes,
      ...assessmentAssignmentRoutes,
      ...assessmentRoutes,
      ...starRatingRoutes,

      { path: 'dashboard', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  // Catch-all route
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
