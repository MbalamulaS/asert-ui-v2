import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubmissionStatus } from '../types';

@Component({
  selector: 'app-submission-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      *ngIf="status"
      class="px-3 py-1 rounded-full text-sm font-medium"
      [ngClass]="{
        'bg-gray-500 bg-opacity-20 text-gray-700': status === 'DRAFT',
        'bg-yellow-500 bg-opacity-20 text-yellow-700': status === 'SUBMITTED',
        'bg-green-500 bg-opacity-20 text-green-700': status === 'APPROVED',
        'bg-red-500 bg-opacity-20 text-red-700': status === 'REJECTED',
      }"
    >
      {{ getStatusLabel(status) }}
    </span>
  `,
})
export class SubmissionStatusBadgeComponent {
  @Input() status?: string | SubmissionStatus;

  getStatusLabel(status: string | SubmissionStatus): string {
    const statusMap: Record<string, string> = {
      DRAFT: 'Draft',
      SUBMITTED: 'Pending Approval',
      APPROVED: 'Approved',
      REJECTED: 'Rejected',
    };

    return statusMap[status] || status;
  }
}
