import {
  Component,
  Input,
  OnInit,
  ChangeDetectionStrategy,
  inject,
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

// Define interfaces based on your Java DTOs
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
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full mx-auto space-y-6 min-h-screen">
      <!-- Header Section -->
      <mat-card class="border-l-4 border-l-blue-500">
        <mat-card-header class="pb-4">
          <div class="flex items-center justify-between w-full">
            <div class="flex items-center space-x-4">
              <mat-icon class="text-4xl text-blue-600">hotel</mat-icon>
              <div>
                <mat-card-title class="text-2xl font-bold text-gray-800">
                  {{ assessmentData?.hotelName }}
                </mat-card-title>
                <mat-card-subtitle class="text-lg">
                  <mat-chip class="mr-2 bg-blue-100 text-blue-800">
                    {{ assessmentData?.hotelType | titlecase }}
                  </mat-chip>
                  Assessment Results
                </mat-card-subtitle>
              </div>
            </div>
            <div class="text-right">
              <div class="text-sm text-gray-600">Last Assessed</div>
              <div class="font-semibold">
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
          class="text-center shadow-sm hover:shadow-sm transition-shadow"
        >
          <mat-card-content class="p-6">
            <mat-icon
              class="text-5xl mb-2"
              [class]="getScoreColor(assessmentData?.aggregatePercentage)"
            >
              {{ getScoreIcon(assessmentData?.aggregatePercentage) }}
            </mat-icon>
            <div
              class="text-3xl font-bold mb-1"
              [class]="getScoreTextColor(assessmentData?.aggregatePercentage)"
            >
              {{ assessmentData?.aggregatePercentage | number: '1.1-1' }}%
            </div>
            <div class="text-sm text-gray-600 mb-3">Overall Score</div>
            <mat-progress-bar
              mode="determinate"
              [value]="assessmentData?.aggregatePercentage || 0"
              [class]="getProgressBarColor(assessmentData?.aggregatePercentage)"
              class="h-2 rounded"
            >
            </mat-progress-bar>
            <div class="text-xs text-gray-500 mt-2">
              {{ assessmentData?.aggregateScore | number: '1.1-1' }} /
              {{ assessmentData?.assessorSubmissions?.[0]?.maxPossibleScore }}
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Total Assessments -->
        <mat-card
          class="text-center shadow-sm hover:shadow-sm transition-shadow"
        >
          <mat-card-content class="p-6">
            <mat-icon class="text-5xl text-purple-600 mb-2"
              >assessment</mat-icon
            >
            <div class="text-3xl font-bold text-purple-700 mb-1">
              {{ assessmentData?.totalAssessments }}
            </div>
            <div class="text-sm text-gray-600">Total Assessments</div>
          </mat-card-content>
        </mat-card>

        <!-- Unique Assessors -->
        <mat-card
          class="text-center shadow-sm hover:shadow-sm transition-shadow"
        >
          <mat-card-content class="p-6">
            <mat-icon class="text-5xl text-indigo-600 mb-2">people</mat-icon>
            <div class="text-3xl font-bold text-indigo-700 mb-1">
              {{ assessmentData?.uniqueAssessors }}
            </div>
            <div class="text-sm text-gray-600">Unique Assessors</div>
          </mat-card-content>
        </mat-card>

        <!-- Form Type -->
        <mat-card
          class="text-center shadow-sm hover:shadow-sm transition-shadow"
        >
          <mat-card-content class="p-6">
            <mat-icon class="text-5xl text-teal-600 mb-2">description</mat-icon>
            <div class="text-lg font-semibold text-teal-700 mb-1">
              {{ assessmentData?.formName }}
            </div>
            <div class="text-sm text-gray-600">Assessment Form</div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Section Scores Overview -->
      <mat-card class="shadow-sm">
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
      <mat-card class="shadow-sm">
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
                    <div class="font-semibold">
                      {{ submission.assessorName }}
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
        class="shadow-sm border-l-4 border-l-yellow-500"
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
  `,
})
export class HotelAssessmentResultsComponent implements OnInit {
  @Input() assessmentData: HotelAssessmentResultDto | null = null;

  ngOnInit() {
    // Component initialization logic if needed
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
