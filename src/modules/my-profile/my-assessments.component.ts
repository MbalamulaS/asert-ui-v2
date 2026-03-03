import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { FormSubmissionService } from '../forms/services/form-submission.service';
import { FormSubmission, SubmissionStatus } from '../forms/types';
import { ContainerComponent } from 'components/container/container.component';
import { HeaderComponent } from 'components/header/header.component';
import { lastValueFrom } from 'rxjs';
import { ConfirmDialogComponent } from 'components/confirm/confirm.dialog';
import {
  ExpandableTableComponent,
  ExpandableTableGroup,
  ColumnDefDirective,
} from 'components/expandable-table/expandable-table.component';
import { SubmissionVarianceStatusBadgeComponent } from 'modules/forms/components/submission-variance-status-badge.component';

interface HotelGroup extends ExpandableTableGroup<FormSubmission> {
  hotelName: string;
  hotelUuid: string;
  submissions: FormSubmission[];
  expanded: boolean;
  isExpanded: boolean;
  groupKey: string;
  groupLabel: string;
  items: FormSubmission[];
}

@Component({
  selector: 'app-my-assessments',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    ContainerComponent,
    HeaderComponent,
    ConfirmDialogComponent,
    ExpandableTableComponent,
    SubmissionVarianceStatusBadgeComponent,
    ColumnDefDirective,
    MatMenuModule,
  ],
  template: `
    <container>
      <app-header title="My Assessments" />

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
            You haven't submitted any assessments yet.
          </p>
        </div>
      </div>

      <!-- Search Bar -->
      <div *ngIf="!isLoading && submissions.length > 0" class="mt-6">
        <mat-form-field class="w-full" appearance="outline">
          <mat-label>Search hotels or assessments</mat-label>
          <input
            matInput
            [(ngModel)]="searchTerm"
            (ngModelChange)="onSearchChange()"
            placeholder="Enter hotel name or form name..."
          />
          <mat-icon matPrefix>search</mat-icon>
          <button
            *ngIf="searchTerm"
            matSuffix
            mat-icon-button
            (click)="clearSearch()"
          >
            <mat-icon>clear</mat-icon>
          </button>
        </mat-form-field>
      </div>

      <!-- Grouped Submissions by Hotel -->
      <div *ngIf="!isLoading && filteredHotelGroups.length > 0" class="mt-6">
        <app-expandable-table
          [groups]="filteredHotelGroups"
          [columns]="submissionColumns"
          [striped]="true"
          [showBorders]="true"
          [rowHeight]="30"
          groupColumnLabel="Hotel"
          emptyMessage="No assessments found"
        >
          <ng-template columnDef="hasUnresolvedVariances" let-submission>
            <app-variance-submission-status-badge
              [status]="submission.hasUnresolvedVariances"
            ></app-variance-submission-status-badge>
          </ng-template>

          <ng-template columnDef="submittedAt" let-value="value">
            {{ value | date: 'medium' }}
          </ng-template>

          <ng-template columnDef="status" let-value="value">
            <span
              [ngClass]="{
                'text-green-600': value === 'SUBMITTED',
                'text-yellow-600': value === 'DRAFT',
              }"
              class="font-medium"
            >
              {{ value }}
            </span>
          </ng-template>

          <ng-template columnDef="totalScore" let-value="value">
            {{ value | number: '1.1-1' }}
          </ng-template>

          <ng-template columnDef="maxPossibleScore" let-value="value">
            {{ value | number: '1.1-1' }}
          </ng-template>

          <ng-template columnDef="percentage" let-value="value">
            <span
              [ngClass]="{
                'text-green-600': value >= 75,
                'text-yellow-600': value >= 50 && value < 75,
                'text-red-600': value < 50,
              }"
              class="font-medium"
            >
              {{ value | number: '1.1-1' }}%
            </span>
          </ng-template>

          <ng-template #actions let-submission>
            <div class="flex justify-center">
              <button
                mat-icon-button
                [matMenuTriggerFor]="actionsMenu"
                [matMenuTriggerData]="{ submission: submission }"
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
                    <span>View</span>
                  </button>
                  <button
                    *ngIf="canSubmitForApproval(submission)"
                    mat-menu-item
                    (click)="prepareSubmitForApproval(submission)"
                    [disabled]="isProcessing"
                  >
                    <mat-icon>send</mat-icon>
                    <span>Submit for Approval</span>
                  </button>
                </ng-template>
              </mat-menu>
            </div>
          </ng-template>
        </app-expandable-table>
      </div>
      <!-- No Results State -->
      <div
        *ngIf="
          !isLoading &&
          submissions.length > 0 &&
          filteredHotelGroups.length === 0
        "
        class="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded mt-6"
      >
        <div class="flex items-center">
          <mat-icon class="text-yellow-600 mr-3">search_off</mat-icon>
          <p class="text-yellow-800">
            No assessments found matching your search.
          </p>
        </div>
      </div>

      <app-confirm-dialog
        [open]="isConfirmDialogOpen"
        [title]="'Submit for Approval'"
        [message]="getSubmitConfirmMessage()"
        (onClose)="closeConfirmDialog()"
        (onConfirm)="handleSubmitConfirm()"
      />
    </container>
  `,
})
export class MyAssessmentsComponent implements OnInit {
  private submissionService = inject(FormSubmissionService);

