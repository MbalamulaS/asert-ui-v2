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
  name: 'cantApprove',
  standalone: true,
})
export class CantApprovePipe implements PipeTransform {
  transform(_: any, action: string, facility: Facility): boolean {
    const currentUser = getCurrentUser();

    const { user } = currentUser;

    if (!user?.authorities) return false;

    const paymentStates = [
      'AWAITING_APPLICATION_FEES',
      'AWAITING_REGISTRATION_FEES',
    ];

    const hasNoPermission = !user.authorities.some(
      (auth) => auth.action === action && auth.resource === 'Facility',
    );

    const isAwaitingPayments = paymentStates.includes(facility.status);

    return isAwaitingPayments && hasNoPermission;
  }
}

// first condition: facility is not registered i.e => facility.status === 'AWAITING_APPLICATION_FEES' || facility.status === 'AWAITING_REGISTRATION_FEES'
// current user's role .isCleint = !true
// current user's role .hasApproval role && approval roles are in the list of
// approvable roles
//INCOMPLETE_SUBMISSION,
//AWAITING_APPLICATION_FEES,
//APPLICATION_EXPIRED,
//AWAITING_INSPECTION,
//FAILED_INSPECTION,
//AWAITING_BOARD_REVIEW,
//FAILED_BOARD_REVIEW,
//AWAITING_REGISTRATION_FEES,
//REGISTRATION_EXPIRED,
//AWAITING_HFR_CODES,
