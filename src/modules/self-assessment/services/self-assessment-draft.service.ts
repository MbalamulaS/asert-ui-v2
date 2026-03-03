import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { debounceTime, switchMap, catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';

const SELF_ASSESSMENT_DRAFT_API = 'self-assessment-drafts';

export interface FormDraftData {
  formValues: { [key: string]: any };
  sectionScores?: any[];
  currentSectionIndex?: number;
  completionPercentage?: number;
  totalSections?: number;
}

export interface SelfAssessmentFormDraft {
  uuid?: string;
  formUuid: string;
  hotelUuid?: string;
  submittedBy: string;
  currentSectionIndex: number;
  formData: string;
  completionPercentage?: number;
  totalSections?: number;
  lastSavedAt?: Date;
}

export interface FormDraftResponse {
  data: any;
  status: number;
}

@Injectable({
  providedIn: 'root',
})
export class SelfAssessmentDraftService {
  private saveSubject = new BehaviorSubject<SelfAssessmentFormDraft | null>(null);
  private lastSavedTime = new BehaviorSubject<Date | null>(null);
  private isAutoSaving = new BehaviorSubject<boolean>(false);
  private currentDraftUuid: string | null = null;

  constructor(private readonly http: HttpClient) {
    // Auto-save with debounce - saves 2 seconds after last change
    this.saveSubject
      .pipe(
        debounceTime(2000),
        tap(() => this.isAutoSaving.next(true)),
        switchMap((draft) => {
          if (!draft) return of(null);
          return this.saveDraft(draft).pipe(
            catchError((error) => {
              console.error('Auto-save failed:', error);
              return of(null);
            })
          );
        }),
        tap(() => {
          this.isAutoSaving.next(false);
          this.lastSavedTime.next(new Date());
        })
      )
      .subscribe();
  }

  get lastSavedTime$(): Observable<Date | null> {
    return this.lastSavedTime.asObservable();
  }

  get isAutoSaving$(): Observable<boolean> {
    return this.isAutoSaving.asObservable();
  }

  triggerAutoSave(draft: SelfAssessmentFormDraft): void {
    this.saveSubject.next(draft);
  }

  saveNow(draft: SelfAssessmentFormDraft): Observable<FormDraftResponse> {
    this.isAutoSaving.next(true);
    return this.saveDraft(draft).pipe(
      tap(() => {
        this.isAutoSaving.next(false);
        this.lastSavedTime.next(new Date());
      })
    );
  }

  private saveDraft(draft: SelfAssessmentFormDraft): Observable<FormDraftResponse> {
    return this.http.post<FormDraftResponse>(`/api/v1/${SELF_ASSESSMENT_DRAFT_API}`, draft).pipe(
      tap((response) => {
        if (response.data?.uuid) {
          this.currentDraftUuid = response.data.uuid;
        }
      })
    );
  }

  loadDraft(formUuid: string, hotelUuid?: string): Observable<any> {
    const params: any = { formUuid };
    if (hotelUuid) {
      params.hotelUuid = hotelUuid;
    }

    return this.http.get<any>(`/api/v1/${SELF_ASSESSMENT_DRAFT_API}/by-form-hotel-and-current-user`, { params });
  }

  deleteDraft(uuid: string): Observable<any> {
    return this.http.delete<any>(`/api/v1/${SELF_ASSESSMENT_DRAFT_API}/${uuid}`).pipe(
      tap(() => {
        if (this.currentDraftUuid === uuid) {
          this.currentDraftUuid = null;
        }
      })
    );
  }

  createDraftData(
    formUuid: string,
    currentSectionIndex: number,
    draftData: FormDraftData,
    hotelUuid?: string,
    completionPercentage?: number,
    totalSections?: number
  ): SelfAssessmentFormDraft {
    return {
      formUuid,
      hotelUuid,
      submittedBy: '',
      currentSectionIndex,
      formData: JSON.stringify(draftData),
      completionPercentage: completionPercentage || 0,
      totalSections: totalSections || 0,
    };
  }

  calculateCompletionPercentage(
    currentSectionIndex: number,
    totalSections: number,
    completedSectionScores: any[]
  ): number {
    if (totalSections === 0) return 0;
    const completedSections = completedSectionScores.length;
    return (completedSections / totalSections) * 100;
  }

  getCurrentDraftUuid(): string | null {
    return this.currentDraftUuid;
  }

  reset(): void {
    this.currentDraftUuid = null;
    this.lastSavedTime.next(null);
  }
}
