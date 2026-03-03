import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { DialogComponent } from 'components/dialog/dialog.component';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TextInputComponent } from 'components/text-field/text-field.component';
import { SelectComponent } from 'components/select/select.component';
import { DatepickerComponent } from 'components/datepicker/datepicker.component';
import { ContainerComponent } from 'components/container/container.component';
import { WrapperComponent } from 'components/wrapper/wrapper.component';
import { AssessorService } from 'modules/assessment/assessor.service';
import { AssessorCertificateService } from 'modules/assessment/assessor-certificate.service';
import { Assessor } from 'modules/assessment/assessment';
import { ToastService } from 'app/toast.service';
import { FileUploadService } from 'components/file-upload/file-upload.service';
import { UploadTypes, UploadedFile } from 'components/file-upload/types';
import { FileUploadComponent } from 'components/file-upload/file-upload.component';
import { ConfirmDialogComponent } from 'components/confirm/confirm.dialog';

@Component({
  selector: 'app-assessor-onboarding-overview',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ContainerComponent,
    WrapperComponent,
    TextInputComponent,
    SelectComponent,
    DatepickerComponent,
    DialogComponent,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatProgressBarModule,
    FileUploadComponent,
    ConfirmDialogComponent,
  ],
  template: `
    <container>
      <!-- Progress Overview -->
      <app-wrapper>
        <div class="max-w-6xl mx-auto">
          <div
            class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-8"
          >
            <div class="flex items-center justify-between mb-4">
              <div>
                <h3 class="text-lg font-semibold text-gray-900">
                  Profile Completion
                </h3>
                <p class="text-sm text-gray-600">
                  {{ completedSections }}/{{ totalSections }} sections completed
                </p>
              </div>
              <div class="text-right">
                <div class="text-2xl font-bold text-blue-600">
                  {{ completionPercentage }}%
                </div>
                <div class="text-xs text-gray-500">Complete</div>
              </div>
            </div>
            <mat-progress-bar
              mode="determinate"
              [value]="completionPercentage"
              class="h-2 rounded-full"
            ></mat-progress-bar>
          </div>

          <!-- Status Message -->
          <div class="mt-6" *ngIf="assessor?.status">
            <div
              class="p-4 rounded-lg border"
              [ngClass]="{
                'bg-yellow-50 border-yellow-200 text-yellow-800':
                  isPendingReview(),
                'bg-red-50 border-red-200 text-red-800':
                  isRejectedApplication(),
                'bg-green-50 border-green-200 text-green-800': isApproved(),
                'bg-blue-50 border-blue-200 text-blue-800':
                  !isPendingReview() &&
                  !isRejectedApplication() &&
                  !isApproved(),
              }"
            >
              <div class="flex items-center">
                <mat-icon class="mr-2">
                  {{
                    isPendingReview()
                      ? 'schedule'
                      : isRejectedApplication()
                        ? 'error'
                        : isApproved()
                          ? 'check_circle'
                          : 'info'
                  }}
                </mat-icon>
                <span class="text-sm font-medium">{{
                  getStatusMessage()
                }}</span>
              </div>
            </div>
          </div>
        </div>
      </app-wrapper>

      <!-- Profile Sections -->
      <app-wrapper>
        <div class="max-w-6xl mx-auto">
          <div
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
          >
            <!-- Personal Information Card -->
            <mat-card
              [class]="
                'relative overflow-hidden transition-all duration-300 transform ' +
                getCardOpacity() +
                ' ' +
                getCardCursor() +
                (isPendingReview()
                  ? ''
                  : ' hover:shadow-lg hover:-translate-y-1')
              "
              (click)="navigateToSection('personal')"
            >
              <div
                class="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 transform rotate-45 translate-x-8 -translate-y-8"
              ></div>

              <mat-card-content class="p-6">
                <div class="flex items-start justify-between mb-4">
                  <div
                    class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center"
                  >
                    <mat-icon class="text-blue-600">person</mat-icon>
                  </div>
                  <div class="flex items-center">
                    <mat-icon
                      class="text-green-500 text-xl"
                      *ngIf="sections[0]?.completed"
                      >check_circle</mat-icon
                    >
                    <mat-icon
                      class="text-orange-500 text-xl"
                      *ngIf="!sections[0]?.completed && hasStartedSection(0)"
                      >schedule</mat-icon
                    >
                    <mat-icon
                      class="text-gray-400 text-xl"
                      *ngIf="!sections[0]?.completed && !hasStartedSection(0)"
                      >radio_button_unchecked</mat-icon
                    >
                  </div>
                </div>

                <h3 class="text-lg font-semibold text-gray-900 mb-2">
                  Personal Information
                </h3>
                <p class="text-sm text-gray-600 mb-4">
                  Basic details, photo, ID and location
                </p>

                <div class="flex items-center justify-between">
                  <span
                    class="text-xs px-2 py-1 rounded-full"
                    [class]="
                      sections[0]?.completed
                        ? 'bg-green-100 text-green-700'
                        : 'bg-orange-100 text-orange-700'
                    "
                  >
                    {{ sections[0]?.completed ? 'Complete' : 'In Progress' }}
                  </span>
                  <div class="text-sm text-gray-500">
                    {{ getFieldCompletionText(0) }}
                  </div>
                </div>
              </mat-card-content>
            </mat-card>

            <!-- Academic Qualifications Card -->
            <mat-card
              [class]="
                'relative overflow-hidden transition-all duration-300 transform ' +
                getCardOpacity() +
                ' ' +
                getCardCursor() +
                (isPendingReview()
                  ? ''
                  : ' hover:shadow-lg hover:-translate-y-1')
              "
              (click)="navigateToSection('education')"
            >
              <div
                class="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 transform rotate-45 translate-x-8 -translate-y-8"
              ></div>

              <mat-card-content class="p-6">
                <div class="flex items-start justify-between mb-4">
                  <div
                    class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center"
                  >
                    <mat-icon class="text-green-600">school</mat-icon>
                  </div>
                  <div class="flex items-center">
                    <mat-icon
                      class="text-green-500 text-xl"
                      *ngIf="sections[1]?.completed"
                      >check_circle</mat-icon
                    >
                    <mat-icon
                      class="text-orange-500 text-xl"
                      *ngIf="!sections[1]?.completed && hasStartedSection(1)"
                      >schedule</mat-icon
                    >
                    <mat-icon
                      class="text-gray-400 text-xl"
                      *ngIf="!sections[1]?.completed && !hasStartedSection(1)"
                      >radio_button_unchecked</mat-icon
                    >
                  </div>
                </div>

                <h3 class="text-lg font-semibold text-gray-900 mb-2">
                  Academic Qualifications
                </h3>
                <p class="text-sm text-gray-600 mb-4">
                  Education background and levels
                </p>

                <div class="flex items-center justify-between">
                  <span
                    class="text-xs px-2 py-1 rounded-full"
                    [class]="
                      sections[1]?.completed
                        ? 'bg-green-100 text-green-700'
                        : 'bg-orange-100 text-orange-700'
                    "
                  >
                    {{ sections[1]?.completed ? 'Complete' : 'In Progress' }}
                  </span>
                  <div class="text-sm text-gray-500">
                    {{ getFieldCompletionText(1) }}
                  </div>
                </div>
              </mat-card-content>
            </mat-card>

            <!-- Work Experience Card -->
            <mat-card
              class="relative overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              (click)="navigateToSection('employment')"
            >
              <div
                class="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-400 to-purple-600 transform rotate-45 translate-x-8 -translate-y-8"
              ></div>

              <mat-card-content class="p-6">
                <div class="flex items-start justify-between mb-4">
                  <div
                    class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center"
                  >
                    <mat-icon class="text-purple-600">work</mat-icon>
                  </div>
                  <div class="flex items-center">
                    <mat-icon
                      class="text-green-500 text-xl"
                      *ngIf="sections[2]?.completed"
                      >check_circle</mat-icon
                    >
                    <mat-icon
                      class="text-orange-500 text-xl"
                      *ngIf="!sections[2]?.completed && hasStartedSection(2)"
                      >schedule</mat-icon
                    >
                    <mat-icon
                      class="text-gray-400 text-xl"
                      *ngIf="!sections[2]?.completed && !hasStartedSection(2)"
                      >radio_button_unchecked</mat-icon
                    >
                  </div>
                </div>

                <h3 class="text-lg font-semibold text-gray-900 mb-2">
                  Work Experience
                </h3>
                <p class="text-sm text-gray-600 mb-4">
                  Employment history and experience
                </p>

                <div class="flex items-center justify-between">
                  <span
                    class="text-xs px-2 py-1 rounded-full"
                    [class]="
                      sections[2]?.completed
                        ? 'bg-green-100 text-green-700'
                        : 'bg-orange-100 text-orange-700'
                    "
                  >
                    {{ sections[2]?.completed ? 'Complete' : 'In Progress' }}
                  </span>
                  <div class="text-sm text-gray-500">
                    {{ getFieldCompletionText(2) }}
                  </div>
                </div>
              </mat-card-content>
            </mat-card>

            <!-- Professional Certifications Card -->
            <mat-card
              class="relative overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              (click)="navigateToSection('certifications')"
            >
              <div
                class="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-indigo-400 to-indigo-600 transform rotate-45 translate-x-8 -translate-y-8"
              ></div>

              <mat-card-content class="p-6">
                <div class="flex items-start justify-between mb-4">
                  <div
                    class="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center"
                  >
                    <mat-icon class="text-indigo-600">verified</mat-icon>
                  </div>
                  <div class="flex items-center">
                    <mat-icon
                      class="text-green-500 text-xl"
                      *ngIf="sections[3]?.completed"
                      >check_circle</mat-icon
                    >
                    <mat-icon
                      class="text-orange-500 text-xl"
                      *ngIf="!sections[3]?.completed && hasStartedSection(3)"
                      >schedule</mat-icon
                    >
                    <mat-icon
                      class="text-gray-400 text-xl"
                      *ngIf="!sections[3]?.completed && !hasStartedSection(3)"
                      >radio_button_unchecked</mat-icon
                    >
                  </div>
                </div>

                <h3 class="text-lg font-semibold text-gray-900 mb-2">
                  Professional Certifications
                </h3>
                <p class="text-sm text-gray-600 mb-4">
                  Career certifications and credentials
                </p>

                <div class="flex items-center justify-between">
                  <span
                    class="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700"
                  >
                    Optional
                  </span>
                  <div class="text-sm text-gray-500">
                    {{ getFieldCompletionText(3) }}
                  </div>
                </div>
              </mat-card-content>
            </mat-card>

            <!-- Professional References Card -->
            <mat-card
              class="relative overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              (click)="navigateToSection('references')"
            >
              <div
                class="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-teal-400 to-teal-600 transform rotate-45 translate-x-8 -translate-y-8"
              ></div>

              <mat-card-content class="p-6">
                <div class="flex items-start justify-between mb-4">
                  <div
                    class="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center"
                  >
                    <mat-icon class="text-teal-600">contacts</mat-icon>
                  </div>
                  <div class="flex items-center">
                    <mat-icon
                      class="text-green-500 text-xl"
                      *ngIf="sections[4]?.completed"
                      >check_circle</mat-icon
                    >
                    <mat-icon
                      class="text-orange-500 text-xl"
                      *ngIf="!sections[4]?.completed && hasStartedSection(4)"
                      >schedule</mat-icon
                    >
                    <mat-icon
                      class="text-gray-400 text-xl"
                      *ngIf="!sections[4]?.completed && !hasStartedSection(4)"
                      >radio_button_unchecked</mat-icon
                    >
                  </div>
                </div>

                <h3 class="text-lg font-semibold text-gray-900 mb-2">
                  Professional References
                </h3>
                <p class="text-sm text-gray-600 mb-4">
                  Referees and recommendations
                </p>

                <div class="flex items-center justify-between">
                  <span
                    class="text-xs px-2 py-1 rounded-full"
                    [class]="
                      sections[4]?.completed
                        ? 'bg-green-100 text-green-700'
                        : 'bg-orange-100 text-orange-700'
                    "
                  >
                    {{ sections[4]?.completed ? 'Complete' : 'In Progress' }}
                  </span>
                  <div class="text-sm text-gray-500">
                    {{ getFieldCompletionText(4) }}
                  </div>
                </div>
              </mat-card-content>
            </mat-card>

            <!-- Assessment Preferences Card -->
            <mat-card
              class="relative overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              (click)="navigateToSection('preferences')"
            >
              <div
                class="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 transform rotate-45 translate-x-8 -translate-y-8"
              ></div>

              <mat-card-content class="p-6">
                <div class="flex items-start justify-between mb-4">
                  <div
                    class="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center"
                  >
                    <mat-icon class="text-orange-600">tune</mat-icon>
                  </div>
                  <div class="flex items-center">
                    <mat-icon
                      class="text-green-500 text-xl"
                      *ngIf="sections[5]?.completed"
                      >check_circle</mat-icon
                    >
                    <mat-icon
                      class="text-orange-500 text-xl"
                      *ngIf="!sections[5]?.completed && hasStartedSection(5)"
                      >schedule</mat-icon
                    >
                    <mat-icon
                      class="text-gray-400 text-xl"
                      *ngIf="!sections[5]?.completed && !hasStartedSection(5)"
                      >radio_button_unchecked</mat-icon
                    >
                  </div>
                </div>

                <h3 class="text-lg font-semibold text-gray-900 mb-2">
                  Assessment Preferences
                </h3>
                <p class="text-sm text-gray-600 mb-4">
                  Types of establishments
                </p>

                <div class="flex items-center justify-between">
                  <span
                    class="text-xs px-2 py-1 rounded-full"
                    [class]="
                      sections[5]?.completed
                        ? 'bg-green-100 text-green-700'
                        : 'bg-orange-100 text-orange-700'
                    "
                  >
                    {{ sections[5]?.completed ? 'Complete' : 'In Progress' }}
                  </span>
                  <div class="text-sm text-gray-500">
                    {{ getFieldCompletionText(5) }}
                  </div>
                </div>
              </mat-card-content>
            </mat-card>

            <!-- Supporting Certificates Card -->
            <mat-card
              class="relative overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              (click)="navigateToSection('certificates')"
            >
              <div
                class="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 transform rotate-45 translate-x-8 -translate-y-8"
              ></div>

              <mat-card-content class="p-6">
                <div class="flex items-start justify-between mb-4">
                  <div
                    class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center"
                  >
                    <mat-icon class="text-blue-600">verified_user</mat-icon>
                  </div>
                  <div class="flex items-center">
                    <mat-icon
                      class="text-green-500 text-xl"
                      *ngIf="sections[6]?.completed"
                      >check_circle</mat-icon
                    >
                    <mat-icon
                      class="text-orange-500 text-xl"
                      *ngIf="!sections[6]?.completed && hasStartedSection(6)"
                      >schedule</mat-icon
                    >
                    <mat-icon
                      class="text-gray-400 text-xl"
                      *ngIf="!sections[6]?.completed && !hasStartedSection(6)"
                      >radio_button_unchecked</mat-icon
                    >
                  </div>
                </div>

                <h3 class="text-lg font-semibold text-gray-900 mb-2">
                  Supporting Certificates
                </h3>
                <p class="text-sm text-gray-600 mb-4">
                  Upload certificates and supporting documents
                </p>

                <div class="flex items-center justify-between">
                  <span
                    class="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700"
                  >
                    Optional
                  </span>
                  <div class="text-sm text-gray-500">
                    {{ getFieldCompletionText(6) }}
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </div>
      </app-wrapper>

      <!-- Submit Section -->
      <app-wrapper>
        <div class="max-w-6xl mx-auto">
          <div
            class="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6"
          >
            <div class="flex items-center justify-between">
              <div class="flex space-x-3">
                <button
                  mat-button
                  class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 mr-3"
                  (click)="previewProfile()"
                >
                  Preview Profile
                </button>
                <button
                  mat-raised-button
                  color="primary"
                  class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  [disabled]="!canSubmit"
                  (click)="openSubmitDialog()"
                >
                  {{ getSubmitButtonText() }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </app-wrapper>

      <!-- Quick Certificate Upload Dialog -->
      <app-dialog
        [open]="showCertificateDialog"
        [title]="'Quick Certificate Upload'"
        width="500px"
        headerBgColor="bg-gray-100"
        headerTextColor="text-gray-900"
        (onClose)="onCertificateDialogClose($event)"
      >
        <ng-template>
          <div class="p-6">
            <p class="text-sm text-gray-600 mb-4">
              Quickly upload a certificate. You can add more details later.
            </p>

            <form [formGroup]="quickCertificateForm" class="space-y-4">
              <app-text-input
                label="Certificate Name"
                [formControl]="quickCertificateForm.get('certificateName')"
                [required]="true"
                placeholder="e.g., Project Management Professional (PMP)"
              />

              <app-text-input
                label="Issuing Authority"
                [formControl]="quickCertificateForm.get('issuingAuthority')"
                [required]="true"
                placeholder="e.g., PMI, Google, Microsoft"
              />

              <app-select
                label="Certificate Type"
                [formControl]="quickCertificateForm.get('certificateType')"
                [options]="certificateTypeOptions"
                [required]="true"
              />

              <app-datepicker
                label="Issue Date"
                [formControl]="quickCertificateForm.get('issueDate')"
                [required]="true"
              />
              <file-upload
                label=" Upload certificate file (optional)"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                [multiple]="false"
                [autoUpload]="true"
                [uploadType]="uploadType.ASSESSOR_CERTIFICATE"
                (onSuccess)="handleFileUploaded($event, 'ASSESSOR_CERTIFICATE')"
              />

              <div
                *ngIf="selectedCertificateFile"
                class="bg-gray-50 rounded-lg p-3"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center">
                    <mat-icon class="text-gray-500 mr-2">description</mat-icon>
                    <span class="text-sm">{{
                      selectedCertificateFile.name
                    }}</span>
                  </div>
                  <button
                    mat-icon-button
                    (click)="removeSelectedCertificateFile()"
                    class="text-red-500 hover:bg-red-50"
                  >
                    <mat-icon>close</mat-icon>
                  </button>
                </div>
              </div>
            </form>

            <div
              class="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200"
            >
              <button
                mat-button
                (click)="cancelCertificateDialog()"
                class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                mat-raised-button
                color="primary"
                (click)="saveQuickCertificate()"
                [disabled]="quickCertificateForm.invalid"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save Certificate
              </button>
            </div>
          </div>
        </ng-template>
      </app-dialog>

      <!-- Submit Confirmation Dialog -->
      <app-confirm-dialog
        [open]="isSubmitDialogOpen"
        [title]="getSubmitButtonText()"
        [message]="getSubmitConfirmationMessage()"
        (onClose)="closeSubmitDialog($event)"
        (onConfirm)="handleSubmitConfirm()"
      />
    </container>
  `,
  styles: [
    `
      .mat-mdc-card {
        @apply shadow-sm border border-gray-100;
      }

      .mat-mdc-card:hover {
        @apply shadow-xl;
      }

      .mat-mdc-progress-bar {
        @apply rounded-full;
      }

      .mat-mdc-progress-bar .mdc-linear-progress__bar-inner {
        @apply bg-gradient-to-r from-blue-500 to-indigo-600;
      }
    `,
  ],
})
export class AssessorOnboardingOverviewComponent implements OnInit {
  assessor: Assessor | undefined = undefined;
  isSubmitDialogOpen = false;
  assessorData: any = {};
  sections: any[] = [];
  completedSections = 0;
  totalSections = 7;
  completionPercentage = 0;
  showCertificateDialog = false;
  quickCertificateForm: FormGroup;
  selectedCertificateFile: File | null = null;
  uploadedFiles: UploadedFile[] = [];
  protected readonly uploadType = UploadTypes;

