import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-rejection-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  template: `
    <div class="p-6">
      <p class="text-gray-600 mb-4">
        Please provide a detailed reason for rejecting this submission. This
        will be shared with the assessor.
      </p>

      <mat-form-field class="w-full" appearance="outline">
        <mat-label>Rejection Reason</mat-label>
        <textarea
          matInput
          [(ngModel)]="rejectionReason"
          rows="6"
          placeholder="Enter the reason for rejection..."
          required
        ></textarea>
        <mat-hint
          >Provide a clear explanation to help the assessor understand what
          needs to be corrected.</mat-hint
        >
      </mat-form-field>

      <div class="flex justify-end gap-3 mt-6">
        <button
          mat-stroked-button
          type="button"
          (click)="onCancel()"
          class="text-gray-700"
        >
          Cancel
        </button>
        <button
          mat-raised-button
          color="warn"
          type="button"
          (click)="onSubmit()"
          [disabled]="!rejectionReason || rejectionReason.trim().length === 0"
        >
          Confirm Rejection
        </button>
      </div>
    </div>
  `,
})
export class RejectionFormComponent {
  @Output() onSubmitRejection = new EventEmitter<string>();
  @Output() onCancelRejection = new EventEmitter<void>();

  rejectionReason = '';

  onSubmit() {
    if (this.rejectionReason && this.rejectionReason.trim().length > 0) {
      this.onSubmitRejection.emit(this.rejectionReason.trim());
      this.rejectionReason = ''; // Reset after submission
    }
  }

  onCancel() {
    this.rejectionReason = '';
    this.onCancelRejection.emit();
  }
}
