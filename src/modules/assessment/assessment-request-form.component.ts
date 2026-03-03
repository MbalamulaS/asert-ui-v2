import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormControl,
} from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { CheckboxComponent } from 'components/checkbox/checkbox.component';
import { RadioButtonComponent } from 'components/radio/radio.component';
import { TextInputComponent } from 'components/text-field/text-field.component';
import { SelectComponent } from 'components/select/select.component';
import { TextAreaComponent } from 'components/text-area/text-area.component';
import { DatepickerComponent } from 'components/datepicker/datepicker.component';
import { FileUploadComponent } from 'components/file-upload/file-upload.component';
import { SubmitButtonComponent } from 'components/submit-button/submit-button.component';
import { UploadTypes, UploadedFile } from 'components/file-upload/types';
import { lastValueFrom } from 'rxjs';
import {
  AssessmentRequestService,
  AssessmentRequest,
} from './assessment-request.service';
import { FetcherComponent } from 'components/fetcher/fetcher.component';

interface EssentialItem {
  itemNo: number;
  title: string;
  description: string[];
  complianceRequirements: string[];
  requiresCopyUpload: boolean;
  uploadLabel?: string;
  uploadType?: UploadTypes;
  evidenceCategory?: 'document' | 'certificate' | 'photo' | 'video';
  category: 'legal' | 'health-safety' | 'facilities' | 'staff' | 'operational';
}