  certificateTypeOptions = [
    { value: 'ACADEMIC', label: 'Academic Certificate' },
    { value: 'PROFESSIONAL', label: 'Professional Certificate' },
    { value: 'TRAINING', label: 'Training Certificate' },
    { value: 'LICENSE', label: 'License/Permit' },
  ];

  constructor(
    private router: Router,
    private assessorService: AssessorService,
    private certificateService: AssessorCertificateService,
    private fileUploadService: FileUploadService,
    private toast: ToastService,
    private fb: FormBuilder,
  ) {
    this.quickCertificateForm = this.fb.group({
      certificateName: ['', Validators.required],
      issuingAuthority: ['', Validators.required],
      certificateType: ['', Validators.required],
      issueDate: ['', Validators.required],
      assessorId: [null],
    });
  }

  ngOnInit(): void {
    this.loadAssessorData();
  }

  loadAssessorData(): void {
    this.assessorService.getCurrentUserAssessorData().subscribe({
      next: (response) => {
        const data = response.data;
        this.assessor = data.assessor || data;
        this.assessorData = data;

        // Set certificates from the DTO structure
        this.assessorData.certificates = data.certificateList || [];

        // Initialize sections and calculate progress
        this.loadCertificates();
      },
      error: (error) => {
        console.error('Error loading assessor data:', error);
        this.initializeSections(); // Initialize with empty data
      },
    });
  }

