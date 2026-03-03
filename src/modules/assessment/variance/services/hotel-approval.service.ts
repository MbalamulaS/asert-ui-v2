import { Injectable } from '@angular/core';
import { HttpService } from 'app/api/api.service';
import { ApiResponse } from 'app/custom-response';
import { Observable } from 'rxjs';

const API = 'hotel-assessment-approvals';

@Injectable({
  providedIn: 'root',
})
export class HotelApprovalService {
  constructor(private readonly httpService: HttpService) {}

  /**
   * Get pending approvals (for DT dashboard)
   */
  getPendingApprovals(page?: number, size?: number): Observable<ApiResponse> {
    const params: Record<string, string> = {};
    if (page !== undefined) params['page'] = page.toString();
    if (size) params['size'] = size.toString();

    return this.httpService.get<ApiResponse>(
      `${API}/pending-dt-approvals`,
      params,
    );
  }

  /**
   * Get approval by hotel and form
   */
  getApprovalByHotelAndForm(
    hotelId: number,
    formId: number,
  ): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(
      `${API}/hotel/${hotelId}/form/${formId}`,
    );
  }

  /**
   * Approve an assessment
   */
  approveAssessment(uuid: string, comments?: string): Observable<ApiResponse> {
    return this.httpService.put<ApiResponse>(`${API}/${uuid}/approve`, {
      comments,
    });
  }

  /**
   * Reject an assessment
   */
  rejectAssessment(
    uuid: string,
    rejectionReason: string,
    comments?: string,
  ): Observable<ApiResponse> {
    return this.httpService.put<ApiResponse>(`${API}/${uuid}/reject`, {
      rejectionReason,
      comments,
    });
  }
}
