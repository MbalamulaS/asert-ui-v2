import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { FormsModule } from '@angular/forms';
import { SystemConfigurationService } from '../../services/system-configuration.service';
import { TextInputComponent } from 'components/text-field/text-field.component';

@Component({
  selector: 'app-variance-threshold-config',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    FormsModule,
    TextInputComponent,
  ],
  template: `
    <div class="p-6">
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-gray-800">
          Variance Detection Configuration
        </h2>
        <p class="text-gray-600 mt-2">
          Configure the threshold for automatic variance detection in assessment
          scores
        </p>
      </div>

      <div class="max-w-2xl">
        <mat-card class="shadow-lg">
          <mat-card-content class="p-6">
            <div class="space-y-6">
              <!-- Current Threshold Display -->
              <div class="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <div class="flex items-center gap-3">
                  <mat-icon class="text-blue-600">info</mat-icon>
                  <div>
                    <p class="text-sm font-medium text-gray-700">
                      Current Variance Threshold
                    </p>
                    <p class="text-2xl font-bold text-blue-600">
                      {{ currentThreshold | number: '1.1-1' }} points
                    </p>
                  </div>
                </div>
              </div>

              <!-- Threshold Explanation -->
              <div class="text-sm text-gray-600 space-y-2">
                <p>
                  <strong>What is variance threshold?</strong>
                </p>
                <p>
                  The variance threshold determines when assessor score
                  differences trigger automatic detection and notification. When
                  any pairwise comparison of assessor scores is <strong>greater than or equal to (≥)</strong> this
                  threshold, the system will:
                </p>
                <ul class="list-disc list-inside ml-4 space-y-1">
                  <li>Create a variance log entry</li>
                  <li>Notify relevant assessors</li>
                  <li>Flag the assessment for review</li>
                  <li>Prevent final submission until variances are resolved</li>
                </ul>
              </div>

              <!-- Update Form -->
              <div class="border-t pt-6">
                <h3 class="text-lg font-semibold text-gray-800 mb-4">
                  Update Threshold
                </h3>

                <div class="space-y-4">
                  <app-text-input
                    label="New Threshold Value (points)"
                    name="newThreshold"
                    type="number"
                    [(ngModel)]="newThreshold"
                    placeholder="Enter threshold value"
                    icon="trending_up"
                  />

                  <!-- Preview Examples -->
                  <div
                    *ngIf="newThreshold !== null && newThreshold >= 0"
                    class="p-4 bg-gray-50 rounded-lg"
                  >
                    <p class="text-sm font-medium text-gray-700 mb-2">
                      Example Scenarios (threshold: {{ newThreshold | number: '1.1-1' }} points):
                    </p>
                    <div class="space-y-2 text-sm text-gray-600">
                      <div class="flex items-center gap-2">
                        <mat-icon class="text-green-600" style="font-size: 18px"
                          >check_circle</mat-icon
                        >
                        <span
                          >Assessor A: 85, Assessor B: {{ (85 + (+newThreshold) - 0.5) | number: '1.1-1' }}
                          (diff: {{ (+newThreshold - 0.5) | number: '1.1-1' }}) - No variance (less than threshold)</span
                        >
                      </div>
                      <div class="flex items-center gap-2">
                        <mat-icon
                          class="text-orange-600"
                          style="font-size: 18px"
                          >warning</mat-icon
                        >
                        <span
                          >Assessor A: 70, Assessor B: {{ (70 + (+newThreshold)) | number: '1.1-1' }}
                          (diff: {{ newThreshold | number: '1.1-1' }}) - Variance detected! (≥ threshold)</span
                        >
                      </div>
                    </div>
                  </div>

                  <!-- Validation Messages -->
                  <div
                    *ngIf="
                      newThreshold !== null &&
                      (newThreshold < 0 || newThreshold > 50)
                    "
                    class="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2"
                  >
                    <mat-icon class="text-red-600" style="font-size: 20px"
                      >error</mat-icon
                    >
                    <span class="text-sm text-red-700">
                      <span *ngIf="newThreshold < 0"
                        >Threshold must be a positive number.</span
                      >
                      <span *ngIf="newThreshold > 50"
                        >Threshold seems unusually high. Consider a value
                        between 10-20 points.</span
                      >
                    </span>
                  </div>

                  <!-- Success Message -->
                  <div
                    *ngIf="updateSuccess"
                    class="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2"
                  >
                    <mat-icon class="text-green-600" style="font-size: 20px"
                      >check_circle</mat-icon
                    >
                    <span class="text-sm text-green-700">
                      Variance threshold updated successfully! All future
                      variance detections will use the new threshold.
                    </span>
                  </div>

                  <!-- Error Message -->
                  <div
                    *ngIf="updateError"
                    class="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2"
                  >
                    <mat-icon class="text-red-600" style="font-size: 20px"
                      >error</mat-icon
                    >
                    <span class="text-sm text-red-700">
                      {{ updateError }}
                    </span>
                  </div>

                  <!-- Action Buttons -->
                  <div class="flex justify-end gap-3 pt-4">
                    <button
                      mat-stroked-button
                      (click)="resetForm()"
                      [disabled]="isUpdating"
                      class="text-gray-700"
                    >
                      Reset
                    </button>
                    <button
                      mat-raised-button
                      color="primary"
                      (click)="updateThreshold()"
                      [disabled]="
                        !isValidThreshold() ||
                        isUpdating ||
                        newThreshold === currentThreshold
                      "
                      class="bg-blue-600 text-white hover:bg-blue-700"
                    >
                      {{ isUpdating ? 'Updating...' : 'Update Threshold' }}
                    </button>
                  </div>
                </div>
              </div>

              <!-- Historical Context -->
              <div class="border-t pt-6">
                <h3 class="text-lg font-semibold text-gray-800 mb-4">
                  Best Practices
                </h3>
                <div class="space-y-3 text-sm text-gray-600">
                  <div class="flex items-start gap-3">
                    <mat-icon
                      class="text-blue-600 flex-shrink-0"
                      style="font-size: 20px"
                      >lightbulb</mat-icon
                    >
                    <div>
                      <p class="font-medium text-gray-700">
                        Setting the Right Threshold
                      </p>
                      <p>
                        A lower threshold (10-12 points) provides stricter
                        quality control but may generate more variance
                        notifications. A higher threshold (15-20 points) allows
                        more assessor discretion but may miss significant
                        discrepancies.
                      </p>
                    </div>
                  </div>
                  <div class="flex items-start gap-3">
                    <mat-icon
                      class="text-blue-600 flex-shrink-0"
                      style="font-size: 20px"
                      >analytics</mat-icon
                    >
                    <div>
                      <p class="font-medium text-gray-700">
                        Monitor and Adjust
                      </p>
                      <p>
                        Review variance detection patterns regularly. If too
                        many false positives occur, consider increasing the
                        threshold. If critical discrepancies are missed,
                        decrease it.
                      </p>
                    </div>
                  </div>
                  <div class="flex items-start gap-3">
                    <mat-icon
                      class="text-blue-600 flex-shrink-0"
                      style="font-size: 20px"
                      >people</mat-icon
                    >
                    <div>
                      <p class="font-medium text-gray-700">
                        Assessor Training Impact
                      </p>
                      <p>
                        Well-trained assessors with consistent scoring patterns
                        may allow for a slightly higher threshold. New or
                        inconsistent assessors benefit from a lower threshold
                        for better oversight.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
})
export class VarianceThresholdConfigComponent implements OnInit {
  currentThreshold: number = 5;
  newThreshold: number | null = null;
  isUpdating = false;
  updateSuccess = false;
  updateError: string | null = null;

  constructor(private systemConfigurationService: SystemConfigurationService) {}

  ngOnInit() {
    this.loadCurrentThreshold();
  }

  loadCurrentThreshold() {
    this.systemConfigurationService
      .getVarianceThreshold()
      .subscribe((response) => {
        if (response && response.data) {
          this.currentThreshold = response.data;
          this.newThreshold = response.data;
        }
      });
  }

  isValidThreshold(): boolean {
    return this.newThreshold !== null && this.newThreshold >= 0;
  }

  updateThreshold() {
    if (!this.isValidThreshold() || this.newThreshold === null) {
      return;
    }

    this.isUpdating = true;
    this.updateSuccess = false;
    this.updateError = null;

    this.systemConfigurationService
      .updateVarianceThreshold(this.newThreshold)
      .subscribe({
        next: (response) => {
          if (response) {
            this.currentThreshold = this.newThreshold!;
            this.updateSuccess = true;
            setTimeout(() => {
              this.updateSuccess = false;
            }, 5000);
          } else {
            this.updateError = response.message || 'Failed to update threshold';
          }
          this.isUpdating = false;
        },
        error: (error) => {
          this.updateError =
            error.error?.message ||
            'An error occurred while updating the threshold';
          this.isUpdating = false;
        },
      });
  }

  resetForm() {
    this.newThreshold = this.currentThreshold;
    this.updateSuccess = false;
    this.updateError = null;
  }
}