  loadCertificates(): void {
    // Certificates are now loaded as part of loadAssessorData()
    // from the /current-user endpoint, so no separate API call needed
    this.initializeSections();
    this.calculateProgress();
  }

  initializeSections(): void {
    this.sections = [
      {
        id: 'personal',
        title: 'Personal Information',
        completed: this.isPersonalInfoComplete(),
        required: true,
      },
      {
        id: 'education',
        title: 'Academic Qualifications',
        completed: this.isEducationComplete(),
        required: true,
      },
      {
        id: 'employment',
        title: 'Work Experience',
        completed: this.isEmploymentComplete(),
        required: true,
      },
      {
        id: 'certifications',
        title: 'Professional Certifications',
        completed: this.isCertificationsComplete(),
        required: false,
      },
      {
        id: 'references',
        title: 'Professional References',
        completed: this.isReferencesComplete(),
        required: true,
      },
      {
        id: 'preferences',
        title: 'Assessment Preferences',
        completed: this.isPreferencesComplete(),
        required: true,
      },
      {
        id: 'certificates',
        title: 'Supporting Certificates',
        completed: this.isCertificatesComplete(),
        required: false,
      },
    ];
  }

  isPersonalInfoComplete(): boolean {
    if (!this.assessor) return false;

    const requiredFields = [
      'firstName',
      'lastName',
      'email',
      'phone',
      'dob',
      'sex',
      'title',
      'identificationType',
      'identificationId',
      'locationId',
    ];

    return requiredFields.every((field) => {
      const value = this.assessor![field as keyof Assessor];
      return value !== null && value !== undefined && value !== '';
    });
  }

