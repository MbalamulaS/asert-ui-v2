import { AuthGuard } from 'app/guards/auth.guard';
import { CustomRoutes } from 'app/type-interface';

export const myProfileRoutes: CustomRoutes = [
  {
    path: 'assessor/assignments',
    canActivate: [AuthGuard],
    data: { backofficeOnly: true },
    loadComponent: () =>
      import('modules/my-profile/my-assignment.component').then(
        (m) => m.MyAssignmentComponent,
      ),
  },
  {
    path: 'assessor/onboarding-demo',
    canActivate: [AuthGuard],
    data: { backofficeOnly: true },
    loadComponent: () =>
      import('modules/my-profile/assessor-onboarding-demo.component').then(
        (m) => m.AssessorOnboardingDemoComponent,
      ),
  },
  {
    path: 'assessor/onboarding',
    canActivate: [AuthGuard],
    data: { backofficeOnly: true },
    loadComponent: () =>
      import('modules/my-profile/assessor-onboarding-overview.component').then(
        (m) => m.AssessorOnboardingOverviewComponent,
      ),
  },
  {
    path: 'assessor/onboarding/personal',
    canActivate: [AuthGuard],
    data: { backofficeOnly: true },
    loadComponent: () =>
      import('modules/my-profile/sections/personal-info.component').then(
        (m) => m.PersonalInfoComponent,
      ),
  },
  {
    path: 'assessor/onboarding/education',
    canActivate: [AuthGuard],
    data: { backofficeOnly: true },
    loadComponent: () =>
      import('modules/my-profile/sections/academic-qualifications.component').then(
        (m) => m.AcademicQualificationsComponent,
      ),
  },
  {
    path: 'assessor/onboarding/employment',
    canActivate: [AuthGuard],
    data: { backofficeOnly: true },
    loadComponent: () =>
      import('modules/my-profile/sections/work-experience.component').then(
        (m) => m.WorkExperienceComponent,
      ),
  },
  {
    path: 'assessor/onboarding/certifications',
    canActivate: [AuthGuard],
    data: { backofficeOnly: true },
    loadComponent: () =>
      import('modules/my-profile/sections/certifications.component').then(
        (m) => m.CertificationsComponent,
      ),
  },
  {
    path: 'assessor/onboarding/references',
    canActivate: [AuthGuard],
    data: { backofficeOnly: true },
    loadComponent: () =>
      import('modules/my-profile/sections/references.component').then(
        (m) => m.ReferencesComponent,
      ),
  },
  {
    path: 'assessor/onboarding/preferences',
    canActivate: [AuthGuard],
    data: { backofficeOnly: true },
    loadComponent: () =>
      import('modules/my-profile/sections/preferences.component').then(
        (m) => m.PreferencesComponent,
      ),
  },
  {
    path: 'assessor/onboarding/preview',
    canActivate: [AuthGuard],
    data: { backofficeOnly: true },
    loadComponent: () =>
      import('modules/my-profile/sections/profile-preview.component').then(
        (m) => m.ProfilePreviewComponent,
      ),
  },
  {
    path: 'assessor/update',
    canActivate: [AuthGuard],
    data: { backofficeOnly: true },
    loadComponent: () =>
      import('modules/my-profile/update-profile.component').then(
        (m) => m.UpdateProfileComponent,
      ),
  },
  {
    path: 'assessor/self-assessment-requests',
    canActivate: [AuthGuard],
    data: { backofficeOnly: true },
    loadComponent: () =>
      import('modules/my-profile/self-assessment-request.component').then(
        (m) => m.SelfAssessmentRequestComponent,
      ),
  },
  {
    path: 'my-assessments',
    canActivate: [AuthGuard],
    data: { backofficeOnly: true },
    loadComponent: () =>
      import('modules/my-profile/my-assessments.component').then(
        (m) => m.MyAssessmentsComponent,
      ),
  },
];
