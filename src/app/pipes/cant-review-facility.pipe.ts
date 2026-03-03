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
  name: 'cantReviewFacility',
  standalone: true,
})
export class CantReviewFacilityPipe implements PipeTransform {
  transform(_: any, facility: Facility): boolean {
    const currentUser = getCurrentUser();

    const { user } = currentUser;

    if (!user?.authorities) return false;

    const reviewStatuses = [
      'AWAITING_APPLICATION_FEES',
      'AWAITING_INSPECTION',
      'AWAITING_BOARD_REVIEW',
      'AWAITING_REGISTRATION_FEES',
      'AWAITING_HFR_CODES',
      'FACILITY_REGISTERED',
    ];

    const failedStatus = [
      'APPLICATION_EXPIRED',
      'FAILED_INSPECTION',
      'FAILED_BOARD_REVIEW',
      'REGISTRATION_EXPIRED',
    ];

    const hasReviewState = user.roles[0].states.includes(facility.status);
    const isClient = user.roles.map((r) => r.isClient).includes(true);
    const hasFailed = failedStatus.includes(facility.status);
    const ownsFacility = user.id === facility.userId;

    return !(
      (hasReviewState && !isClient) ||
      (isClient && ownsFacility && hasFailed)
    );
  }
}