  isEducationComplete(): boolean {
    return (
      this.assessorData.educationBackgroundList &&
      this.assessorData.educationBackgroundList.length > 0
    );
  }

  isEmploymentComplete(): boolean {
    return (
      this.assessorData.employmentHistoryDtoList &&
      this.assessorData.employmentHistoryDtoList.length > 0
    );
  }

  isCertificationsComplete(): boolean {
    return (
      this.assessorData.certificationDtoList &&
      this.assessorData.certificationDtoList.length > 0
    );
  }

  isReferencesComplete(): boolean {
    return (
      this.assessorData.referenceDtoList &&
      this.assessorData.referenceDtoList.length > 0
    );
  }

  isPreferencesComplete(): boolean {
    return (
      this.assessorData.preferenceDtoList &&
      this.assessorData.preferenceDtoList.length > 0
    );
  }

  isCertificatesComplete(): boolean {
    return (
      this.assessorData.certificates &&
      this.assessorData.certificates.length > 0
    );
  }

  calculateProgress(): void {
    this.completedSections = this.sections.filter((s) => s.completed).length;
    this.completionPercentage = Math.round(
      (this.completedSections / this.totalSections) * 100,
    );
  }

  navigateToSection(sectionId: string): void {
    if (!this.canSubmit && sectionId !== 'personal') {
      const message = `You cannot edit ${this.assessor.status} profiles`;
      this.toast.info(message);
      return;
    }

    if (sectionId === 'certificates') {
      this.openCertificateDialog();
    } else {
      this.router.navigate(['/assessor/onboarding', sectionId]);
    }
  }

