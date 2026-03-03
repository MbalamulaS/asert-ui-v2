import { Route, Routes, Data } from '@angular/router';

export interface JwtPayload {
  iss: string;
  sub: string;
  aud: string[] | string;
  exp: number;
  nbf: number;
  iat: number;
  jti: string;
}

// Extended Data interface with custom properties
export interface CustomRouteData extends Data {
  clientOnly?: boolean;
  backofficeOnly?: boolean;
  publicRoute?: boolean;
}

// Extended Route interface with custom data property
export interface CustomRoute extends Omit<Route, 'data'> {
  data?: CustomRouteData;
  children?: CustomRoutes;
}

// Type for array of custom routes
export type CustomRoutes = CustomRoute[];

// Helper function to safely cast Routes to CustomRoutes
export function asCustomRoutes(routes: Routes): CustomRoutes {
  return routes as CustomRoutes;
}
