import { getCurrentUser } from 'utils/helpers';
import _ from 'lodash';

type Auth = {
  action: string;
  resource: string;
};

export const cant = (action: string, resource: string): boolean => {
  const currentUser = getCurrentUser();

  const { user } = currentUser;

  if (!user?.authorities) return false;

  return !user.authorities.some(
    (auth: Auth) => auth.action === action && auth.resource === resource,
  );
};

export const can = (action: string, resource: string): boolean => {
  const currentUser = getCurrentUser();

  const { user } = currentUser;

  if (!user?.authorities) return false;

  return user.authorities.some(
    (auth: Auth) => auth.action === action && auth.resource === resource,
  );
};
