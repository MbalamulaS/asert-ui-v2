import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { TextAreaComponent } from 'components/text-area/text-area.component';
import { SubmitButtonComponent } from 'components/submit-button/submit-button.component';
import { AssessmentRequest, AssessmentRequestStatus } from '../types/assessment-request.types';

@Component({
  selector: 'app-assessment-request-approval-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatSelectModule,
    TextAreaComponent,
    SubmitButtonComponent,
  ],
  template: `
    <div class="space-y-6" *ngIf="request">
      <!-- Request Summary -->
      <mat-card class="p-4">
        <mat-card-header>
          <mat-card-title class="text-lg font-semibold">Request Summary</mat-card-title>
        </mat-card-header>
        <mat-card-content class="mt-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="text-sm font-medium text-gray-600">Hotel Name</label>
              <p class="text-base">{{ request.facilityName }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-600">Contact Person</label>
              <p class="text-base">{{ request.contactPerson }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-600">Email</label>
              <p class="text-base">{{ request.email }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-600">Current Status</label>
              <span 
                class="inline-block px-2 py-1 text-xs font-medium rounded-full"
                [ngClass]="getStatusBadgeClass(request.status)"
              >
                {{ request.statusDisplayName }}
              </span>
            </div>
          </div>
          
          <div class="mt-4">
            <label class="text-sm font-medium text-gray-600">Completion Progress</label>
            <div class="flex items-center mt-1">
              <div class="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  class="bg-blue-600 h-2 rounded-full" 
                  [style.width.%]="request.completionPercentage"
                ></div>
              </div>
              <span class="ml-2 text-sm text-gray-600">{{ request.completionPercentage | number:'1.0-0' }}%</span>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Action Selection Form -->
      <mat-card class="p-4">
        <mat-card-header>
          <mat-card-title class="text-lg font-semibold">Take Action</mat-card-title>
        </mat-card-header>
        <mat-card-content class="mt-4">
          <form [formGroup]="actionForm" (ngSubmit)="submitAction()" class="space-y-4">
            
            <!-- Action Type Selection -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Action</label>
              <mat-select 
                formControlName="action" 
                placeholder="Select an action"
                class="w-full"
                (selectionChange)="onActionChange()"
              >
                <mat-option 
                  value="under_review"
                  *ngIf="request.status === 'SUBMITTED'"
                >
                  Set Under Review
                </mat-option>
                <mat-option 
                  value="approve"
                  *ngIf="canApprove()"
                >
                  Approve Request
                </mat-option>
                <mat-option 
                  value="reject"
                  *ngIf="canReject()"
                >
                  Reject Request
                </mat-option>
              </mat-select>
            </div>

            <!-- Action-specific content -->
            <div *ngIf="actionForm.get('action')?.value" class="space-y-4">
              
              <!-- Under Review Action -->
              <div *ngIf="actionForm.get('action')?.value === 'under_review'" class="bg-blue-50 p-4 rounded-lg">
                <div class="flex items-center gap-2 mb-3">
                  <mat-icon class="text-blue-600">rate_review</mat-icon>
                  <h3 class="font-medium text-blue-900">Set Under Review</h3>
                </div>
                <p class="text-sm text-blue-700 mb-3">
                  This will mark the request as being actively reviewed. You can add optional notes about the review process.
                </p>
              </div>

              <!-- Approve Action -->
              <div *ngIf="actionForm.get('action')?.value === 'approve'" class="bg-green-50 p-4 rounded-lg">
                <div class="flex items-center gap-2 mb-3">
                  <mat-icon class="text-green-600">check_circle</mat-icon>
                  <h3 class="font-medium text-green-900">Approve Request</h3>
                </div>
                <p class="text-sm text-green-700 mb-3">
                  This will approve the assessment request. The facility will be notified of the approval.
                </p>
              </div>

              <!-- Reject Action -->
              <div *ngIf="actionForm.get('action')?.value === 'reject'" class="bg-red-50 p-4 rounded-lg">
                <div class="flex items-center gap-2 mb-3">
                  <mat-icon class="text-red-600">cancel</mat-icon>
                  <h3 class="font-medium text-red-900">Reject Request</h3>
                </div>
                <p class="text-sm text-red-700 mb-3">
                  This will reject the assessment request. Please provide a clear reason for the rejection.
                </p>
              </div>

              <!-- Notes Section -->
              <app-text-area
                [label]="getNotesLabel()"
                [placeholder]="getNotesPlaceholder()"
                [form]="actionForm"
                controlName="notes"
                [rows]="4"
                [required]="isNotesRequired()"
              ></app-text-area>

              <!-- Submit Button -->
              <div class="flex justify-end gap-3 pt-4">
                <button 
                  type="button" 
                  mat-button 
                  (click)="onCancel()"
                  [disabled]="isSubmitting"
                >
                  Cancel
                </button>
                
                <app-submit-button
                  [text]="getSubmitButtonText()"
                  [loading]="isSubmitting"
                  [color]="getSubmitButtonColor()"
                  [disabled]="actionForm.invalid"
                ></app-submit-button>
              </div>
            </div>

          </form>
        </mat-card-content>
      </mat-card>

      <!-- Processing History -->
      <mat-card class="p-4" *ngIf="request.processingNotes">
        <mat-card-header>
          <mat-card-title class="text-lg font-semibold">Processing History</mat-card-title>
        </mat-card-header>
        <mat-card-content class="mt-4">
          <div class="bg-gray-50 p-4 rounded-lg">
            <p class="text-base">{{ request.processingNotes }}</p>
            <p class="text-sm text-gray-600 mt-2" *ngIf="request.processedAt">
              Last updated: {{ request.processedAt | date:'medium' }}
            </p>
          </div>
        </mat-card-content>
      </mat-card>

    </div>
  `,
})
export class AssessmentRequestApprovalFormComponent implements OnInit {
  @Input() request!: AssessmentRequest;
  @Output() onApprove = new EventEmitter<{ uuid: string; notes?: string }>();
  @Output() onReject = new EventEmitter<{ uuid: string; notes: string }>();
  @Output() onSetUnderReview = new EventEmitter<{ uuid: string; notes?: string }>();
  @Output() onCancel = new EventEmitter<void>();