@Component({
  selector: 'app-assessment-request-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatCardModule,
    MatIconModule,
    MatProgressBarModule,
    MatChipsModule,
    MatDividerModule,
    MatButtonModule,
    MatExpansionModule,
    MatTooltipModule,
    MatBadgeModule,
    CheckboxComponent,
    RadioButtonComponent,
    TextInputComponent,
    SelectComponent,
    TextAreaComponent,
    DatepickerComponent,
    FileUploadComponent,
    SubmitButtonComponent,
    FetcherComponent,
  ],
  template: `
    <div class="max-w-7xl mx-auto p-4 md:p-6">
      <!-- Header Card -->
      <mat-card class="mb-6 shadow-lg">
        <mat-card-header
          class="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t"
        >
          <mat-card-title class="flex items-center text-2xl font-bold">
            <mat-icon class="mr-3 scale-125">assignment_turned_in</mat-icon>
            Essential Items Compliance Assessment
          </mat-card-title>
          <mat-card-subtitle class="text-blue-100 mt-2">
            Hotel Classification Prerequisites - 100% compliance required for
            classification
          </mat-card-subtitle>
        </mat-card-header>

        <mat-card-content class="p-6">
          <!-- Key Definitions -->
          <div class="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 rounded">
            <h3 class="font-semibold text-blue-900 mb-2 flex items-center">
              <mat-icon class="mr-2 text-blue-600">info</mat-icon>
              Important Definitions
            </h3>
            <div
              class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm"
            >
              <div class="flex items-start">
                <span class="font-semibold text-blue-700 mr-2"
                  >Availability:</span
                >
                <span class="text-gray-700"
                  >Item is physically present and verifiable</span
                >
              </div>
              <div class="flex items-start">
                <span class="font-semibold text-blue-700 mr-2"
                  >Conformity:</span
                >
                <span class="text-gray-700"
                  >Meets quality standards set by authorities</span
                >
              </div>
              <div class="flex items-start">
                <span class="font-semibold text-blue-700 mr-2"
                  >Compliance:</span
                >
                <span class="text-gray-700"
                  >Up to date and meets validity conditions</span
                >
              </div>
              <div class="flex items-start">
                <span class="font-semibold text-blue-700 mr-2"
                  >Functionality:</span
                >
                <span class="text-gray-700"
                  >Operational and meets intended purpose</span
                >
              </div>
            </div>
          </div>

          <!-- Progress Overview -->
          <div class="mb-6 bg-white p-4 rounded-lg border border-gray-200">
            <div class="flex justify-between items-center mb-3">
              <span class="text-lg font-semibold text-gray-800"
                >Overall Progress</span
              >
              <span
                class="text-2xl font-bold"
                [class]="getProgressColorClass()"
              >
                {{ getCompletionPercentage() }}%
              </span>
            </div>
            <mat-progress-bar
              mode="determinate"
              [value]="getCompletionPercentage()"
              [class]="getProgressBarClass()"
              class="h-3 rounded"
            ></mat-progress-bar>

            <!-- Status Summary -->
            <div class="grid grid-cols-3 gap-4 mt-4">
              <div
                class="text-center p-3 bg-green-50 rounded-lg border border-green-200"
              >
                <div class="text-2xl font-bold text-green-600">
                  {{ getCompliantCount() }}
                </div>
                <div class="text-xs text-green-700 uppercase tracking-wide">
                  Compliant
                </div>
              </div>
              <div
                class="text-center p-3 bg-red-50 rounded-lg border border-red-200"
              >
                <div class="text-2xl font-bold text-red-600">
                  {{ getNonCompliantCount() }}
                </div>
                <div class="text-xs text-red-700 uppercase tracking-wide">
                  Non-Compliant
                </div>
              </div>
              <div
                class="text-center p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div class="text-2xl font-bold text-gray-600">
                  {{ getPendingCount() }}
                </div>
                <div class="text-xs text-gray-700 uppercase tracking-wide">
                  Pending
                </div>
              </div>
            </div>
          </div>

          <form [formGroup]="assessmentForm" (ngSubmit)="onSubmit()">
            <mat-stepper #stepper orientation="vertical" linear="false">
              <!-- Step 1: Facility Information -->
              <mat-step
                [stepControl]="facilityInfoGroup"
                label="Facility Information"
              >
                <ng-template matStepLabel>
                  <span class="text-lg font-semibold"
                    >Facility Information</span
                  >
                </ng-template>

                <form [formGroup]="facilityInfoGroup" class="mt-6">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <app-text-input
                      label="Facility/Hotel Name"
                      name="facilityName"
                      formControlName="facilityName"
                      [required]="true"
                      placeholder="Enter the official name of your hotel"
                    />

                    <app-fetcher
                      api="hotels/get-types"
                      [defaultParams]="{ size: '15' }"
                      loadingLabel="Fetching Hotel Types..."
                    >
                      <ng-template let-response>
                        <div *ngIf="response; else noData">
                          <app-select
                            label="Hotel Type"
                            [form]="facilityInfoGroup"
                            name="facilityType"
                            formControlName="facilityType"
                            [options]="mapPropertyTypes(response.data)"
                            [required]="true"
                          />
                        </div>
                        <ng-template #noData>
                          <app-select
                            label="Hotel Type"
                            [form]="facilityInfoGroup"
                            name="facilityType"
                            formControlName="facilityType"
                            [options]="[]"
                            [required]="true"
                          />
                        </ng-template>
                      </ng-template>
                    </app-fetcher>
                  </div>

                  <app-text-area
                    label="Facility Description"
                    formControlName="description"
                    [rows]="3"
                    [required]="false"
                    class="w-full mt-4"
                    placeholder="Brief description of the facility"
                  />

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <app-text-input
                      label="Contact Person"
                      name="contactPerson"
                      formControlName="contactPerson"
                      [required]="true"
                      placeholder="Full name of primary contact"
                    />

                    <app-text-input
                      label="Email Address"
                      name="email"
                      formControlName="email"
                      type="email"
                      [required]="true"
                      placeholder="email@example.com"
                    />

                    <app-text-input
                      label="Phone Number"
                      name="phoneNumber"
                      formControlName="phoneNumber"
                      [required]="true"
                      placeholder="+255 xxx xxx xxx"
                    />

                    <app-datepicker
                      label="Requested Assessment Date"
                      formControlName="requestedDate"
                      [required]="true"
                    />
                  </div>

                  <app-text-area
                    label="Complete Facility Address"
                    formControlName="address"
                    [rows]="3"
                    [required]="true"
                    class="w-full mt-4"
                    placeholder="Street address, City, Region, Postal code"
                  />

                  <div class="flex justify-between mt-8">
                    <button
                      mat-stroked-button
                      type="button"
                      (click)="onCancel()"
                    >
                      Cancel
                    </button>
                    <button
                      mat-raised-button
                      color="primary"
                      matStepperNext
                      type="button"
                    >
                      Next
                      <mat-icon class="ml-2">arrow_forward</mat-icon>
                    </button>
                  </div>
                </form>
              </mat-step>

              <!-- Step 2: Essential Items Compliance -->
              <mat-step
                [stepControl]="essentialItemsGroup"
                label="Essential Items Compliance"
              >
                <ng-template matStepLabel>
                  <span class="text-lg font-semibold"
                    >Essential Items Compliance Checklist</span
                  >
                </ng-template>

                <form [formGroup]="essentialItemsGroup" class="mt-6">
                  <div
                    class="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded"
                  >
                    <h3
                      class="text-lg font-semibold text-gray-800 mb-2 flex items-center"
                    >
                      <mat-icon class="mr-2 text-yellow-600">warning</mat-icon>
                      Important Notice
                    </h3>
                    <p class="text-sm text-gray-700">
                      All 22 essential items must achieve 100% compliance for
                      hotel classification. Items marked as non-compliant will
                      require remediation before certification.
                    </p>
                  </div>

                  <!-- Categories of Essential Items -->
                  <mat-accordion multi="true" class="space-y-4">
                    <!-- Legal & Regulatory Compliance -->
                    <mat-expansion-panel
                      [expanded]="true"
                      class="border border-blue-200 shadow-sm"
                    >
                      <mat-expansion-panel-header
                        class="bg-blue-50 hover:bg-blue-100"
                      >
                        <mat-panel-title
                          class="flex items-center text-lg font-semibold text-blue-900"
                        >
                          <mat-icon class="mr-2 text-blue-600">gavel</mat-icon>
                          Legal & Regulatory Compliance
                          <mat-badge
                            [matBadge]="getCategoryCompliance('legal')"
                            matBadgeColor="accent"
                            class="ml-3"
                          ></mat-badge>
                        </mat-panel-title>
                        <mat-panel-description class="text-gray-600">
                          Building permits, licenses, and environmental
                          compliance
                        </mat-panel-description>
                      </mat-expansion-panel-header>

                      <div class="p-6 space-y-6">
                        <div
                          *ngFor="let item of getLegalItems()"
                          class="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
                          [class.bg-green-50]="isItemCompliant(item.itemNo)"
                          [class.bg-red-50]="isItemNonCompliant(item.itemNo)"
                        >
                          <div class="flex items-start justify-between mb-4">
                            <div class="flex-1">
                              <h4
                                class="text-lg font-semibold text-gray-900 mb-2"
                              >
                                {{ item.itemNo }}. {{ item.title }}
                              </h4>
                              <div class="space-y-1 mb-3">
                                <p
                                  *ngFor="let desc of item.description"
                                  class="text-sm text-gray-700"
                                >
                                  {{ desc }}
                                </p>
                              </div>
                              <div class="bg-gray-100 rounded p-3 mb-3">
                                <h5
                                  class="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1"
                                >
                                  Compliance Requirements:
                                </h5>
                                <ul class="space-y-1">
                                  <li
                                    *ngFor="
                                      let req of item.complianceRequirements
                                    "
                                    class="text-sm text-gray-700 flex items-start"
                                  >
                                    <mat-icon
                                      class="text-gray-400 mr-1 scale-75"
                                      >check_circle</mat-icon
                                    >
                                    {{ req }}
                                  </li>
                                </ul>
                              </div>
                            </div>
                            <mat-chip-set class="ml-4">
                              <mat-chip
                                [class]="getItemStatusClass(item.itemNo)"
                              >
                                {{ getItemStatusText(item.itemNo) }}
                              </mat-chip>
                            </mat-chip-set>
                          </div>

                          <div
                            [formGroupName]="'item' + item.itemNo"
                            class="space-y-4"
                          >
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <app-radio-button
                                label="Compliance Status"
                                formControlName="compliance"
                                [options]="complianceOptions"
                                [required]="true"
                                class="col-span-1"
                              />

                              <div
                                *ngIf="item.requiresCopyUpload"
                                class="col-span-1"
                              >
                                <label
                                  class="block text-sm font-medium text-gray-700 mb-2"
                                >
                                  {{
                                    item.uploadLabel ||
                                      'Upload Supporting Document'
                                  }}
                                  <span class="text-red-500">*</span>
                                </label>
                                <file-upload
                                  [label]="
                                    item.uploadLabel ||
                                    'Upload Supporting Document'
                                  "
                                  [uploadType]="item.uploadType"
                                  [multiple]="false"
                                  [accept]="'.pdf,.jpg,.jpeg,.png'"
                                  [autoUpload]="true"
                                  (onSuccess)="
                                    handleFileUpload($event, item.itemNo)
                                  "
                                  class="w-full"
                                />
                                <p class="text-xs text-gray-500 mt-1">
                                  Copy must be available for verification
                                </p>
                              </div>
                            </div>

                            <app-text-area
                              label="Notes / Comments"
                              formControlName="notes"
                              [rows]="2"
                              placeholder="Provide any additional information or specify repairs/improvements needed"
                              class="w-full"
                            />
                          </div>
                        </div>
                      </div>
                    </mat-expansion-panel>

                    <!-- Health, Safety & Sanitation -->
                    <mat-expansion-panel
                      class="border border-green-200 shadow-sm"
                    >
                      <mat-expansion-panel-header
                        class="bg-green-50 hover:bg-green-100"
                      >
                        <mat-panel-title
                          class="flex items-center text-lg font-semibold text-green-900"
                        >
                          <mat-icon class="mr-2 text-green-600"
                            >health_and_safety</mat-icon
                          >
                          Health, Safety & Sanitation
                          <mat-badge
                            [matBadge]="getCategoryCompliance('health-safety')"
                            matBadgeColor="accent"
                            class="ml-3"
                          ></mat-badge>
                        </mat-panel-title>
                        <mat-panel-description class="text-gray-600">
                          Hygiene, waste management, water supply, and safety
                          systems
                        </mat-panel-description>
                      </mat-expansion-panel-header>

                      <div class="p-6 space-y-6">
                        <div
                          *ngFor="let item of getHealthSafetyItems()"
                          class="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
                          [class.bg-green-50]="isItemCompliant(item.itemNo)"
                          [class.bg-red-50]="isItemNonCompliant(item.itemNo)"
                        >
                          <div class="flex items-start justify-between mb-4">
                            <div class="flex-1">
                              <h4
                                class="text-lg font-semibold text-gray-900 mb-2"
                              >
                                {{ item.itemNo }}. {{ item.title }}
                              </h4>
                              <div class="space-y-1 mb-3">
                                <p
                                  *ngFor="let desc of item.description"
                                  class="text-sm text-gray-700"
                                >
                                  {{ desc }}
                                </p>
                              </div>
                              <div class="bg-gray-100 rounded p-3 mb-3">
                                <h5
                                  class="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1"
                                >
                                  Compliance Requirements:
                                </h5>
                                <ul class="space-y-1">
                                  <li
                                    *ngFor="
                                      let req of item.complianceRequirements
                                    "
                                    class="text-sm text-gray-700 flex items-start"
                                  >
                                    <mat-icon
                                      class="text-gray-400 mr-1 scale-75"
                                      >check_circle</mat-icon
                                    >
                                    {{ req }}
                                  </li>
                                </ul>
                              </div>
                            </div>
                            <mat-chip-set class="ml-4">
                              <mat-chip
                                [class]="getItemStatusClass(item.itemNo)"
                              >
                                {{ getItemStatusText(item.itemNo) }}
                              </mat-chip>
                            </mat-chip-set>
                          </div>

                          <div
                            [formGroupName]="'item' + item.itemNo"
                            class="space-y-4"
                          >
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <app-radio-button
                                label="Compliance Status"
                                formControlName="compliance"
                                [options]="complianceOptions"
                                [required]="true"
                                class="col-span-1"
                              />

                              <div
                                *ngIf="item.requiresCopyUpload"
                                class="col-span-1"
                              >
                                <label
                                  class="block text-sm font-medium text-gray-700 mb-2"
                                >
                                  {{
                                    item.uploadLabel ||
                                      'Upload Supporting Document'
                                  }}
                                  <span class="text-red-500">*</span>
                                </label>
                                <file-upload
                                  [label]="
                                    item.uploadLabel ||
                                    'Upload Supporting Document'
                                  "
                                  [uploadType]="item.uploadType"
                                  [multiple]="false"
                                  [accept]="'.pdf,.jpg,.jpeg,.png'"
                                  [autoUpload]="true"
                                  (onSuccess)="
                                    handleFileUpload($event, item.itemNo)
                                  "
                                  class="w-full"
                                />
                                <p class="text-xs text-gray-500 mt-1">
                                  Certificate/evidence must be available
                                </p>
                              </div>
                            </div>

                            <app-text-area
                              label="Notes / Comments"
                              formControlName="notes"
                              [rows]="2"
                              placeholder="Provide any additional information or specify repairs/improvements needed"
                              class="w-full"
                            />
                          </div>
                        </div>
                      </div>
                    </mat-expansion-panel>

                    <!-- Facilities & Infrastructure -->
                    <mat-expansion-panel
                      class="border border-purple-200 shadow-sm"
                    >
                      <mat-expansion-panel-header
                        class="bg-purple-50 hover:bg-purple-100"
                      >
                        <mat-panel-title
                          class="flex items-center text-lg font-semibold text-purple-900"
                        >
                          <mat-icon class="mr-2 text-purple-600"
                            >apartment</mat-icon
                          >
                          Facilities & Infrastructure
                          <mat-badge
                            [matBadge]="getCategoryCompliance('facilities')"
                            matBadgeColor="accent"
                            class="ml-3"
                          ></mat-badge>
                        </mat-panel-title>
                        <mat-panel-description class="text-gray-600">
                          Room designation, communication systems, and guest
                          amenities
                        </mat-panel-description>
                      </mat-expansion-panel-header>

                      <div class="p-6 space-y-6">
                        <div
                          *ngFor="let item of getFacilitiesItems()"
                          class="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
                          [class.bg-green-50]="isItemCompliant(item.itemNo)"
                          [class.bg-red-50]="isItemNonCompliant(item.itemNo)"
                        >
                          <div class="flex items-start justify-between mb-4">
                            <div class="flex-1">
                              <h4
                                class="text-lg font-semibold text-gray-900 mb-2"
                              >
                                {{ item.itemNo }}. {{ item.title }}
                              </h4>
                              <div class="space-y-1 mb-3">
                                <p
                                  *ngFor="let desc of item.description"
                                  class="text-sm text-gray-700"
                                >
                                  {{ desc }}
                                </p>
                              </div>
                              <div class="bg-gray-100 rounded p-3 mb-3">
                                <h5
                                  class="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1"
                                >
                                  Compliance Requirements:
                                </h5>
                                <ul class="space-y-1">
                                  <li
                                    *ngFor="
                                      let req of item.complianceRequirements
                                    "
                                    class="text-sm text-gray-700 flex items-start"
                                  >
                                    <mat-icon
                                      class="text-gray-400 mr-1 scale-75"
                                      >check_circle</mat-icon
                                    >
                                    {{ req }}
                                  </li>
                                </ul>
                              </div>
                            </div>
                            <mat-chip-set class="ml-4">
                              <mat-chip
                                [class]="getItemStatusClass(item.itemNo)"
                              >
                                {{ getItemStatusText(item.itemNo) }}
                              </mat-chip>
                            </mat-chip-set>
                          </div>

                          <div
                            [formGroupName]="'item' + item.itemNo"
                            class="space-y-4"
                          >
                            <app-radio-button
                              label="Compliance Status"
                              formControlName="compliance"
                              [options]="complianceOptions"
                              [required]="true"
                            />

                            <app-text-area
                              label="Notes / Comments"
                              formControlName="notes"
                              [rows]="2"
                              placeholder="Provide any additional information or specify repairs/improvements needed"
                              class="w-full"
                            />
                          </div>
                        </div>
                      </div>
                    </mat-expansion-panel>

                    <!-- Staff & Management -->
                    <mat-expansion-panel
                      class="border border-orange-200 shadow-sm"
                    >
                      <mat-expansion-panel-header
                        class="bg-orange-50 hover:bg-orange-100"
                      >
                        <mat-panel-title
                          class="flex items-center text-lg font-semibold text-orange-900"
                        >
                          <mat-icon class="mr-2 text-orange-600"
                            >people</mat-icon
                          >
                          Staff & Management
                          <mat-badge
                            [matBadge]="getCategoryCompliance('staff')"
                            matBadgeColor="accent"
                            class="ml-3"
                          ></mat-badge>
                        </mat-panel-title>
                        <mat-panel-description class="text-gray-600">
                          Staff qualifications and health certifications
                        </mat-panel-description>
                      </mat-expansion-panel-header>

                      <div class="p-6 space-y-6">
                        <div
                          *ngFor="let item of getStaffItems()"
                          class="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
                          [class.bg-green-50]="isItemCompliant(item.itemNo)"
                          [class.bg-red-50]="isItemNonCompliant(item.itemNo)"
                        >
                          <div class="flex items-start justify-between mb-4">
                            <div class="flex-1">
                              <h4
                                class="text-lg font-semibold text-gray-900 mb-2"
                              >
                                {{ item.itemNo }}. {{ item.title }}
                              </h4>
                              <div class="space-y-1 mb-3">
                                <p
                                  *ngFor="let desc of item.description"
                                  class="text-sm text-gray-700"
                                >
                                  {{ desc }}
                                </p>
                              </div>
                              <div class="bg-gray-100 rounded p-3 mb-3">
                                <h5
                                  class="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1"
                                >
                                  Compliance Requirements:
                                </h5>
                                <ul class="space-y-1">
                                  <li
                                    *ngFor="
                                      let req of item.complianceRequirements
                                    "
                                    class="text-sm text-gray-700 flex items-start"
                                  >
                                    <mat-icon
                                      class="text-gray-400 mr-1 scale-75"
                                      >check_circle</mat-icon
                                    >
                                    {{ req }}
                                  </li>
                                </ul>
                              </div>
                            </div>
                            <mat-chip-set class="ml-4">
                              <mat-chip
                                [class]="getItemStatusClass(item.itemNo)"
                              >
                                {{ getItemStatusText(item.itemNo) }}
                              </mat-chip>
                            </mat-chip-set>
                          </div>

                          <div
                            [formGroupName]="'item' + item.itemNo"
                            class="space-y-4"
                          >
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <app-radio-button
                                label="Compliance Status"
                                formControlName="compliance"
                                [options]="complianceOptions"
                                [required]="true"
                                class="col-span-1"
                              />

                              <div
                                *ngIf="item.requiresCopyUpload"
                                class="col-span-1"
                              >
                                <label
                                  class="block text-sm font-medium text-gray-700 mb-2"
                                >
                                  {{
                                    item.uploadLabel || 'Upload Certificates'
                                  }}
                                  <span class="text-red-500">*</span>
                                </label>
                                <file-upload
                                  [label]="
                                    item.uploadLabel || 'Upload Certificates'
                                  "
                                  [uploadType]="item.uploadType"
                                  [multiple]="true"
                                  [accept]="'.pdf,.jpg,.jpeg,.png'"
                                  [autoUpload]="true"
                                  (onSuccess)="
                                    handleFileUpload($event, item.itemNo)
                                  "
                                  class="w-full"
                                />
                                <p class="text-xs text-gray-500 mt-1">
                                  Certificates must be available for
                                  verification
                                </p>
                              </div>
                            </div>

                            <app-text-area
                              label="Notes / Comments"
                              formControlName="notes"
                              [rows]="2"
                              placeholder="Provide any additional information or specify improvements needed"
                              class="w-full"
                            />
                          </div>
                        </div>
                      </div>
                    </mat-expansion-panel>

                    <!-- Operational & Emergency Systems -->
                    <mat-expansion-panel
                      class="border border-red-200 shadow-sm"
                    >
                      <mat-expansion-panel-header
                        class="bg-red-50 hover:bg-red-100"
                      >
                        <mat-panel-title
                          class="flex items-center text-lg font-semibold text-red-900"
                        >
                          <mat-icon class="mr-2 text-red-600"
                            >emergency</mat-icon
                          >
                          Operational & Emergency Systems
                          <mat-badge
                            [matBadge]="getCategoryCompliance('operational')"
                            matBadgeColor="accent"
                            class="ml-3"
                          ></mat-badge>
                        </mat-panel-title>
                        <mat-panel-description class="text-gray-600">
                          Insurance, emergency procedures, and operational
                          systems
                        </mat-panel-description>
                      </mat-expansion-panel-header>

                      <div class="p-6 space-y-6">
                        <div
                          *ngFor="let item of getOperationalItems()"
                          class="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
                          [class.bg-green-50]="isItemCompliant(item.itemNo)"
                          [class.bg-red-50]="isItemNonCompliant(item.itemNo)"
                        >
                          <div class="flex items-start justify-between mb-4">
                            <div class="flex-1">
                              <h4
                                class="text-lg font-semibold text-gray-900 mb-2"
                              >
                                {{ item.itemNo }}. {{ item.title }}
                              </h4>
                              <div class="space-y-1 mb-3">
                                <p
                                  *ngFor="let desc of item.description"
                                  class="text-sm text-gray-700"
                                >
                                  {{ desc }}
                                </p>
                              </div>
                              <div class="bg-gray-100 rounded p-3 mb-3">
                                <h5
                                  class="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1"
                                >
                                  Compliance Requirements:
                                </h5>
                                <ul class="space-y-1">
                                  <li
                                    *ngFor="
                                      let req of item.complianceRequirements
                                    "
                                    class="text-sm text-gray-700 flex items-start"
                                  >
                                    <mat-icon
                                      class="text-gray-400 mr-1 scale-75"
                                      >check_circle</mat-icon
                                    >
                                    {{ req }}
                                  </li>
                                </ul>
                              </div>
                            </div>
                            <mat-chip-set class="ml-4">
                              <mat-chip
                                [class]="getItemStatusClass(item.itemNo)"
                              >
                                {{ getItemStatusText(item.itemNo) }}
                              </mat-chip>
                            </mat-chip-set>
                          </div>

                          <div
                            [formGroupName]="'item' + item.itemNo"
                            class="space-y-4"
                          >
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <app-radio-button
                                label="Compliance Status"
                                formControlName="compliance"
                                [options]="complianceOptions"
                                [required]="true"
                                class="col-span-1"
                              />

                              <div
                                *ngIf="item.requiresCopyUpload"
                                class="col-span-1"
                              >
                                <label
                                  class="block text-sm font-medium text-gray-700 mb-2"
                                >
                                  {{ item.uploadLabel || 'Upload Document' }}
                                  <span class="text-red-500">*</span>
                                </label>
                                <file-upload
                                  [label]="
                                    item.uploadLabel ||
                                    'Upload Supporting Document'
                                  "
                                  [uploadType]="item.uploadType"
                                  [multiple]="false"
                                  [accept]="'.pdf,.jpg,.jpeg,.png'"
                                  [autoUpload]="true"
                                  (onSuccess)="
                                    handleFileUpload($event, item.itemNo)
                                  "
                                  class="w-full"
                                />
                                <p class="text-xs text-gray-500 mt-1">
                                  Copy must be available for verification
                                </p>
                              </div>
                            </div>

                            <app-text-area
                              label="Notes / Comments"
                              formControlName="notes"
                              [rows]="2"
                              placeholder="Provide any additional information or specify improvements needed"
                              class="w-full"
                            />
                          </div>
                        </div>
                      </div>
                    </mat-expansion-panel>
                  </mat-accordion>

                  <div class="flex justify-between mt-8">
                    <button mat-stroked-button matStepperPrevious type="button">
                      <mat-icon class="mr-2">arrow_back</mat-icon>
                      Previous
                    </button>
                    <button
                      mat-raised-button
                      color="primary"
                      matStepperNext
                      type="button"
                    >
                      Next
                      <mat-icon class="ml-2">arrow_forward</mat-icon>
                    </button>
                  </div>
                </form>
              </mat-step>

              <!-- Step 3: Additional Information & Review -->
              <mat-step label="Review & Submit">
                <ng-template matStepLabel>
                  <span class="text-lg font-semibold">Review & Submit</span>
                </ng-template>

                <div class="mt-6">
                  <!-- Summary Card -->
                  <mat-card class="mb-6 border border-blue-200">
                    <mat-card-header class="bg-blue-50">
                      <mat-card-title class="text-lg"
                        >Assessment Summary</mat-card-title
                      >
                    </mat-card-header>
                    <mat-card-content class="p-6">
                      <div
                        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
                      >
                        <div class="text-center p-4 bg-white rounded-lg border">
                          <div class="text-3xl font-bold text-blue-600">
                            {{ getCompletionPercentage() }}%
                          </div>
                          <div class="text-sm text-gray-600">
                            Overall Completion
                          </div>
                        </div>
                        <div
                          class="text-center p-4 bg-green-50 rounded-lg border border-green-200"
                        >
                          <div class="text-3xl font-bold text-green-600">
                            {{ getCompliantCount() }}
                          </div>
                          <div class="text-sm text-gray-600">
                            Compliant Items
                          </div>
                        </div>
                        <div
                          class="text-center p-4 bg-red-50 rounded-lg border border-red-200"
                        >
                          <div class="text-3xl font-bold text-red-600">
                            {{ getNonCompliantCount() }}
                          </div>
                          <div class="text-sm text-gray-600">
                            Non-Compliant Items
                          </div>
                        </div>
                        <div
                          class="text-center p-4 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          <div class="text-3xl font-bold text-gray-600">
                            {{ getTotalUploadedFiles() }}
                          </div>
                          <div class="text-sm text-gray-600">
                            Documents Uploaded
                          </div>
                        </div>
                      </div>

                      <!-- Non-compliant items list -->
                      <div *ngIf="getNonCompliantCount() > 0" class="mt-6">
                        <h3 class="text-lg font-semibold text-red-600 mb-3">
                          Non-Compliant Items Requiring Attention:
                        </h3>
                        <div
                          class="bg-red-50 rounded-lg p-4 border border-red-200"
                        >
                          <ul class="space-y-2">
                            <li
                              *ngFor="let item of getNonCompliantItems()"
                              class="flex items-start text-sm text-red-800"
                            >
                              <mat-icon class="text-red-500 mr-2 scale-75"
                                >error</mat-icon
                              >
                              <span
                                ><strong>Item {{ item.itemNo }}:</strong>
                                {{ item.title }}</span
                              >
                            </li>
                          </ul>
                        </div>
                      </div>
                    </mat-card-content>
                  </mat-card>

                  <!-- Additional Comments -->
                  <mat-card class="mb-6">
                    <mat-card-header>
                      <mat-card-title>Additional Information</mat-card-title>
                    </mat-card-header>
                    <mat-card-content class="pt-4">
                      <app-text-area
                        label="Additional Comments (Optional)"
                        formControlName="additionalComments"
                        [rows]="4"
                        placeholder="Provide any additional information that may be relevant to the assessment"
                        class="w-full"
                      />
                    </mat-card-content>
                  </mat-card>

                  <!-- Terms and Conditions -->
                  <mat-card class="mb-6">
                    <mat-card-content class="pt-4">
                      <app-checkbox
                        label="I confirm that all information provided is accurate and complete. I understand that false information may result in rejection of the assessment request."
                        formControlName="termsAccepted"
                        [required]="true"
                      />
                    </mat-card-content>
                  </mat-card>

                  <!-- Action Buttons -->
                  <div class="flex justify-between mt-8">
                    <button mat-stroked-button matStepperPrevious type="button">
                      <mat-icon class="mr-2">arrow_back</mat-icon>
                      Previous
                    </button>
                    <div class="space-x-4">
                      <button
                        mat-stroked-button
                        type="button"
                        (click)="onCancel()"
                      >
                        Cancel
                      </button>
                      <submit-button
                        [isSubmitting]="isSubmitting"
                        [isDisabled]="!assessmentForm.valid || isSubmitting"
                        [buttonText]="'Submit Assessment Request'"
                        (action)="onSubmit()"
                      />
                    </div>
                  </div>
                </div>
              </mat-step>
            </mat-stepper>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .mat-stepper-vertical {
        background-color: transparent;
      }

      .mat-step-header {
        padding: 16px 24px !important;
      }

      .mat-expansion-panel-header {
        min-height: 64px !important;
      }

      .mat-chip.status-compliant {
        background-color: #10b981 !important;
        color: white !important;
      }

      .mat-chip.status-non-compliant {
        background-color: #ef4444 !important;
        color: white !important;
      }

      .mat-chip.status-pending {
        background-color: #6b7280 !important;
        color: white !important;
      }

      .mat-progress-bar.progress-low {
        ::ng-deep .mat-progress-bar-fill::after {
          background-color: #ef4444 !important;
        }
      }

      .mat-progress-bar.progress-medium {
        ::ng-deep .mat-progress-bar-fill::after {
          background-color: #f59e0b !important;
        }
      }

      .mat-progress-bar.progress-high {
        ::ng-deep .mat-progress-bar-fill::after {
          background-color: #10b981 !important;
        }
      }
    `,
  ],
})
export class AssessmentRequestFormComponent implements OnInit {
  @Input() hotelData: any;
  @Output() formSubmitted = new EventEmitter<AssessmentRequest>();
  @Output() formCancelled = new EventEmitter<void>();

