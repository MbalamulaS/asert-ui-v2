import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AssessorService } from 'modules/assessment/assessor.service';
import { AssessorPreferenceService } from 'modules/assessment/assessor-preference.service';
import { HotelService } from 'modules/portal/hotels/services/hotel.service';
import { ContainerComponent } from 'components/container/container.component';
import { HeaderComponent } from 'components/header/header.component';
import { WrapperComponent } from 'components/wrapper/wrapper.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ToastService } from 'app/toast.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-preferences',
  standalone: true,
  imports: [
    CommonModule,
    ContainerComponent,
    HeaderComponent,
    WrapperComponent,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
  ],
  template: `
    <container>
      <app-wrapper>
        <div class="flex items-center mb-6">
          <button 
            mat-icon-button 
            (click)="goBack()"
            class="mr-4 hover:bg-gray-100 rounded-full"
          >
            <mat-icon>arrow_back</mat-icon>
          </button>
          <app-header
            title="Assessment Preferences"
            subtitle="Select the types of establishments you are qualified to assess"
          />
        </div>
      </app-wrapper>

      <!-- Preferences Form -->
      <app-wrapper>
        <div class="max-w-4xl mx-auto">
          <mat-card>
          <mat-card-header>
            <mat-card-title class="flex items-center">
              <mat-icon class="text-orange-600 mr-3">tune</mat-icon>
              Property Types
            </mat-card-title>
            <mat-card-subtitle>
              {{ selectedPreferences.length }} property type{{ selectedPreferences.length !== 1 ? 's' : '' }} selected
            </mat-card-subtitle>
          </mat-card-header>
          
          <mat-card-content class="space-y-4">
            <p class="text-sm text-gray-600">
              Select all types of establishments you are qualified and comfortable assessing:
            </p>

            <div *ngIf="loading" class="flex justify-center items-center py-8">
              <div class="text-gray-500">Loading property types...</div>
            </div>

            <div *ngIf="!loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div 
                *ngFor="let option of propertyTypeOptions" 
                class="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <mat-checkbox
                  [checked]="isPreferenceSelected(option.value)"
                  (change)="togglePreference(option.value)"
                  class="mr-3"
                >
                </mat-checkbox>
                <div class="flex-1">
                  <div class="font-medium text-gray-900">{{ option.label }}</div>
                  <div class="text-xs text-gray-500">{{ getPropertyDescription(option.value) }}</div>
                </div>
              </div>
            </div>

            <div 
              *ngIf="selectedPreferences.length > 0"
              class="mt-6 p-4 bg-blue-50 rounded-lg"
            >
              <div class="flex items-center mb-2">
                <mat-icon class="text-blue-600 mr-2">info</mat-icon>
                <span class="font-medium text-blue-900">Selected Preferences</span>
              </div>
              <div class="flex flex-wrap gap-2">
                <span 
                  *ngFor="let pref of selectedPreferences"
                  class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {{ getPropertyLabel(pref) }}
                </span>
              </div>
            </div>

            <div 
              *ngIf="selectedPreferences.length === 0"
              class="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg"
            >
              <div class="flex items-center">
                <mat-icon class="text-orange-600 mr-2">warning</mat-icon>
                <span class="text-orange-800">Please select at least one property type to continue</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
        </div>
      </app-wrapper>

      <!-- Navigation -->
      <app-wrapper>
        <div class="max-w-4xl mx-auto">
          <div class="flex justify-between items-center">
          <button
            mat-button
            (click)="goBack()"
            class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <mat-icon class="mr-2">arrow_back</mat-icon>
            Back to Overview
          </button>
          
          <button
            mat-raised-button
            color="primary"
            (click)="saveAndContinue()"
            [disabled]="selectedPreferences.length === 0"
            class="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            Save & Finish
            <mat-icon class="ml-2">check</mat-icon>
          </button>
          </div>
        </div>
      </app-wrapper>
    </container>
  `,
})
export class PreferencesComponent implements OnInit {
  selectedPreferences: string[] = [];
  existingPreferences: any[] = [];
  propertyTypeOptions: any[] = [];
  loading = true;

  constructor(
    private assessorService: AssessorService,
    private preferenceService: AssessorPreferenceService,
    private hotelService: HotelService,
    private router: Router,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.loadPropertyTypes();
  }

