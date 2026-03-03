import { CommonModule } from '@angular/common';
import { Component, OnInit, Input, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { DialogComponent } from 'components/dialog/dialog.component';
import { NotificationService } from 'components/notification/notification.service';
import { StorageService } from 'modules/login/storage.service';
import { StorageKey } from 'modules/login/storage.model';
import { lastValueFrom } from 'rxjs';
import { ApiResponse } from 'app/custom-response';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [
    CommonModule,
    MatListModule,
    MatIconModule,
    MatMenuModule,
    DialogComponent,
  ],
  template: `
    <button [matMenuTriggerFor]="notificationsMenu">
      <span class="relative inline-block">
        <mat-icon class="material-symbols-outlined">notifications</mat-icon>
        <span
          *ngIf="getNotificationCount() > 0"
          class="absolute top-0 right-0 inline-flex items-center justify-center px-1 py-0.5 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full border border-white"
        >
          {{ getNotificationCount() }}
        </span>
      </span>
    </button>
    <mat-menu #notificationsMenu="matMenu" class="notificationsMenu max-h-96">
      <ng-container *ngIf="getNotificationCount() > 0; else noNotifications">
        @for (notification of notifications; track notification.id) {
        <button
          mat-menu-item
          class="text-sm"
          (click)="openDialog(notification)"
        >
          <strong
            [ngClass]="{
              'text-green-600':
                notification.notificationTypeId === 0 ||
                notification.notificationTypeId === 1 ||
                notification.notificationTypeId === 2,
              'text-amber-600':
                notification.notificationTypeId === 3 ||
                notification.notificationTypeId === 5,
              'text-red-600':
                notification.notificationTypeId === 4 ||
                notification.notificationTypeId === 6
            }"
            >{{ notification.title }} -
          </strong>
          {{ truncateMessage(notification.message) }}
          <hr />
        </button>
        }
        <span
          class="flex w-full justify-center items-center hover:bg-gray-100 cursor-pointer group"
          (click)="clearNotifications(getUserId())"
        >
          <p
            class="font-medium text-blue-600 dark:text-blue-500 py-1.5 group-hover:text-red-500"
          >
            Clear All
          </p>
        </span>
      </ng-container>
      <ng-template #noNotifications>
        <button mat-menu-item disabled>No notifications</button>
      </ng-template>
    </mat-menu>

    <app-dialog
      [open]="isOpen"
      (onClose)="handleClose($event)"
      width="740px"
      title="{{ title }}"
    >
      <ng-template>
        {{ message }}
      </ng-template>
    </app-dialog>
  `,
})
export class NotificationComponent implements OnInit {
  @Input() userId: number;
  notifications: any[] = [];
  isOpen = false;
  title: string = '';
  message: string = '';
  notificationUuid: string = '';
  selectedItem: any;

  constructor(
    private storageService: StorageService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.fetchNotifications();
  }

  async fetchNotifications() {
    const { USER_NOTIFICATIONS } = StorageKey;
    const notificationsStr = this.storageService.read(USER_NOTIFICATIONS);
    if (notificationsStr) {
      this.notifications = notificationsStr;
    } else {
      await this.updateNotificationsFromBackend();
    }
    return notificationsStr;
  }

  getNotificationCount(): number {
    return this.notifications.length;
  }

  truncateMessage(message: string): string {
    if (message && message.length > 17) {
      return message.substring(0, 17) + '...';
    }
    return message;
  }

  openDialog(notification: any): void {
    this.isOpen = true;
    this.selectedItem = notification;
    this.title = this.selectedItem.title;
    this.message = this.selectedItem.message;
  }

  async handleClose(result: boolean) {
    this.isOpen = false;

    const { USER_NOTIFICATIONS } = StorageKey;
    const notificationsStr = this.storageService.read(USER_NOTIFICATIONS);
    let notifications = notificationsStr ? notificationsStr : [];

    const notificationIndex = notifications.findIndex(
      (notification: { uuid: any }) =>
        notification.uuid === this.selectedItem.uuid
    );

    if (notificationIndex > -1) {
      notifications.splice(notificationIndex, 1);
    }

    this.storageService.save(USER_NOTIFICATIONS, notifications);
    this.notifications = notifications;

    await lastValueFrom(
      this.notificationService.update(this.selectedItem.uuid, this.selectedItem)
    );

    await this.updateNotificationsFromBackend();
  }

  private async updateNotificationsFromBackend() {
    const { USER_NOTIFICATIONS } = StorageKey;

    try {
      const response: ApiResponse = await lastValueFrom(
        this.notificationService.getByUserId(this.userId)
      );

      if (Array.isArray(response)) {
        this.notifications = response;
        this.storageService.save(USER_NOTIFICATIONS, this.notifications);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  }

  public async clearNotifications(userId: number) {
    try {
      const response = await lastValueFrom(
        this.notificationService.markAllReadByUserId(userId)
      );
      console.log('Notifications deleted successfully', response);
      await this.updateNotificationsFromBackend();
    } catch (error) {
      console.error('Error deleting notifications:', error);
      return;
    }
  }

  public getUserId() {
    return this.userId;
  }
}