  assessmentForm: FormGroup;
  facilityInfoGroup: FormGroup;
  essentialItemsGroup: FormGroup;
  isSubmitting = false;
  uploadedFiles: UploadedFile[] = [];

  complianceOptions = [
    { value: 'compliant', label: 'Compliant', icon: 'check_circle' },
    { value: 'non-compliant', label: 'Non-Compliant', icon: 'cancel' },
  ];

  // Complete list of all 22 essential items with full descriptions
  essentialItems: EssentialItem[] = [
    // Legal & Regulatory Compliance
    {
      itemNo: 1,
      title: 'Occupational Permit',
      description: [
        'Does the hotel have approved:',
        '(a) Building Plan',
        '(b) Valid occupational certificate',
      ],
      complianceRequirements: [
        'Compliant with the building law',
        'Copy availability',
      ],
      requiresCopyUpload: true,
      uploadLabel: 'Upload Building Plan & Occupational Certificate',
      uploadType: UploadTypes.BUILDING_PLAN_DOCUMENTS,
      evidenceCategory: 'document',
      category: 'legal',
    },
    {
      itemNo: 2,
      title: 'Valid Operating Licenses',
      description: [
        'Does the hotel have operational licenses required under regulatory laws?',
      ],
      complianceRequirements: [
        'Compliant with the regulatory law',
        'Copy availability',
      ],
      requiresCopyUpload: true,
      uploadLabel: 'Upload Operating Licenses',
      uploadType: UploadTypes.OPERATING_LICENSES,
      evidenceCategory: 'document',
      category: 'legal',
    },
    {
      itemNo: 3,
      title: 'Valid EIA Reports/Audits',
      description: [
        'Does the hotel have a certified EIA and/or current EA report?',
      ],
      complianceRequirements: [
        'Compliant with the regulatory law',
        'Copy availability',
      ],
      requiresCopyUpload: true,
      uploadLabel: 'Upload EIA/EA Reports',
      uploadType: UploadTypes.EIA_REPORTS_AUDITS,
      evidenceCategory: 'document',
      category: 'legal',
    },

    // Health, Safety & Sanitation
    {
      itemNo: 4,
      title: 'Drainage',
      description: [
        'Is there adequate & functional drains especially within and around the Kitchen area?',
        'Connected to soakage pit, with provision for grease trap?',
        'Properly covered & Maintained in good working condition?',
      ],
      complianceRequirements: [
        'Compliant with the public health Act & the building code',
        'Functionality',
        'Good state of Repair/Maintenance',
      ],
      requiresCopyUpload: false,
      category: 'health-safety',
    },
    {
      itemNo: 7,
      title: 'Hand Wash Basin',
      description: [
        'Is there provision for adequate & separate wash hand basins appropriately located at the Kitchen entry for staff?',
        'Hygienically controlled & means of hand drying?',
        'Hot & cold running water?',
      ],
      complianceRequirements: [
        'Availability & appropriately located',
        'Functionality',
        'Good State of Repair/Maintenance',
      ],
      requiresCopyUpload: false,
      category: 'health-safety',
    },
    {
      itemNo: 8,
      title: 'Wash Rooms',
      description: [
        'Is there a provision of public wash rooms conveniently located to public areas?',
        'Gender segregated to ensure privacy?',
        'Clean & functional?',
      ],
      complianceRequirements: [
        'Availability & segregated for male & female',
        'Clean & Functional',
        'Good State of Repair/Maintenance',
      ],
      requiresCopyUpload: false,
      category: 'health-safety',
    },
    {
      itemNo: 9,
      title: 'Waste / Refuse Disposal',
      description: [
        'Does the hotel have sufficient number of waste bins?',
        'Lined with appropriate bags & covered?',
        'A system of separation, storage and disposal conforming to public health standards & environmental laws?',
      ],
      complianceRequirements: [
        'Waste bins, lined & well Covered with storage area available',
        'Waste separation done correctly',
        'Conform to legislative laws',
      ],
      requiresCopyUpload: false,
      category: 'health-safety',
    },
    {
      itemNo: 10,
      title: 'Sewage Disposal and Treatment',
      description: [
        'Does the hotel have a system of sewage disposal and/or treatment?',
        'Connected to soakage pit?',
        'Approved & Certified by relevant authorities?',
      ],
      complianceRequirements: [
        'Availability',
        'Functionality',
        'Approved & Certified by relevant authority',
      ],
      requiresCopyUpload: false,
      category: 'health-safety',
    },
    {
      itemNo: 11,
      title: 'Vermin Proofing',
      description: [
        'Is the hotel regularly fumigated?',
        'Fumigation conforms to local public health & environmental regulations?',
        'Have a certificate as proof of most recent fumigation?',
      ],
      complianceRequirements: [
        'Conforms to the relevant laws',
        'Certificates availability to evidence the service',
      ],
      requiresCopyUpload: true,
      uploadLabel: 'Upload Fumigation Certificate',
      uploadType: UploadTypes.VERMIN_PROOFING_DOCS,
      evidenceCategory: 'certificate',
      category: 'health-safety',
    },
    {
      itemNo: 12,
      title: 'Water Supply',
      description: [
        'Does the hotel water supply conform to local & WHO standards, treated & certified by competent authority?',
      ],
      complianceRequirements: [
        'Availability',
        'Water supply certified',
        'Reservoir Adequate commensurate to capacity',
      ],
      requiresCopyUpload: true,
      uploadLabel: 'Upload Water Quality Certificate',
      uploadType: UploadTypes.WATER_SUPPLY_DOCS,
      evidenceCategory: 'certificate',
      category: 'health-safety',
    },
    {
      itemNo: 14,
      title: 'Fire Safety',
      description: [
        'Does the hotel building material fire resistant or retardant?',
        'Have firefighting equipment?',
        'Well maintained in working condition?',
        'Conducting fire drills often?',
      ],
      complianceRequirements: [
        'Fire safety measures Availability',
        'Equipment functionality',
        'Good State of Repair/Maintenance',
      ],
      requiresCopyUpload: false,
      category: 'health-safety',
    },
    {
      itemNo: 15,
      title: 'First Aid',
      description: [
        'Is there provision for first aid kits located in essential areas?',
        'Are there trained staffs on first aid procedure and in-house nurse or doctor on call?',
      ],
      complianceRequirements: [
        'First aid kit & content expiry dates valid',
        'Availability in key areas',
        'Staff capable of administering first aid',
        'In-house nurse or doctor on call',
      ],
      requiresCopyUpload: false,
      category: 'health-safety',
    },
    {
      itemNo: 16,
      title: 'Electrical Safety',
      description: [
        'Does the hotel electric installation well maintained?',
        'Electric fittings conform to safety laws and certified?',
        'Fittings regularly inspected?',
      ],
      complianceRequirements: [
        'TANESCO certificate Availability',
        'Compliant with regular inspection requirement',
      ],
      requiresCopyUpload: true,
      uploadLabel: 'Upload TANESCO Certificate',
      uploadType: UploadTypes.ELECTRICAL_SAFETY_DOCS,
      evidenceCategory: 'certificate',
      category: 'health-safety',
    },
    {
      itemNo: 17,
      title: 'Security Systems',
      description: [
        'Does the hotel have security arrangement?',
        'Functional alarm systems?',
        'Professionally trained security personnel?',
      ],
      complianceRequirements: [
        'Security measures Availability',
        'Security equipments',
        'Security personnel trained',
      ],
      requiresCopyUpload: false,
      category: 'health-safety',
    },

    // Facilities & Infrastructure
    {
      itemNo: 5,
      title: 'Room Designation',
      description: [
        'Are the rooms clearly designated?',
        'With signs showing the location of rooms in the hotel',
        'Guest rooms numbered',
      ],
      complianceRequirements: [
        'Functional & stylish',
        'Good State of Repair/Maintenance',
      ],
      requiresCopyUpload: false,
      category: 'facilities',
    },
    {
      itemNo: 6,
      title: 'Safe Deposit',
      description: [
        'Is there provision for safe deposit, either in the rooms or centrally placed?',
        'Are guests informed?',
      ],
      complianceRequirements: [
        'Availability',
        'Functional',
        'Good State of Repair/Maintenance',
      ],
      requiresCopyUpload: false,
      category: 'facilities',
    },
    {
      itemNo: 13,
      title: 'Communication Systems',
      description: [
        'Does the hotel have appropriate system for guest bedroom communication?',
      ],
      complianceRequirements: [
        'Availability',
        'Functionality',
        'Good State of Repair/Maintenance',
      ],
      requiresCopyUpload: false,
      category: 'facilities',
    },

    // Staff & Management
    {
      itemNo: 18,
      title: 'Qualification/Experience of Management Staff',
      description: [
        'Is the hotel property managed by a professionally qualified person, certified by recognized institutions/authority?',
      ],
      complianceRequirements: [
        'Manager Qualified',
        'Certified by relevant Authority',
        'Competence',
      ],
      requiresCopyUpload: true,
      uploadLabel: 'Upload Manager Certification',
      uploadType: UploadTypes.QUALIFIED_MANAGEMENT_DOCS,
      evidenceCategory: 'certificate',
      category: 'staff',
    },
    {
      itemNo: 19,
      title: 'Qualification/Experience of Departmental Heads',
      description: [
        'The hotel has suitably qualified & experienced staff supervising departments/section operations?',
      ],
      complianceRequirements: [
        'Key departments supervised by qualified person',
        'Certified by relevant authority',
        'Competence',
      ],
      requiresCopyUpload: true,
      uploadLabel: 'Upload Department Head Certifications',
      uploadType: UploadTypes.QUALIFIED_DEPARTMENTAL_HEADS_DOCS,
      evidenceCategory: 'certificate',
      category: 'staff',
    },
    {
      itemNo: 20,
      title: 'Health Medical Examination',
      description: [
        'Does the hotel staff especially food handlers undergo routine medical examination?',
        'Compliant with the county regulations?',
      ],
      complianceRequirements: [
        'Food handlers examined',
        'Compliant with 6 months medical examination',
        'Medical certificates available',
      ],
      requiresCopyUpload: true,
      uploadLabel: 'Upload Medical Certificates',
      uploadType: UploadTypes.HEALTH_MEDICAL_EXAM_DOCS,
      evidenceCategory: 'certificate',
      category: 'staff',
    },

    // Operational & Emergency Systems
    {
      itemNo: 21,
      title: 'Emergency Evacuation',
      description: [
        'Does the hotel have in place provision for emergency evacuation?',
        'Oral or written information on emergency provided to guests?',
      ],
      complianceRequirements: [
        'Emergency procedures provided',
        'Information on emergency procedures given to guests',
      ],
      requiresCopyUpload: false,
      category: 'operational',
    },
    {
      itemNo: 22,
      title: 'Insurance',
      description: [
        'Is the hotel comprehensively insured under public liability insurance policy?',
      ],
      complianceRequirements: [
        'Property properly insured',
        'Copy of insurance contract available',
      ],
      requiresCopyUpload: true,
      uploadLabel: 'Upload Insurance Policy',
      uploadType: UploadTypes.INSURANCE_DOCS,
      evidenceCategory: 'document',
      category: 'operational',
    },
  ];

