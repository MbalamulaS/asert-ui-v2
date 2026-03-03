import { Injectable } from '@angular/core';
import { HttpService } from 'app/api/api.service';
import { ApiResponse } from 'app/custom-response';
import { Observable } from 'rxjs';

const API = 'payments';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  constructor(private readonly httpService: HttpService) {}

  get(params?: Record<string, any>): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(API, { ...params });
  }

  update(uuid: string, payload: any): Observable<ApiResponse> {
    return this.httpService.put<ApiResponse>(`${API}/${uuid}`, payload);
  }
}