  isSubmitting = false;
  actionForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.actionForm = this.fb.group({
      action: ['', Validators.required],
      notes: ['']
    });
  }

  ngOnInit() {
    // Update notes validation when action changes
    this.actionForm.get('action')?.valueChanges.subscribe(() => {
      this.updateNotesValidation();
    });
  }

  onActionChange() {
    // Clear notes when action changes
    this.actionForm.patchValue({ notes: '' });
    this.updateNotesValidation();
  }

  updateNotesValidation() {
    const notesControl = this.actionForm.get('notes');
    const action = this.actionForm.get('action')?.value;
    
    if (action === 'reject') {
      notesControl?.setValidators([Validators.required]);
    } else {
      notesControl?.setValidators([]);
    }
    
    notesControl?.updateValueAndValidity();
  }

  canApprove(): boolean {
    return this.request?.status === AssessmentRequestStatus.SUBMITTED || 
           this.request?.status === AssessmentRequestStatus.UNDER_REVIEW;
  }

  canReject(): boolean {
    return this.request?.status === AssessmentRequestStatus.SUBMITTED || 
           this.request?.status === AssessmentRequestStatus.UNDER_REVIEW;
  }

  getNotesLabel(): string {
    const action = this.actionForm.get('action')?.value;
    switch (action) {
      case 'under_review':
        return 'Review Notes (Optional)';
      case 'approve':
        return 'Approval Notes (Optional)';
      case 'reject':
        return 'Rejection Reason *';
      default:
        return 'Notes';
    }
  }

  getNotesPlaceholder(): string {
    const action = this.actionForm.get('action')?.value;
    switch (action) {
      case 'under_review':
        return 'Add any notes about starting the review process...';
      case 'approve':
        return 'Add any notes about the approval...';
      case 'reject':
        return 'Please provide a clear reason for rejecting this request...';
      default:
        return 'Add notes...';
    }
  }

  isNotesRequired(): boolean {
    return this.actionForm.get('action')?.value === 'reject';
  }

  getSubmitButtonText(): string {
    const action = this.actionForm.get('action')?.value;
    switch (action) {
      case 'under_review':
        return 'Set Under Review';
      case 'approve':
        return 'Approve Request';
      case 'reject':
        return 'Reject Request';
      default:
        return 'Submit';
    }
  }

  getSubmitButtonColor(): string {
    const action = this.actionForm.get('action')?.value;
    switch (action) {
      case 'under_review':
        return 'accent';
      case 'approve':
        return 'primary';
      case 'reject':
        return 'warn';
      default:
        return 'primary';
    }
  }

  async submitAction() {
    if (this.actionForm.invalid) return;
    
    this.isSubmitting = true;
    try {
      const formValue = this.actionForm.value;
      const notes = formValue.notes || undefined;
      
      switch (formValue.action) {
        case 'under_review':
          this.onSetUnderReview.emit({
            uuid: this.request.uuid,
            notes
          });
          break;
        case 'approve':
          this.onApprove.emit({
            uuid: this.request.uuid,
            notes
          });
          break;
        case 'reject':
          this.onReject.emit({
            uuid: this.request.uuid,
            notes: formValue.notes // Required for rejection
          });
          break;
      }
    } finally {
      this.isSubmitting = false;
    }
  }

  getStatusBadgeClass(status: AssessmentRequestStatus): string {
    const statusClasses: Record<AssessmentRequestStatus, string> = {
      [AssessmentRequestStatus.PENDING]: 'bg-gray-100 text-gray-800',
      [AssessmentRequestStatus.SUBMITTED]: 'bg-blue-100 text-blue-800',
      [AssessmentRequestStatus.UNDER_REVIEW]: 'bg-yellow-100 text-yellow-800',
      [AssessmentRequestStatus.APPROVED]: 'bg-green-100 text-green-800',
      [AssessmentRequestStatus.REJECTED]: 'bg-red-100 text-red-800'
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-800';
  }
}