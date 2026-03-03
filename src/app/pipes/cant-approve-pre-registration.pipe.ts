import { Pipe, PipeTransform } from '@angular/core';
import { getCurrentUser } from 'utils/helpers';
import _ from 'lodash';
import { Facility } from 'modules/facility/facility/facility';

/*
 * Check if the current user can perform an action on a given resource.
 * Takes a string argument for the action and the resource.
 * Usage:
 *   '' | cant:'DELETE':'User'
 * Example:
 *   {{ '' | cant:'DELETE':'User' }}
 *   returns true or false based on the current user's permissions.
 */
@Pipe({
  name: 'cantApprovePreRegistration',
  standalone: true,
})
export class CantApprovePreRegistrationPipe implements PipeTransform {
  transform(_: any, action: string, facility: Facility): boolean {
    const currentUser = getCurrentUser();

    const { user } = currentUser;

    if (!user?.authorities) return false;

    const reviewStatuses = [
      'AWAITING_APPLICATION_FEES',
      'AWAITING_REGISTRATION_FEES',
      'PRE_REGISTRATION',
    ];

    const isPreRegistration = facility.status === 'PRE_REGISTRATION';

    const hasReviewState = user.roles[0].states.includes(facility.status);

    const isClient = user.roles[0].isClient;

    return (
      (!hasReviewState && isPreRegistration && !isClient) ||
      reviewStatuses.includes(facility.status)
    );
  }
}
