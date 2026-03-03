import { Injectable } from '@angular/core';
import { HttpService } from 'app/api/api.service';
import { ApiResponse } from 'app/custom-response';
import { Observable } from 'rxjs';

const AUTHORITY_API = 'authorities';

@Injectable({
  providedIn: 'root',
})
export class RolePermissionService {
  constructor(private readonly httpService: HttpService) {}

  get(params?: Record<string, any>): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(AUTHORITY_API, { ...params });
  }

  getAllPermissions(params?: Record<string, any>): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(`${AUTHORITY_API}/permissions`, {
      ...params,
    });
  }
}
