import { Injectable } from '@angular/core';
import { HttpService } from 'app/api/api.service';
import { ApiResponse } from 'app/custom-response';
import { Observable } from 'rxjs';

const API = 'system-configurations';

@Injectable({
  providedIn: 'root',
})
export class SystemConfigurationService {
  constructor(private readonly httpService: HttpService) {}

  /**
   * Get variance threshold
   */
  getVarianceThreshold(): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(`${API}/variance-threshold`);
  }

  /**
   * Update variance threshold
   */
  updateVarianceThreshold(threshold: number): Observable<ApiResponse> {
    return this.httpService.put<ApiResponse>(
      `${API}/variance-threshold?threshold=${threshold}`,
      {},
    );
  }

  /**
   * Get configuration by key
   */
  getByKey(configKey: string): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(`${API}/by-key/${configKey}`);
  }

  /**
   * Update configuration by key
   */
  updateByKey(configKey: string, value: string): Observable<ApiResponse> {
    return this.httpService.put<ApiResponse>(
      `${API}/by-key/${configKey}?value=${encodeURIComponent(value)}`,
      {},
    );
  }
}
