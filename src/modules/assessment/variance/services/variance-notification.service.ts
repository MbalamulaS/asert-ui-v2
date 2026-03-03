import { Injectable } from '@angular/core';
import { HttpService } from 'app/api/api.service';
import { ApiResponse } from 'app/custom-response';
import { Observable, BehaviorSubject, interval } from 'rxjs';
import { tap, switchMap, startWith } from 'rxjs/operators';
import { AssessorVarianceNotification } from '../types/variance.types';

const API = 'assessor-variance-notifications';

@Injectable({
  providedIn: 'root',
})
export class VarianceNotificationService {
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private readonly httpService: HttpService) {}

  /**
   * Get unread notifications for an assessor
   */
  getUnreadNotifications(assessorId: number): Observable<ApiResponse> {
    return this.httpService
      .get<ApiResponse>(`${API}/assessor/${assessorId}/unread`)
      .pipe(
        tap((response) => {
          if (response.success && response.data) {
            this.unreadCountSubject.next(response.data.length);
          }
        }),
      );
  }

  /**
   * Mark a notification as read
   */
  markAsRead(notificationUuid: string): Observable<ApiResponse> {
    return this.httpService
      .put<ApiResponse>(`${API}/${notificationUuid}/mark-read`, {})
      .pipe(
        tap(() => {
          const currentCount = this.unreadCountSubject.value;
          this.unreadCountSubject.next(Math.max(0, currentCount - 1));
        }),
      );
  }

  /**
   * Mark all notifications as read for an assessor
   */
  markAllAsRead(assessorId: number): Observable<ApiResponse> {
    return this.httpService
      .put<ApiResponse>(`${API}/assessor/${assessorId}/mark-all-read`, {})
      .pipe(tap(() => this.unreadCountSubject.next(0)));
  }

  /**
   * Poll for new notifications every 30 seconds
   */
  startPolling(
    assessorId: number,
  ): Observable<AssessorVarianceNotification[]> {
    return interval(30000).pipe(
      startWith(0),
      switchMap(() => this.getUnreadNotifications(assessorId)),
      tap((response: any) => {
        if (response.success && response.data) {
          return response.data;
        }
        return [];
      }),
    );
  }
}
