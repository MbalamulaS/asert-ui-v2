import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  SelfAssessmentRequest,
  SelfAssessmentResponse,
  SelfAssessmentSummary,
  SelfAssessmentResult,
  SelfAssessmentComparison,
  FieldResponse
} from '../types/self-assessment.types';

@Injectable({
  providedIn: 'root'
})
export class SelfAssessmentService {
  private readonly apiUrl = '/api/v1/self-assessments';

  constructor(private http: HttpClient) {}

  /**
   * Start a new self-assessment draft
   */
  startSelfAssessment(request: SelfAssessmentRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/start`, request);
  }

  /**
   * Save draft responses (partial completion allowed)
   */
  saveDraft(uuid: string, responses: FieldResponse[]): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${uuid}/draft`, responses);
  }

  /**
   * Submit completed self-assessment and calculate scores
   */
  submitSelfAssessment(uuid: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${uuid}/submit`, null);
  }

  /**
   * Get all self-assessments for a hotel
   */
  getHotelSelfAssessments(hotelUuid: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/hotel/${hotelUuid}`);
  }

  /**
   * Get detailed result for a specific self-assessment
   */
  getSelfAssessmentResult(uuid: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${uuid}`);
  }

  /**
   * Delete a self-assessment
   */
  deleteSelfAssessment(uuid: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${uuid}`);
  }

  /**
   * Compare latest self-assessment with official assessment
   */
  compareAssessments(hotelUuid: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/hotel/${hotelUuid}/comparison`);
  }

  /**
   * Recalculate scores for a self-assessment
   */
  recalculateScores(uuid: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${uuid}/recalculate`, null);
  }
}