  hasStartedSection(index: number): boolean {
    if (!this.assessor) {
      return index !== 0
        ? false
        : !!this.assessorData.firstName ||
            !!this.assessorData.lastName ||
            !!this.assessorData.email ||
            !!this.assessorData.phone;
    }

    switch (index) {
      case 0: // Personal
        return (
          !!this.assessor.firstName ||
          !!this.assessor.lastName ||
          !!this.assessor.email ||
          !!this.assessor.phone
        );
      case 1: // Education
        return (
          this.assessorData.educationBackgroundList &&
          this.assessorData.educationBackgroundList.length > 0
        );
      case 2: // Employment
        return (
          this.assessorData.employmentHistoryDtoList &&
          this.assessorData.employmentHistoryDtoList.length > 0
        );
      case 3: // Certifications
        return (
          this.assessorData.certificationDtoList &&
          this.assessorData.certificationDtoList.length > 0
        );
      case 4: // References
        return (
          this.assessorData.referenceDtoList &&
          this.assessorData.referenceDtoList.length > 0
        );
      case 5: // Preferences
        return (
          this.assessorData.preferenceDtoList &&
          this.assessorData.preferenceDtoList.length > 0
        );
      case 6: // Certificates
        return (
          this.assessorData.certificates &&
          this.assessorData.certificates.length > 0
        );
      default:
        return false;
    }
  }