  private fb = inject(FormBuilder);
  private assessmentRequestService = inject(AssessmentRequestService);

  ngOnInit(): void {
    this.initializeForm();
    if (this.hotelData) {
      this.populateFormWithHotelData();
    }
  }

  initializeForm(): void {
    // Initialize facility info group
    this.facilityInfoGroup = this.fb.group({
      facilityName: ['', Validators.required],
      facilityType: ['', Validators.required],
      description: [''],
      contactPerson: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', Validators.required],
      address: ['', Validators.required],
      requestedDate: ['', Validators.required],
    });

    // Initialize essential items group
    const essentialItemsControls = {};
    this.essentialItems.forEach((item) => {
      essentialItemsControls[`item${item.itemNo}`] = this.fb.group({
        compliance: ['', Validators.required],
        notes: [''],
        evidenceProvided: [false],
        evidenceType: [''],
      });
    });
    this.essentialItemsGroup = this.fb.group(essentialItemsControls);

    // Main form
    this.assessmentForm = this.fb.group({
      facilityInfo: this.facilityInfoGroup,
      essentialItems: this.essentialItemsGroup,
      additionalComments: [''],
      termsAccepted: [false, Validators.requiredTrue],
    });
  }

  populateFormWithHotelData(): void {
    if (this.hotelData) {
      this.facilityInfoGroup.patchValue({
        facilityName: this.hotelData.name || '',
        facilityType: this.hotelData.propertyType || this.hotelData.type || '',
        description: this.hotelData.description || '',
        contactPerson: this.hotelData.contactPerson || '',
        email: this.hotelData.email || '',
        phoneNumber: this.hotelData.phone || '',
        address: this.hotelData.address || '',
      });
    }
  }

