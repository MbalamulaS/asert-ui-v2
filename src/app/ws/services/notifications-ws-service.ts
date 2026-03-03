import { Injectable } from '@angular/core';
import { environment } from 'environment/environment';
import { Observable, Subject } from 'rxjs';
import { Notification } from 'components/notification/notification.service';

@Injectable({
  providedIn: 'root',
})
export class NotificationWsService {
  private notificationSocket: WebSocket;
  private notificationSubject = new Subject<Notification>();
  private isNotificationSocketOpen = false;

  constructor() {
    this.connectNotificationSocket();
  }

  private connectNotificationSocket() {
    this.notificationSocket = new WebSocket(
      `${environment.API_WS_URL}/notifications`,
    );

    this.notificationSocket.onopen = () => {
      console.log('Notification WebSocket connection established');
      this.isNotificationSocketOpen = true;
    };

    this.notificationSocket.onmessage = (event) => {
      this.notificationSubject.next(JSON.parse(event.data));
    };

    this.notificationSocket.onerror = (event) => {
      console.error('Notification WebSocket error:', event);
    };

    this.notificationSocket.onclose = (event) => {
      console.log('Notification WebSocket closed:', event);
      this.isNotificationSocketOpen = false;
    };
  }

  getNotificationUpdates(): Observable<Notification> {
    return this.notificationSubject.asObservable();
  }
}
