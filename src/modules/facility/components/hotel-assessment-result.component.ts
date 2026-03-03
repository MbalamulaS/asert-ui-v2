import {
  Component,
  Input,
  OnInit,
  ChangeDetectionStrategy,
  inject,
  TemplateRef,
  ViewChild,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { DatePipe } from '@angular/common';
import { TitleizeTypePipe } from 'utils/titleize';
import { HotelService } from '../../portal/hotels/services/hotel.service';
import { lastValueFrom } from 'rxjs';
import { DialogComponent } from 'components/dialog/dialog.component';
import { PdfViewerComponent } from 'components/pdf-viewer/pdf-viewer.component';
import { SubmissionStatusBadgeComponent } from 'modules/forms/components/submission-status-badge.component';
import { ApiResponse } from 'app/custom-response';

interface AggregatedSectionScoreDto {
  sectionUuid: string;
  sectionTitle: string;
  maxPossibleScore: number;
  averageScore: number;
  averagePercentage: number;
  subsectionScores?: AggregatedSectionScoreDto[];
}

interface SectionScoreDto {
  sectionId: number;
  sectionUuid: string;
  sectionTitle: string;
  score: number;
  maxPossible: number;
  percentage: number;
  subsectionScores?: SectionScoreDto[];
}

interface AssessorSubmissionDto {
  submissionUuid: string;
  assessorName: string;
  submittedAt: string;
  totalScore: number;
  maxPossibleScore: number;
  percentage: number;
  sectionScores: SectionScoreDto[];
  status?: string;
}

export interface HotelAssessmentResultDto {
  hotelUuid: string;
  hotelName: string;
  hotelType: string;
  formUuid: string;
  formName: string;
  totalAssessments: number;
  uniqueAssessors: number;
  lastAssessedAt: string;
  aggregateScore: number;
  aggregatePercentage: number;
  starRating?: string;
  assessorSubmissions: AssessorSubmissionDto[];
  sectionScores: AggregatedSectionScoreDto[];
}

@Component({
  selector: 'app-hotel-assessment-results',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressBarModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    MatExpansionModule,
    MatTooltipModule,
    MatDividerModule,
    MatBadgeModule,
    DatePipe,
    TitleizeTypePipe,
    DialogComponent,
    PdfViewerComponent,
    SubmissionStatusBadgeComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full mx-auto space-y-6 min-h-screen bg-white">
      <!-- Header Section -->
      <mat-card
        class="border-l-4 border-l-blue-500 shadow-lg bg-gradient-to-r from-white to-blue-50"
      >
        <mat-card-header class="pb-4">
          <div class="flex items-center justify-between w-full">
            <div class="flex items-center space-x-4">
              <div
                class="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-xl shadow-lg"
              >
                <mat-icon class="text-4xl text-white">hotel</mat-icon>
              </div>
              <div>
                <mat-card-title class="text-3xl font-bold text-gray-800 mb-2">
                  {{ assessmentData?.hotelName }}
                </mat-card-title>
                <div class="flex items-center space-x-4 mb-2">
                  <mat-chip class="bg-blue-100 text-blue-800 font-medium">
                    {{ assessmentData?.hotelType | titleizeType }}
                  </mat-chip>
                  <!-- Star Rating Display -->
                  <div
                    class="flex items-center space-x-2"
                    *ngIf="assessmentData?.starRating"
                  >
                    <div
                      class="flex items-center"
                      *ngIf="!isApprovedFacility(assessmentData?.starRating)"
                    >
                      <mat-icon
                        *ngFor="
                          let star of getStarArray(
                            getStarCount(assessmentData?.starRating)
                          )
                        "
                        class="h-5 w-5 text-yellow-400"
                        >star</mat-icon
                      >
                      <mat-icon
                        *ngFor="
                          let star of getEmptyStarArray(
                            getStarCount(assessmentData?.starRating)
                          )
                        "
                        class="h-5 w-5 text-gray-300"
                        >star_border</mat-icon
                      >
                    </div>
                    <div
                      *ngIf="isApprovedFacility(assessmentData?.starRating)"
                      class="text-sm font-medium text-green-700 bg-green-100 px-3 py-1 rounded-full"
                    >
                      {{ assessmentData?.starRating }}
                    </div>
                  </div>
                </div>
                <mat-card-subtitle class="text-lg text-gray-600">
                  Assessment Results Dashboard
                </mat-card-subtitle>
                @if (showPrintCertificateButton()) {
                  <button
                    mat-raised-button
                    color="primary"
                    (click)="printCertificate()"
                    [disabled]="isGeneratingCertificate"
                    class="mt-4"
                  >
                    <mat-icon class="mr-2">print</mat-icon>
                    {{
                      isGeneratingCertificate
                        ? 'Generating...'
                        : 'Print Certificate'
                    }}
                  </button>
                }
              </div>
            </div>
            <div class="text-right bg-gray-50 p-4 rounded-lg">
              <div class="text-sm text-gray-600 font-medium">Last Assessed</div>
              <div class="font-semibold text-lg">
                {{ assessmentData?.lastAssessedAt | date: 'medium' }}
              </div>
            </div>
          </div>
        </mat-card-header>
      </mat-card>

      <!-- Key Metrics Overview -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Overall Score -->
        <mat-card
          class="text-center shadow-lg hover:shadow-xl transition-shadow duration-300 border-t-4"
          [class]="getScoreBorderColor(assessmentData?.aggregatePercentage)"
        >
          <mat-card-content class="p-6">
            <div
              class="bg-gradient-to-br p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center"
              [class]="getScoreGradient(assessmentData?.aggregatePercentage)"
            >
              <mat-icon class="text-3xl text-white">
                {{ getScoreIcon(assessmentData?.aggregatePercentage) }}
              </mat-icon>
            </div>
            <div
              class="text-4xl font-bold mb-2"
              [class]="getScoreTextColor(assessmentData?.aggregatePercentage)"
            >
              {{ assessmentData?.aggregatePercentage | number: '1.1-1' }}%
            </div>
            <div class="text-sm text-gray-600 mb-4 font-medium">
              Overall Score
            </div>
            <mat-progress-bar
              mode="determinate"
              [value]="assessmentData?.aggregatePercentage || 0"
              [class]="getProgressBarColor(assessmentData?.aggregatePercentage)"
              class="h-3 rounded-full"
            >
            </mat-progress-bar>
            <div class="text-sm text-gray-600 mt-3 font-medium">
              {{ assessmentData?.aggregateScore | number: '1.1-1' }} /
              {{ assessmentData?.assessorSubmissions?.[0]?.maxPossibleScore }}
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Total Assessments -->
        <mat-card
          class="text-center shadow-lg hover:shadow-xl transition-shadow duration-300 border-t-4 border-t-purple-500"
        >
          <mat-card-content class="p-6">
            <div
              class="bg-gradient-to-br from-purple-500 to-purple-600 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center"
            >
              <mat-icon class="text-3xl text-white">assessment</mat-icon>
            </div>
            <div class="text-4xl font-bold text-purple-700 mb-2">
              {{ assessmentData?.totalAssessments }}
            </div>
            <div class="text-sm text-gray-600 font-medium">
              Total Assessments
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Unique Assessors -->
        <mat-card
          class="text-center shadow-lg hover:shadow-xl transition-shadow duration-300 border-t-4 border-t-indigo-500"
        >
          <mat-card-content class="p-6">
            <div
              class="bg-gradient-to-br from-indigo-500 to-indigo-600 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center"
            >
              <mat-icon class="text-3xl text-white">people</mat-icon>
            </div>
            <div class="text-4xl font-bold text-indigo-700 mb-2">
              {{ assessmentData?.uniqueAssessors }}
            </div>
            <div class="text-sm text-gray-600 font-medium">
              Unique Assessors
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Form Type -->
        <mat-card
          class="text-center shadow-lg hover:shadow-xl transition-shadow duration-300 border-t-4 border-t-teal-500"
        >
          <mat-card-content class="p-6">
            <div
              class="bg-gradient-to-br from-teal-500 to-teal-600 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center"
            >
              <mat-icon class="text-3xl text-white">description</mat-icon>
            </div>
            <div class="text-lg font-semibold text-teal-700 mb-2">
              {{ assessmentData?.formName }}
            </div>
            <div class="text-sm text-gray-600 font-medium">Assessment Form</div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Section Scores Overview -->
      <mat-card class="">
        <mat-card-header>
          <mat-card-title class="flex items-center">
            <mat-icon class="mr-2 text-blue-600">bar_chart</mat-icon>
            Section Performance Overview
          </mat-card-title>
        </mat-card-header>
        <mat-card-content class="p-6">
          <div class="space-y-4">
            <div
              *ngFor="let section of assessmentData?.sectionScores"
              class="border border-gray-200 p-4 bg-white"
            >
              <div class="flex items-center justify-between mb-3">
                <h3 class="font-semibold text-lg text-gray-800">
                  {{ section.sectionTitle }}
                </h3>
                <mat-chip
                  [class]="getSectionChipColor(section.averagePercentage)"
                >
                  {{ section.averagePercentage | number: '1.1-1' }}%
                </mat-chip>
              </div>

              <div class="flex items-center space-x-4 mb-2">
                <div class="flex-1">
                  <mat-progress-bar
                    mode="determinate"
                    [value]="section.averagePercentage"
                    [class]="getProgressBarColor(section.averagePercentage)"
                    class="h-3 rounded"
                  >
                  </mat-progress-bar>
                </div>
                <div class="text-sm text-gray-600 min-w-0 w-24 text-right">
                  {{ section.averageScore | number: '1.1-1' }} /
                  {{ section.maxPossibleScore }}
                </div>
              </div>

              <!-- Subsections -->
              <div
                *ngIf="
                  section.subsectionScores &&
                  section.subsectionScores.length > 0
                "
                class="mt-4 ml-4 space-y-2"
              >
                <div
                  *ngFor="let subsection of section.subsectionScores"
                  class="flex items-center justify-between p-2 bg-gray-50 "
                >
                  <span class="text-sm text-gray-700">{{
                    subsection.sectionTitle
                  }}</span>
                  <div class="flex items-center space-x-2">
                    <div class="w-24 h-2">
                      <mat-progress-bar
                        mode="determinate"
                        [value]="subsection.averagePercentage"
                        class="h-full rounded"
                      >
                      </mat-progress-bar>
                    </div>
                    <span class="text-xs text-gray-600 w-12 text-right"
                      >{{
                        subsection.averagePercentage | number: '1.0-0'
                      }}%</span
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Individual Assessor Results -->
      <mat-card class="">
        <mat-card-header>
          <mat-card-title class="flex items-center">
            <mat-icon class="mr-2 text-green-600">person_search</mat-icon>
            Individual Assessor Results
          </mat-card-title>
          <mat-card-subtitle>
            Detailed breakdown by each assessor
          </mat-card-subtitle>
        </mat-card-header>
        <mat-card-content class="p-0">
          <mat-accordion class="shadow-none">
            <mat-expansion-panel
              *ngFor="
                let submission of assessmentData?.assessorSubmissions;
                let i = index
              "
              class="border-b last:border-b-0 p-2"
            >
              <mat-expansion-panel-header class="p-6">
                <mat-panel-title class="flex items-center space-x-4">
                  <mat-icon class="text-gray-600">person</mat-icon>
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="font-semibold">
                        {{ submission.assessorName }}
                      </span>
                      <app-submission-status-badge
                        [status]="submission.status"
                      ></app-submission-status-badge>
                    </div>
                    <div class="text-sm text-gray-600">
                      {{ submission.submittedAt | date: 'short' }}
                    </div>
                  </div>
                </mat-panel-title>
                <mat-panel-description class="flex items-center space-x-4">
                  <mat-chip
                    [class]="getSectionChipColor(submission.percentage)"
                  >
                    {{ submission.percentage | number: '1.1-1' }}%
                  </mat-chip>
                  <span class="text-sm text-gray-600">
                    {{ submission.totalScore | number: '1.1-1' }} /
                    {{ submission.maxPossibleScore }}
                  </span>
                </mat-panel-description>
              </mat-expansion-panel-header>

              <div class="px-6 pb-6">
                <div class="space-y-4">
                  <!-- Assessor's Section Scores -->
                  <div
                    *ngFor="let sectionScore of submission.sectionScores"
                    class="border border-gray-100 p-3 bg-gray-50"
                  >
                    <div class="flex items-center justify-between mb-2">
                      <h4 class="font-medium text-gray-800">
                        {{ sectionScore.sectionTitle }}
                      </h4>
                      <mat-chip
                        size="small"
                        [class]="getSectionChipColor(sectionScore.percentage)"
                      >
                        {{ sectionScore.percentage | number: '1.0-0' }}%
                      </mat-chip>
                    </div>

                    <div class="flex items-center space-x-4">
                      <div class="flex-1">
                        <mat-progress-bar
                          mode="determinate"
                          [value]="sectionScore.percentage"
                          class="h-2 rounded"
                        >
                        </mat-progress-bar>
                      </div>
                      <div class="text-sm text-gray-600 w-20 text-right">
                        {{ sectionScore.score | number: '1.1-1' }} /
                        {{ sectionScore.maxPossible }}
                      </div>
                    </div>

                    <!-- Subsection scores for this assessor -->
                    <div
                      *ngIf="
                        sectionScore.subsectionScores &&
                        sectionScore.subsectionScores.length > 0
                      "
                      class="mt-3 ml-2 space-y-1"
                    >
                      <div
                        *ngFor="let subscore of sectionScore.subsectionScores"
                        class="flex items-center justify-between text-sm p-1"
                      >
                        <span class="text-gray-600">{{
                          subscore.sectionTitle
                        }}</span>
                        <div class="flex items-center space-x-2">
                          <div class="w-16 h-1">
                            <mat-progress-bar
                              mode="determinate"
                              [value]="subscore.percentage"
                              class="h-full rounded"
                            >
                            </mat-progress-bar>
                          </div>
                          <span class="text-xs text-gray-500 w-8 text-right"
                            >{{ subscore.percentage | number: '1.0-0' }}%</span
                          >
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </mat-expansion-panel>
          </mat-accordion>
        </mat-card-content>
      </mat-card>

      <!-- Performance Insights -->
      <mat-card
        class="border-l-4 border-l-yellow-500"
        *ngIf="getPerformanceInsights().length > 0"
      >
        <mat-card-header>
          <mat-card-title class="flex items-center">
            <mat-icon class="mr-2 text-yellow-600">lightbulb</mat-icon>
            Performance Insights
          </mat-card-title>
        </mat-card-header>
        <mat-card-content class="p-6">
          <div class="space-y-3">
            <div
              *ngFor="let insight of getPerformanceInsights()"
              class="flex items-start space-x-3 p-3 "
              [class]="
                insight.type === 'success'
                  ? 'bg-green-50 border border-green-200'
                  : insight.type === 'warning'
                    ? 'bg-yellow-50 border border-yellow-200'
                    : 'bg-red-50 border border-red-200'
              "
            >
              <mat-icon
                [class]="
                  insight.type === 'success'
                    ? 'text-green-600'
                    : insight.type === 'warning'
                      ? 'text-yellow-600'
                      : 'text-red-600'
                "
              >
                {{
                  insight.type === 'success'
                    ? 'check_circle'
                    : insight.type === 'warning'
                      ? 'warning'
                      : 'error'
                }}
              </mat-icon>
              <div>
                <div
                  class="font-medium"
                  [class]="
                    insight.type === 'success'
                      ? 'text-green-800'
                      : insight.type === 'warning'
                        ? 'text-yellow-800'
                        : 'text-red-800'
                  "
                >
                  {{ insight.title }}
                </div>
                <div
                  class="text-sm"
                  [class]="
                    insight.type === 'success'
                      ? 'text-green-700'
                      : insight.type === 'warning'
                        ? 'text-yellow-700'
                        : 'text-red-700'
                  "
                >
                  {{ insight.message }}
                </div>
              </div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>

    <!-- PDF Viewer Dialog -->
    <app-dialog
      [open]="showPdfDialog"
      [title]="
        'Hotel Rating Certificate - ' + (assessmentData?.hotelName || '')
      "
      [width]="'90vw'"
      [height]="'90vh'"
      [showFullScreen]="true"
      (onClose)="closePdfDialog()"
    >
      <ng-template>
        <app-pdf-viewer
          [pdfBase64]="pdfBase64"
          [filename]="getCertificateFilename()"
        ></app-pdf-viewer>
      </ng-template>
    </app-dialog>
  `,
})
export class HotelAssessmentResultsComponent implements OnInit {
  @Input() assessmentData: HotelAssessmentResultDto | null = null;

  private hotelService = inject(HotelService);
  private cdr = inject(ChangeDetectorRef);

  isGeneratingCertificate = false;
  showPdfDialog = false;
  pdfBase64 = '';

  ngOnInit() {
    console.log('Assessment Data:', this.assessmentData);
  }

  showPrintCertificateButton(): boolean {
    return !!this.assessmentData?.starRating;
  }

  async printCertificate() {
    if (!this.assessmentData?.hotelUuid) return;

    this.isGeneratingCertificate = true;
    this.cdr.markForCheck();

    try {
      const response: ApiResponse = await lastValueFrom(
        this.hotelService.generateHotelRatingCertificate(
          this.assessmentData.hotelUuid,
        ),
      );

      console.log('Certificate response:', response);

      // Extract base64 string from API response
      if (response && response.data) {
        this.pdfBase64 = response.data;
        console.log('PDF base64 extracted, opening dialog...');

        // Open the PDF viewer dialog
        this.showPdfDialog = true;

        // Trigger change detection
        this.cdr.markForCheck();
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      console.error('Error generating certificate:', error);
      alert('Failed to generate certificate. Please try again.');
    } finally {
      this.isGeneratingCertificate = false;
      this.cdr.markForCheck();
    }
  }

  closePdfDialog() {
    this.showPdfDialog = false;
    this.cdr.markForCheck();
  }

  getCertificateFilename(): string {
    if (!this.assessmentData) {
      return 'hotel-certificate.pdf';
    }

    // Create a clean filename from hotel name
    const cleanName = this.assessmentData.hotelName
      .replace(/[^a-z0-9]/gi, '-')
      .replace(/-+/g, '-')
      .toLowerCase();

    return `${cleanName}-certificate.pdf`;
  }

  getScoreColor(percentage: number | undefined): string {
    if (!percentage) return 'text-gray-400';
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  }

  getScoreTextColor(percentage: number | undefined): string {
    if (!percentage) return 'text-gray-600';
    if (percentage >= 80) return 'text-green-700';
    if (percentage >= 60) return 'text-yellow-700';
    return 'text-red-700';
  }

  getScoreIcon(percentage: number | undefined): string {
    if (!percentage) return 'help_outline';
    if (percentage >= 80) return 'emoji_events';
    if (percentage >= 60) return 'thumbs_up_down';
    return 'priority_high';
  }

  getProgressBarColor(percentage: number | undefined): string {
    if (!percentage) return '';
    if (percentage >= 80) return 'progress-bar-success';
    if (percentage >= 60) return 'progress-bar-warning';
    return 'progress-bar-danger';
  }

  getSectionChipColor(percentage: number | undefined): string {
    if (!percentage) return 'bg-gray-100 text-gray-700';
    if (percentage >= 80) return 'bg-green-100 text-green-800';
    if (percentage >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  }

  getProgressBarBgColor(percentage: number | undefined): string {
    if (!percentage) return 'bg-gray-300';
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  }

  // Star rating helper methods
  isApprovedFacility(starRating: string | undefined): boolean {
    if (!starRating) return false;
    return (
      starRating === 'Approved Accommodation Facilities' ||
      starRating === 'Approved Accommodation Facilitie'
    );
  }

  getStarCount(starRating: string | undefined): number {
    if (!starRating || this.isApprovedFacility(starRating)) {
      return 0;
    }

    // Handle numeric rating levels (1-5)
    if (/^\d+$/.test(starRating)) {
      return parseInt(starRating);
    }

    // Handle "X Star" format
    const starMatch = starRating.match(/(\d+)\s*Star/);
    return starMatch ? parseInt(starMatch[1]) : 0;
  }

  getStarArray(rating: number): number[] {
    return Array(rating).fill(0);
  }

  getEmptyStarArray(filledStars: number): number[] {
    const emptyStars = Math.max(0, 5 - filledStars);
    return Array(emptyStars).fill(0);
  }

  // Enhanced UI helper methods
  getScoreBorderColor(percentage: number | undefined): string {
    if (!percentage) return 'border-t-gray-500';
    if (percentage >= 80) return 'border-t-green-500';
    if (percentage >= 60) return 'border-t-yellow-500';
    return 'border-t-red-500';
  }

  getScoreGradient(percentage: number | undefined): string {
    if (!percentage) return 'from-gray-500 to-gray-600';
    if (percentage >= 80) return 'from-green-500 to-green-600';
    if (percentage >= 60) return 'from-yellow-500 to-yellow-600';
    return 'from-red-500 to-red-600';
  }

  getPerformanceInsights(): Array<{
    type: 'success' | 'warning' | 'error';
    title: string;
    message: string;
  }> {
    const insights: Array<{
      type: 'success' | 'warning' | 'error';
      title: string;
      message: string;
    }> = [];

    if (!this.assessmentData) return insights;

    const avgPercentage = this.assessmentData.aggregatePercentage;

    // Overall performance insights
    if (avgPercentage >= 85) {
      insights.push({
        type: 'success',
        title: 'Excellent Performance',
        message:
          'This hotel consistently meets high standards across all assessment criteria.',
      });
    } else if (avgPercentage >= 70) {
      insights.push({
        type: 'success',
        title: 'Good Performance',
        message: 'This hotel performs well with room for minor improvements.',
      });
    } else if (avgPercentage >= 50) {
      insights.push({
        type: 'warning',
        title: 'Average Performance',
        message:
          'This hotel meets basic standards but has significant opportunities for improvement.',
      });
    } else {
      insights.push({
        type: 'error',
        title: 'Below Standard Performance',
        message:
          'This hotel requires immediate attention to meet industry standards.',
      });
    }

    // Assessor consistency insights
    if (
      this.assessmentData.assessorSubmissions &&
      this.assessmentData.assessorSubmissions.length > 1
    ) {
      const scores = this.assessmentData.assessorSubmissions.map(
        (s) => s.percentage,
      );
      const maxScore = Math.max(...scores);
      const minScore = Math.min(...scores);
      const variance = maxScore - minScore;

      if (variance <= 5) {
        insights.push({
          type: 'success',
          title: 'Consistent Assessment Results',
          message:
            'All assessors provided similar scores, indicating reliable performance.',
        });
      } else if (variance <= 15) {
        insights.push({
          type: 'warning',
          title: 'Moderate Assessment Variance',
          message: `Assessment scores vary by ${variance.toFixed(1)}%, suggesting some inconsistency in performance or evaluation.`,
        });
      } else {
        insights.push({
          type: 'error',
          title: 'High Assessment Variance',
          message: `Assessment scores vary significantly by ${variance.toFixed(1)}%, indicating inconsistent performance.`,
        });
      }
    }

    // Section-specific insights
    if (this.assessmentData.sectionScores) {
      const bestSection = this.assessmentData.sectionScores.reduce(
        (best, section) =>
          section.averagePercentage > best.averagePercentage ? section : best,
      );

      const worstSection = this.assessmentData.sectionScores.reduce(
        (worst, section) =>
          section.averagePercentage < worst.averagePercentage ? section : worst,
      );

      if (bestSection.averagePercentage >= 80) {
        insights.push({
          type: 'success',
          title: `Strong ${bestSection.sectionTitle}`,
          message: `Excellent performance in ${bestSection.sectionTitle} with ${bestSection.averagePercentage.toFixed(1)}% average score.`,
        });
      }

      if (worstSection.averagePercentage < 60) {
        insights.push({
          type: 'error',
          title: `Improvement Needed: ${worstSection.sectionTitle}`,
          message: `Focus attention on ${worstSection.sectionTitle} - lowest performing area with ${worstSection.averagePercentage.toFixed(1)}% average score.`,
        });
      }
    }

    return insights;
  }
}