  // Category filtering methods
  getLegalItems(): EssentialItem[] {
    return this.essentialItems.filter((item) => item.category === 'legal');
  }

  getHealthSafetyItems(): EssentialItem[] {
    return this.essentialItems.filter(
      (item) => item.category === 'health-safety',
    );
  }

  getFacilitiesItems(): EssentialItem[] {
    return this.essentialItems.filter((item) => item.category === 'facilities');
  }

  getStaffItems(): EssentialItem[] {
    return this.essentialItems.filter((item) => item.category === 'staff');
  }

  getOperationalItems(): EssentialItem[] {
    return this.essentialItems.filter(
      (item) => item.category === 'operational',
    );
  }

  // Status checking methods
  isItemCompliant(itemNo: number): boolean {
    return (
      this.essentialItemsGroup.get(`item${itemNo}.compliance`)?.value ===
      'compliant'
    );
  }

  isItemNonCompliant(itemNo: number): boolean {
    return (
      this.essentialItemsGroup.get(`item${itemNo}.compliance`)?.value ===
      'non-compliant'
    );
  }

  getItemStatusClass(itemNo: number): string {
    const compliance = this.essentialItemsGroup.get(
      `item${itemNo}.compliance`,
    )?.value;
    if (compliance === 'compliant') return 'status-compliant';
    if (compliance === 'non-compliant') return 'status-non-compliant';
    return 'status-pending';
  }

