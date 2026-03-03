import {
  Component,
  OnInit,
  AfterViewInit,
  inject,
  TemplateRef,
  ViewChild,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { FormSubmissionService } from '../services/form-submission.service';
import { FormSubmission, SubmissionStatus } from '../types';
import { SubmissionStatusBadgeComponent } from './submission-status-badge.component';
import { ContainerComponent } from 'components/container/container.component';
import { HeaderComponent } from 'components/header/header.component';
import { ConfirmDialogComponent } from 'components/confirm/confirm.dialog';
import { DialogComponent } from 'components/dialog/dialog.component';
import { RejectionFormComponent } from './rejection-form.component';
import {
  ExpandableTableComponent,
  ExpandableTableGroup,
} from 'components/expandable-table/expandable-table.component';
import { lastValueFrom } from 'rxjs';

interface HotelGroup extends ExpandableTableGroup<FormSubmission> {
  hotelName: string;
  hotelUuid: string;
  submissions: FormSubmission[];
  isExpanded: boolean;
  groupKey: string;
  groupLabel: string;
  items: FormSubmission[];
}

@Component({
  selector: 'app-submissions-approval',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatMenuModule,
    SubmissionStatusBadgeComponent,
    ContainerComponent,
    HeaderComponent,
    ExpandableTableComponent,
    ConfirmDialogComponent,
    DialogComponent,
    RejectionFormComponent,
  ],
  template: `
    <container>
      <app-header
        title="Submissions Awaiting Approval"
        subtitle="Review and approve or reject assessment submissions"
      />

      <!-- Loading State -->
      <div *ngIf="isLoading" class="flex justify-center items-center py-20">
        <mat-spinner></mat-spinner>
      </div>

      <!-- Empty State -->
      <div
        *ngIf="!isLoading && submissions.length === 0"
        class="bg-blue-50 border-l-4 border-blue-500 p-6 rounded mt-6"
      >
        <div class="flex items-center">
          <mat-icon class="text-blue-600 mr-3">info</mat-icon>
          <p class="text-blue-800">
            No submissions awaiting approval at this time.
          </p>
        </div>
      </div>

      <!-- Custom column templates (defined outside *ngIf so ViewChild can access them) -->
      <ng-template #assessorTemplate let-item>
        {{ getAssessorFullName(item?.assessor) }}
      </ng-template>

      <ng-template #submittedAtTemplate let-item>
        {{ item.submittedAt | date: 'MMM d, y, h:mm a' }}
      </ng-template>

      <ng-template #totalScoreTemplate let-item>
        {{ item.totalScore | number: '1.1-1' }}
      </ng-template>

      <ng-template #maxScoreTemplate let-item>
        {{ item.maxPossibleScore | number: '1.1-1' }}
      </ng-template>

      <ng-template #percentageTemplate let-item>
        <span
          [ngClass]="{
            'text-green-600': item.percentage >= 75,
            'text-yellow-600': item.percentage >= 50 && item.percentage < 75,
            'text-red-600': item.percentage < 50,
          }"
          class="font-medium"
        >
          {{ item.percentage | number: '1.1-1' }}%
        </span>
      </ng-template>

      <ng-template #statusTemplate let-item>
        <app-submission-status-badge
          [status]="item.status"
        ></app-submission-status-badge>
      </ng-template>

      <!-- Expandable Table Grouped by Hotel -->
      <div *ngIf="!isLoading && groupedSubmissions.length > 0" class="mt-6">
        <app-expandable-table
          [groups]="groupedSubmissions"
          [columns]="submissionColumns"
          [striped]="true"
          [showBorders]="true"
          groupColumnLabel="Hotel"
          emptyMessage="No submissions awaiting approval"
        >
          <!-- Actions template (must be inside app-expandable-table for @ContentChild) -->
          <ng-template #actions let-item>
            <div class="flex justify-center gap-2">
              <button
                mat-icon-button
                [matMenuTriggerFor]="actionsMenu"
                [matMenuTriggerData]="{ submission: item }"
                aria-label="Actions menu"
                (click)="$event.stopPropagation()"
              >
                <mat-icon>more_vert</mat-icon>
              </button>

              <mat-menu #actionsMenu="matMenu">
                <ng-template matMenuContent let-submission="submission">
                  <button
                    mat-menu-item
                    [routerLink]="['/submissions', submission.uuid]"
                    (click)="$event.stopPropagation()"
                  >
                    <mat-icon>visibility</mat-icon>
                    <span>View Details</span>
                  </button>
                  <button
                    mat-menu-item
                    (click)="approveSubmission(submission)"
                    [disabled]="isProcessing"
                  >
                    <mat-icon class="text-green-600">check_circle</mat-icon>
                    <span>Approve</span>
                  </button>
                  <button
                    mat-menu-item
                    (click)="openRejectDialog(submission)"
                    [disabled]="isProcessing"
                  >
                    <mat-icon class="text-red-600">cancel</mat-icon>
                    <span>Reject</span>
                  </button>
                </ng-template>
              </mat-menu>
            </div>
          </ng-template>
        </app-expandable-table>
      </div>

      <!-- Approval Confirmation Dialog -->
      <app-confirm-dialog
        [open]="isApprovalDialogOpen"
        [title]="'Approve Submission'"
        [message]="
          'Are you sure you want to approve this submission? This action cannot be undone.'
        "
        [confirmMessage]="'APPROVE'"
        (onClose)="closeApprovalDialog($event)"
        (onConfirm)="handleApprovalConfirm()"
      />

      <!-- Rejection Form Dialog -->
      <app-dialog
        [open]="isRejectDialogOpen"
        [title]="'Reject Submission'"
        width="600px"
        (onClose)="handleRejectDialogClose($event)"
      >
        <ng-template>
          <app-rejection-form
            (onSubmitRejection)="handleRejectSubmit($event)"
            (onCancelRejection)="handleRejectCancel()"
          />
        </ng-template>
      </app-dialog>
    </container>
  `,
})
export class SubmissionsApprovalComponent implements OnInit, AfterViewInit {
  @ViewChild('assessorTemplate') assessorTemplate!: TemplateRef<any>;
  @ViewChild('submittedAtTemplate') submittedAtTemplate!: TemplateRef<any>;
  @ViewChild('totalScoreTemplate') totalScoreTemplate!: TemplateRef<any>;
  @ViewChild('maxScoreTemplate') maxScoreTemplate!: TemplateRef<any>;
  @ViewChild('percentageTemplate') percentageTemplate!: TemplateRef<any>;
  @ViewChild('statusTemplate') statusTemplate!: TemplateRef<any>;

