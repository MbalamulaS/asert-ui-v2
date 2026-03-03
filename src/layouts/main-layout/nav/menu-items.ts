export type MenuGroup = {
  id?: number;
  uuid: string;
  name: string;
  icon: string;
  state: string;
  translationLabel?: string;
};

export interface MenuItem {
  id?: number;
  uuid?: string;
  name: string;
  icon?: string;
  translationLabel?: string;
  state: string;
  menuGroup?: string | null;
  sortOrder: number;
  children?: MenuItem[];
  isOpen?: boolean;
}

export const menuItems: MenuItem[] = [
  {
    name: 'Dashboard',
    translationLabel: 'DASHBOARD',
    icon: 'home',
    state: '/dashboard',
    menuGroup: null,
    sortOrder: 1,
  },
  {
    name: 'Manage Users',
    translationLabel: 'MANAGE_USERS',
    icon: 'account_box',
    state: null,
    menuGroup: null,
    sortOrder: 2,
  },
  {
    name: 'Api Keys',
    translationLabel: 'API_KEYS',
    icon: 'api',
    state: null,
    menuGroup: null,
    sortOrder: 3,
  },
  {
    name: 'Roles & Permissions',
    translationLabel: 'ROLES_PERMISSIONS',
    icon: 'token',
    state: null,
    sortOrder: 4,
    isOpen: false,
    children: [
      {
        name: 'Roles',
        state: '/manage-roles',
        icon: null,
        translationLabel: 'ROLES',
        sortOrder: 1,
      },
      {
        name: 'Menu Groups',
        state: '/manage-menu-groups',
        icon: null,
        translationLabel: 'MENU_GROUPS',
        sortOrder: 2,
      },
      {
        name: 'Menu Items',
        state: '/manage-menu-items',
        icon: null,
        translationLabel: 'MENU_ITEMS',
        sortOrder: 3,
      },
    ],
  },
  {
    name: 'Setup',
    icon: 'settings',
    isOpen: false,
    translationLabel: 'SETUP',
    state: null,
    sortOrder: 7,
    children: [
      {
        name: 'Financial Years',
        state: '/manage-financial-years',
        icon: null,
        translationLabel: 'FINANCIAL_YEARS',
        sortOrder: 1,
      },
      {
        name: 'Bed Types',
        state: '/manage-bed-types',
        icon: null,
        translationLabel: 'BED_TYPES',
        sortOrder: 1,
      },
      {
        name: 'Assessor Rejection Reasons',
        state: '/manage-assessor-rejection-reasons',
        icon: null,
        translationLabel: 'ASSESSOR_REJECTION_REASONS',
        sortOrder: 23,
      },
      {
        name: 'Countries',
        state: '/manage-countries',
        icon: null,
        translationLabel: 'COUNTRIES',
        sortOrder: 23,
      },
      {
        name: 'Countries',
        state: '/manage-countries',
        icon: null,
        translationLabel: 'COUNTRIES',
        sortOrder: 24,
      },
      {
        name: 'Incident Report Types',
        state: '/manage-incident-report-types',
        icon: null,
        translationLabel: 'INCIDENT_REPORT_TYPES',
        sortOrder: 25,
      },
      {
        name: 'Identification Types',
        state: '/manage-identification-types',
        icon: null,
        translationLabel: 'IDENTIFICATION_TYPES',
        sortOrder: 26,
      },
      {
        name: 'Company Types',
        state: '/manage-company-types',
        icon: null,
        translationLabel: 'COMPANY_TYPES',
        sortOrder: 26,
      },
      {
        name: 'Manage Rating Criteria',
        state: '/manage-star-ratings',
        icon: 'hotel_class',
        translationLabel: 'STAR_RATING',
        sortOrder: 26,
      },
      {
        name: 'Manage Variance Thresholds',
        state: '/variance-configurations',
        icon: 'tune',
        translationLabel: 'VARIANCE_THRESHOLD_CONFIGURATION',
        sortOrder: 26,
      },
    ],
  },

  {
    name: 'Admin Hierarchy',
    icon: 'account_tree',
    state: null,
    sortOrder: 8,
    isOpen: false,
    children: [
      {
        name: 'Levels',
        state: '/manage-admin-hierarchy-levels',
        icon: null,
        translationLabel: 'ADMIN_HIERARCHY_LEVELS',
        sortOrder: 1,
      },
      {
        name: 'Admin Areas',
        state: '/manage-admin-hierarchies',
        icon: null,
        translationLabel: 'ADMIN_HIERARCHIES',
        sortOrder: 2,
      },
    ],
  },

  {
    name: 'Bills & Payments',
    icon: 'account_balance_wallet',
    state: null,
    sortOrder: 9,
    isOpen: false,
    children: [
      {
        name: 'Bills',
        state: '/manage-bills',
        icon: null,
        translationLabel: 'BILLS_MANAGEMENT',
        sortOrder: 1,
      },
      {
        name: 'Payments',
        state: '/manage-payments',
        icon: null,
        translationLabel: 'PAYMENT_MANAGEMENT',
        sortOrder: 2,
      },
    ],
  },
  {
    name: 'Assessor Details',
    icon: 'account_balance_wallet',
    state: null,
    sortOrder: 9,
    isOpen: false,
    children: [
      {
        name: 'Profile & Preferences',
        state: '/assessor/onboarding',
        icon: null,
        translationLabel: 'UPDATE_PROFILE',
        sortOrder: 0,
      },
      {
        name: 'Assignments',
        state: '/assessor/assignments',
        icon: null,
        translationLabel: 'ASSIGNMENTS',
        sortOrder: 1,
      },
      {
        name: 'Self Assessment Requests',
        state: '/assessor/self-assessment-requests',
        icon: null,
        translationLabel: 'SELF_ASSESSMENT_REQUESTS',
        sortOrder: 3,
      },
    ],
  },
  {
    name: 'Assessors',
    icon: 'account_balance_wallet',
    state: null,
    sortOrder: 9,
    isOpen: false,
    children: [
      {
        name: 'New Applications',
        state: '/assessor-management/new-applications',
        icon: null,
        translationLabel: 'NEW_APPLICATIONS',
        sortOrder: 1,
      },
      {
        name: 'Approved Applications',
        state: '/assessor-management/approved-applications',
        icon: null,
        translationLabel: 'APPROVED_APPLICATIONS',
        sortOrder: 2,
      },
      {
        name: 'Rejected Applications',
        state: '/assessor-management/rejected-applications',
        icon: null,
        translationLabel: 'REJECTED_APPLICATIONS',
        sortOrder: 2,
      },
    ],
  },
  {
    name: 'Forms Management',
    icon: 'build',
    isOpen: false,
    translationLabel: 'FORMS',
    state: null,
    sortOrder: 7,
    children: [
      {
        name: 'Forms Managements',
        state: '/manage-forms',
        icon: null,
        translationLabel: 'FORM_BUILDER',
        sortOrder: 1,
      },
    ],
  },
  {
    name: 'Assessments',
    icon: 'rate_review',
    isOpen: false,
    translationLabel: 'ASSESSMENTS',
    state: null,
    sortOrder: 7,
    children: [
      {
        name: 'Manage Assessments',
        state: '/manage-establishments',
        icon: null,
        translationLabel: 'ASSESSMENTS',
        sortOrder: 1,
      },
      {
        name: 'Assessment Requests',
        state: '/assessment-requests',
        icon: null,
        translationLabel: 'ASSESSMENT_REQUESTS',
        sortOrder: 2,
      },
      {
        name: 'Pending Approvals',
        state: '/submissions-pending-approval',
        icon: null,
        translationLabel: 'PENDING_APPROVALS',
        sortOrder: 3,
      },
      {
        name: 'Variance Resolutions',
        state: '/assessment-variance-resolutions',
        icon: null,
        translationLabel: 'ASSESSMENT_VARIANCE_RESOLUTIONS',
        sortOrder: 4,
      },
      {
        name: 'My Assessments',
        state: '/my-assessments',
        icon: null,
        translationLabel: 'MY_ASSESSMENTS',
        sortOrder: 5,
      },
    ],
  },
  {
    name: 'Assignments',
    icon: 'account_balance_wallet',
    state: null,
    sortOrder: 10,
    isOpen: false,
    children: [
      {
        name: 'View',
        state: '/assignments/list',
        icon: null,
        translationLabel: 'ASSIGNMENTS',
        sortOrder: 1,
      },
    ],
  },
  {
    name: 'Bednight',
    icon: 'bed',
    state: null,
    sortOrder: 10,
    isOpen: false,
    children: [
      {
        name: 'Visitors',
        state: '/manage-visitors',
        icon: null,
        translationLabel: 'VISITORS',
        sortOrder: 26,
      },
      {
        name: 'Reservations',
        state: '/manage-reservations',
        icon: null,
        translationLabel: 'RESERVATIONS',
        sortOrder: 27,
      },
    ],
  },
];