  getItemStatusText(itemNo: number): string {
    const compliance = this.essentialItemsGroup.get(
      `item${itemNo}.compliance`,
    )?.value;
    if (compliance === 'compliant') return 'Compliant';
    if (compliance === 'non-compliant') return 'Non-Compliant';
    return 'Pending';
  }

  // Progress tracking methods
  getCompletionPercentage(): number {
    const totalItems = this.essentialItems.length;
    const completedItems = this.essentialItems.filter(
      (item) =>
        this.essentialItemsGroup.get(`item${item.itemNo}.compliance`)?.value,
    ).length;
    return Math.round((completedItems / totalItems) * 100);
  }

  getProgressColorClass(): string {
    const percentage = this.getCompletionPercentage();
    if (percentage < 50) return 'text-red-600';
    if (percentage < 80) return 'text-amber-600';
    return 'text-green-600';
  }

  getProgressBarClass(): string {
    const percentage = this.getCompletionPercentage();
    if (percentage < 50) return 'progress-low';
    if (percentage < 80) return 'progress-medium';
    return 'progress-high';
  }

  getCategoryCompliance(category: string): string {
    const categoryItems = this.essentialItems.filter(
      (item) => item.category === category,
    );
    const compliantCount = categoryItems.filter(
      (item) =>
        this.essentialItemsGroup.get(`item${item.itemNo}.compliance`)?.value ===
        'compliant',
    ).length;
    return `${compliantCount}/${categoryItems.length}`;
  }