  private submissionService = inject(FormSubmissionService);
  private dialog = inject(MatDialog);
  private cdr = inject(ChangeDetectorRef);

  submissions: FormSubmission[] = [];
  groupedSubmissions: HotelGroup[] = [];
  submissionColumns: any[] = [];
  isLoading = false;
  isProcessing = false;
  isApprovalDialogOpen = false;
  isRejectDialogOpen = false;
  selectedSubmission: FormSubmission | null = null;

  ngOnInit() {
    this.loadSubmissions();
  }

  ngAfterViewInit() {
    // Set up columns with templates after view init
    this.submissionColumns = [
      {
        label: 'Submitted By',
        value: 'assessor',
        template: this.assessorTemplate,
      },
      {
        label: 'Submitted At',
        value: 'submittedAt',
        template: this.submittedAtTemplate,
      },
      {
        label: 'Score',
        value: 'totalScore',
        template: this.totalScoreTemplate,
      },
      {
        label: 'Max Score',
        value: 'maxPossibleScore',
        template: this.maxScoreTemplate,
      },
      {
        label: 'Percentage',
        value: 'percentage',
        template: this.percentageTemplate,
      },
      { label: 'Status', value: 'status', template: this.statusTemplate },
    ];
    // Trigger change detection to avoid ExpressionChangedAfterItHasBeenCheckedError
    this.cdr.detectChanges();
  }