  submissions: FormSubmission[] = [];
  hotelGroups: HotelGroup[] = [];
  filteredHotelGroups: HotelGroup[] = [];
  searchTerm = '';
  isLoading = false;
  isProcessing = false;
  isConfirmDialogOpen = false;
  selectedSubmission: FormSubmission;

  // Column configuration for the expandable table
  submissionColumns = [
    { label: 'Variance Resolution', value: 'hasUnresolvedVariances' },
    { label: 'Score', value: 'totalScore' },
    { label: 'Max Score', value: 'maxPossibleScore' },
    { label: 'Submission Status', value: 'status' },
    { label: 'Percentage', value: 'percentage' },
  ];

  ngOnInit() {
    this.loadMySubmissions();
  }

  async loadMySubmissions() {
    try {
      this.isLoading = true;
      const response = await lastValueFrom(
        this.submissionService.getMySubmissions(),
      );

      // API already returns submissions sorted by most recent first
      this.submissions = (response as any).data || [];

      console.log('Submissions:', this.submissions);

      this.groupSubmissionsByHotel();
    } catch (err) {
      console.error('Error loading submissions:', err);
    } finally {
      this.isLoading = false;
    }
  }

  groupSubmissionsByHotel() {
    const groupMap = new Map<string, HotelGroup>();

    this.submissions.forEach((submission) => {
      const hotelUuid = (submission as any).hotel?.uuid || 'unknown';
      const hotelName = (submission as any).hotel?.name || 'Unknown Hotel';

      if (!groupMap.has(hotelUuid)) {
        groupMap.set(hotelUuid, {
          // HotelGroup specific properties
          hotelUuid,
          hotelName,
          submissions: [],
          isExpanded: true,
          expanded: true,
          groupKey: hotelUuid,
          groupLabel: hotelName,
          items: [],
        });
      }

      const group = groupMap.get(hotelUuid)!;
      group.submissions.push(submission);
      group.items.push(submission);
    });

    this.hotelGroups = Array.from(groupMap.values());
    // Only expand the first hotel group by default
    this.hotelGroups.forEach((group, index) => {
      group.expanded = index === 0;
      group.isExpanded = index === 0; // For ExpandableTableGroup
    });
    this.filteredHotelGroups = [...this.hotelGroups];
  }

