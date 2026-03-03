import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from 'app/api/api.service';
import {
  Form,
  FormSubmission,
  FormSubmissionScoreSummaryDto,
  SectionScoreDto,
} from '../types';
import { ApiResponse } from 'app/custom-response';

const FORM_API = 'form-submissions';

@Injectable({
  providedIn: 'root',
})
export class FormSubmissionService {
  constructor(private readonly httpService: HttpService) {}

  // Form CRUD operations
  getAllForms(params?: Record<string, any>): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(`${FORM_API}`, params);
  }

  getFormById(uuid: string): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(`${FORM_API}/${uuid}`);
  }

  submitForm(
    form: any,
    isVarianceResolution: boolean = false,
  ): Observable<Form> {
    // Add isVarianceResolution to the form data body
    const formData = {
      ...form,
      isVarianceResolution: isVarianceResolution,
    };
    return this.httpService.post<Form>(`${FORM_API}`, formData);
  }

  updateForm(uuid: string, form: Form): Observable<Form> {
    return this.httpService.put<Form>(`${FORM_API}/${uuid}`, form);
  }

  deleteForm(id: number): Observable<void> {
    return this.httpService.delete<void>(`${FORM_API}/${id}`);
  }

  getAllSubmissions(params?: Record<string, any>): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(`${FORM_API}`, params);
  }

  /**
   * Get all submissions for the currently authenticated assessor.
   * Returns paginated list of submissions ordered by most recent first.
   */
  getMySubmissions(params?: Record<string, any>): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(
      `${FORM_API}/my-submissions`,
      params,
    );
  }

  getSubmissionById(id: number): Observable<FormSubmission> {
    return this.httpService.get<FormSubmission>(`${FORM_API}/${id}`);
  }

  getSubmissionByUuid(uuid: string): Observable<FormSubmission> {
    return this.httpService.get<FormSubmission>(`${FORM_API}/${uuid}`);
  }

  getSubmissionsByFormId(formUuid: string): Observable<any[]> {
    return this.httpService.get<any[]>(`${FORM_API}/form/${formUuid}`);
  }

  deleteSubmission(uuid: string): Observable<void> {
    return this.httpService.delete<void>(`${FORM_API}/${uuid}`);
  }

  // New scoring-related methods
  getScoreSummary(
    submissionUuid: string,
  ): Observable<FormSubmissionScoreSummaryDto> {
    return this.httpService.get<FormSubmissionScoreSummaryDto>(
      `${FORM_API}/${submissionUuid}/score`,
    );
  }

  getSectionScore(
    submissionUuid: string,
    sectionUuid: string,
  ): Observable<SectionScoreDto> {
    return this.httpService.get<SectionScoreDto>(
      `${FORM_API}/${submissionUuid}/sections/${sectionUuid}/score`,
    );
  }

  recalculateScores(submissionUuid: string): Observable<FormSubmission> {
    return this.httpService.put<FormSubmission>(
      `${FORM_API}/${submissionUuid}/recalculate-scores`,
      {},
    );
  }

  downloadReport(submissionUuid: string): Observable<Blob> {
    return this.httpService.getBlob(`${FORM_API}/${submissionUuid}/report`, {});
  }

  // Submission status workflow methods
  submitForApproval(submissionUuid: string): Observable<FormSubmission> {
    return this.httpService.put<FormSubmission>(
      `${FORM_API}/${submissionUuid}/submit-for-approval`,
      {},
    );
  }

  approveSubmission(submissionUuid: string): Observable<FormSubmission> {
    return this.httpService.put<FormSubmission>(
      `${FORM_API}/${submissionUuid}/approve`,
      {},
    );
  }

  rejectSubmission(
    submissionUuid: string,
    rejectionReason: string,
  ): Observable<FormSubmission> {
    return this.httpService.put<FormSubmission>(
      `${FORM_API}/${submissionUuid}/reject?rejectionReason=${encodeURIComponent(rejectionReason)}`,
      {},
    );
  }

  /**
   * Get the latest submission for the currently authenticated assessor for a specific form and hotel.
   * Used for variance resolution to load the assessor's most recent submission with all responses.
   * Returns the most recent submission ordered by submittedAt DESC.
   *
   * @param formUuid The form UUID
   * @param hotelUuid The hotel UUID
   * @return Observable containing the latest submission with responses and scores
   */
  getLatestSubmissionForVarianceResolution(
    formUuid: string,
    hotelUuid: string,
  ): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(
      `${FORM_API}/latest-for-variance-resolution`,
      { formUuid, hotelUuid },
    );
  }
}
