import { AuthGuard } from 'app/guards/auth.guard';
import { CustomRoutes } from 'app/type-interface';

export const setupRoutes: CustomRoutes = [
  {
    path: 'manage-financial-years',
    canActivate: [AuthGuard],
    data: { backofficeOnly: true },
    loadComponent: () =>
      import('modules/setup/financial-year/financial-year.component').then(
        (m) => m.FinancialYearComponent
      ),
  },
  {
    path: 'manage-facility-levels',
    canActivate: [AuthGuard],
    data: { backofficeOnly: true },
    loadComponent: () =>
      import('modules/setup/facility-level/facility-level.component').then(
        (m) => m.FacilityLevelComponent
      ),
  },
  {
    path: 'manage-facility-level-groups',
    canActivate: [AuthGuard],
    data: { backofficeOnly: true },
    loadComponent: () =>
      import(
        'modules/setup/facility-level-group/facility-level-group.component'
      ).then((m) => m.FacilityLevelGroupComponent),
  },
  {
    path: 'manage-facility-types',
    canActivate: [AuthGuard],
    data: { backofficeOnly: true },
    loadComponent: () =>
      import('modules/setup/facility-type/facility-type.component').then(
        (m) => m.FacilityTypeComponent
      ),
  },
  {
    path: 'manage-equipment-categories',
    canActivate: [AuthGuard],
    data: { backofficeOnly: true },
    loadComponent: () =>
      import(
        'modules/setup/equipment-category/equipment-category.component'
      ).then((m) => m.EquipmentCategoryComponent),
  },

  {
    path: 'manage-facility-ownership-authorities',
    canActivate: [AuthGuard],
    data: { backofficeOnly: true },
    loadComponent: () =>
      import(
        'modules/setup/facility-ownership-authority/facility-ownership-authority.component'
      ).then((m) => m.FacilityOwnershipAuthorityComponent),
  },

  {
    path: 'manage-facility-registration-status',
    canActivate: [AuthGuard],
    data: { backofficeOnly: true },
    loadComponent: () =>
      import(
        'modules/setup/facility-registration-status/facility-registration-status.component'
      ).then((m) => m.FacilityRegistrationStatusComponent),
  },

  {
    path: 'manage-facility-referral-point-transport',
    canActivate: [AuthGuard],
    data: { backofficeOnly: true },
    loadComponent: () =>
      import(
        'modules/setup/facility-referral-point-transport/facility-referral-point-transport.component'
      ).then((m) => m.FacilityReferralPointTransportComponent),
  },

  {
    path: 'manage-facility-ownership-categories',
    canActivate: [AuthGuard],
    data: { backofficeOnly: true },
    loadComponent: () =>
      import(
        'modules/setup/facility-ownership-category/facility-ownership-category.component'
      ).then((m) => m.FacilityOwnershipCategoryComponent),
  },
  {
    path: 'manage-facility-operation-status',
    canActivate: [AuthGuard],
    data: { backofficeOnly: true },
    loadComponent: () =>
      import(
        'modules/setup/facility-operation/facility-operation-statuses.component'
      ).then((m) => m.FacilityOperationComponent),
  },
  {
    path: 'manage-facility-fund-sources',
    canActivate: [AuthGuard],
    data: { backofficeOnly: true },
    loadComponent: () =>
      import(
        'modules/setup/facility-fund-sources/facility-fund-sources.component'
      ).then((m) => m.FacilityFundSourcesComponent),
  },
  {
    path: 'manage-equipment',
    canActivate: [AuthGuard],
    data: { backofficeOnly: true },
    loadComponent: () =>
      import('modules/setup/equipment/equipment.component').then(
        (m) => m.EquipmentComponent
      ),
  },

  {
    path: 'manage-services',
    canActivate: [AuthGuard],
    data: { backofficeOnly: true },
    loadComponent: () =>
      import('modules/setup/service/service.component').then(
        (m) => m.ServiceComponent
      ),
  },
  {
    path: 'manage-service-categories',
    canActivate: [AuthGuard],
    data: { backofficeOnly: true },
    loadComponent: () =>
      import('modules/setup/service-category/service-category.component').then(
        (m) => m.ServiceCategoryComponent
      ),
  },
  {
    path: 'manage-application-types',
    canActivate: [AuthGuard],
    data: { backofficeOnly: true },
    loadComponent: () =>
      import('modules/setup/application-type/application-type.component').then(
        (m) => m.ApplicationTypeComponent
      ),
  },
  {
    path: 'manage-premises',
    canActivate: [AuthGuard],
    data: { backofficeOnly: true },
    loadComponent: () =>
      import('modules/setup/premise/premise.component').then(
        (m) => m.PremiseComponent
      ),
  },
  {
    path: 'manage-infrastructure-category',
    canActivate: [AuthGuard],
    data: { backofficeOnly: true },
    loadComponent: () =>
      import(
        'modules/setup/infrastructure-category/infrastructure-category.component'
      ).then((m) => m.InfrastructureCategoryComponent),
  },
  {
    path: 'manage-staff-titles',
    canActivate: [AuthGuard],
    data: { backofficeOnly: true },
    loadComponent: () =>
      import('modules/setup/staff-title/staff-title.component').then(
        (m) => m.StaffTitleComponent
      ),
  },
  {
    path: 'manage-infrastructure',
    canActivate: [AuthGuard],
    data: { backofficeOnly: true },
    loadComponent: () =>
      import('modules/setup/infrastructure/infrastructure.component').then(
        (m) => m.InfrastructureComponent
      ),
  },
  {
    path: 'manage-bill-types',
    canActivate: [AuthGuard],
    data: { backofficeOnly: true },
    loadComponent: () =>
      import('modules/setup/bill-type/bill-type.component').then(
        (m) => m.BillTypeComponent
      ),
  },
  {
    path: 'manage-education-institutions',
    loadComponent: () =>
      import(
        'modules/setup/education-institution/education-institution.component'
      ).then((m) => m.EducationInstitutionComponent),
  },
  {
    path: 'manage-education-levels',
    loadComponent: () =>
      import('modules/setup/education-level/education-level.component').then(
        (m) => m.EducationLevelComponent
      ),
  },
  {
    path: 'manage-education-courses',
    loadComponent: () =>
      import('modules/setup/education-course/education-course.component').then(
        (m) => m.EducationCourseComponent
      ),
  },
  {
    path: 'manage-document-types',
    loadComponent: () =>
      import('modules/setup/document-type/document-type.component').then(
        (m) => m.DocumentTypeComponent
      ),
  },
  {
    path: 'manage-assessor-rejection-reasons',
    loadComponent: () =>
      import(
        'modules/setup/assessor-rejection-reason/assessor-rejection-reason.component'
      ).then((m) => m.AssessorRejectionReasonComponent),
  },
  {
    path: 'manage-countries',
    loadComponent: () =>
      import('modules/setup/country/country.component').then(
        (m) => m.CountryComponent
      ),
  },
  {
    path: 'manage-identification-types',
    loadComponent: () =>
      import(
        'modules/setup/identification-type/identification-type.component'
      ).then((m) => m.IdentificationTypeComponent),
  },
  {
    path: 'manage-incident-report-types',
    loadComponent: () =>
      import(
        'modules/setup/incident-report-type/incident-report-type.component'
      ).then((m) => m.IncidentReportTypeComponent),
  },
  {
    path: 'manage-company-types',
    loadComponent: () =>
      import(
        'modules/setup/company-type/company-type.component'
      ).then((m) => m.CompanyTypeComponent),
  },
];
