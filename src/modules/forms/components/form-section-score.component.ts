import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon'; // Import MatIconModule
import { FormSubmissionService } from '../services/form-submission.service';
import { SectionScoreDto } from '../types';

@Component({
  selector: 'app-section-score-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  template: `
    <div class="container mx-auto px-4 py-6">
      <div *ngIf="isLoading" class="text-center py-10">
        <mat-icon
          class="animate-spin h-8 w-8 text-blue-600 mx-auto"
          aria-hidden="true"
          >refresh</mat-icon
        >
        <p class="mt-2 text-gray-600">Loading section details...</p>
      </div>

      <div
        *ngIf="!isLoading && !sectionScore"
        class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded"
      >
        <p>Could not load section score details.</p>
      </div>

      <div
        *ngIf="!isLoading && sectionScore"
        class="bg-white rounded-lg shadow-md overflow-hidden"
      >
        <!-- Section header -->
        <div class="bg-blue-600 text-white px-6 py-4">
          <h1 class="text-xl font-bold">{{ sectionScore.sectionTitle }}</h1>
          <div class="flex items-center mt-2">
            <div class="flex-1">
              <div class="w-full bg-blue-800 rounded-full h-2">
                <div
                  class="h-2 rounded-full bg-white"
                  [style.width.%]="sectionScore.percentage"
                ></div>
              </div>
            </div>
            <div class="ml-4 text-right whitespace-nowrap">
              <span class="text-lg font-semibold"
                >{{ sectionScore.percentage | number: '1.1-1' }}%</span
              >
              <span class="text-sm text-blue-100 ml-1">
                ({{ sectionScore.score | number: '1.1-1' }} /
                {{ sectionScore.maxPossible | number: '1.1-1' }})
              </span>
            </div>
          </div>
        </div>

        <!-- Subsections -->
        <div class="p-6">
          <div
            *ngIf="
              sectionScore.subsectionScores &&
              sectionScore.subsectionScores.length > 0
            "
            class="mb-8"
          >
            <h2 class="text-lg font-semibold mb-4">Subsections</h2>

            <div class="space-y-4">
              <div
                *ngFor="let subsection of sectionScore.subsectionScores"
                class="border border-gray-200 rounded p-4 hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <div class="flex justify-between items-center mb-2">
                  <h3 class="font-medium">{{ subsection.sectionTitle }}</h3>
                  <div class="text-right">
                    <span class="font-semibold"
                      >{{ subsection.percentage | number: '1.1-1' }}%</span
                    >
                    <span class="text-sm text-gray-600 ml-1">
                      ({{ subsection.score | number: '1.1-1' }} /
                      {{ subsection.maxPossible | number: '1.1-1' }})
                    </span>
                  </div>
                </div>

                <!-- Subsection progress bar -->
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div
                    class="h-2 rounded-full"
                    [ngClass]="getScoreColorClass(subsection.percentage)"
                    [style.width.%]="subsection.percentage"
                  ></div>
                </div>

                <!-- View subsection detail link -->
                <div class="mt-2 text-right">
                  <a
                    [routerLink]="[
                      '/submissions',
                      submissionUuid,
                      'sections',
                      subsection.sectionUuid,
                    ]"
                    class="text-sm text-blue-600 hover:text-blue-800"
                  >
                    View details
                  </a>
                </div>
              </div>
            </div>
          </div>

          <!-- Field responses visualization could go here -->

          <!-- Navigation buttons -->
          <div class="mt-6 flex justify-between">
            <button
              (click)="goBack()"
              class="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class SectionScoreDetailComponent implements OnInit {
  submissionUuid: string = '';
  sectionUuid: string = '';
  sectionScore: SectionScoreDto | null = null;
  isLoading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private submissionService: FormSubmissionService,
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.submissionUuid = params['submissionUuid'];
      this.sectionUuid = params['sectionUuid'];
      this.loadSectionScore();
    });
  }

  async loadSectionScore(): Promise<void> {
    try {
      this.isLoading = true;
      this.sectionScore = await this.submissionService
        .getSectionScore(this.submissionUuid, this.sectionUuid)
        .toPromise();
    } catch (error) {
      console.error('Error loading section score:', error);
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
}
