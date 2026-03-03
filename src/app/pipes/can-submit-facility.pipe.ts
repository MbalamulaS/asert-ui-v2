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
  name: 'canSubmitFacility',
  standalone: true,
})
export class CanSubmitFacilityPipe implements PipeTransform {
  transform(_: any, facility: Facility): boolean {
    const currentUser = getCurrentUser();

    const { user } = currentUser;

    if (!user?.authorities) return false;

    const isIncomplete = facility.status === 'INCOMPLETE_SUBMISSION';
    const isClient = user.roles[0].isClient;

    const hasFacilityOwnership = user.id === facility.userId;

    return isClient && isIncomplete && hasFacilityOwnership;
  }
}
