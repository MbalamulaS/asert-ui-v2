import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { SelfAssessmentService } from '../services/self-assessment.service';
import { SelfAssessmentSummary, SelfAssessmentStatus } from '../types/self-assessment.types';

@Component({
  selector: 'app-self-assessment-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatDialogModule
  ],
  template: `
    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Self-Assessments</h1>
          <p class="text-gray-600 mt-2">
            Practice and prepare for your official grading assessment
          </p>
        </div>
        <button
          mat-raised-button
          color="primary"
          (click)="startNewAssessment()"
          class="flex items-center gap-2"
        >
          <mat-icon>add</mat-icon>
          Start New Self-Assessment
        </button>
      </div>

      <!-- Info Banner -->
      <div class="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded">
        <div class="flex items-start">
          <mat-icon class="text-blue-500 mr-3">info</mat-icon>
          <div>
            <h3 class="font-semibold text-blue-900">About Self-Assessments</h3>
            <p class="text-blue-800 text-sm mt-1">
              Self-assessments provide an <strong>estimated rating</strong> based on the same criteria
              as official assessments. Use this to identify areas for improvement before requesting
              your official grading. You can complete unlimited self-assessments.
            </p>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="flex justify-center items-center py-12">
        <mat-spinner></mat-spinner>
      </div>

      <!-- Empty State -->
      <div
        *ngIf="!isLoading && assessments.length === 0"
        class="text-center py-12 bg-gray-50 rounded-lg"
      >
        <mat-icon class="text-gray-400 text-6xl mb-4">assignment</mat-icon>
        <h3 class="text-xl font-semibold text-gray-700 mb-2">
          No Self-Assessments Yet
        </h3>
        <p class="text-gray-600 mb-6">
          Get started with your first self-assessment to see your estimated rating
        </p>
        <button
          mat-raised-button
          color="primary"
          (click)="startNewAssessment()"
        >
          <mat-icon>add</mat-icon>
          Start Your First Self-Assessment
        </button>
      </div>

      <!-- Assessments Table -->
      <div *ngIf="!isLoading && assessments.length > 0" class="bg-white rounded-lg shadow">
        <div class="overflow-x-auto">
          <table mat-table [dataSource]="assessments" class="w-full">
            <!-- Date Column -->
            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef class="font-semibold">Date</th>
              <td mat-cell *matCellDef="let assessment">
                {{ assessment.createdAt | date: 'MMM d, y' }}
              </td>
            </ng-container>

            <!-- Form Column -->
            <ng-container matColumnDef="form">
              <th mat-header-cell *matHeaderCellDef class="font-semibold">Form</th>
              <td mat-cell *matCellDef="let assessment">
                {{ assessment.formName }}
              </td>
            </ng-container>

            <!-- Status Column -->
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef class="font-semibold">Status</th>
              <td mat-cell *matCellDef="let assessment">
                <mat-chip
                  [ngClass]="{
                    'bg-yellow-100 text-yellow-800': assessment.status === 'DRAFT',
                    'bg-green-100 text-green-800': assessment.status === 'COMPLETED'
                  }"
                >
                  {{ getStatusLabel(assessment.status) }}
                </mat-chip>
              </td>
            </ng-container>

            <!-- Score Column -->
            <ng-container matColumnDef="score">
              <th mat-header-cell *matHeaderCellDef class="font-semibold">Score</th>
              <td mat-cell *matCellDef="let assessment">
                <span *ngIf="assessment.status === 'COMPLETED' && assessment.percentage">
                  {{ assessment.percentage | number: '1.1-1' }}%
                </span>
                <span *ngIf="assessment.status === 'DRAFT'" class="text-gray-400">
                  Not submitted
                </span>
              </td>
            </ng-container>

            <!-- Rating Column -->
            <ng-container matColumnDef="rating">
              <th mat-header-cell *matHeaderCellDef class="font-semibold">Estimated Rating</th>
              <td mat-cell *matCellDef="let assessment">
                <div *ngIf="assessment.status === 'COMPLETED' && assessment.estimatedRating">
                  <mat-chip class="bg-blue-100 text-blue-800">
                    {{ assessment.estimatedRating }}
                  </mat-chip>
                </div>
                <span *ngIf="assessment.status === 'DRAFT'" class="text-gray-400">
                  -
                </span>
              </td>
            </ng-container>

            <!-- Actions Column -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef class="font-semibold">Actions</th>
              <td mat-cell *matCellDef="let assessment">
                <div class="flex gap-2">
                  <button
                    mat-icon-button
                    color="primary"
                    [matTooltip]="assessment.status === 'DRAFT' ? 'Continue' : 'View Results'"
                    (click)="viewAssessment(assessment)"
                  >
                    <mat-icon>{{ assessment.status === 'DRAFT' ? 'edit' : 'visibility' }}</mat-icon>
                  </button>
                  <button
                    mat-icon-button
                    color="warn"
                    matTooltip="Delete"
                    (click)="deleteAssessment(assessment)"
                  >
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
          </table>
        </div>
      </div>

      <!-- Statistics Cards (if completed assessments exist) -->
      <div
        *ngIf="!isLoading && completedAssessments.length > 0"
        class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8"
      >
        <mat-card>
          <mat-card-header>
            <mat-card-title>Total Attempts</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="text-4xl font-bold text-blue-600">
              {{ assessments.length }}
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-header>
            <mat-card-title>Latest Score</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="text-4xl font-bold text-green-600">
              {{ latestCompletedAssessment?.percentage | number: '1.1-1' }}%
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-header>
            <mat-card-title>Estimated Rating</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="text-2xl font-bold text-purple-600">
              {{ latestCompletedAssessment?.estimatedRating || 'N/A' }}
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    ::ng-deep .mat-mdc-chip {
      padding: 4px 12px;
      font-size: 0.875rem;
    }
  `]
})
export class SelfAssessmentDashboardComponent implements OnInit {
  assessments: SelfAssessmentSummary[] = [];
  completedAssessments: SelfAssessmentSummary[] = [];
  latestCompletedAssessment?: SelfAssessmentSummary;
  isLoading = true;
  displayedColumns = ['date', 'form', 'status', 'score', 'rating', 'actions'];