  getFieldCompletionText(sectionIndex: number): string {
    switch (sectionIndex) {
      case 0: // Personal
        const completedFields = this.getCompletedPersonalFields();
        return `${completedFields}/10 fields`;
      case 1: // Education
        const educationCount =
          this.assessorData.educationBackgroundList?.length || 0;
        return `${educationCount} qualification${educationCount !== 1 ? 's' : ''}`;
      case 2: // Employment
        const employmentCount =
          this.assessorData.employmentHistoryDtoList?.length || 0;
        return `${employmentCount} position${employmentCount !== 1 ? 's' : ''}`;
      case 3: // Certifications
        const certificationCount =
          this.assessorData.certificationDtoList?.length || 0;
        return `${certificationCount} certification${certificationCount !== 1 ? 's' : ''}`;
      case 4: // References
        const referenceCount = this.assessorData.referenceDtoList?.length || 0;
        return `${referenceCount} reference${referenceCount !== 1 ? 's' : ''}`;
      case 5: // Preferences
        const preferenceCount =
          this.assessorData.preferenceDtoList?.length || 0;
        return `${preferenceCount} selected`;
      case 6: // Certificates
        const certificateCount = this.assessorData.certificates?.length || 0;
        return `${certificateCount} certificate${certificateCount !== 1 ? 's' : ''}`;
      default:
        return '';
    }
  }

