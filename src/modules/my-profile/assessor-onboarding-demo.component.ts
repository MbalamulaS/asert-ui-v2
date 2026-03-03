import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { ContainerComponent } from 'components/container/container.component';

@Component({
  selector: 'app-assessor-onboarding-demo',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    ContainerComponent,
  ],
  template: `
    <container>
      <div
        class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12"
      >
        <div class="max-w-4xl mx-auto px-4">
          <!-- Header -->
          <div class="text-center mb-12">
            <h1 class="text-4xl font-bold text-gray-900 mb-4">
              New Assessor Onboarding Experience
            </h1>
            <p class="text-xl text-gray-600 max-w-2xl mx-auto">
              A modern, streamlined approach to complete your assessor profile
              with intelligent grouping and better UX.
            </p>
          </div>

          <!-- Comparison -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <!-- Old Approach -->
            <mat-card class="p-6">
              <div class="text-center mb-6">
                <div
                  class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <mat-icon class="text-red-600 text-2xl">close</mat-icon>
                </div>
                <h3 class="text-xl font-semibold text-gray-900 mb-2">
                  Current Approach
                </h3>
                <p class="text-gray-600">9-step linear stepper process</p>
              </div>

              <div class="space-y-3">
                <div class="flex items-center text-sm text-gray-600">
                  <mat-icon class="text-red-500 mr-2 text-sm">remove</mat-icon>
                  Too many steps (9 separate pages)
                </div>
                <div class="flex items-center text-sm text-gray-600">
                  <mat-icon class="text-red-500 mr-2 text-sm">remove</mat-icon>
                  Poor information grouping
                </div>
                <div class="flex items-center text-sm text-gray-600">
                  <mat-icon class="text-red-500 mr-2 text-sm">remove</mat-icon>
                  Forced linear progression
                </div>
                <div class="flex items-center text-sm text-gray-600">
                  <mat-icon class="text-red-500 mr-2 text-sm">remove</mat-icon>
                  No progress indication
                </div>
                <div class="flex items-center text-sm text-gray-600">
                  <mat-icon class="text-red-500 mr-2 text-sm">remove</mat-icon>
                  Outdated Material Design stepper
                </div>
                <div class="flex items-center text-sm text-gray-600">
                  <mat-icon class="text-red-500 mr-2 text-sm">remove</mat-icon>
                  High completion fatigue
                </div>
              </div>

              <button
                mat-button
                class="w-full mt-6 py-2 border border-gray-300 text-gray-700"
                (click)="openOldApproach()"
              >
                View Old Approach
              </button>
            </mat-card>

            <!-- New Approach -->
            <mat-card class="p-6 border-2 border-green-200">
              <div class="text-center mb-6">
                <div
                  class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <mat-icon class="text-green-600 text-2xl">check</mat-icon>
                </div>
                <h3 class="text-xl font-semibold text-gray-900 mb-2">
                  New Approach
                </h3>
                <p class="text-gray-600">Smart card-based layout</p>
              </div>

              <div class="space-y-3">
                <div class="flex items-center text-sm text-gray-600">
                  <mat-icon class="text-green-500 mr-2 text-sm">check</mat-icon>
                  4 logical sections instead of 9 steps
                </div>
                <div class="flex items-center text-sm text-gray-600">
                  <mat-icon class="text-green-500 mr-2 text-sm">check</mat-icon>
                  Intelligent information grouping
                </div>
                <div class="flex items-center text-sm text-gray-600">
                  <mat-icon class="text-green-500 mr-2 text-sm">check</mat-icon>
                  Non-linear completion flow
                </div>
                <div class="flex items-center text-sm text-gray-600">
                  <mat-icon class="text-green-500 mr-2 text-sm">check</mat-icon>
                  Visual progress tracking
                </div>
                <div class="flex items-center text-sm text-gray-600">
                  <mat-icon class="text-green-500 mr-2 text-sm">check</mat-icon>
                  Modern card-based design
                </div>
                <div class="flex items-center text-sm text-gray-600">
                  <mat-icon class="text-green-500 mr-2 text-sm">check</mat-icon>
                  Quick completion features
                </div>
              </div>

              <button
                mat-raised-button
                color="primary"
                class="w-full mt-6 py-2 bg-green-600 text-white"
                (click)="openNewApproach()"
              >
                Try New Experience
              </button>
            </mat-card>
          </div>

          <!-- Key Improvements -->
          <mat-card class="p-8 mb-12">
            <h3 class="text-2xl font-semibold text-gray-900 mb-6 text-center">
              Key Improvements
            </h3>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div class="text-center">
                <div
                  class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3"
                >
                  <mat-icon class="text-blue-600">dashboard</mat-icon>
                </div>
                <h4 class="font-semibold text-gray-900 mb-2">Smart Grouping</h4>
                <p class="text-sm text-gray-600">
                  Related information grouped together logically
                </p>
              </div>

              <div class="text-center">
                <div
                  class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3"
                >
                  <mat-icon class="text-green-600">speed</mat-icon>
                </div>
                <h4 class="font-semibold text-gray-900 mb-2">Quick Actions</h4>
                <p class="text-sm text-gray-600">
                  Quick complete, import CV, save draft options
                </p>
              </div>

              <div class="text-center">
                <div
                  class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3"
                >
                  <mat-icon class="text-purple-600">track_changes</mat-icon>
                </div>
                <h4 class="font-semibold text-gray-900 mb-2">
                  Progress Tracking
                </h4>
                <p class="text-sm text-gray-600">
                  Clear visual progress with completion percentage
                </p>
              </div>

              <div class="text-center">
                <div
                  class="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3"
                >
                  <mat-icon class="text-orange-600">palette</mat-icon>
                </div>
                <h4 class="font-semibold text-gray-900 mb-2">Modern Design</h4>
                <p class="text-sm text-gray-600">
                  Beautiful cards with gradient accents and animations
                </p>
              </div>
            </div>
          </mat-card>

          <!-- New Information Architecture -->
          <mat-card class="p-8">
            <h3 class="text-2xl font-semibold text-gray-900 mb-6 text-center">
              New Information Architecture
            </h3>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div class="bg-blue-50 p-4 rounded-lg">
                <h4 class="font-semibold text-blue-900 mb-3 flex items-center">
                  <mat-icon class="mr-2">person</mat-icon>
                  Personal Information
                </h4>
                <ul class="text-sm text-blue-700 space-y-1">
                  <li>• Basic details</li>
                  <li>• Contact information</li>
                  <li>• Profile photo</li>
                  <li>• Demographics</li>
                </ul>
              </div>

              <div class="bg-green-50 p-4 rounded-lg">
                <h4 class="font-semibold text-green-900 mb-3 flex items-center">
                  <mat-icon class="mr-2">work</mat-icon>
                  Professional Background
                </h4>
                <ul class="text-sm text-green-700 space-y-1">
                  <li>• Education history</li>
                  <li>• Work experience</li>
                  <li>• Dynamic entry addition</li>
                  <li>• Validation</li>
                </ul>
              </div>

              <div class="bg-purple-50 p-4 rounded-lg">
                <h4
                  class="font-semibold text-purple-900 mb-3 flex items-center"
                >
                  <mat-icon class="mr-2">badge</mat-icon>
                  Identification & Location
                </h4>
                <ul class="text-sm text-purple-700 space-y-1">
                  <li>• ID verification</li>
                  <li>• Location details</li>
                  <li>• Geographic assignment</li>
                  <li>• Admin hierarchy</li>
                </ul>
              </div>

              <div class="bg-orange-50 p-4 rounded-lg">
                <h4
                  class="font-semibold text-orange-900 mb-3 flex items-center"
                >
                  <mat-icon class="mr-2">tune</mat-icon>
                  Assessment Preferences
                </h4>
                <ul class="text-sm text-orange-700 space-y-1">
                  <li>• Property types</li>
                  <li>• Specializations</li>
                  <li>• Assignment matching</li>
                  <li>• Multi-selection</li>
                </ul>
              </div>
            </div>

            <!-- Supporting Documents as Optional Section -->
            <div class="mt-8 p-4 bg-indigo-50 rounded-lg">
              <h4 class="font-semibold text-indigo-900 mb-3 flex items-center">
                <mat-icon class="mr-2">folder</mat-icon>
                Supporting Documents (Optional)
              </h4>
              <div
                class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-indigo-700"
              >
                <div>• Document uploads</div>
                <div>• Professional references</div>
                <div>• Certifications</div>
              </div>
            </div>
          </mat-card>
        </div>
      </div>
    </container>
  `,
  styles: [
    `
      .mat-mdc-card {
        @apply shadow-sm border border-gray-100;
      }
    `,
  ],
})
export class AssessorOnboardingDemoComponent {
  constructor(private router: Router) {}

  openOldApproach(): void {
    this.router.navigate(['/assessor/update']);
  }

  openNewApproach(): void {
    this.router.navigate(['/assessor/onboarding']);
  }
}
