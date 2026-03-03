import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { TableComponent } from 'components/table/table.component';
import { DialogComponent } from 'components/dialog/dialog.component';
import { HeaderComponent } from 'components/header/header.component';
import { ContainerComponent } from 'components/container/container.component';
import { TextAreaComponent } from 'components/text-area/text-area.component';
import { HotelApprovalService } from '../../services/hotel-approval.service';
import { HotelAssessmentApproval } from '../../types/variance.types';

@Component({
  selector: 'app-dt-approval-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    TableComponent,
    MatButtonModule,
    MatIconModule,
    FormsModule,
    DialogComponent,
    HeaderComponent,
    ContainerComponent,
    TextAreaComponent,
  ],
  template: `
    <container>
      <app-header
        title="Pending Assessment Approvals"
        subtitle="Review and approve hotel assessments with resolved variances"
      />

      <app-table
        [data]="approvals"
        [columns]="columns"
        [dataLength]="totalElements"
        [tableClass]="'min-w-full bg-white rounded-lg shadow-lg'"
        (handePagination)="onPageChange($event)"
        [pageSize]="pageSize"
        [page]="currentPage"
      >
        <ng-template columnDef="hotel" let-item>
          {{ item.hotel?.name }}
        </ng-template>

        <ng-template columnDef="form" let-item>
          {{ item.form?.name }}
        </ng-template>

        <ng-template columnDef="finalScore" let-item>
          <div class="flex flex-col">
            <span class="font-semibold text-gray-900">
              {{ item.finalTotalScore | number: '1.1-1' }} /
              {{ item.finalMaxScore | number: '1.0-0' }}
            </span>
            <span class="text-sm text-gray-600">
              {{ item.finalPercentage | number: '1.1-1' }}%
            </span>
          </div>
        </ng-template>

        <ng-template columnDef="rating" let-item>
          <span
            class="px-3 py-1 rounded-full text-xs font-semibold"
            [ngClass]="getRatingClass(item.finalRating)"
          >
            {{ item.finalRating }}
          </span>
        </ng-template>

        <ng-template columnDef="variances" let-item>
          <div class="flex flex-col">
            <span
              class="text-sm"
              [ngClass]="{
                'text-green-600 font-semibold': !item.hasUnresolvedVariances,
                'text-orange-600': item.hasUnresolvedVariances,
              }"
            >
              {{
                item.hasUnresolvedVariances ? 'Has Unresolved' : 'All Resolved'
              }}
            </span>
            <span
              class="text-xs text-gray-600"
              *ngIf="item.varianceResolutionCount"
            >
              {{ item.varianceResolutionCount }} resolved
            </span>
          </div>
        </ng-template>

        <ng-template columnDef="submittedAt" let-item>
          {{ item.submittedToDtAt | date: 'short' }}
        </ng-template>

        <ng-template #actionTemplate let-item>
          <div class="flex gap-2">
            <button
              mat-icon-button
              (click)="openApprovalDialog(item)"
              class="text-green-600 hover:text-green-800"
              title="Approve"
            >
              <mat-icon>check_circle</mat-icon>
            </button>
            <button
              mat-icon-button
              (click)="openRejectionDialog(item)"
              class="text-red-600 hover:text-red-800"
              title="Reject"
            >
              <mat-icon>cancel</mat-icon>
            </button>
            <button
              mat-icon-button
              (click)="openDetailsDialog(item)"
              class="text-blue-600 hover:text-blue-800"
              title="View Details"
            >
              <mat-icon>visibility</mat-icon>
            </button>
          </div>
        </ng-template>
      </app-table>
    </container>

    <!-- Approval Dialog -->
    <app-dialog
      [open]="isApprovalDialogOpen"
      (onClose)="handleApprovalDialogClose()"
      width="600px"
      title="Approve Assessment"
    >
      <ng-template>
        <div *ngIf="selectedApproval" class="space-y-4">
          <p class="text-gray-700">
            Are you sure you want to approve the assessment for
            <strong>{{ selectedApproval.hotel.name }}</strong> using
            <strong>{{ selectedApproval.form.name }}</strong
            >?
          </p>

          <div class="p-4 bg-blue-50 rounded-lg">
            <div class="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p class="text-gray-600">Final Score</p>
                <p class="font-semibold text-gray-900">
                  {{ selectedApproval.finalTotalScore | number: '1.1-1' }} /
                  {{ selectedApproval.finalMaxScore | number: '1.0-0' }}
                </p>
              </div>
              <div>
                <p class="text-gray-600">Rating</p>
                <p class="font-semibold text-gray-900">
                  {{ selectedApproval.finalRating }}
                </p>
              </div>
            </div>
          </div>

          <app-text-area
            label="Comments (Optional)"
            name="approvalComments"
            [(ngModel)]="approvalComments"
            [rows]="3"
            placeholder="Add any comments or notes..."
          />

          <div class="flex justify-end gap-3 pt-4 border-t">
            <button
              mat-stroked-button
              (click)="handleApprovalDialogClose()"
              class="text-gray-700"
            >
              Cancel
            </button>
            <button
              mat-raised-button
              color="primary"
              (click)="confirmApproval()"
              [disabled]="isProcessing"
              class="bg-green-600 text-white hover:bg-green-700"
            >
              {{ isProcessing ? 'Processing...' : 'Approve' }}
            </button>
          </div>
        </div>
      </ng-template>
    </app-dialog>

    <!-- Rejection Dialog -->
    <app-dialog
      [open]="isRejectionDialogOpen"
      (onClose)="handleRejectionDialogClose()"
      width="600px"
      title="Reject Assessment"
    >
      <ng-template>
        <div *ngIf="selectedApproval" class="space-y-4">
          <p class="text-gray-700">
            You are about to reject the assessment for
            <strong>{{ selectedApproval.hotel.name }}</strong
            >.
          </p>

          <app-text-area
            label="Rejection Reason *"
            name="rejectionReason"
            [(ngModel)]="rejectionReason"
            [rows]="3"
            [required]="true"
            placeholder="Explain why this assessment is being rejected..."
          />

          <app-text-area
            label="Additional Comments (Optional)"
            name="rejectionComments"
            [(ngModel)]="rejectionComments"
            [rows]="2"
            placeholder="Add any additional comments..."
          />

          <div class="flex justify-end gap-3 pt-4 border-t">
            <button
              mat-stroked-button
              (click)="handleRejectionDialogClose()"
              class="text-gray-700"
            >
              Cancel
            </button>
            <button
              mat-raised-button
              color="warn"
              (click)="confirmRejection()"
              [disabled]="!rejectionReason || isProcessing"
              class="bg-red-600 text-white hover:bg-red-700"
            >
              {{ isProcessing ? 'Processing...' : 'Reject' }}
            </button>
          </div>
        </div>
      </ng-template>
    </app-dialog>

    <!-- Details Dialog -->
    <app-dialog
      [open]="isDetailsDialogOpen"
      (onClose)="handleDetailsDialogClose()"
      width="800px"
      title="Assessment Details"
    >
      <ng-template>
        <div *ngIf="selectedApproval" class="space-y-6">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-sm text-gray-600 font-medium">Hotel</p>
              <p class="text-gray-900">{{ selectedApproval.hotel.name }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-600 font-medium">Form</p>
              <p class="text-gray-900">{{ selectedApproval.form.name }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-600 font-medium">Final Score</p>
              <p class="text-gray-900 font-semibold">
                {{ selectedApproval.finalTotalScore | number: '1.1-1' }} /
                {{ selectedApproval.finalMaxScore | number: '1.0-0' }}
              </p>
            </div>
            <div>
              <p class="text-sm text-gray-600 font-medium">Percentage</p>
              <p class="text-gray-900 font-semibold">
                {{ selectedApproval.finalPercentage | number: '1.1-1' }}%
              </p>
            </div>
            <div>
              <p class="text-sm text-gray-600 font-medium">Rating</p>
              <span
                class="px-3 py-1 rounded-full text-xs font-semibold inline-block"
                [ngClass]="getRatingClass(selectedApproval.finalRating)"
              >
                {{ selectedApproval.finalRating }}
              </span>
            </div>
            <div>
              <p class="text-sm text-gray-600 font-medium">Submitted</p>
              <p class="text-gray-900">
                {{ selectedApproval.submittedToDtAt | date: 'medium' }}
              </p>
            </div>
          </div>

          <div class="border-t pt-4">
            <h4 class="font-semibold text-gray-800 mb-3">
              Variance Information
            </h4>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-sm text-gray-600">Status</p>
                <p
                  class="font-semibold"
                  [ngClass]="{
                    'text-green-600': !selectedApproval.hasUnresolvedVariances,
                    'text-orange-600': selectedApproval.hasUnresolvedVariances,
                  }"
                >
                  {{
                    selectedApproval.hasUnresolvedVariances
                      ? 'Has Unresolved Variances'
                      : 'All Variances Resolved'
                  }}
                </p>
              </div>
              <div *ngIf="selectedApproval.varianceResolutionCount">
                <p class="text-sm text-gray-600">Resolutions</p>
                <p class="font-semibold text-gray-900">
                  {{ selectedApproval.varianceResolutionCount }} variances
                  resolved
                </p>
              </div>
              <div *ngIf="selectedApproval.allVariancesResolvedAt">
                <p class="text-sm text-gray-600">Resolved At</p>
                <p class="text-gray-900">
                  {{ selectedApproval.allVariancesResolvedAt | date: 'medium' }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </ng-template>
    </app-dialog>
  `,
})
export class DtApprovalDashboardComponent implements OnInit {
  columns = [
    { label: 'Hotel', value: 'hotel' },
    { label: 'Form', value: 'form' },
    { label: 'Final Score', value: 'finalScore' },
    { label: 'Rating', value: 'rating' },
    { label: 'Variances', value: 'variances' },
    { label: 'Submitted', value: 'submittedAt' },
  ];
  approvals: HotelAssessmentApproval[] = [];
  totalElements = 0;
  pageSize = 10;
  currentPage = 0;