  private getCompletedPersonalFields(): number {
    if (!this.assessor) return 0;

    const fields = [
      'firstName',
      'lastName',
      'email',
      'phone',
      'dob',
      'sex',
      'title',
      'identificationType',
      'identificationId',
      'locationId',
    ];

    return fields.filter((field) => {
      const value = this.assessor![field as keyof Assessor];
      return value !== null && value !== undefined && value !== '';
    }).length;
  }

  quickComplete(): void {
    // Implementation for quick complete
    console.log('Quick complete');
  }

  importProfile(): void {
    // Implementation for import profile
    console.log('Import profile');
  }

  saveDraft(): void {
    // Implementation for save draft
    console.log('Save draft');
  }

  canSubmitApplication(): boolean {
    const allowableStates = ['DRAFT', 'REJECTED'];
    return allowableStates.includes(this.assessor?.status);
  }

  get canSubmit(): boolean {
    const allowedStates = ['DRAFT', 'REJECTED'];

    if (this.assessor?.status) {
      return allowedStates.includes(this.assessor?.status);
    }

    // Only allow submission when all required sections are completed (100%)
    const requiredSections = this.sections.filter((s) => s.required);
    const completedRequiredSections = requiredSections.filter(
      (s) => s.completed,
    );
    return completedRequiredSections.length === requiredSections.length;
  }

  previewProfile(): void {
    this.router.navigate(['/assessor/onboarding/preview']);
  }

  openSubmitDialog(): void {
    this.isSubmitDialogOpen = true;
  }

  closeSubmitDialog(event: any): void {
    this.isSubmitDialogOpen = false;
  }

  handleSubmitConfirm(): void {
    this.submitProfile();
  }