  loadPropertyTypes(): void {
    this.hotelService.getPropertyTypes().subscribe({
      next: (response) => {
        if (response.data && Array.isArray(response.data)) {
          this.propertyTypeOptions = response.data.map((type: string) => ({
            value: type,
            label: this.formatPropertyTypeLabel(type)
          }));
        }
        this.loadPreferences();
      },
      error: (error) => {
        console.error('Error loading property types:', error);
        // Fallback to hardcoded options if API fails
        this.propertyTypeOptions = [
          { value: 'TOWN_HOTEL', label: 'Town Hotel' },
          { value: 'VACATION_HOTEL', label: 'Vacation Hotel' },
          { value: 'RESTAURANT', label: 'Restaurant' },
          { value: 'LODGE', label: 'Lodge' },
          { value: 'TENTED_CAMP', label: 'Tented Camp' },
          { value: 'VILLA', label: 'Villa' },
          { value: 'COTTAGE', label: 'Cottage' },
          { value: 'SERVICED_APARTMENT', label: 'Serviced Apartment' },
          { value: 'MOTEL', label: 'Motel' },
        ];
        this.loadPreferences();
      },
    });
  }

  formatPropertyTypeLabel(enumValue: string): string {
    // Convert ENUM_VALUE to "Enum Value"
    return enumValue
      .split('_')
      .map(word => word.charAt(0) + word.substring(1).toLowerCase())
      .join(' ');
  }

  loadPreferences(): void {
    this.assessorService.getCurrentUserAssessorData().subscribe({
      next: (response) => {
        const data = response.data;
        if (data.preferenceDtoList) {
          this.existingPreferences = data.preferenceDtoList;
          this.selectedPreferences = data.preferenceDtoList.map(
            (pref: any) => pref.preference || pref.propertyType
          );
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading preferences:', error);
        this.loading = false;
      },
    });
  }

  isPreferenceSelected(value: string): boolean {
    return this.selectedPreferences.includes(value);
  }

  togglePreference(value: string): void {
    const index = this.selectedPreferences.indexOf(value);
    if (index > -1) {
      // Remove the preference
      this.selectedPreferences = this.selectedPreferences.filter(pref => pref !== value);
      console.log('Removed preference:', value, 'Updated list:', this.selectedPreferences);
    } else {
      // Add the preference
      this.selectedPreferences = [...this.selectedPreferences, value];
      console.log('Added preference:', value, 'Updated list:', this.selectedPreferences);
    }
  }

  getPropertyLabel(value: string): string {
    const option = this.propertyTypeOptions.find(opt => opt.value === value);
    return option ? option.label : value;
  }

  getPropertyDescription(value: string): string {
    const descriptions: { [key: string]: string } = {
      'TOWN_HOTEL': 'Urban accommodations and business hotels',
      'VACATION_HOTEL': 'Resort and leisure accommodations',
      'RESTAURANT': 'Dining establishments and food services',
      'LODGE': 'Traditional lodging facilities',
      'TENTED_CAMP': 'Safari and outdoor camping facilities',
      'VILLA': 'Private vacation rental properties',
      'COTTAGE': 'Small residential accommodations',
      'SERVICED_APARTMENT': 'Extended stay accommodations',
      'MOTEL': 'Roadside and budget accommodations',
    };
    return descriptions[value] || '';
  }

  goBack(): void {
    this.router.navigate(['/assessor/onboarding']);
  }

  saveAndContinue(): void {
    if (this.selectedPreferences.length > 0) {
      // Determine which preferences to add and which to remove
      const existingPreferenceValues = this.existingPreferences.map(p => p.preference);
      
      // Preferences to add (selected but not existing)
      const preferencesToAdd = this.selectedPreferences.filter(
        pref => !existingPreferenceValues.includes(pref)
      );
      
      // Preferences to remove (existing but not selected)
      const preferencesToRemove = this.existingPreferences.filter(
        pref => !this.selectedPreferences.includes(pref.preference)
      );
      
      const operations: any[] = [];
      
      // Add new preferences
      preferencesToAdd.forEach(preference => {
        operations.push(this.preferenceService.create({ preference }));
      });
      
      // Remove unselected preferences
      preferencesToRemove.forEach(preference => {
        operations.push(this.preferenceService.delete(preference.uuid));
      });
      
      if (operations.length > 0) {
        forkJoin(operations).subscribe({
          next: () => {
            this.toast.success('Assessment preferences saved successfully');
            this.router.navigate(['/assessor/onboarding']);
          },
          error: (error) => {
            console.error('Error saving preferences:', error);
            this.toast.error('Failed to save preferences');
          },
        });
      } else {
        // No changes needed
        this.toast.success('Assessment preferences are up to date');
        this.router.navigate(['/assessor/onboarding']);
      }
    } else {
      this.toast.error('Please select at least one property type');
    }
  }
}