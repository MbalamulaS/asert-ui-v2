import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from 'app/api/api.service';
import { ApiResponse } from 'app/custom-response';
import {
  AssessmentRequest,
  AssessmentRequestUpdateDto,
  AssessmentRequestFilters,
  AssessmentRequestStatistics,
  AssessmentRequestStatus,
} from '../types/assessment-request.types';

const API = 'assessment-requests';

@Injectable({
  providedIn: 'root',
})
export class AssessmentRequestService {
  constructor(
    private readonly httpService: HttpService,
    private readonly fb: FormBuilder,
  ) {}

  // Approval form for processing assessment requests
  approvalForm: FormGroup = this.fb.group({
    status: [null, Validators.required],
    processingNotes: ['', [Validators.maxLength(2000)]],
  });

  // Rejection form for processing assessment requests
  rejectionForm: FormGroup = this.fb.group({
    status: [AssessmentRequestStatus.REJECTED, Validators.required],
    processingNotes: ['', [Validators.required, Validators.maxLength(2000)]],
  });

  /**
   * Get all assessment requests with optional filtering and pagination
   */
    return this.httpService.get<ApiResponse>(API, params);
  }

  /**
   * Get assessment request by UUID
   */
  getAssessmentRequestByUuid(uuid: string): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(`${API}/${uuid}`);
  }

  /**
   * Get assessment requests by status
   */
  getAssessmentRequestsByStatus(
    status: AssessmentRequestStatus,
    params?: Record<string, any>,
  ): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(`${API}/status/${status}`, params);
  }

  /**
   * Get assessment requests by user
   */
  getAssessmentRequestsByUser(
    userId: number,
    params?: Record<string, any>,
  ): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(`${API}/user/${userId}`, params);
  }

  /**
   * Update assessment request (approve/reject/change status)
   */
  updateAssessmentRequest(
    uuid: string,
    updateData: AssessmentRequestUpdateDto,
  ): Observable<ApiResponse> {
    return this.httpService.put<ApiResponse>(`${API}/${uuid}`, updateData);
  }

  /**
   * Approve assessment request
   */
  approveAssessmentRequest(
    uuid: string,
    processingNotes?: string,
  ): Observable<ApiResponse> {
    const updateData: AssessmentRequestUpdateDto = {
      status: AssessmentRequestStatus.APPROVED,
      processingNotes,
    };
    return this.updateAssessmentRequest(uuid, updateData);
  }

  /**
   * Reject assessment request
   */
  rejectAssessmentRequest(
    uuid: string,
    processingNotes: string,
  ): Observable<ApiResponse> {
    const updateData: AssessmentRequestUpdateDto = {
      status: AssessmentRequestStatus.REJECTED,
      processingNotes,
    };
    return this.updateAssessmentRequest(uuid, updateData);
  }

  /**
   * Set assessment request under review
   */
  setUnderReview(
    uuid: string,
    processingNotes?: string,
  ): Observable<ApiResponse> {
    const updateData: AssessmentRequestUpdateDto = {
      status: AssessmentRequestStatus.UNDER_REVIEW,
      processingNotes,
    };
    return this.updateAssessmentRequest(uuid, updateData);
  }

  /**
   * Delete assessment request
   */
  deleteAssessmentRequest(uuid: string): Observable<ApiResponse> {
    return this.httpService.delete<ApiResponse>(`${API}/${uuid}`);
  }

  /**
   * Check for duplicate submission
   */
  checkDuplicate(email: string, hotelUuid: string): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(`${API}/check-duplicate`, {
      email,
      hotelUuid,
    });
  }

  /**
   * Get status statistics
   */
  getStatusStatistics(): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(`${API}/statistics/status`);
  }

  /**
   * Get facility type statistics
   */
  getFacilityTypeStatistics(): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(`${API}/statistics/facility-type`);
  }

  /**
   * Get submission statistics
   */
  getSubmissionStatistics(): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(`${API}/statistics/submissions`);
  }

  /**
   * Populate approval form with data
   */
  populateApprovalForm(data: Partial<AssessmentRequestUpdateDto>) {
    this.approvalForm.patchValue(data);
  }

  /**
   * Populate rejection form with data
   */
  populateRejectionForm(data: Partial<AssessmentRequestUpdateDto>) {
    this.rejectionForm.patchValue(data);
  }

  /**
   * Clear approval form
   */
  clearApprovalForm() {
    this.approvalForm.reset({
      status: null,
      processingNotes: '',
    });
  }

  /**
   * Clear rejection form
   */
  clearRejectionForm() {
    this.rejectionForm.reset({
      status: AssessmentRequestStatus.REJECTED,
      processingNotes: '',
    });
  }

  /**
   * Get status display name
   */
  getStatusDisplayName(status: AssessmentRequestStatus): string {
    const statusNames: Record<AssessmentRequestStatus, string> = {
      [AssessmentRequestStatus.PENDING]: 'Pending',
      [AssessmentRequestStatus.SUBMITTED]: 'Submitted',
      [AssessmentRequestStatus.UNDER_REVIEW]: 'Under Review',
      [AssessmentRequestStatus.APPROVED]: 'Approved',
      [AssessmentRequestStatus.REJECTED]: 'Rejected',
    };
    return statusNames[status] || status;
  }

  /**
   * Get status badge class for styling
   */
  getStatusBadgeClass(status: AssessmentRequestStatus): string {
    const statusClasses: Record<AssessmentRequestStatus, string> = {
      [AssessmentRequestStatus.PENDING]: 'bg-gray-100 text-gray-800',
      [AssessmentRequestStatus.SUBMITTED]: 'bg-blue-100 text-blue-800',
      [AssessmentRequestStatus.UNDER_REVIEW]: 'bg-yellow-100 text-yellow-800',
      [AssessmentRequestStatus.APPROVED]: 'bg-green-100 text-green-800',
      [AssessmentRequestStatus.REJECTED]: 'bg-red-100 text-red-800',
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-800';
  }
}
