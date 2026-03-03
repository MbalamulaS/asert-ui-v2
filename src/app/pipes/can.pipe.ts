import { Pipe, PipeTransform } from '@angular/core';
import { getCurrentUser } from 'utils/helpers';
import _ from 'lodash';

/*
 * Check if the current user can perform an action on a given resource.
 * Takes a string argument for the action and the resource.
 * Usage:
 *   '' | can:'DELETE':'User'
 * Example:
 *   {{ '' | can:'DELETE':'User' }}
 *   returns true or false based on the current user's permissions.
 */
@Pipe({
  name: 'can',
  standalone: true,
})
export class CanPipe implements PipeTransform {
  transform(_: any, action: string, resource: string): boolean {
    const currentUser = getCurrentUser();

    const { user } = currentUser;

    if (!user?.authorities) return false;
    return user.authorities.some(
      (auth) => auth.action === action && auth.resource === resource,
    );
  }
}
