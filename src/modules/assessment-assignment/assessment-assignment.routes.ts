import {AuthGuard} from 'app/guards/auth.guard';
import {CustomRoutes} from 'app/type-interface';

export const assessmentAssignmentRoutes: CustomRoutes = [
  {
    path: 'assignments/list',
    canActivate: [AuthGuard],
    data: {backofficeOnly: true},
    loadComponent: () =>
      import(
        'modules/assessment-assignment/assignment.component'
        ).then((m) => m.AssignmentComponent),
  }
];
