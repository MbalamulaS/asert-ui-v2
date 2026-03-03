import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TextAreaComponent } from 'components/text-area/text-area.component';
import { SubmitButtonComponent } from 'components/submit-button/submit-button.component';
import {
  AssessmentRequest,
  AssessmentRequestStatus,
} from '../types/assessment-request.types';
import { AssessmentRequestService } from '../services/assessment-request.service';

@Component({
  selector: 'app-assessment-request-view-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatCardModule,
    MatChipsModule,
    MatProgressBarModule,
    MatExpansionModule,
    ReactiveFormsModule,
    TextAreaComponent,
    SubmitButtonComponent,
  ],
  template: `
    <div class="max-h-[80vh] overflow-y-auto" *ngIf="request">
      <mat-tab-group>
        <!-- Overview Tab -->
        <mat-tab label="Overview">
          <div class="p-6 space-y-6">
            <!-- Facility and Contact Info -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <mat-card class="p-4">
                <mat-card-header>
                  <mat-card-title class="text-lg font-semibold"
                    >Facility Information</mat-card-title
                  >
                </mat-card-header>
                <mat-card-content class="mt-4 space-y-3">
                  <div>
                    <label class="text-sm font-medium text-gray-600"
                      >Hotel Name</label
                    >
                    <p>{{ request.facilityName }}</p>
                  </div>
                  <div>
                    <label class="text-sm font-medium text-gray-600"
                      >Property Type</label
                    >
                    <p>{{ request.facilityType }}</p>
                  </div>
                  <div>
                    <label class="text-sm font-medium text-gray-600"
                      >Address</label
                    >
                    <p>{{ request.address || 'Not provided' }}</p>
                  </div>
                </mat-card-content>
              </mat-card>

              <mat-card class="p-4">
                <mat-card-header>
                  <mat-card-title class="text-lg font-semibold"
                    >Contact Information</mat-card-title
                  >
                </mat-card-header>
                <mat-card-content class="mt-4 space-y-3">
                  <div>
                    <label class="text-sm font-medium text-gray-600"
                      >Contact Person</label
                    >
                    <p>{{ request.contactPerson }}</p>
                  </div>
                  <div>
                    <label class="text-sm font-medium text-gray-600"
                      >Email</label
                    >
                    <p>{{ request.email }}</p>
                  </div>
                  <div>
                    <label class="text-sm font-medium text-gray-600"
                      >Phone</label
                    >
                    <p>{{ request.phoneNumber }}</p>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>

            <!-- Status and Progress -->
            <mat-card class="p-4">
              <mat-card-header>
                <mat-card-title class="text-lg font-semibold"
                  >Assessment Status</mat-card-title
                >
              </mat-card-header>
              <mat-card-content class="mt-4">
                <div class="flex items-center justify-between mb-4">
                  <div class="flex items-center gap-3">
                    <mat-chip
                      [ngClass]="getStatusBadgeClass(request.status)"
                      class="font-medium"
                    >
                      {{ request.statusDisplayName }}
                    </mat-chip>
                    <span class="text-sm text-gray-600"
                      >Submitted:
                      {{ request.submittedAt | date: 'medium' }}</span
                    >
                  </div>
                  <div class="text-right">
                    <p class="text-sm text-gray-600">Completion Progress</p>
                    <p class="text-lg font-semibold">
                      {{ request.completionPercentage | number: '1.0-0' }}%
                    </p>
                  </div>
                </div>
                <mat-progress-bar
                  mode="determinate"
                  [value]="request.completionPercentage"
                  class="mb-4"
                ></mat-progress-bar>
                <div class="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p class="text-2xl font-bold text-green-600">
                      {{ request.compliantItemsCount }}
                    </p>
                    <p class="text-sm text-gray-600">Compliant</p>
                  </div>
                  <div>
                    <p class="text-2xl font-bold text-red-600">
                      {{ request.nonCompliantItemsCount }}
                    </p>
                    <p class="text-sm text-gray-600">Non-Compliant</p>
                  </div>
                  <div>
                    <p class="text-2xl font-bold text-gray-600">
                      {{ request.pendingItemsCount }}
                    </p>
                    <p class="text-sm text-gray-600">Pending</p>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>

            <mat-card class="p-4" *ngIf="request.additionalComments">
              <mat-card-header>
                <mat-card-title class="text-lg font-semibold"
                  >Additional Comments</mat-card-title
                >
              </mat-card-header>
              <mat-card-content
                ><p>{{ request.additionalComments }}</p></mat-card-content
              >
            </mat-card>

            <mat-card class="p-4" *ngIf="request.processingNotes">
              <mat-card-header>
                <mat-card-title class="text-lg font-semibold"
                  >Processing Notes</mat-card-title
                >
              </mat-card-header>
              <mat-card-content>
                <p>{{ request.processingNotes }}</p>
                <p
                  class="text-sm text-gray-600 mt-2"
                  *ngIf="request.processedAt"
                >
                  Last updated: {{ request.processedAt | date: 'medium' }}
                </p>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <!-- Essential Items Tab -->
        <mat-tab
          label="Essential Items ({{ request.essentialItems?.length || 0 }})"
        >
          <div class="p-6">
            <mat-accordion>
              <mat-expansion-panel
                *ngFor="
                  let item of request.essentialItems;
                  trackBy: trackByItemId
                "
              >
                <mat-expansion-panel-header>
                  <mat-panel-title class="flex items-center gap-3">
                    <span class="font-medium">Item {{ item.itemNo }}</span>
                    <mat-chip
                      [ngClass]="getComplianceBadgeClass(item.compliance)"
                      class="text-xs"
                    >
                      {{ getComplianceDisplayName(item.compliance) }}
                    </mat-chip>
                    <mat-icon
                      *ngIf="item.evidenceProvided"
                      class="text-blue-600"
                      >attach_file</mat-icon
                    >
                  </mat-panel-title>
                  <mat-panel-description>
                    {{ item.description | slice: 0 : 100
                    }}{{ item.description?.length > 100 ? '...' : '' }}
                  </mat-panel-description>
                </mat-expansion-panel-header>

                <div class="space-y-4">
                  <div>
                    <h4 class="font-medium">Description</h4>
                    <p>{{ item.description }}</p>
                  </div>
                  <div>
                    <h4 class="font-medium">Requirement</h4>
                    <p>{{ item.complianceRequirement }}</p>
                  </div>
                  <div *ngIf="item.notes">
                    <h4 class="font-medium">Notes</h4>
                    <p>{{ item.notes }}</p>
                  </div>

                  <div *ngIf="item.evidence?.length">
                    <h4 class="font-medium">Evidence Files</h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div
                        *ngFor="let file of item.evidence"
                        class="border rounded-lg p-3 hover:bg-gray-50"
                      >
                        <div class="flex items-center gap-3">
                          <mat-icon [ngClass]="getFileIconClass(file.mimeType)">
                            {{ getFileIcon(file.mimeType) }}
                          </mat-icon>
                          <div class="flex-1 min-w-0">
                            <p
                              class="text-sm font-medium text-gray-900 truncate"
                            >
                              {{ file.displayName || 'File' }}
                            </p>
                            <p class="text-sm text-gray-500">
                              {{ file.fileSizeFormatted || '' }}
                            </p>
                          </div>
                          <button
                            mat-icon-button
                            (click)="viewFile(file.fileUrl)"
                            class="text-blue-600"
                          >
                            <mat-icon>visibility</mat-icon>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </mat-expansion-panel>
            </mat-accordion>
          </div>
        </mat-tab>

        <!-- Actions Tab -->
        <mat-tab label="Actions" *ngIf="canTakeAction()">
          <div class="p-6 space-y-6">
            <mat-card class="p-4" *ngIf="request.status === 'SUBMITTED'">
              <mat-card-header
                ><mat-card-title class="text-lg text-blue-600"
                  >Set Under Review</mat-card-title
                ></mat-card-header
              >
              <mat-card-content>
                <form
                  [formGroup]="underReviewForm"
                  (ngSubmit)="submitUnderReview()"
                >
                  <app-text-area
                    label="Notes (Optional)"
                    [form]="underReviewForm"
                    controlName="notes"
                    [rows]="3"
                  ></app-text-area>
                  <div class="flex justify-end mt-4">
                    <app-submit-button
                      text="Set Under Review"
                      [loading]="isSubmitting"
                      color="accent"
                      [disabled]="underReviewForm.invalid"
                    ></app-submit-button>
                  </div>
                </form>
              </mat-card-content>
            </mat-card>

            <mat-card class="p-4" *ngIf="canApprove()">
              <mat-card-header
                ><mat-card-title class="text-lg text-green-600"
                  >Approve Request</mat-card-title
                ></mat-card-header
              >
              <mat-card-content>
                <form [formGroup]="approvalForm" (ngSubmit)="submitApproval()">
                  <app-text-area
                    label="Approval Notes (Optional)"
                    [form]="approvalForm"
                    controlName="notes"
                    [rows]="3"
                  ></app-text-area>
                  <div class="flex justify-end mt-4">
                    <app-submit-button
                      text="Approve Request"
                      [loading]="isSubmitting"
                      color="primary"
                      [disabled]="approvalForm.invalid"
                    ></app-submit-button>
                  </div>
                </form>
              </mat-card-content>
            </mat-card>

            <mat-card class="p-4" *ngIf="canReject()">
              <mat-card-header
                ><mat-card-title class="text-lg text-red-600"
                  >Reject Request</mat-card-title
                ></mat-card-header
              >
              <mat-card-content>
                <form
                  [formGroup]="rejectionForm"
                  (ngSubmit)="submitRejection()"
                >
                  <app-text-area
                    label="Rejection Notes *"
                    [form]="rejectionForm"
                    controlName="notes"
                    [rows]="4"
                    [required]="true"
                  ></app-text-area>
                  <div class="flex justify-end mt-4">
                    <app-submit-button
                      text="Reject Request"
                      [loading]="isSubmitting"
                      color="warn"
                      [disabled]="rejectionForm.invalid"
                    ></app-submit-button>
                  </div>
                </form>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
})
export class AssessmentRequestViewDialogComponent implements OnInit {
  @Input() request!: AssessmentRequest;
  @Output() onApprove = new EventEmitter<{ uuid: string; notes?: string }>();
  @Output() onReject = new EventEmitter<{ uuid: string; notes: string }>();
  @Output() onSetUnderReview = new EventEmitter<{
    uuid: string;
    notes?: string;
  }>();

  isSubmitting = false;

  approvalForm: FormGroup;
  rejectionForm: FormGroup;
  underReviewForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private assessmentRequestService: AssessmentRequestService,
  ) {
    this.approvalForm = this.fb.group({ notes: [''] });
    this.rejectionForm = this.fb.group({ notes: ['', Validators.required] });
    this.underReviewForm = this.fb.group({ notes: [''] });
  }

  ngOnInit() {}

  canTakeAction(): boolean {
    return (
      this.request?.status === AssessmentRequestStatus.SUBMITTED ||
      this.request?.status === AssessmentRequestStatus.UNDER_REVIEW
    );
  }

  canApprove(): boolean {
    return this.canTakeAction();
  }

  canReject(): boolean {
    return this.canTakeAction();
  }

  submitApproval() {
    if (this.approvalForm.invalid) return;
    this.isSubmitting = true;
    const formValue = this.approvalForm.value;
    this.onApprove.emit({
      uuid: this.request.uuid,
      notes: formValue.notes || undefined,
    });
    this.isSubmitting = false;
  }

  submitRejection() {
    if (this.rejectionForm.invalid) return;
    this.isSubmitting = true;
    const formValue = this.rejectionForm.value;
    this.onReject.emit({ uuid: this.request.uuid, notes: formValue.notes });
    this.isSubmitting = false;
  }

  submitUnderReview() {
    this.isSubmitting = true;
    const formValue = this.underReviewForm.value;
    this.onSetUnderReview.emit({
      uuid: this.request.uuid,
      notes: formValue.notes || undefined,
    });
    this.isSubmitting = false;
  }

  getStatusBadgeClass(status: AssessmentRequestStatus): string {
    return this.assessmentRequestService.getStatusBadgeClass(status);
  }

  getComplianceBadgeClass(compliance?: string): string {
    const classes: Record<string, string> = {
      compliant: 'bg-green-100 text-green-800',
      'non-compliant': 'bg-red-100 text-red-800',
      'partially-compliant': 'bg-yellow-100 text-yellow-800',
    };
    return classes[compliance ?? ''] || 'bg-gray-100 text-gray-800';
  }

  getComplianceDisplayName(compliance?: string): string {
    const names: Record<string, string> = {
      compliant: 'Compliant',
      'non-compliant': 'Non-Compliant',
      'partially-compliant': 'Partially Compliant',
    };
    return names[compliance ?? ''] || 'Pending';
  }

  getFileIcon(mimeType: string): string {
    if (mimeType?.startsWith('image/')) return 'image';
    if (mimeType?.startsWith('video/')) return 'videocam';
    if (mimeType?.includes('pdf')) return 'picture_as_pdf';
    if (mimeType?.includes('word') || mimeType?.includes('document'))
      return 'description';
    if (mimeType?.includes('excel') || mimeType?.includes('spreadsheet'))
      return 'table_chart';
    return 'insert_drive_file';
  }

  getFileIconClass(mimeType: string): string {
    if (mimeType?.startsWith('image/')) return 'text-green-600';
    if (mimeType?.startsWith('video/')) return 'text-blue-600';
    if (mimeType?.includes('pdf')) return 'text-red-600';
    return 'text-gray-600';
  }

  viewFile(url: string) {
    window.open(url, '_blank');
  }

  trackByItemId(index: number, item: any): number {
    return item.id;
  }
}
