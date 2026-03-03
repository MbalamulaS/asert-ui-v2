import { Injectable } from '@angular/core';
import { HttpService } from 'app/api/api.service';
import { ApiResponse } from 'app/custom-response';
import { Observable } from 'rxjs';

export interface User {
  id: string;
  uuid: string;
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  adminHierarchyId: string;
  adminHierarchyName: string;
  fullName: string;
  roleName: string;
  roles: any[];
  status: string;
  isActive: boolean;
  phoneNumber: string;
}

const API = 'listings';

@Injectable({
  providedIn: 'root',
})
export class GradedFacilityService {
  constructor(private readonly httpService: HttpService) {}

  get(params?: Record<string, any>): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(API, { ...params });
  }

  getHotelByUuid(uuid?: string): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(`${API}/${uuid}`);
  }
}