  isApprovalDialogOpen = false;
  isRejectionDialogOpen = false;
  isDetailsDialogOpen = false;
  selectedApproval: HotelAssessmentApproval | null = null;
  approvalComments = '';
  rejectionReason = '';
  rejectionComments = '';
  isProcessing = false;

  constructor(private hotelApprovalService: HotelApprovalService) {}

  ngOnInit() {
    this.loadApprovals();
  }

  loadApprovals() {
    this.hotelApprovalService
      .getPendingApprovals(this.currentPage, this.pageSize)
      .subscribe((response) => {
        if (response && response.data) {
          this.approvals = response.data.content || [];
          this.totalElements = response.data.totalElements || 0;
        }
      });
  }

  onPageChange(event: { page: number; size: number }) {
    this.currentPage = event.page;
    this.pageSize = event.size;
    this.loadApprovals();
  }

  openApprovalDialog(approval: HotelAssessmentApproval) {
    this.selectedApproval = approval;
    this.approvalComments = '';
    this.isApprovalDialogOpen = true;
  }

  openRejectionDialog(approval: HotelAssessmentApproval) {
    this.selectedApproval = approval;
    this.rejectionReason = '';
    this.rejectionComments = '';
    this.isRejectionDialogOpen = true;
  }

  openDetailsDialog(approval: HotelAssessmentApproval) {
    this.selectedApproval = approval;
    this.isDetailsDialogOpen = true;
  }