  submitProfile(): void {
    if (this.canSubmit) {
      this.assessorService.submitApplication().subscribe({
        next: (response) => {
          this.toast.success(
            this.isRejectedApplication()
              ? 'Application re-submitted for approval successfully!'
              : 'Application submitted for approval successfully!',
          );
          // Refresh the assessor data to reflect the new status
          this.loadAssessorData();
        },
        error: (error) => {
          console.error('Error submitting application:', error);
          this.toast.error('Failed to submit application');
        },
      });
    } else {
      this.toast.error(
        'Please complete all required sections before submitting.',
      );
    }
  }

  getSubmitButtonText(): string {
    return this.isRejectedApplication() ? 'Re-submit' : 'Submit for Approval';
  }

  getSubmitConfirmationMessage(): string {
    if (this.isRejectedApplication()) {
      return 'Are you sure you want to re-submit your application for approval? This will update your application status and notify the administrators.';
    }
    return 'Are you sure you want to submit your application for approval? Once submitted, you will not be able to make changes until the review is complete.';
  }

  isRejectedApplication(): boolean {
    return (
      this.assessor?.status === 'REJECTED' ||
      this.assessor?.status === 'Rejected'
    );
  }

  isPendingReview(): boolean {
    return (
      this.assessor?.status === 'PENDING' ||
      this.assessor?.status === 'Pending' ||
      this.assessor?.status === 'SUBMITTED'
    );
  }

  isApproved(): boolean {
    return (
      this.assessor?.status === 'APPROVED' ||
      this.assessor?.status === 'Approved'
    );
  }

  getStatusMessage(): string {
    if (this.isPendingReview()) {
      return 'Your application is currently under review. You will be notified once the review is complete.';
    }
    if (this.isRejectedApplication()) {
      return 'Your application was rejected. Please review the feedback and resubmit.';
    }
    if (this.isApproved()) {
      return 'Congratulations! Your application has been approved.';
    }
    return 'Complete all required sections to submit your application for approval.';
  }

  getCardOpacity(): string {
    return this.isPendingReview() ? 'opacity-60' : 'opacity-100';
  }

  getCardCursor(): string {
    return this.isPendingReview() ? 'cursor-not-allowed' : 'cursor-pointer';
  }

  // Certificate Dialog Methods
  openCertificateDialog(): void {
    this.quickCertificateForm.reset();
    this.quickCertificateForm.patchValue({ assessorId: this.assessor?.id });
    this.selectedCertificateFile = null;
    this.showCertificateDialog = true;
  }

  onCertificateFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        this.toast.error('File size must be less than 10MB');
        return;
      }
      this.selectedCertificateFile = file;
    }
  }

  removeSelectedCertificateFile(): void {
    this.selectedCertificateFile = null;
  }

  saveQuickCertificate(): void {
    const certificateData = {
      ...this.quickCertificateForm.value,
      fileUploadId: this.uploadedFiles[0].id,
    };

    this.certificateService.create(certificateData).subscribe({
      next: (response) => {
        this.toast.success('Certificate and file uploaded successfully');
        this.loadAssessorData(); // Refresh all assessor data including certificates
        this.cancelCertificateDialog();
      },
      error: (error) => {
        console.error('Error creating certificate:', error);
        this.toast.error('Failed to create certificate');
      },
    });
  }

  cancelCertificateDialog(): void {
    this.showCertificateDialog = false;
    this.quickCertificateForm.reset();
    this.selectedCertificateFile = null;
  }

  openFullCertificateForm(): void {
    this.cancelCertificateDialog();
    this.router.navigate(['/assessor/onboarding/certificates']);
  }

  onCertificateDialogClose(result: any): void {
    this.showCertificateDialog = false;
    if (!result) {
      this.cancelCertificateDialog();
    }
  }

  handleFileUploaded(uploadedFiles: UploadedFile[], uploadType: string) {
    console.log('Files uploaded:', uploadedFiles, 'Type:', uploadType);

    // Remove any existing files of this type
    this.uploadedFiles = this.uploadedFiles.filter(
      (file) => file.uploadType !== uploadType,
    );

    // Add new files of this type
    if (uploadedFiles && uploadedFiles.length > 0) {
      this.uploadedFiles.push(...uploadedFiles);
    }

    console.log('Total uploaded files:', this.uploadedFiles);
  }
}
