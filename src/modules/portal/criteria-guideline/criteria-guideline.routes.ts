import { CustomRoutes } from 'app/type-interface';

export const criteriaGuidelineRoutes: CustomRoutes = [
  {
    path: 'criteria-guidelines',
    loadComponent: () =>
      import('modules/portal/criteria-guideline/criteria-guideline.component').then(
        (m) => m.CriteriaGuidelineComponent
      ),
    data: { publicRoute: true },
  }
]
