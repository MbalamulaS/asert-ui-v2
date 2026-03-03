import { Injectable } from '@angular/core';
import { HttpService } from 'app/api/api.service';
import { ApiResponse } from 'app/custom-response';
import { Observable } from 'rxjs';

export interface Notification {
  id: string;
  uuid: string;
  notificationTypeId: number;
  userId: number;
  title: string;
  message: string;
  isRead: false;
}

const API = 'notifications';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor(private readonly httpService: HttpService) {}

  getByUserId(userId: number): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(`${API}/recipient/${userId}`);
  }

  update(uuid: string, notification: Notification): Observable<ApiResponse> {
    return this.httpService.put<ApiResponse>(
      `${API}/${uuid}/mark-as-read`,
      notification,
    );
  }

  markAllReadByUserId(userId: number): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(`${API}/mark-all-read/${userId}`);
  }
}
