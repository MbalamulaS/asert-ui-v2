import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import {
  HotelAssessmentResultDto,
  HotelAssessmentResultsComponent,
} from './hotel-assessment-result.component';
import { CommonModule } from '@angular/common';
import { HotelService } from '../services/hotel.service';
import { ActivatedRoute } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-hotel-results',
  standalone: true,
  imports: [
    HotelAssessmentResultsComponent,
    CommonModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
  ],
  template: `
    <!-- Loading State -->
    <div
      *ngIf="isLoading"
      class="flex justify-center items-center h-64 bg-gray-50"
    >
      <div class="text-center">
        <mat-spinner class="mx-auto mb-4"></mat-spinner>
        <p class="text-gray-600">Loading assessment results...</p>
      </div>
    </div>

    <!-- Error State -->
    <div *ngIf="error && !isLoading" class="p-6 bg-gray-50 min-h-screen">
      <mat-card class="max-w-2xl mx-auto shadow-lg border-l-4 border-l-red-500">
        <mat-card-content class="p-6">
          <div class="flex items-start space-x-4">
            <mat-icon class="text-red-500 text-3xl">error</mat-icon>
            <div>
              <h2 class="text-xl font-semibold text-red-800 mb-2">
                Error Loading Assessment Results
              </h2>
              <p class="text-red-700 mb-4">{{ error }}</p>
              <button mat-raised-button color="primary" (click)="retryFetch()">
                <mat-icon class="mr-2">refresh</mat-icon>
                Try Again
              </button>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>

    <!-- Success State -->
    <app-hotel-assessment-results
      *ngIf="assessmentData && !isLoading && !error"
      [assessmentData]="assessmentData"
    />

    <!-- No Data State -->
    <div
      *ngIf="!assessmentData && !isLoading && !error"
      class="p-6 bg-gray-50 min-h-screen"
    >
      <mat-card class="max-w-2xl mx-auto shadow-lg">
        <mat-card-content class="p-6 text-center">
          <mat-icon class="text-gray-400 text-6xl mb-4">assessment</mat-icon>
          <h2 class="text-xl font-semibold text-gray-700 mb-2">
            No Assessment Data Found
          </h2>
          <p class="text-gray-600 mb-4">
            This hotel hasn't been assessed yet or the assessment data is not
            available.
          </p>
          <button mat-raised-button color="primary" (click)="retryFetch()">
            <mat-icon class="mr-2">refresh</mat-icon>
            Refresh
          </button>
        </mat-card-content>
      </mat-card>
    </div>
  `,
})
export class HotelResultsComponent implements OnInit {
  assessmentData: HotelAssessmentResultDto | null = null;
  hotelUuid: string = '';
  isLoading = false;
  error: string | null = null;

  constructor(
    private hotelService: HotelService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    // Use paramMap for path parameters (:id), not queryParamMap
    this.route.paramMap.subscribe((params) => {
      console.log('route params', params);
      this.hotelUuid = params.get('id') || '';
      if (this.hotelUuid) {
        this.fetchData(this.hotelUuid);
      } else {
        this.error = 'Hotel ID not provided in route';
        this.cdr.detectChanges();
      }
    });
  }

  async fetchData(hotelUuid: string) {
    console.log('fetching assessment results for hotel', hotelUuid);
    if (!hotelUuid) return;

    this.isLoading = true;
    this.error = null;
    this.cdr.detectChanges();

    try {
      const response = await lastValueFrom(
        this.hotelService.getAssessmentResults(hotelUuid),
      );
      console.log('assessment results', response.data);
      this.assessmentData = response.data;

      // Check if we actually got data
      if (!response.data) {
        this.error = 'No assessment data available for this hotel';
      }
    } catch (error: any) {
      console.error('Error fetching assessment results:', error);
      this.error =
        error?.message ||
        'Failed to load assessment results. Please try again.';
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  retryFetch() {
    if (this.hotelUuid) {
      this.fetchData(this.hotelUuid);
    }
  }
}
