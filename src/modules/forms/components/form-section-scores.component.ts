import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { FormService } from '../services/form.service';
import { Form } from '../types';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { Router } from '@angular/router';

@Component({
  selector: 'app-form-section-scores-dialog',
  standalone: true,
  template: `
    <div class="p-6 max-h-[80vh] overflow-y-auto">
      <!-- Loading State -->
      <div *ngIf="isLoading" class="flex flex-col items-center justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p class="mt-4 text-sm text-gray-600 font-medium">Loading section scores...</p>
      </div>

      <div *ngIf="!isLoading && form">
        <!-- Form Info Header -->
        <div class="mb-6">
          <h3 class="text-xl font-bold text-gray-900 mb-2">{{ form.name }}</h3>
          <p class="text-sm text-gray-600">{{ form.description }}</p>
        </div>

        <!-- Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <!-- Total Max Score -->
          <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs font-medium text-blue-600 uppercase tracking-wide">Total Max Score</p>
                <p class="text-3xl font-bold text-blue-900 mt-1">{{ form.totalMaxScore || 0 }}</p>
              </div>
              <mat-icon class="text-blue-600 opacity-50 scale-150">assessment</mat-icon>
            </div>
          </div>

          <!-- Defined Scores -->
          <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs font-medium text-green-600 uppercase tracking-wide">Defined</p>
                <p class="text-3xl font-bold text-green-900 mt-1">{{ form.totalDefinedMaxScore || 0 }}</p>
              </div>
              <mat-icon class="text-green-600 opacity-50 scale-150">check_circle</mat-icon>
            </div>
          </div>

          <!-- Calculated Scores -->
          <div class="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-4 border border-amber-200">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs font-medium text-amber-600 uppercase tracking-wide">Calculated</p>
                <p class="text-3xl font-bold text-amber-900 mt-1">{{ form.totalCalculatedMaxScore || 0 }}</p>
              </div>
              <mat-icon class="text-amber-600 opacity-50 scale-150">calculate</mat-icon>
            </div>
          </div>

          <!-- Mismatches Alert -->
          <div [ngClass]="{
            'bg-gradient-to-br from-red-50 to-red-100 border-red-200': form.hasSectionMismatches,
            'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200': !form.hasSectionMismatches
          }" class="rounded-lg p-4 border">
            <div class="flex items-center justify-between">
              <div>
                <p [ngClass]="{
                  'text-red-600': form.hasSectionMismatches,
                  'text-gray-600': !form.hasSectionMismatches
                }" class="text-xs font-medium uppercase tracking-wide">Mismatches</p>
                <p [ngClass]="{
                  'text-red-900': form.hasSectionMismatches,
                  'text-gray-900': !form.hasSectionMismatches
                }" class="text-3xl font-bold mt-1">{{ getMismatchCount() }}</p>
              </div>
              <mat-icon [ngClass]="{
                'text-red-600': form.hasSectionMismatches,
                'text-gray-400': !form.hasSectionMismatches
              }" class="opacity-50 scale-150">
                {{ form.hasSectionMismatches ? 'error' : 'check' }}
              </mat-icon>
            </div>
          </div>
        </div>

        <!-- Mismatch Alert Banner -->
        <div *ngIf="form.hasSectionMismatches" class="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-6">
          <div class="flex items-start">
            <mat-icon class="text-red-600 mr-3 mt-0.5">warning</mat-icon>
            <div>
              <p class="text-sm font-semibold text-red-800 mb-1">Score Mismatch Detected</p>
              <p class="text-sm text-red-700">
                Some sections have defined max scores that don't match the calculated scores from field options.
                Review the highlighted sections below and update the rating criteria accordingly.
              </p>
            </div>
          </div>
        </div>

        <!-- Sections List -->
        <div class="space-y-3">
          <h4 class="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Section Breakdown</h4>

          <!-- Filter: Show only top-level sections -->
          <div *ngFor="let section of getTopLevelSections()" class="border border-gray-200 rounded-lg overflow-hidden">
            <mat-expansion-panel class="shadow-none">
              <mat-expansion-panel-header class="bg-gray-50 hover:bg-gray-100">
                <mat-panel-title>
                  <div class="flex items-center justify-between w-full pr-4">
                    <div class="flex items-center gap-3">
                      <mat-icon class="text-gray-600">{{ section.subsectionCount > 0 ? 'folder' : 'description' }}</mat-icon>
                      <span class="font-semibold text-gray-900">{{ section.sectionTitle }}</span>

                      <!-- Mismatch Badge -->
                      <span *ngIf="section.hasMismatch"
                            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700"
                            matTooltip="Defined score doesn't match calculated score">
                        <mat-icon class="text-xs">error</mat-icon>
                        Mismatch
                      </span>

                      <!-- Score Type Badge -->
                      <span *ngIf="section.hasDefinedMaxScore"
                            class="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        Defined
                      </span>
                      <span *ngIf="!section.hasDefinedMaxScore && section.hasScoringOptions"
                            class="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                        Calculated
                      </span>
                    </div>

                    <div class="flex items-center gap-4 text-sm">
                      <span class="text-gray-500">{{ section.fieldCount }} fields</span>
                      <span class="font-bold text-blue-600">{{ section.effectiveMaxScore || 0 }} pts</span>

                      <!-- Fix Button for Mismatched Sections -->
                      <button *ngIf="section.hasMismatch"
                              (click)="navigateToSection($event, section.sectionUuid)"
                              class="inline-flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded transition-colors"
                              matTooltip="Navigate to this section in form builder">
                        <mat-icon class="text-sm">edit</mat-icon>
                        Fix
                      </button>
                    </div>
                  </div>
                </mat-panel-title>
              </mat-expansion-panel-header>

              <div class="p-4 bg-white">
                <!-- Section Details Grid -->
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p class="text-xs text-gray-500 mb-1">Defined Max Score</p>
                    <p class="text-lg font-semibold" [ngClass]="{
                      'text-green-600': section.hasDefinedMaxScore,
                      'text-gray-400': !section.hasDefinedMaxScore
                    }">
                      {{ section.maxScore !== null ? section.maxScore : '—' }}
                    </p>
                  </div>

                  <div>
                    <p class="text-xs text-gray-500 mb-1">Calculated Max Score</p>
                    <p class="text-lg font-semibold" [ngClass]="{
                      'text-blue-600': section.calculatedMaxScore !== null,
                      'text-gray-400': section.calculatedMaxScore === null
                    }">
                      {{ section.calculatedMaxScore !== null ? section.calculatedMaxScore : '—' }}
                    </p>
                  </div>

                  <div>
                    <p class="text-xs text-gray-500 mb-1">Field Count</p>
                    <p class="text-lg font-semibold text-gray-700">{{ section.fieldCount }}</p>
                  </div>

                  <div>
                    <p class="text-xs text-gray-500 mb-1">Subsections</p>
                    <p class="text-lg font-semibold text-gray-700">{{ section.subsectionCount }}</p>
                  </div>
                </div>

                <!-- Subsections -->
                <div *ngIf="getSubsections(section.sectionUuid).length > 0" class="mt-4 pt-4 border-t border-gray-100">
                  <p class="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">Subsections</p>
                  <div class="space-y-2">
                    <div *ngFor="let subsection of getSubsections(section.sectionUuid)"
                         class="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div class="flex items-center gap-3">
                        <div [style.marginLeft.rem]="(subsection.sectionLevel - 1) * 1.5"></div>
                        <mat-icon class="text-gray-400 text-sm">subdirectory_arrow_right</mat-icon>
                        <span class="text-sm font-medium text-gray-700">{{ subsection.sectionTitle }}</span>

                        <!-- Subsection Mismatch Badge -->
                        <span *ngIf="subsection.hasMismatch"
                              class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-600">
                          <mat-icon class="text-xs">error</mat-icon>
                        </span>
                      </div>

                      <div class="flex items-center gap-4 text-xs">
                        <span class="text-gray-500">{{ subsection.fieldCount }} fields</span>
                        <span class="font-semibold text-gray-900">{{ subsection.effectiveMaxScore || 0 }} pts</span>

                        <!-- Fix Button for Mismatched Subsections -->
                        <button *ngIf="subsection.hasMismatch"
                                (click)="navigateToSection($event, subsection.sectionUuid)"
                                class="inline-flex items-center gap-1 px-2 py-0.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded transition-colors"
                                matTooltip="Navigate to this subsection in form builder">
                          <mat-icon class="text-xs">edit</mat-icon>
                          Fix
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </mat-expansion-panel>
          </div>
        </div>
      </div>
    </div>
  `,
  imports: [
    CommonModule,
    MatIconModule,
    MatTooltipModule,
    MatExpansionModule,
  ],
})
export class FormSectionScoresDialogComponent implements OnChanges {
  @Input() formUuid: string = '';
  @Output() closeDialog = new EventEmitter<void>();
  form: Form | null = null;
  isLoading = true;

