import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { FormSubmissionService } from '../services/form-submission.service';
import { FormSubmission } from '../types';

@Component({
  selector: 'app-form-submission-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatChipsModule,
    MatProgressBarModule,
    MatDividerModule,
    MatButtonModule,
  ],
  template: `
    <div class="bg-gray-50 min-h-screen py-8">
      <div class="mx-auto px-4 max-w-full">
        <!-- Loading State -->
        <div *ngIf="isLoading" class="text-center py-16">
          <mat-icon class="animate-spin h-10 w-10 text-blue-600 mx-auto mb-4"
            >refresh</mat-icon
          >
          <p class="text-gray-600 text-lg">Loading submission details...</p>
        </div>

        <!-- Error State -->
        <div
          *ngIf="!isLoading && !submission"
          class="bg-red-100 border-l-4 border-red-500 text-red-700 p-6 rounded-lg shadow-sm my-8"
        >
          <div class="flex items-center">
            <mat-icon class="text-red-500 mr-3">error</mat-icon>
            <p class="font-medium">Submission not found</p>
          </div>
          <p class="mt-2">
            The requested submission could not be found. Please check the URL
            and try again.
          </p>
          <button
            mat-flat-button
            color="primary"
            class="mt-4"
            routerLink="/forms"
          >
            Return to Forms
          </button>
        </div>

        <!-- Submission Details -->
        <div *ngIf="!isLoading && submission" class="space-y-6">
          <!-- Header with Actions -->
          <div class="flex justify-between items-start">
            <div>
              <button
                (click)="goBack()"
                class="text-blue-600 hover:text-blue-800 flex items-center mb-2 bg-transparent border-0 cursor-pointer"
              >
                <mat-icon class="mr-1 text-sm">arrow_back</mat-icon>
                <span>Back to Submissions</span>
              </button>
              <h1 class="text-2xl font-bold text-gray-900">
                {{ submission.form?.name }}
              </h1>
              <p class="text-gray-600 mt-1">ID: {{ submission.uuid }}</p>
            </div>
            <div class="flex space-x-2">
              <button mat-stroked-button color="primary">
                <mat-icon class="mr-1">print</mat-icon>
                Print
              </button>
              <button mat-stroked-button color="primary">
                <mat-icon class="mr-1">download</mat-icon>
                Export
              </button>
            </div>
          </div>

          <!-- Submission Overview Card -->
          <div class="bg-white rounded-lg shadow-md overflow-hidden">
            <div class="bg-blue-600 text-white px-6 py-4">
              <h2 class="text-xl font-semibold">Submission Overview</h2>
            </div>

            <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Submission Info -->
              <div>
                <div class="space-y-4">
                  <div>
                    <h3 class="text-sm font-medium text-gray-500">
                      Submitted By
                    </h3>
                    <p class="mt-1 text-gray-900">
                      {{ submission.submittedBy }}
                    </p>
                  </div>
                  <div>
                    <h3 class="text-sm font-medium text-gray-500">
                      Submission Date
                    </h3>
                    <p class="mt-1 text-gray-900">
                      {{ submission.submittedAt | date: 'medium' }}
                    </p>
                  </div>
                  <div>
                    <h3 class="text-sm font-medium text-gray-500">Form Type</h3>
                    <p class="mt-1 text-gray-900">
                      {{ submission.form?.description || 'Not specified' }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Score Card -->
              <div class="bg-blue-50 rounded-lg p-4">
                <h3 class="font-medium text-blue-800 mb-2">Total Score</h3>
                <div class="flex items-baseline mb-1">
                  <span class="text-3xl font-bold text-blue-600">{{
                    submission.totalScore
                  }}</span>
                  <span class="text-gray-600 ml-1"
                    >/ {{ submission.maxPossibleScore }}</span
                  >
                </div>

                <!-- Score Progress Bar -->
                <div class="mt-2">
                  <mat-progress-bar
                    [value]="submission.percentage"
                    [color]="getScoreColor(submission.percentage)"
                  >
                  </mat-progress-bar>
                  <div class="flex justify-between mt-1">
                    <span class="text-xs text-gray-500">0%</span>
                    <span
                      class="text-xs font-medium"
                      [ngClass]="getTextColorClass(submission.percentage)"
                    >
                      {{ submission.percentage }}%
                    </span>
                    <span class="text-xs text-gray-500">100%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Section Scores -->
          <div class="bg-white rounded-lg shadow-md overflow-hidden">
            <div class="bg-blue-600 text-white px-6 py-4">
              <h2 class="text-xl font-semibold">Section Scores</h2>
            </div>

            <div class="p-6">
              <div class="space-y-6">
                <div
                  *ngFor="let sectionScore of submission.sectionScores"
                  class="border-b border-gray-200 pb-6 last:border-0 last:pb-0"
                >
                  <div class="flex justify-between items-center mb-2">
                    <h3 class="font-medium text-gray-900">
                      {{ sectionScore.sectionTitle }}
                    </h3>
                    <div class="flex items-baseline">
                      <span
                        class="font-bold"
                        [ngClass]="getTextColorClass(sectionScore.percentage)"
                      >
                        {{ sectionScore.score }}
                      </span>
                      <span class="text-gray-600 ml-1"
                        >/ {{ sectionScore.maxPossible }}</span
                      >
                    </div>
                  </div>

                  <!-- Section Score Progress Bar -->
                  <mat-progress-bar
                    [value]="sectionScore.percentage"
                    [color]="getScoreColor(sectionScore.percentage)"
                  >
                  </mat-progress-bar>
                  <div class="flex justify-between mt-1">
                    <span class="text-xs text-gray-500">0%</span>
                    <span
                      class="text-xs font-medium"
                      [ngClass]="getTextColorClass(sectionScore.percentage)"
                    >
                      {{ sectionScore.percentage }}%
                    </span>
                    <span class="text-xs text-gray-500">100%</span>
                  </div>

                  <!-- Subsection Scores -->
                  <div
                    *ngIf="
                      sectionScore.subsectionScores &&
                      sectionScore.subsectionScores.length > 0
                    "
                    class="mt-4 pl-4 border-l-2 border-gray-200"
                  >
                    <h4 class="text-sm font-medium text-gray-600 mb-2">
                      Subsections
                    </h4>
                    <div
                      *ngFor="let subsection of sectionScore.subsectionScores"
                      class="mt-3"
                    >
                      <div class="flex justify-between items-center mb-1">
                        <span class="text-sm text-gray-700">{{
                          subsection.sectionTitle
                        }}</span>
                        <div class="flex items-baseline">
                          <span
                            class="font-medium text-sm"
                            [ngClass]="getTextColorClass(subsection.percentage)"
                          >
                            {{ subsection.score }}
                          </span>
                          <span class="text-xs text-gray-600 ml-1"
                            >/ {{ subsection.maxPossible || 'N/A' }}</span
                          >
                        </div>
                      </div>

                      <mat-progress-bar
                        *ngIf="subsection.maxPossible > 0"
                        [value]="subsection.percentage"
                        [color]="getScoreColor(subsection.percentage)"
                      >
                      </mat-progress-bar>
                      <div
                        *ngIf="subsection.maxPossible === 0"
                        class="text-xs text-gray-500 italic"
                      >
                        No maximum score defined
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Form Responses -->
          <div class="bg-white rounded-lg shadow-md overflow-hidden">
            <div class="bg-blue-600 text-white px-6 py-4">
              <h2 class="text-xl font-semibold">Form Responses</h2>
            </div>

            <div class="p-6">
              <div *ngFor="let section of getSections()" class="mb-8 last:mb-0">
                <!-- Section Header -->
                <div class="flex items-center mb-4">
                  <h3 class="text-lg font-medium text-gray-900">
                    {{ section.title }}
                  </h3>
                  <mat-divider class="flex-grow ml-4"></mat-divider>
                </div>

                <!-- Responses in This Section -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div
                    *ngFor="let response of getResponsesForSection(section)"
                    class="bg-gray-50 p-4 rounded-lg"
                  >
                    <h4 class="text-sm font-medium text-gray-600 mb-1">
                      {{ response.field.label }}
                      <span
                        *ngIf="response.field.required"
                        class="text-red-500 ml-1"
                        >*</span
                      >
                    </h4>

                    <!-- Display based on field type -->
                    <div class="mt-1">
                      <!-- Text, Textarea, Email inputs -->
                      <div
                        *ngIf="
                          response.field.fieldType === 'text' ||
                          response.field.fieldType === 'textarea' ||
                          response.field.fieldType === 'email'
                        "
                        class="font-medium text-gray-900"
                      >
                        {{ response.value || 'Not provided' }}
                      </div>

                      <!-- Select or Radio inputs -->
                      <div
                        *ngIf="
                          response.field.fieldType === 'select' ||
                          response.field.fieldType === 'radio'
                        "
                      >
                        <mat-chip-option
                          class="!pointer-events-none"
                          selected
                          color="primary"
                        >
                          {{
                            getOptionLabel(
                              response.field.options,
                              response.value
                            )
                          }}
                        </mat-chip-option>
                      </div>

                      <!-- Checkbox input (multiple values grouped) -->
                      <div *ngIf="response.field.fieldType === 'checkbox'" class="flex flex-wrap gap-2">
                        <span
                          *ngFor="let value of response.values"
                          class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                        >
                          <mat-icon class="!h-4 !w-4 !text-base mr-1">check</mat-icon>
                          {{ value }}
                        </span>
                      </div>

                      <!-- Rating input -->
                      <div
                        *ngIf="response.field.fieldType === 'rating'"
                        class="flex items-center"
                      >
                        <div class="flex">
                          <ng-container *ngFor="let n of [1, 2, 3, 4, 5]">
                            <mat-icon
                              *ngIf="n <= +response.value"
                              class="!h-5 !w-5 !font-size-18 text-yellow-400"
                              aria-hidden="true"
                              >star</mat-icon
                            >
                            <mat-icon
                              *ngIf="n > +response.value"
                              class="!h-5 !w-5 !font-size-18 text-gray-300"
                              aria-hidden="true"
                              >star_border</mat-icon
                            >
                          </ng-container>
                        </div>
                        <span class="ml-2 text-gray-600"
                          >{{ response.value }} / 5</span
                        >
                      </div>
                    </div>

                    <!-- Field Help Text -->
                    <div
                      *ngIf="response.field.helpText"
                      class="mt-2 text-xs text-gray-500 italic"
                    >
                      {{ response.field.helpText }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class FormSubmissionDetailComponent implements OnInit {
  submissionUuid: string = '';
  submission: FormSubmission | null = null;
  isLoading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private submissionService: FormSubmissionService,
    private location: Location,
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.submissionUuid = params['uuid'];
      this.loadSubmission();
    });
  }

  loadSubmission() {
    this.isLoading = true;
    this.submissionService.getSubmissionByUuid(this.submissionUuid).subscribe({
      next: (response) => {
        // Unwrap the data property from the API response
        this.submission = response['data'];
        console.log('Loaded submission:', this.submission);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading submission:', err);
        this.isLoading = false;
      },
    });
  }

  getSections() {
    if (
      !this.submission ||
      !this.submission.form ||
      !this.submission.form.sections
    ) {
      return [];
    }
    return this.submission.form.sections.sort(
      (a, b) => a.orderIndex - b.orderIndex,
    );
  }

  getResponsesForSection(section: any) {
    if (!this.submission || !this.submission.responses) {
      return [];
    }

    // Filter responses that belong to fields in this section
    const sectionResponses = this.submission.responses.filter((response) => {
      const fieldIds = section.fields.map((field: any) => field.id);
      return fieldIds.includes(response.field.id);
    });

    // Group checkbox responses by field.id
    const groupedResponses: any[] = [];
    const checkboxGroups = new Map<number, any[]>();

    sectionResponses.forEach((response) => {
      if (response.field.fieldType === 'checkbox') {
        // Group checkbox responses by field ID
        if (!checkboxGroups.has(response.field.id)) {
          checkboxGroups.set(response.field.id, []);
        }
        checkboxGroups.get(response.field.id)!.push(response);
      } else {
        // Non-checkbox responses are added as-is
        groupedResponses.push(response);
      }
    });

    // Convert grouped checkbox responses into single entries with values array
    checkboxGroups.forEach((responses, fieldId) => {
      const firstResponse = responses[0];
      groupedResponses.push({
        ...firstResponse,
        values: responses.map(r => r.value), // Array of all selected values
      });
    });

    return groupedResponses;
  }

  getOptionLabel(options: any[] | null, value: string): string {
    if (!options || options.length === 0) {
      // For select fields, try to find the option in the form definition
      if (this.submission?.form?.sections) {
        for (const section of this.submission.form.sections) {
          for (const field of section.fields) {
            if (field.fieldType === 'select' && field.options) {
              const option = field.options.find((opt) => opt.value === value);
              if (option) return option.label;
            }
          }
        }
      }
      return value;
    }

    const option = options.find((opt) => opt.value === value);
    return option ? option.label : value;
  }

  // Helper methods for score visualization
  getScoreColor(percentage: number): string {
    if (percentage >= 80) return 'primary'; // Blue
    if (percentage >= 60) return 'accent'; // Orange/Amber
    return 'warn'; // Red
  }

  getTextColorClass(percentage: number): string {
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 60) return 'text-amber-600';
    return 'text-red-600';
  }

  goBack(): void {
    this.location.back();
  }
}