  onSearchChange() {
    if (!this.searchTerm.trim()) {
      this.filteredHotelGroups = [...this.hotelGroups];
      return;
    }

    const searchLower = this.searchTerm.toLowerCase().trim();
    this.filteredHotelGroups = this.hotelGroups
      .map((group) => {
        // Check if hotel name matches
        const hotelMatches = group.hotelName
          .toLowerCase()
          .includes(searchLower);

        // Filter submissions within the group
        const filteredSubmissions = group.submissions.filter(
          (submission) =>
            submission.form?.name?.toLowerCase().includes(searchLower) ||
            submission.status.toLowerCase().includes(searchLower),
        );

        // Include group if hotel matches OR if any submissions match
        if (hotelMatches || filteredSubmissions.length > 0) {
          const submissions = hotelMatches
            ? group.submissions
            : filteredSubmissions;
          return {
            ...group,
            submissions,
            items: submissions, // Update items array for ExpandableTableGroup
            expanded: true, // Expand groups with search results
            isExpanded: true, // For ExpandableTableGroup
          };
        }
        return null;
      })
      .filter((group): group is HotelGroup => group !== null);
  }

  clearSearch() {
    this.searchTerm = '';
    this.onSearchChange();
  }

  hasVariances(submission: FormSubmission): boolean {
    // TODO: Integrate with variance detection API
    // For now, return false - this should be populated from backend
    return (submission as any).hasUnresolvedVariances || false;
  }

  canSubmitForApproval(submission: FormSubmission): boolean {
    const { status, totalRequiredAssessors, submittedAssessorCount } =
      submission;

    const hasVariances = this.hasVariances(submission);

    const allAssessorsSubmitted =
      totalRequiredAssessors != null &&
      submittedAssessorCount != null &&
      submittedAssessorCount >= totalRequiredAssessors;

    if (status === SubmissionStatus.DRAFT) {
      return true && !this.hasVariances(submission);
    }

    if (status === SubmissionStatus.REJECTED) {
      return allAssessorsSubmitted && !this.hasVariances(submission);
    }

    return false;
  }

  prepareSubmitForApproval(submission: FormSubmission) {
    this.selectedSubmission = submission;

    this.isConfirmDialogOpen = true;
  }

  closeConfirmDialog() {
    this.isConfirmDialogOpen = false;
  }

  getSubmitConfirmMessage(): string {
    if (!this.selectedSubmission) {
      return "Are you sure you want to submit this assessment for approval? Once submitted, you won't be able to edit it.";
    }

    const baseMessage =
      'Are you sure you want to submit this assessment for approval?';

    // Check if assessor has other submissions for the same form and hotel
    const formUuid = this.selectedSubmission.form?.uuid;
    const hotelUuid = (this.selectedSubmission as any).hotel?.uuid;

    const otherSubmissionsForSameFormAndHotel = this.submissions.filter(
      (s) =>
        s.form?.uuid === formUuid &&
        (s as any).hotel?.uuid === hotelUuid &&
        s.uuid !== this.selectedSubmission.uuid,
    );

    if (otherSubmissionsForSameFormAndHotel.length > 0) {
      const statuses = otherSubmissionsForSameFormAndHotel
        .map((s) => s.status)
        .join(', ');

      return `${baseMessage}\n\n⚠️ IMPORTANT: You have ${otherSubmissionsForSameFormAndHotel.length} other submission(s) for this form and hotel (Status: ${statuses}).\n\nSubmitting this assessment will PERMANENTLY DELETE your previous submission(s) for this form and hotel. Only this latest submission will be retained.\n\nThis ensures only one assessment per form and hotel affects the facility's rating.\n\nOnce submitted, you won't be able to edit it until it's reviewed.`;
    }

    return `${baseMessage}\n\nOnce submitted, you won't be able to edit it until it's reviewed.`;
  }

  async handleSubmitConfirm() {
    if (this.selectedSubmission) {
      await this.submitForApproval(this.selectedSubmission);
    }
  }

  async submitForApproval(submission: FormSubmission) {
    if (!submission.uuid) return;

    try {
      this.isProcessing = true;
      await lastValueFrom(
        this.submissionService.submitForApproval(submission.uuid),
      );

      await this.loadMySubmissions();
    } catch (err) {
      console.error('Error submitting for approval:', err);
    } finally {
      this.isProcessing = false;
    }
  }
}
