import { Injectable } from '@angular/core';
import { HttpService } from 'app/api/api.service';
import { ApiResponse } from 'app/custom-response';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import {
  AssessmentVarianceLog,
  VarianceFilterOptions,
} from '../types/variance.types';

const API = 'assessment-variance-logs';

@Injectable({
  providedIn: 'root',
})
export class VarianceService {
  private variancesSubject = new BehaviorSubject<AssessmentVarianceLog[]>([]);
  public variances$ = this.variancesSubject.asObservable();

  constructor(private readonly httpService: HttpService) {}

  /**
   * Trigger variance detection for a hotel and form
   */
  detectVariances(hotelId: number, formId: number): Observable<ApiResponse> {
    return this.httpService
      .post<ApiResponse>(
        `${API}/detect?hotelId=${hotelId}&formId=${formId}`,
        {},
      )
      .pipe(
        tap((response) => {
          if (response.data) {
            this.variancesSubject.next(response.data);
          }
        }),
      );
  }

  /**
   * Get all variances with filters
   */
  getVariances(filters?: VarianceFilterOptions): Observable<ApiResponse> {
    const params: Record<string, string> = {};

    if (filters) {
      if (filters.status) params['status'] = filters.status;
      if (filters.hotelId) params['hotelId'] = filters.hotelId.toString();
      if (filters.formId) params['formId'] = filters.formId.toString();
      if (filters.page !== undefined) params['page'] = filters.page.toString();
      if (filters.size) params['size'] = filters.size.toString();
    }

    return this.httpService.get<ApiResponse>(API, params);
  }

  /**
   * Get variances grouped by hotel with hotel-level pagination.
   * Returns paginated hotel groups where each group contains ALL variances for that hotel.
   */
  getVariancesGroupedByHotel(
    filters?: VarianceFilterOptions,
  ): Observable<ApiResponse> {
    const params: Record<string, string> = {};

    if (filters) {
      if (filters.status) params['status'] = filters.status;
      if (filters.hotelId) params['hotelId'] = filters.hotelId.toString();
      if (filters.formId) params['formId'] = filters.formId.toString();
      if (filters.page !== undefined) params['page'] = filters.page.toString();
      if (filters.size) params['size'] = filters.size.toString();
    }

    return this.httpService.get<ApiResponse>(`${API}/grouped-by-hotel`, params);
  }

  /**
   * Get variance by UUID
   */
  getVarianceByUuid(uuid: string): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(`${API}/${uuid}`);
  }

  /**
   * Resolve a variance
   */
  resolveVariance(
    uuid: string,
    resolutionNotes: string,
  ): Observable<ApiResponse> {
    return this.httpService.put<ApiResponse>(`${API}/${uuid}/resolve`, {
      resolutionNotes,
    });
  }

  /**
   * Delete a variance
   */
  deleteVariance(uuid: string): Observable<ApiResponse> {
    return this.httpService.delete<ApiResponse>(`${API}/${uuid}`);
  }
}
