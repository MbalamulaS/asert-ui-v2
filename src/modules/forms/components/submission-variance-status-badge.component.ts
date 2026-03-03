import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-variance-submission-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      *ngIf="status !== null && status !== undefined"
      class="px-3 py-1 rounded-full text-sm font-medium"
      [ngClass]="{
        'bg-yellow-500 bg-opacity-20 text-yellow-700': status === true,
        'bg-green-500 bg-opacity-20 text-green-700': status === false,
      }"
    >
      {{ getStatusLabel() }}
    </span>
  `,
})
export class SubmissionVarianceStatusBadgeComponent {
  @Input() status?: boolean;

  getStatusLabel(): string {
    // status = hasUnresolvedVariances
    // true means there ARE unresolved variances (yellow warning)
    // false means there are NO unresolved variances (green resolved)
    return this.status ? 'Has Variances' : 'No Variances';
  }
}