  async loadSubmissions() {
    try {
      this.isLoading = true;
      const response = await lastValueFrom(
        this.submissionService.getAllSubmissions(),
      );

      const { data } = response;

      // Filter only SUBMITTED submissions
      this.submissions = (data as any)
        .filter(
          (sub: FormSubmission) => sub.status === SubmissionStatus.SUBMITTED,
        )
        .sort((a: FormSubmission, b: FormSubmission) => {
          const dateA = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
          const dateB = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
          return dateB - dateA; // Most recent first
        });

      // Group submissions by hotel
      this.groupSubmissionsByHotel();
    } catch (err) {
      console.error('Error loading submissions:', err);
    } finally {
      this.isLoading = false;
    }
  }

  groupSubmissionsByHotel() {
    // Group submissions by hotel
    const groupsMap = new Map<string, HotelGroup>();

    this.submissions.forEach((submission) => {
      const hotelUuid = (submission as any).hotel?.uuid || 'unknown';
      const hotelName = (submission as any).hotel?.name || 'Unknown Hotel';

      if (!groupsMap.has(hotelUuid)) {
        groupsMap.set(hotelUuid, {
          hotelUuid,
          hotelName,
          submissions: [],
          isExpanded: true,
          groupKey: hotelUuid,
          groupLabel: hotelName,
          items: [],
        });
      }

      const group = groupsMap.get(hotelUuid)!;
      group.submissions.push(submission);
      group.items.push(submission); // Also add to items array for ExpandableTableGroup
    });

    // Convert map to array
    this.groupedSubmissions = Array.from(groupsMap.values());

    // Only expand the first hotel group by default
    this.groupedSubmissions.forEach((group, index) => {
      group.isExpanded = index === 0;
    });
  }

  getAssessorFullName(assessor: any): string {
    if (!assessor) return 'Unknown';

    const parts = [
      assessor.title,
      assessor.firstName,
      assessor.middleName,
      assessor.lastName,
    ].filter((part) => part && part.trim() !== '');

    return parts.join(' ') || 'Unknown';
  }

  approveSubmission(submission: FormSubmission) {
    if (!submission.uuid) return;
    this.selectedSubmission = submission;
    this.isApprovalDialogOpen = true;
  }

  closeApprovalDialog(event: any) {
    this.isApprovalDialogOpen = false;
  }

  async handleApprovalConfirm() {
    if (!this.selectedSubmission?.uuid) return;

    try {
      this.isProcessing = true;
      this.isApprovalDialogOpen = false;

      await lastValueFrom(
        this.submissionService.approveSubmission(this.selectedSubmission.uuid),
      );

      await this.loadSubmissions(); // Reload the list
    } catch (err) {
      console.error('Error approving submission:', err);
    } finally {
      this.isProcessing = false;
      this.selectedSubmission = null;
    }
  }

  openRejectDialog(submission: FormSubmission) {
    this.selectedSubmission = submission;
    this.isRejectDialogOpen = true;
  }

  handleRejectDialogClose(event: any) {
    this.isRejectDialogOpen = false;
    this.selectedSubmission = null;
  }

  handleRejectCancel() {
    this.isRejectDialogOpen = false;
    this.selectedSubmission = null;
  }

  async handleRejectSubmit(rejectionReason: string) {
    if (!this.selectedSubmission?.uuid) return;

    try {
      this.isProcessing = true;
      this.isRejectDialogOpen = false;

      await lastValueFrom(
        this.submissionService.rejectSubmission(
          this.selectedSubmission.uuid,
          rejectionReason,
        ),
      );

      await this.loadSubmissions(); // Reload the list
    } catch (err) {
      console.error('Error rejecting submission:', err);
    } finally {
      this.isProcessing = false;
      this.selectedSubmission = null;
    }
  }
}
