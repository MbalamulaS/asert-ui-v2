import { environment } from 'environment/environment';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

// from local storage using key ASERT_USER
export const getCurrentUser = () => {
  const { ASERT_USER } = environment;
  const user = localStorage.getItem(ASERT_USER) || null;
  if (user) {
    return JSON.parse(user);
  } else {
    return null;
  }
};

export interface Params {
  size?: number | null;
  total?: number | null;
  page?: number | null;
  searchType?: string;
}

export const PAGINATION_PARAMS: Params = {
  size: null,
  total: null,
  page: null,
  searchType: 'or',
};

export interface SEARCH_ACTION {
  type: string;
  payload?: string;
}

export interface GENERIC_SEARCH_STATE {
  searchType: string;
}

export const DEFAULT_SEARCH_PARAMS: GENERIC_SEARCH_STATE = {
  searchType: 'or',
};

export function cleanPhoto(
  photo: string,
  sanitizer: DomSanitizer,
): SafeResourceUrl {
  return sanitizer.bypassSecurityTrustResourceUrl(
    'data:image/jpg;base64,' + photo,
  );
}

export function createPhotoUtils(sanitizer: DomSanitizer) {
  return {
    cleanPhoto: (photo: string): SafeResourceUrl => {
      return sanitizer.bypassSecurityTrustResourceUrl(
        'data:image/jpg;base64,' + photo,
      );
    },
  };
}
