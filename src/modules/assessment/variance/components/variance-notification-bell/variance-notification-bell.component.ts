import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { DialogComponent } from 'components/dialog/dialog.component';
import { VarianceNotificationService } from '../../services/variance-notification.service';
import { AssessorVarianceNotification } from '../../types/variance.types';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-variance-notification-bell',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatMenuModule,
    MatButtonModule,
    DialogComponent,
  ],
  template: `
    <button [matMenuTriggerFor]="varianceMenu">
      <span class="relative inline-block">
        <mat-icon class="material-symbols-outlined">warning</mat-icon>
        <span
          *ngIf="unreadCount > 0"
          class="absolute top-0 right-0 inline-flex items-center justify-center px-1 py-0.5 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full border border-white"
        >
          {{ unreadCount }}
        </span>
      </span>
    </button>

    <mat-menu #varianceMenu="matMenu" class="varianceMenu max-h-96">
      <div class="px-4 py-3 border-b">
        <h3 class="text-lg font-semibold text-gray-800">Variance Alerts</h3>
        <button
          *ngIf="unreadCount > 0"
          class="text-sm text-blue-600 hover:text-blue-800 mt-1"
          (click)="markAllAsRead(); $event.stopPropagation()"
        >
          Mark all as read
        </button>
      </div>

      <ng-container *ngIf="notifications.length > 0; else noVariances">
        @for (notification of notifications; track notification.uuid) {
        <button
          mat-menu-item
          class="text-sm hover:bg-gray-50"
          [class.bg-blue-50]="!notification.isRead"
          (click)="openNotificationDetails(notification)"
        >
          <div class="flex items-start gap-3 py-2">
            <mat-icon
              class="text-orange-500 flex-shrink-0"
              style="font-size: 20px"
            >
              warning
            </mat-icon>
            <div class="flex-1 min-w-0">
              <p class="text-sm text-gray-900 line-clamp-2">
                {{ truncateMessage(notification.message) }}
              </p>
              <p class="text-xs text-gray-500 mt-1">
                {{ formatDate(notification.createdAt) }}
              </p>
            </div>
            <span
              *ngIf="!notification.isRead"
              class="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full"
            ></span>
          </div>
        </button>
        }
      </ng-container>

      <ng-template #noVariances>
        <div class="px-4 py-8 text-center text-gray-500">
          <mat-icon class="text-gray-400 mb-2" style="font-size: 48px"
            >check_circle</mat-icon
          >
          <p>No variance alerts</p>
        </div>
      </ng-template>
    </mat-menu>

    <app-dialog
      [open]="isDialogOpen"
      (onClose)="handleDialogClose()"
      width="700px"
      [title]="dialogTitle"
    >
      <ng-template>
        <div class="space-y-4">
          <p class="text-gray-700">{{ dialogMessage }}</p>
          <div class="mt-4 p-4 bg-gray-50 rounded-lg">
            <p class="text-sm text-gray-600">
              <strong>Detected:</strong>
              {{ formatDate(selectedNotification?.createdAt) }}
            </p>
          </div>
        </div>
      </ng-template>
    </app-dialog>
  `,
})
export class VarianceNotificationBellComponent implements OnInit, OnDestroy {
  @Input() assessorId!: number;

  notifications: AssessorVarianceNotification[] = [];
  unreadCount = 0;
  isDialogOpen = false;
  dialogTitle = '';
  dialogMessage = '';
  selectedNotification: AssessorVarianceNotification | null = null;

  private subscription?: Subscription;

  constructor(
    private varianceNotificationService: VarianceNotificationService,
  ) {}

  ngOnInit() {
    if (this.assessorId) {
      this.loadNotifications();
      this.startPolling();
    }
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  private loadNotifications() {
    this.varianceNotificationService
      .getUnreadNotifications(this.assessorId)
      .subscribe((response) => {
        if (response.success && response.data) {
          this.notifications = response.data;
          this.unreadCount = this.notifications.filter((n) => !n.isRead).length;
        }
      });
  }

  private startPolling() {
    this.subscription = this.varianceNotificationService
      .startPolling(this.assessorId)
      .subscribe((response: any) => {
        if (response.success && response.data) {
          this.notifications = response.data;
          this.unreadCount = this.notifications.filter((n) => !n.isRead).length;
        }
      });
  }

  openNotificationDetails(notification: AssessorVarianceNotification) {
    if (!notification.isRead) {
      this.varianceNotificationService
        .markAsRead(notification.uuid)
        .subscribe(() => {
          notification.isRead = true;
          this.unreadCount = Math.max(0, this.unreadCount - 1);
        });
    }

    this.selectedNotification = notification;
    this.dialogTitle = 'Variance Alert';
    this.dialogMessage = notification.message;
    this.isDialogOpen = true;
  }

  markAllAsRead() {
    this.varianceNotificationService
      .markAllAsRead(this.assessorId)
      .subscribe(() => {
        this.notifications.forEach((n) => (n.isRead = true));
        this.unreadCount = 0;
      });
  }

  handleDialogClose() {
    this.isDialogOpen = false;
    this.selectedNotification = null;
  }

  truncateMessage(message: string): string {
    if (message && message.length > 100) {
      return message.substring(0, 100) + '...';
    }
    return message;
  }

  formatDate(dateString?: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString();
  }
}
