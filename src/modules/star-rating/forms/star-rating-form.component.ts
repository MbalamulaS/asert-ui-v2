import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TextInputComponent } from 'components/text-field/text-field.component';
import { TextAreaComponent } from 'components/text-area/text-area.component';
import { FetcherComponent } from 'components/fetcher/fetcher.component';
import { SubmitButtonComponent } from 'components/submit-button/submit-button.component';
import { DualMultiSelectStringComponent } from 'components/dual-multiselect/dual-multi-select-string.component';
import { RadioButtonComponent } from 'components/radio/radio.component';
import { AutocompleteAsyncComponent } from 'components/autocomplete/autocomplete-async.component';
import { SelectComponent } from 'components/select/select.component';
import { StarRatingService } from '../star-rating.service';
import { PropertyType } from 'modules/portal/hotels/types';

interface Item {
  id: number;
  name: string;
}

@Component({
  selector: 'star-rating-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    TextInputComponent,
    TextAreaComponent,
    FetcherComponent,
    SubmitButtonComponent,
    DualMultiSelectStringComponent,
    RadioButtonComponent,
    SelectComponent,
    AutocompleteAsyncComponent,
  ],
  template: `
    <form [formGroup]="form" class="space-y-4">
      <div class="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Property Type Selection -->
        <app-select
          label="Property Type"
          formControlName="propertyType"
          [options]="service.propertyTypeOptions"
          placeholder="Select property type"
        />
        
        <!-- Star Level Selection (filtered by property type) -->
        <app-select
          label="Star Level"
          formControlName="starLevel"
          [options]="getStarLevelOptions()"
          placeholder="Select star level"
          [disabled]="!form.get('propertyType')?.value"
        />
        
        <!-- Rating Criteria Name -->
        <app-text-input 
          label="Name" 
          name="name" 
          formControlName="name"
          placeholder="e.g., 3 Star Lodge"
        />
      </div>

      <div class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Score Fields -->
        <app-text-input
          label="Minimum Score"
          name="minScore"
          type="number"
          formControlName="minScore"
          placeholder="0"
        />
        <app-text-input
          label="Maximum Score"
          name="maxScore"
          type="number"
          formControlName="maxScore"
          placeholder="0"
        />
        <app-text-input
          label="Total Possible Score"
          name="totalPossibleScore"
          type="number"
          formControlName="totalPossibleScore"
          placeholder="0"
        />
      </div>

      <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Percentage Required -->
        <app-text-input
          label="Percentage Required (%)"
          name="percentageRequired"
          type="number"
          formControlName="percentageRequired"
          placeholder="0-100"
        />
        
        <!-- Legacy Rating Level (for backward compatibility) -->
        <app-select
          label="Legacy Rating Level (Deprecated)"
          formControlName="ratingLevel"
          [options]="legacyRatingLevels"
          placeholder="Select legacy level"
          *ngIf="showLegacyFields"
        />
      </div>

      <!-- Criteria Description -->
      <div class="mt-6">
        <app-text-area
          label="Criteria Description"
          name="criteriaDescription"
          formControlName="criteriaDescription"
          [rows]="3"
          placeholder="Describe the criteria requirements for this star level..."
        />
      </div>

      <!-- Toggle for legacy fields -->
      <div class="mt-4">
        <label class="flex items-center">
          <input 
            type="checkbox" 
            [(ngModel)]="showLegacyFields"
            class="mr-2"
          />
          <span class="text-sm text-gray-600">Show legacy fields (for migration purposes)</span>
        </label>
      </div>

      <div class="mt-6 flex justify-end">
        <submit-button
          [isDisabled]="!form.dirty || form.invalid || isSubmitting"
          [isSubmitting]="isSubmitting"
          [buttonText]="form.get('id')?.value ? 'UPDATE' : 'CREATE'"
          (action)="submitForm()"
        />
      </div>
      
      <!-- Debug info (development only) -->
      <!-- <pre class="mt-4 text-xs">{{ form.value | json }}</pre> -->
    </form>
  `,
})
export class StarRatingFormComponent implements OnInit {
  form: FormGroup;
  selectedItems: Item[] = [];
  isSubmitting = false;
  canApprove: boolean = false;
  showLegacyFields = false;

  @Output() onSubmit = new EventEmitter<string>();

  // Legacy rating levels for backward compatibility
  legacyRatingLevels = [
    { value: '5', label: '5 Star' },
    { value: '4', label: '4 Star' },
    { value: '3', label: '3 Star' },
    { value: '2', label: '2 Star' },
    { value: '1', label: '1 Star' },
    {
      value: 'Approved Accommodation Facilities',
      label: 'Approved Accommodation Facilities',
    },
  ];

  constructor(
    private fb: FormBuilder,
    public service: StarRatingService,
  ) {
    this.form = this.service.form;
  }

  ngOnInit() {
    // Watch for property type changes to update star level options
    this.form.get('propertyType')?.valueChanges.subscribe(() => {
      // Reset star level when property type changes
      this.form.get('starLevel')?.setValue('');
      // Update the name field based on selections
      this.updateNameFromSelections();
    });

    // Watch for star level changes to update name
    this.form.get('starLevel')?.valueChanges.subscribe(() => {
      this.updateNameFromSelections();
    });
  }

  // Get star level options filtered by selected property type
  getStarLevelOptions(): { id: number; name: string }[] {
    const propertyType = this.form.get('propertyType')?.value as PropertyType;
    if (!propertyType) {
      return [];
    }
    return this.service.getStarLevelOptionsForPropertyType(propertyType);
  }

  // Auto-generate name based on property type and star level selections
  private updateNameFromSelections() {
    const propertyType = this.form.get('propertyType')?.value as PropertyType;
    const starLevel = this.form.get('starLevel')?.value;
    
    if (propertyType && starLevel) {
      const propertyTypeName = this.service.propertyTypeOptions
        .find(opt => opt.id === propertyType)?.name || propertyType;
      
      const name = `${starLevel} Star ${propertyTypeName}`;
      this.form.get('name')?.setValue(name, { emitEvent: false });
    }
  }

  async submitForm() {
    if (this.form.invalid) {
      return;
    }

    this.isSubmitting = true;

    try {
      const formData = this.form.value;
      this.onSubmit.emit(formData);
    } catch (error) {
    } finally {
      this.isSubmitting = false;
    }
  }
}