  getCompliantCount(): number {
    return this.essentialItems.filter(
      (item) =>
        this.essentialItemsGroup.get(`item${item.itemNo}.compliance`)?.value ===
        'compliant',
    ).length;
  }

  getNonCompliantCount(): number {
    return this.essentialItems.filter(
      (item) =>
        this.essentialItemsGroup.get(`item${item.itemNo}.compliance`)?.value ===
        'non-compliant',
    ).length;
  }

  getPendingCount(): number {
    return this.essentialItems.filter(
      (item) =>
        !this.essentialItemsGroup.get(`item${item.itemNo}.compliance`)?.value,
    ).length;
  }

  getNonCompliantItems(): EssentialItem[] {
    return this.essentialItems.filter(
      (item) =>
        this.essentialItemsGroup.get(`item${item.itemNo}.compliance`)?.value ===
        'non-compliant',
    );
  }

  // File handling methods
  handleFileUpload(uploadedFiles: UploadedFile[], itemNo: number): void {
    console.log('Files uploaded:', uploadedFiles, 'Item No:', itemNo);

    if (!uploadedFiles || uploadedFiles.length === 0) {
      console.warn('No files provided for item:', itemNo);
      return;
    }

    // Find the item to get its uploadType and evidenceCategory
    const item = this.essentialItems.find((i) => i.itemNo === itemNo);
    if (!item || !item.uploadType) {
      console.warn('No uploadType found for item:', itemNo);
      return;
    }

    const uploadType = item.uploadType;

    // Remove existing files of this type
    this.uploadedFiles = this.uploadedFiles.filter(
      (file) => file.uploadType !== uploadType,
    );

    // Add new files - they already have the uploadType from the file-upload component
    this.uploadedFiles.push(...uploadedFiles);

    // Update form state for evidence
    this.essentialItemsGroup
      .get(`item${itemNo}.evidenceProvided`)
      ?.setValue(true);
    this.essentialItemsGroup
      .get(`item${itemNo}.evidenceType`)
      ?.setValue(item.evidenceCategory || '');

    console.log('Total uploaded files:', this.uploadedFiles.length);
  }