  confirmApproval() {
    if (!this.selectedApproval) return;

    this.isProcessing = true;
    this.hotelApprovalService
      .approveAssessment(this.selectedApproval.uuid, this.approvalComments)
      .subscribe({
        next: (response) => {
          if (response.status === 200) {
            this.handleApprovalDialogClose();
            this.loadApprovals();
          }
          this.isProcessing = false;
        },
        error: () => {
          this.isProcessing = false;
        },
      });
  }

  confirmRejection() {
    if (!this.selectedApproval || !this.rejectionReason) return;

    this.isProcessing = true;
    this.hotelApprovalService
      .rejectAssessment(
        this.selectedApproval.uuid,
        this.rejectionReason,
        this.rejectionComments,
      )
      .subscribe({
        next: (response) => {
          if (response.status === 200) {
            this.handleRejectionDialogClose();
            this.loadApprovals();
          }
          this.isProcessing = false;
        },
        error: () => {
          this.isProcessing = false;
        },
      });
  }

  handleApprovalDialogClose() {
    this.isApprovalDialogOpen = false;
    this.selectedApproval = null;
    this.approvalComments = '';
  }

  handleRejectionDialogClose() {
    this.isRejectionDialogOpen = false;
    this.selectedApproval = null;
    this.rejectionReason = '';
    this.rejectionComments = '';
  }

  handleDetailsDialogClose() {
    this.isDetailsDialogOpen = false;
    this.selectedApproval = null;
  }

  getRatingClass(rating: string): string {
    const ratingUpper = rating?.toUpperCase() || '';
    if (ratingUpper.includes('5') || ratingUpper.includes('FIVE')) {
      return 'bg-purple-100 text-purple-800';
    } else if (ratingUpper.includes('4') || ratingUpper.includes('FOUR')) {
      return 'bg-blue-100 text-blue-800';
    } else if (ratingUpper.includes('3') || ratingUpper.includes('THREE')) {
      return 'bg-green-100 text-green-800';
    } else if (ratingUpper.includes('2') || ratingUpper.includes('TWO')) {
      return 'bg-yellow-100 text-yellow-800';
    } else if (ratingUpper.includes('1') || ratingUpper.includes('ONE')) {
      return 'bg-orange-100 text-orange-800';
    }
    return 'bg-gray-100 text-gray-800';
  }
}
