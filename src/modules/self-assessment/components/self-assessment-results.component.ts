import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { SelfAssessmentService } from '../services/self-assessment.service';
import { SelfAssessmentResult } from '../types/self-assessment.types';

@Component({
  selector: 'app-self-assessment-results',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule
  ],
  template: `
    <div class="container mx-auto px-4 py-8">
      <!-- Loading State -->
      <div *ngIf="isLoading" class="flex justify-center items-center py-12">
        <mat-spinner></mat-spinner>
      </div>

      <!-- Results -->
      <div *ngIf="!isLoading && result">
        <!-- Header -->
        <div class="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div class="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-6">
            <div class="flex justify-between items-start">
              <div>
                <h1 class="text-2xl font-bold mb-2">Self-Assessment Results</h1>
                <p class="text-blue-100">{{ result.formName }}</p>
                <p class="text-blue-100 text-sm">
                  Completed: {{ result.submittedAt | date: 'MMM d, y, h:mm a' }}
                </p>
              </div>
              <div class="text-right">
                <div class="text-4xl font-bold">
                  {{ result.percentage | number: '1.1-1' }}%
                </div>
                <div class="text-sm text-blue-100">
                  {{ result.totalScore | number: '1.1-1' }} /
                  {{ result.maxPossibleScore | number: '1.1-1' }} points
                </div>
              </div>
            </div>
          </div>

          <!-- Estimated Rating Banner -->
          <div class="bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-yellow-500 p-6 rounded-r-lg shadow-sm">
            <div class="flex items-start">
              <mat-icon class="text-yellow-600 mr-4 text-3xl">stars</mat-icon>
              <div class="flex-1">
                <h3 class="font-bold text-yellow-900 text-xl mb-2">Estimated Star Rating</h3>
                <div class="flex items-center gap-3 mb-3">
                  <div class="flex items-center gap-1">
                    @for (star of getStarArray(result.estimatedRating); track $index) {
                      <mat-icon class="text-yellow-500 text-3xl">
                        {{ star ? 'star' : 'star_border' }}
                      </mat-icon>
                    }
                  </div>
                  <span class="text-2xl font-bold text-yellow-900">{{ result.estimatedRating }}</span>
                </div>
                <p class="text-yellow-800 text-sm mb-2">
                  Based on your self-assessment score of
                  <strong>{{ result.percentage | number: '1.1-1' }}%</strong>,
                  your facility would likely receive this rating.
                </p>
                <div class="bg-yellow-100 border border-yellow-300 rounded p-3 mt-3">
                  <div class="flex items-start gap-2">
                    <mat-icon class="text-yellow-700 text-sm mt-0.5">info</mat-icon>
                    <p class="text-yellow-800 text-xs flex-1">
                      <strong>Important:</strong> This is an estimated rating based on your self-assessment.
                      Official star grading requires evaluation by at least 3 certified assessors
                      and may differ from this estimate. To request official grading, please contact the assessment team.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Overall Performance Summary -->
        <mat-card class="mb-6">
          <mat-card-header>
            <mat-card-title>Overall Performance</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="mt-4">
              <div class="flex justify-between items-center mb-2">
                <span class="font-medium">Your Score</span>
                <span class="text-lg font-bold" [ngClass]="getPerformanceClass(result.percentage!)">
                  {{ getPerformanceLabel(result.percentage!) }}
                </span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-6">
                <div
                  class="h-6 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                  [ngClass]="getScoreColorClass(result.percentage!)"
                  [style.width.%]="result.percentage"
                >
                  <span class="text-white text-sm font-semibold">
                    {{ result.percentage | number: '1.0-0' }}%
                  </span>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Section Breakdown -->
        <mat-card class="mb-6">
          <mat-card-header>
            <mat-card-title>Section Breakdown</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="space-y-6 mt-4">
              <div
                *ngFor="let section of result.sectionScores"
                class="border border-gray-200 rounded-lg p-4"
              >
                <div class="flex justify-between items-center mb-3">
                  <h3 class="text-lg font-semibold">{{ section.sectionTitle }}</h3>
                  <div class="text-right">
                    <div class="text-xl font-bold" [ngClass]="getScoreTextClass(section.percentage)">
                      {{ section.percentage | number: '1.1-1' }}%
                    </div>
                    <div class="text-sm text-gray-600">
                      {{ section.score | number: '1.1-1' }} / {{ section.maxPossible | number: '1.1-1' }}
                    </div>
                  </div>
                </div>

                <!-- Progress Bar -->
                <div class="w-full bg-gray-200 rounded-full h-4 mb-2">
                  <div
                    class="h-4 rounded-full transition-all duration-500"
                    [ngClass]="getScoreColorClass(section.percentage)"
                    [style.width.%]="section.percentage"
                  ></div>
                </div>

                <!-- Performance Badge -->
                <div class="flex items-center gap-2">
                  <mat-icon
                    class="text-sm"
                    [ngClass]="getScoreTextClass(section.percentage)"
                  >
                    {{ getPerformanceIcon(section.percentage) }}
                  </mat-icon>
                  <span class="text-sm" [ngClass]="getScoreTextClass(section.percentage)">
                    {{ getPerformanceLabel(section.percentage) }}
                  </span>
                </div>

                <!-- Subsections (if any) -->
                <div *ngIf="section.subsectionScores && section.subsectionScores.length > 0" class="mt-4 ml-4 space-y-3">
                  <div *ngFor="let subsection of section.subsectionScores" class="border-l-2 border-gray-300 pl-4">
                    <div class="flex justify-between items-center mb-2">
                      <span class="font-medium text-gray-700">{{ subsection.sectionTitle }}</span>
                      <span class="text-sm font-semibold">
                        {{ subsection.percentage | number: '1.0-0' }}%
                      </span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                      <div
                        class="h-2 rounded-full"
                        [ngClass]="getScoreColorClass(subsection.percentage)"
                        [style.width.%]="subsection.percentage"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Improvement Recommendations -->
        <mat-card class="mb-6" *ngIf="improvementAreas.length > 0">
          <mat-card-header>
            <mat-card-title>Areas for Improvement</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="mt-4 space-y-3">
              <div
                *ngFor="let area of improvementAreas"
                class="flex items-start gap-3 p-3 bg-orange-50 border-l-4 border-orange-500 rounded"
              >
                <mat-icon class="text-orange-600">priority_high</mat-icon>
                <div>
                  <h4 class="font-semibold text-orange-900">{{ area.sectionTitle }}</h4>
                  <p class="text-sm text-orange-800">
                    Current score: {{ area.percentage | number: '1.1-1' }}%
                    - Focus on improving this section to increase your overall rating.
                  </p>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Strengths -->
        <mat-card class="mb-6" *ngIf="strengths.length > 0">
          <mat-card-header>
            <mat-card-title>Your Strengths</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="mt-4 space-y-3">
              <div
                *ngFor="let strength of strengths"
                class="flex items-start gap-3 p-3 bg-green-50 border-l-4 border-green-500 rounded"
              >
                <mat-icon class="text-green-600">check_circle</mat-icon>
                <div>
                  <h4 class="font-semibold text-green-900">{{ strength.sectionTitle }}</h4>
                  <p class="text-sm text-green-800">
                    Excellent performance: {{ strength.percentage | number: '1.1-1' }}%
                  </p>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Actions -->
        <div class="flex justify-between items-center">
          <button mat-button (click)="goBack()">
            <mat-icon>arrow_back</mat-icon>
            Back to Dashboard
          </button>
          <div class="flex gap-3">
            <button mat-stroked-button color="primary" (click)="startNewAssessment()">
              <mat-icon>refresh</mat-icon>
              Start New Assessment
            </button>
            <button mat-raised-button color="primary" (click)="requestOfficialAssessment()">
              <mat-icon>verified</mat-icon>
              Request Official Assessment
            </button>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div *ngIf="!isLoading && !result" class="text-center py-12">
        <mat-icon class="text-gray-400 text-6xl mb-4">error_outline</mat-icon>
        <h3 class="text-xl font-semibold text-gray-700 mb-2">
          Could not load results
        </h3>
        <p class="text-gray-600 mb-6">
          The self-assessment results could not be found.
        </p>
        <button mat-raised-button color="primary" (click)="goBack()">
          Back to Dashboard
        </button>
      </div>
    </div>
  `,
  styles: []
})
export class SelfAssessmentResultsComponent implements OnInit {
  result?: SelfAssessmentResult;
  isLoading = true;
  improvementAreas: any[] = [];
  strengths: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private selfAssessmentService: SelfAssessmentService
  ) {}

  ngOnInit(): void {
    const uuid = this.route.snapshot.paramMap.get('uuid');
    if (uuid) {
      this.loadResults(uuid);
    } else {
      this.isLoading = false;
    }
  }

  loadResults(uuid: string): void {
    this.isLoading = true;
    this.selfAssessmentService.getSelfAssessmentResult(uuid).subscribe({
      next: (response) => {
        this.result = response.data;
        this.analyzeResults();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading results:', error);
        this.isLoading = false;
      }
    });
  }

  analyzeResults(): void {
    if (!this.result?.sectionScores) return;

    this.improvementAreas = this.result.sectionScores.filter(s => s.percentage < 70);
    this.strengths = this.result.sectionScores.filter(s => s.percentage >= 85);
  }

  getScoreColorClass(percentage: number): string {
    if (percentage >= 85) return 'bg-green-500';
    if (percentage >= 70) return 'bg-blue-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  }

  getScoreTextClass(percentage: number): string {
    if (percentage >= 85) return 'text-green-600';
    if (percentage >= 70) return 'text-blue-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  }

  getPerformanceClass(percentage: number): string {
    if (percentage >= 85) return 'text-green-600';
    if (percentage >= 70) return 'text-blue-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  }

  getPerformanceLabel(percentage: number): string {
    if (percentage >= 85) return 'Excellent';
    if (percentage >= 70) return 'Good';
    if (percentage >= 50) return 'Fair';
    return 'Needs Improvement';
  }

  getPerformanceIcon(percentage: number): string {
    if (percentage >= 85) return 'star';
    if (percentage >= 70) return 'thumb_up';
    if (percentage >= 50) return 'trending_up';
    return 'warning';
  }

  getStarArray(estimatedRating: string | undefined): boolean[] {
    if (!estimatedRating) return [false, false, false, false, false];

    // Extract number from string like "4 Star" or "5 Star"
    const match = estimatedRating.match(/(\d+)/);
    const starCount = match ? parseInt(match[1], 10) : 0;

    // Return array of 5 booleans, true for filled stars
    return Array.from({ length: 5 }, (_, i) => i < starCount);
  }

  goBack(): void {
    this.router.navigate(['/manage-listings']);
  }

  startNewAssessment(): void {
    this.router.navigate(['/manage-listings']);
  }

  requestOfficialAssessment(): void {
    // TODO: Navigate to official assessment request flow
    this.router.navigate(['/assessment-request/new']);
  }
}
