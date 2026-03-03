import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, EMPTY } from 'rxjs';
import { HttpService } from 'app/api/api.service';
import { debounceTime, switchMap, catchError, tap } from 'rxjs/operators';

const FORM_DRAFT_API = 'form-drafts';

export interface FormDraftData {
  formValues: Record<string, any>;
  sectionScores?: {
    sectionUuid: string;
    score: number;
    maxPossible: number;
    percentage: number;
  }[];
  currentSectionIndex?: number;
  completionPercentage?: number;
  totalSections?: number;
}

export interface FormDraft {
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
  uuid: string;
  formUuid: string;
  formName: string;
  hotelUuid?: string;
  hotelName?: string;
  submittedBy: string;
  currentSectionIndex: number;
  formData: string;
  data: string;
  lastSavedAt: Date;
  completionPercentage: number;
  totalSections: number;
}

@Injectable({
  providedIn: 'root',
})
export class FormDraftService {
  private saveSubject = new BehaviorSubject<FormDraft | null>(null);
  private lastSavedTime = new BehaviorSubject<Date | null>(null);
  private isAutoSaving = new BehaviorSubject<boolean>(false);
  private currentDraftUuid: string | null = null;

  constructor(private readonly httpService: HttpService) {
    // Auto-save with debounce - saves 2 seconds after last change
    this.saveSubject
      .pipe(
        debounceTime(2000),
        switchMap((draft) => {
          if (!draft) return EMPTY;

          this.isAutoSaving.next(true);
          return this.saveDraft(draft).pipe(
            tap(() => {
              this.lastSavedTime.next(new Date());
              this.isAutoSaving.next(false);
            }),
            catchError((error) => {
              console.error('Auto-save failed:', error);
              this.isAutoSaving.next(false);
              return EMPTY;
            }),
          );
        }),
      )
      .subscribe();
  }

  // Observables for component to subscribe to
  get lastSavedTime$() {
    return this.lastSavedTime.asObservable();
  }

  get isAutoSaving$() {
    return this.isAutoSaving.asObservable();
  }

  // Trigger auto-save
  triggerAutoSave(draft: FormDraft): void {
    this.saveSubject.next(draft);
  }

  // Manual save
  saveNow(draft: FormDraft): Observable<FormDraftResponse> {
    return this.saveDraft(draft).pipe(
      tap(() => this.lastSavedTime.next(new Date())),
    );
  }

  // Internal save method
  private saveDraft(draft: FormDraft): Observable<FormDraftResponse> {
    if (this.currentDraftUuid) {
      // Update existing draft
      return this.httpService
        .put<FormDraftResponse>(
          `${FORM_DRAFT_API}/${this.currentDraftUuid}`,
          draft,
        )
        .pipe(
          tap((response) => {
            this.currentDraftUuid = response.uuid;
          }),
        );
    } else {
      // Create new draft
      return this.httpService
        .post<FormDraftResponse>(FORM_DRAFT_API, draft)
        .pipe(
          tap((response) => {
            this.currentDraftUuid = response.uuid;
          }),
        );
    }
  }

  // Load existing draft for current user (returns single draft or null)
  loadDraft(
    formUuid: string,
    hotelUuid?: string,
  ): Observable<FormDraftResponse | null> {
    const params: Record<string, string> = {
      formUuid,
    };

    if (hotelUuid) {
      params['hotelUuid'] = hotelUuid;
      return this.httpService
        .get<FormDraftResponse>(
          `${FORM_DRAFT_API}/by-form-hotel-and-current-user`,
          params,
        )
        .pipe(
          tap((response) => {
            if (response) {
              this.currentDraftUuid = response.uuid;
            }
          }),
          catchError(() => {
            // No draft found for current user
            return new Observable((observer) => observer.next(null));
          }),
        );
    } else {
      return this.httpService
        .get<FormDraftResponse>(
          `${FORM_DRAFT_API}/by-form-and-current-user`,
          params,
        )
        .pipe(
          tap((response) => {
            if (response) {
              this.currentDraftUuid = response.uuid;
            }
          }),
          catchError(() => {
            // No draft found for current user
            return new Observable((observer) => observer.next(null));
          }),
        );
    }
  }

  // Get all drafts for current user
  getCurrentUserDrafts(): Observable<FormDraftResponse[]> {
    return this.httpService.get<FormDraftResponse[]>(
      `${FORM_DRAFT_API}/by-current-user`,
    );
  }

  // Delete draft
  deleteDraft(uuid: string): Observable<void> {
    return this.httpService.delete<void>(`${FORM_DRAFT_API}/${uuid}`).pipe(
      tap(() => {
        if (this.currentDraftUuid === uuid) {
          this.currentDraftUuid = null;
          this.lastSavedTime.next(null);
        }
      }),
    );
  }

  // Get current draft UUID
  getCurrentDraftUuid(): string | null {
    return this.currentDraftUuid;
  }

  // Reset service state (useful when navigating away from form)
  reset(): void {
    this.currentDraftUuid = null;
    this.lastSavedTime.next(null);
    this.isAutoSaving.next(false);
    this.saveSubject.next(null);
  }

  // Helper method to create FormDraft object
  createDraftData(
    formUuid: string,
    currentSectionIndex: number,
    formData: FormDraftData,
    hotelUuid?: string,
    completionPercentage?: number,
    totalSections?: number,
  ): FormDraft {
    return {
      uuid: this.currentDraftUuid || undefined,
      formUuid,
      hotelUuid,
      submittedBy: '', // This will be set automatically by the backend
      currentSectionIndex,
      formData: JSON.stringify(formData),
      completionPercentage,
      totalSections,
    };
  }

  // Calculate completion percentage
  calculateCompletionPercentage(
    currentSectionIndex: number,
    totalSections: number,
    sectionScores: any[],
  ): number {
    if (totalSections === 0) return 0;

    // Base completion on sections with scores
    const completedSections = sectionScores.length;
    const progressPercentage = (completedSections / totalSections) * 100;

    // Add partial progress for current section if it's partially filled
    const currentSectionProgress =
      currentSectionIndex > completedSections
        ? ((currentSectionIndex - completedSections) / totalSections) * 10
        : 0; // 10% for starting a section

    return Math.min(100, progressPercentage + currentSectionProgress);
  }
}