  constructor(
    private formService: FormService,
    private router: Router
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['formUuid'] && this.formUuid) {
      this.loadFormSectionScores(this.formUuid);
    }
  }

  loadFormSectionScores(formUuid: string) {
    this.isLoading = true;
    this.formService.getFormById(formUuid).subscribe(
      (response) => {
        this.form = response.data;
        this.isLoading = false;
      },
      (error) => {
        console.error('Error loading form section scores:', error);
        this.isLoading = false;
      }
    );
  }

  getTopLevelSections(): any[] {
    if (!this.form || !this.form.sectionScores) {
      return [];
    }
    return this.form.sectionScores.filter(
      (section: any) => section.parentSectionUuid === null || section.parentSectionUuid === undefined
    );
  }

  getSubsections(parentUuid: string): any[] {
    if (!this.form || !this.form.sectionScores) {
      return [];
    }
    return this.form.sectionScores.filter(
      (section: any) => section.parentSectionUuid === parentUuid
    );
  }

  getMismatchCount(): number {
    if (!this.form || !this.form.sectionScores) {
      return 0;
    }
    return this.form.sectionScores.filter((section: any) => section.hasMismatch).length;
  }

  getSectionMaxScore(section: any): number {
    return section.effectiveMaxScore || 0;
  }

  navigateToSection(event: Event, sectionUuid: string): void {
    // Prevent expansion panel from toggling
    event.stopPropagation();

    // Close the dialog first
    this.closeDialog.emit();

    // Navigate to form builder with highlightSection query parameter
    this.router.navigate(['/forms/edit', this.form?.uuid], {
      queryParams: { highlightSection: sectionUuid }
    });
  }
}