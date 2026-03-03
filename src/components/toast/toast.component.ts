import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ToastMessage, ToastService } from 'components/toast/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [MatIconModule, CommonModule],
  template: `
    <div
      *ngIf="toast"
      class="flex items-center z-[9999] p-4 mb-4 text-sm rounded-lg shadow-lg fixed bottom-4 right-4 w-96 bg-black text-white"
    >
      <mat-icon
        class="mr-3 w-7 h-7 align-middle"
        [ngClass]="getIconColor(toast.type)"
      >
        {{ getIcon(toast.type) }}
      </mat-icon>
      <div class="flex-1">
        <p class="text-lg font-semibold !-mb-0">{{ toast.title }}</p>
        <p class="text-lg">{{ toast.message }}</p>
      </div>
      <button
        (click)="clearToast()"
        class="ml-4 text-3xl font-semibold text-white"
      >
        &times;
      </button>
    </div>
  `,
})
export class ToastComponent {
  toast: ToastMessage | null = null;

  constructor(private toastService: ToastService) {
    this.toastService.toast$.subscribe((message) => {
      this.toast = message;
      console.log('Toast message:', message);
      if (message) {
        // Auto-dismiss after 3 seconds
        setTimeout(() => this.clearToast(), 3000);
      }
    });
  }

  clearToast() {
    this.toastService.clear();
    this.toast = null;
  }

  getIcon(type: string): string {
    switch (type) {
      case 'success':
        return 'check_circle';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'info';
    }
  }

  // Set the icon color based on the toast type
  getIconColor(type: string): string {
    switch (type) {
      case 'success':
        return 'text-green-500';
      case 'error':
        return 'text-red-500';
      case 'warning':
        return 'text-yellow-500';
      case 'info':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  }
}