  // Placeholder - should be fetched from user context or route
  hotelUuid = ''; // TODO: Get from user's hotel or route param

  constructor(
    private selfAssessmentService: SelfAssessmentService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    // TODO: Get hotelUuid from user context or route
    // For now, this will need to be passed in or fetched
    this.loadAssessments();
  }

  loadAssessments(): void {
    if (!this.hotelUuid) {
      console.error('Hotel UUID not available');
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.selfAssessmentService.getHotelSelfAssessments(this.hotelUuid).subscribe({
      next: (response) => {
        this.assessments = response.data || [];
        this.completedAssessments = this.assessments.filter(
          a => a.status === SelfAssessmentStatus.COMPLETED
        );
        this.latestCompletedAssessment = this.completedAssessments[0];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading self-assessments:', error);
        this.isLoading = false;
      }
    });
  }

  startNewAssessment(): void {
    // TODO: Navigate to form selection or start assessment flow
    // For now, navigate to a placeholder route
    this.router.navigate(['/self-assessment/new']);
  }

  viewAssessment(assessment: SelfAssessmentSummary): void {
    if (assessment.status === SelfAssessmentStatus.DRAFT) {
      // Continue the draft
      this.router.navigate(['/self-assessment', assessment.uuid, 'continue']);
    } else {
      // View results
      this.router.navigate(['/self-assessment', assessment.uuid, 'results']);
    }
  }

  deleteAssessment(assessment: SelfAssessmentSummary): void {
    if (confirm(`Are you sure you want to delete this self-assessment from ${new Date(assessment.createdAt).toLocaleDateString()}?`)) {
      this.selfAssessmentService.deleteSelfAssessment(assessment.uuid).subscribe({
        next: () => {
          this.loadAssessments();
        },
        error: (error) => {
          console.error('Error deleting self-assessment:', error);
          alert('Failed to delete self-assessment. Please try again.');
        }
      });
    }
  }

  getStatusLabel(status: SelfAssessmentStatus): string {
    return status === SelfAssessmentStatus.DRAFT ? 'Draft' : 'Completed';
  }
}
