import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon'; // Import MatIconModule
import { FormSubmissionService } from '../services/form-submission.service';
import { FormSubmissionScoreSummaryDto, CategoryScoreDto } from '../types';

@Component({
  selector: 'app-submission-results',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule], // Add MatIconModule
  template: `
    <div class="container mx-auto px-4 py-6">
      <div *ngIf="isLoading" class="text-center py-10">
        <mat-icon
          class="animate-spin h-8 w-8 text-blue-600 mx-auto"
          aria-hidden="true"
          >refresh</mat-icon
        >
        <p class="mt-2 text-gray-600">Loading submission results...</p>
      </div>

      <div
        *ngIf="!isLoading && !scoreSummary"
        class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded"
      >
        <p>Could not load submission results.</p>
      </div>

      <div
        *ngIf="!isLoading && scoreSummary"
        class="bg-white rounded-lg shadow-md overflow-hidden"
      >
        <!-- Header with overall score -->
        <div class="bg-blue-600 text-white px-6 py-6">
          <div class="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h1 class="text-xl font-bold mb-1">
                {{ scoreSummary.formName }}
              </h1>
              <p class="text-blue-100">
                Submitted by {{ scoreSummary.submittedBy }}
              </p>
            </div>
            <div class="mt-4 md:mt-0 text-center">
              <div class="text-3xl font-bold">
                {{ scoreSummary.percentage | number: '1.1-1' }}%
              </div>
              <div class="text-sm text-blue-100">
                {{ scoreSummary.totalScore | number: '1.1-1' }} /
                {{ scoreSummary.maxPossibleScore | number: '1.1-1' }} points
              </div>
            </div>
          </div>
        </div>

        <!-- Category scores -->
        <div class="p-6">
          <h2 class="text-xl font-semibold mb-4">Category Breakdown</h2>

          <div class="space-y-6">
            <div
              *ngFor="let category of scoreSummary.categoryScores"
              class="border border-gray-200 rounded-lg p-4"
            >
              <div
                class="flex flex-col md:flex-row justify-between items-start md:items-center mb-2"
              >
                <h3 class="text-lg font-medium">{{ category.categoryName }}</h3>
                <div class="mt-1 md:mt-0 text-right">
                  <span class="text-xl font-semibold"
                    >{{ category.percentage | number: '1.1-1' }}%</span
                  >
                  <span class="text-sm text-gray-600 ml-2">
                    ({{ category.score | number: '1.1-1' }} /
                    {{ category.maxPossible | number: '1.1-1' }})
                  </span>
                </div>
              </div>

              <!-- Progress bar -->
              <div class="w-full bg-gray-200 rounded-full h-4">
                <div
                  class="h-4 rounded-full transition-all duration-500"
                  [ngClass]="getScoreColorClass(category.percentage)"
                  [style.width.%]="category.percentage"
                ></div>
              </div>
            </div>
          </div>

          <!-- Action buttons -->
          <div class="mt-8 flex justify-between">
            <button
              (click)="goBack()"
              class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Back
            </button>
            <button
              (click)="downloadReport()"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 inline-flex items-center"
            >
              <mat-icon class="h-5 w-5 mr-2" aria-hidden="true"
                >download</mat-icon
              >
              Download Report
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class SubmissionResultsComponent implements OnInit {
  submissionUuid: string = '';
  scoreSummary: FormSubmissionScoreSummaryDto | null = null;
  isLoading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private submissionService: FormSubmissionService,
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.submissionUuid = params['uuid'];
      this.loadScoreSummary();
    });
  }

  async loadScoreSummary(): Promise<void> {
    try {
      this.isLoading = true;
      this.scoreSummary = await this.submissionService
        .getScoreSummary(this.submissionUuid)
        .toPromise();
    } catch (error) {
      console.error('Error loading score summary:', error);
    } finally {
      this.isLoading = false;
    }
  }

  getScoreColorClass(percentage: number): string {
    if (percentage >= 85) return 'bg-green-500';
    if (percentage >= 70) return 'bg-blue-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  }

  goBack(): void {
    window.history.back();
  }

  downloadReport(): void {
    if (!this.scoreSummary) return;

    this.submissionService
      .downloadReport(this.submissionUuid)
      .subscribe((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.scoreSummary?.formName.replace(/\s+/g, '_')}_Report.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      });
  }
}