  getTotalUploadedFiles(): number {
    return this.uploadedFiles.length;
  }

  getFilesByType(uploadType: string): UploadedFile[] {
    return this.uploadedFiles.filter((file) => file.uploadType === uploadType);
  }

  clearUploadedFiles(): void {
    this.uploadedFiles = [];
  }

  // Form submission
  async onSubmit(): Promise<void> {
    if (this.assessmentForm.valid) {
      // Validate that required uploads are present
      const missingUploads = this.validateRequiredUploads();
      if (missingUploads.length > 0) {
        const itemNumbers = missingUploads.map(item => item.itemNo).join(', ');
        console.error('Missing required uploads for items:', itemNumbers);
        alert(`Please upload required documents for the following items:\n\nItems: ${itemNumbers}\n\n${missingUploads.map(item => `Item ${item.itemNo}: ${item.title}`).join('\n')}`);
        return;
      }

      this.isSubmitting = true;

      try {
        const formData = this.assessmentForm.value;

        // Convert uploaded files to backend format
        const documentList = this.uploadedFiles.map((file) => ({
          attachmentId: file.id,
          name: file.name,
          fileSize: file.fileSize,
          uploadType: file.uploadType,
          fileType: file.fileType || 'application/octet-stream',
        }));

        const assessmentRequest: AssessmentRequest = {
          hotelUuid: this.hotelData?.uuid || null,
          facilityInfo: formData.facilityInfo,
          essentialItems: this.mapEssentialItemsData(),
          uploadedDocuments: documentList,
          additionalComments: formData.additionalComments || '',
          termsAccepted: formData.termsAccepted,
          submittedAt: new Date().toISOString(),
          completionPercentage: this.getCompletionPercentage(),
        };

        console.log('Submitting assessment request:', assessmentRequest);

        await lastValueFrom(
          this.assessmentRequestService.submit(assessmentRequest),
        );

        this.formSubmitted.emit(assessmentRequest);
        this.clearUploadedFiles();

        console.log('Assessment request submitted successfully');
      } catch (error) {
        console.error('Error submitting assessment request:', error);
      } finally {
        this.isSubmitting = false;
      }
    } else {
      console.warn('Form is invalid. Please check all required fields.');
      this.markFormGroupTouched(this.assessmentForm);
    }
  }

  private validateRequiredUploads(): EssentialItem[] {
    const missingUploads: EssentialItem[] = [];

    for (const item of this.essentialItems) {
      if (item.requiresCopyUpload && item.uploadType) {
        // Check if this item is marked as compliant
        const compliance = this.essentialItemsGroup.get(`item${item.itemNo}.compliance`)?.value;

        if (compliance === 'compliant') {
          // Check if we have uploaded files for this upload type
          const hasUpload = this.uploadedFiles.some(
            file => file.uploadType === item.uploadType
          );

          if (!hasUpload) {
            missingUploads.push(item);
          }
        }
      }
    }

    return missingUploads;
  }

  private mapEssentialItemsData(): any[] {
    return this.essentialItems.map((item) => {
      const itemData = this.essentialItemsGroup.get(
        `item${item.itemNo}`,
      )?.value;
      return {
        itemNo: item.itemNo,
        title: item.title,
        description: item.description.join(' '),
        complianceRequirements: item.complianceRequirements,
        compliance: itemData?.compliance || 'non-compliant',
        notes: itemData?.notes || '',
        evidenceProvided: itemData?.evidenceProvided || false,
        evidenceType: itemData?.evidenceType || '',
        category: item.category,
      };
    });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  onCancel(): void {
    this.clearUploadedFiles();
    this.formCancelled.emit();
  }

  mapPropertyTypes(types: any[]): any[] {
    return types.map((t) => ({
      id: t,
      label: t
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, (l: string) => l.toUpperCase()),
      value: t,
      name: t,
    }));
  }
}
