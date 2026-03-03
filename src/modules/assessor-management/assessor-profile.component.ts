import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import {
  heroCog6Tooth,
  heroMagnifyingGlass,
  heroPencilSquare,
  heroTrash,
} from '@ng-icons/heroicons/outline';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AssessorService } from 'modules/assessment/assessor.service';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  AssessorDocument,
  AssessorProfile,
} from 'modules/assessment/assessment';
import { ContainerComponent } from 'components/container/container.component';
import { WrapperComponent } from 'components/wrapper/wrapper.component';
import { AsyncPipe, DatePipe, NgClass, NgForOf, NgIf } from '@angular/common';
import { HeaderComponent } from 'components/header/header.component';
import { DomSanitizer } from '@angular/platform-browser';
import { AssessorProgressComponent } from 'modules/my-profile/assessor-progress.component';
import { DialogComponent } from 'components/dialog/dialog.component';
import { PdfViewerDialogComponent } from 'modules/my-profile/pdf-viewer';
import { AssessorRejectionFormComponent } from 'modules/assessor-management/assessor-rejection-form.component';
import { AssessorApprovalFormComponent } from 'modules/assessor-management/assessor-approval-form.component';
import { ProfilePictureComponent } from 'components/profile-picture/profile-picture.component';
import { ToastService } from 'app/toast.service';

@Component({
  selector: 'app-assessor-profile',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatDividerModule,
    FormsModule,
    ReactiveFormsModule,
    ContainerComponent,
    WrapperComponent,
    AsyncPipe,
    HeaderComponent,
    NgForOf,
    NgIf,
    DatePipe,
    AssessorProgressComponent,
    DialogComponent,
    PdfViewerDialogComponent,
    AssessorRejectionFormComponent,
    AssessorApprovalFormComponent,
    NgClass,
    ProfilePictureComponent,
  ],
  viewProviders: [
    provideIcons({
      heroCog6Tooth,
      heroPencilSquare,
      heroTrash,
      heroMagnifyingGlass,
    }),
  ],
  template: `
    <container *ngIf="getProfile() | async as profile">
      <!-- Enhanced Profile Header -->
      <app-wrapper>
        <mat-card class="mb-8 overflow-hidden w-full shadow-lg">
          <div
            class="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-8 relative"
          >
            <div class="absolute inset-0 bg-black opacity-10"></div>
            <div class="relative z-10 flex items-start space-x-8">
              <div class="flex-shrink-0">
                <app-profile-picture
                  [src]="getProfilePictureSrc(profile)"
                  alt="Professional Profile Photo"
                  size="8rem"
                  [clickable]="false"
                  shadowSize="xl"
                  borderColor="border-white"
                />
              </div>
              <div class="flex-1 min-w-0">
                <h1 class="text-4xl font-bold mb-3">
                  {{ profile.assessor.title }} {{ profile.assessor.firstName }}
                  {{ profile.assessor.lastName }}
                </h1>
                <div class="flex items-center mb-4">
                  <mat-icon class="mr-2">verified_user</mat-icon>
                  <span class="text-xl text-blue-100"
                    >Professional Assessor</span
                  >
                  <span
                    class="ml-4 px-3 py-1 rounded-full text-sm"
                    [ngClass]="{
                      'bg-green-500 bg-opacity-20 text-green-100':
                        profile.assessor.status.toString() === 'APPROVED',
                      'bg-yellow-500 bg-opacity-20 text-yellow-100':
                        profile.assessor.status.toString() === 'PENDING',
                      'bg-red-500 bg-opacity-20 text-red-100':
                        profile.assessor.status.toString() === 'REJECTED',
                    }"
                  >
                    {{ profile.assessor.status }}
                  </span>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div class="flex items-center">
                    <mat-icon class="mr-2 text-blue-200">email</mat-icon>
                    <span class="truncate">{{ profile.assessor.email }}</span>
                  </div>
                  <div class="flex items-center">
                    <mat-icon class="mr-2 text-blue-200">phone</mat-icon>
                    {{ profile.assessor.phone }}
                  </div>
                  <div class="flex items-center">
                    <mat-icon class="mr-2 text-blue-200">location_on</mat-icon>
                    {{ profile.assessor.locationName }}
                  </div>
                  <div class="flex items-center">
                    <mat-icon class="mr-2 text-blue-200">badge</mat-icon>
                    {{ profile.assessor.identificationType }}:
                    {{ profile.assessor.identificationId }}
                  </div>
                </div>
                <div
                  *ngIf="profile.assessor.dateRejected"
                  class="mt-4 p-3 bg-red-500 bg-opacity-20 rounded-lg"
                >
                  <div class="flex items-center text-red-100">
                    <mat-icon class="mr-2">error</mat-icon>
                    <span class="font-semibold">Rejection Reason:</span>
                  </div>
                  <p class="text-red-100 mt-1">
                    {{ profile.assessor.rejectionReason }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </mat-card>
      </app-wrapper>

      <!-- Profile Summary Stats -->
      <app-wrapper>
        <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <mat-card class="text-center p-4">
            <div class="text-2xl font-bold text-green-600">
              {{ profile.educationBackgroundList.length }}
            </div>
            <div class="text-sm text-gray-600">Education</div>
          </mat-card>
          <mat-card class="text-center p-4">
            <div class="text-2xl font-bold text-purple-600">
              {{ profile.employmentHistoryDtoList.length }}
            </div>
            <div class="text-sm text-gray-600">Experience</div>
          </mat-card>
          <mat-card class="text-center p-4">
            <div class="text-2xl font-bold text-indigo-600">
              {{ profile.certificationDtoList.length }}
            </div>
            <div class="text-sm text-gray-600">Certifications</div>
          </mat-card>
          <mat-card class="text-center p-4">
            <div class="text-2xl font-bold text-blue-600">
              {{ profile.documentDtoList.length }}
            </div>
            <div class="text-sm text-gray-600">Documents</div>
          </mat-card>
          <mat-card class="text-center p-4">
            <div class="text-2xl font-bold text-teal-600">
              {{ profile.referenceDtoList.length }}
            </div>
            <div class="text-sm text-gray-600">References</div>
          </mat-card>
        </div>
      </app-wrapper>

      <!-- Progress Component -->
      <app-wrapper>
        <mat-card class="w-full mb-8 shadow-md">
          <mat-card-header class="bg-blue-50">
            <mat-card-title class="flex items-center text-blue-800">
              <mat-icon class="text-blue-600 mr-3">assessment</mat-icon>
              Profile Completion
            </mat-card-title>
          </mat-card-header>
          <mat-card-content class="p-6">
            <app-assessor-progress
              [id]="profile.assessor.id"
              [showButton]="false"
            ></app-assessor-progress>
          </mat-card-content>
        </mat-card>
      </app-wrapper>

      <!-- Academic Qualifications -->
      <app-wrapper>
        <mat-card class="w-full mb-8 shadow-md">
          <mat-card-header class="bg-green-50">
            <mat-card-title class="flex items-center text-green-800">
              <mat-icon class="text-green-600 mr-3">school</mat-icon>
              Academic Qualifications
            </mat-card-title>
          </mat-card-header>
          <mat-card-content class="p-6">
            <div
              *ngIf="profile.educationBackgroundList.length === 0"
              class="text-center py-8 text-gray-500"
            >
              <mat-icon class="text-6xl text-gray-300 mb-4">school</mat-icon>
              <p>No academic qualifications added</p>
            </div>
            <div class="space-y-6">
              <div
                *ngFor="let qualification of profile.educationBackgroundList"
                class="bg-white border border-green-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <h4 class="text-lg font-bold text-gray-900 mb-1">
                      {{ qualification.course }}
                    </h4>
                    <p class="text-green-700 font-medium mb-2">
                      {{ qualification.institution }}
                    </p>
                    <div class="flex flex-wrap gap-2 text-sm">
                      <span class="bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        {{ formatDate(qualification.fromDate) }} -
                        {{
                          qualification.toDate
                            ? formatDate(qualification.toDate)
                            : 'Present'
                        }}
                      </span>
                      <span
                        *ngIf="qualification.graduated"
                        class="bg-green-100 text-green-800 px-2 py-1 rounded"
                      >
                        ✓ Graduated
                      </span>
                    </div>
                  </div>
                  <mat-icon class="text-green-500 text-2xl">school</mat-icon>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </app-wrapper>

      <!-- Work Experience -->
      <app-wrapper>
        <mat-card class="w-full mb-8 shadow-md">
          <mat-card-header class="bg-purple-50">
            <mat-card-title class="flex items-center text-purple-800">
              <mat-icon class="text-purple-600 mr-3">work</mat-icon>
              Work Experience
            </mat-card-title>
          </mat-card-header>
          <mat-card-content class="p-6">
            <div
              *ngIf="profile.employmentHistoryDtoList.length === 0"
              class="text-center py-8 text-gray-500"
            >
              <mat-icon class="text-6xl text-gray-300 mb-4">work</mat-icon>
              <p>No work experience added</p>
            </div>
            <div class="space-y-6">
              <div
                *ngFor="let position of profile.employmentHistoryDtoList"
                class="bg-white border border-purple-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <h4 class="text-lg font-bold text-gray-900 mb-1">
                      {{ position.positionHeld }}
                    </h4>
                    <p class="text-purple-700 font-medium mb-2">
                      {{ position.company }}
                    </p>
                    <div class="flex flex-wrap gap-2 text-sm">
                      <span
                        class="bg-purple-100 text-purple-800 px-2 py-1 rounded"
                      >
                        {{ formatDate(position.fromDate) }} -
                        {{
                          position.toDate
                            ? formatDate(position.toDate)
                            : 'Present'
                        }}
                      </span>
                      <span
                        *ngIf="!position.toDate"
                        class="bg-green-100 text-green-800 px-2 py-1 rounded"
                      >
                        Current Position
                      </span>
                    </div>
                  </div>
                  <mat-icon class="text-purple-500 text-2xl">work</mat-icon>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </app-wrapper>

      <!-- Professional Certifications -->
      <app-wrapper>
        <mat-card
          class="w-full mb-8 shadow-md"
          *ngIf="profile.certificationDtoList.length > 0"
        >
          <mat-card-header class="bg-indigo-50">
            <mat-card-title class="flex items-center text-indigo-800">
              <mat-icon class="text-indigo-600 mr-3">verified</mat-icon>
              Professional Certifications
            </mat-card-title>
          </mat-card-header>
          <mat-card-content class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div
                *ngFor="let cert of profile.certificationDtoList"
                class="bg-white border border-indigo-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div class="flex items-start justify-between mb-3">
                  <h4 class="text-lg font-bold text-gray-900">
                    {{ cert.title }}
                  </h4>
                  <mat-icon class="text-indigo-500">verified</mat-icon>
                </div>
                <p class="text-indigo-700 font-medium mb-2">
                  {{ cert.issuer }}
                </p>
                <p class="text-gray-600 text-sm mb-3" *ngIf="cert.description">
                  {{ cert.description }}
                </p>
                <div class="space-y-1 text-xs">
                  <div class="flex justify-between">
                    <span class="text-gray-500">Issued:</span>
                    <span class="font-medium">{{
                      formatDate(cert.issueDate)
                    }}</span>
                  </div>
                  <div class="flex justify-between" *ngIf="cert.expiryDate">
                    <span class="text-gray-500">Expires:</span>
                    <span class="font-medium">{{
                      formatDate(cert.expiryDate)
                    }}</span>
                  </div>
                  <div *ngIf="!cert.expiryDate" class="text-center">
                    <span
                      class="bg-green-100 text-green-800 px-2 py-1 rounded text-xs"
                      >No Expiration</span
                    >
                  </div>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </app-wrapper>

      <!-- Assessment Preferences -->
      <app-wrapper>
        <mat-card class="w-full mb-8 shadow-md">
          <mat-card-header class="bg-orange-50">
            <mat-card-title class="flex items-center text-orange-800">
              <mat-icon class="text-orange-600 mr-3">tune</mat-icon>
              Assessment Preferences
            </mat-card-title>
          </mat-card-header>
          <mat-card-content class="p-6">
            <div
              *ngIf="profile.preferenceDtoList.length === 0"
              class="text-center py-8 text-gray-500"
            >
              <mat-icon class="text-6xl text-gray-300 mb-4">tune</mat-icon>
              <p>No assessment preferences selected</p>
            </div>
            <div class="flex flex-wrap gap-3">
              <span
                *ngFor="let preference of profile.preferenceDtoList"
                class="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full text-sm font-medium shadow-md hover:shadow-lg transition-shadow"
              >
                {{ formatPropertyTypeLabel(preference.preference) }}
              </span>
            </div>
          </mat-card-content>
        </mat-card>
      </app-wrapper>

      <!-- Documents -->
      <app-wrapper>
        <mat-card class="w-full mb-8 shadow-md">
          <mat-card-header class="bg-blue-50">
            <mat-card-title class="flex items-center text-blue-800">
              <mat-icon class="text-blue-600 mr-3">description</mat-icon>
              Uploaded Documents
              <span
                class="ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm"
                >{{ profile.documentDtoList.length }}</span
              >
            </mat-card-title>
          </mat-card-header>
          <mat-card-content class="p-6">
            <div
              *ngIf="profile.documentDtoList.length === 0"
              class="text-center py-8 text-gray-500"
            >
              <mat-icon class="text-6xl text-gray-300 mb-4"
                >description</mat-icon
              >
              <p>No documents uploaded</p>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div
                *ngFor="let doc of profile.documentDtoList"
                class="bg-white border border-blue-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div class="flex items-start justify-between mb-3">
                  <div class="flex-1">
                    <h4 class="text-lg font-bold text-gray-900 mb-1">
                      {{ doc.title }}
                    </h4>
                    <p class="text-blue-700 font-medium mb-2">
                      {{ doc.documentTypeName }}
                    </p>
                    <div class="text-sm text-gray-600">
                      <div class="flex items-center mb-1">
                        <mat-icon class="text-blue-500 mr-1 text-sm"
                          >calendar_today</mat-icon
                        >
                        {{ doc.uploadedAt | date: 'shortDate' }}
                      </div>
                    </div>
                  </div>
                  <div class="flex items-center">
                    <mat-icon class="text-blue-500 mr-1" title="File Attached"
                      >attachment</mat-icon
                    >
                  </div>
                </div>
                <div class="flex gap-2">
                  <button
                    mat-button
                    color="primary"
                    class="text-blue-600 hover:bg-blue-50 text-sm"
                    (click)="openPdfDialog(doc)"
                  >
                    <mat-icon class="mr-1">visibility</mat-icon>
                    View Document
                  </button>
                  <button
                    mat-button
                    color="primary"
                    class="text-blue-600 hover:bg-blue-50 text-sm"
                    (click)="downloadDocument(doc)"
                  >
                    <mat-icon class="mr-1">download</mat-icon>
                    Download
                  </button>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </app-wrapper>

      <!-- Professional References -->
      <app-wrapper>
        <mat-card class="w-full mb-8 shadow-md">
          <mat-card-header class="bg-teal-50">
            <mat-card-title class="flex items-center text-teal-800">
              <mat-icon class="text-teal-600 mr-3">contacts</mat-icon>
              Professional References
            </mat-card-title>
          </mat-card-header>
          <mat-card-content class="p-6">
            <div
              *ngIf="profile.referenceDtoList.length === 0"
              class="text-center py-8 text-gray-500"
            >
              <mat-icon class="text-6xl text-gray-300 mb-4">contacts</mat-icon>
              <p>No professional references added</p>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div
                *ngFor="let reference of profile.referenceDtoList"
                class="bg-white border border-teal-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div class="flex items-start justify-between mb-3">
                  <h4 class="text-lg font-bold text-gray-900">
                    {{ reference.name }}
                  </h4>
                  <mat-icon class="text-teal-500">person</mat-icon>
                </div>
                <p class="text-teal-700 font-medium mb-3">
                  {{ reference.relationship }}
                </p>
                <div class="space-y-2 text-sm">
                  <div class="flex items-center">
                    <mat-icon class="text-teal-500 mr-2 text-sm"
                      >email</mat-icon
                    >
                    <a
                      href="mailto:{{ reference.email }}"
                      class="text-blue-600 hover:underline"
                      >{{ reference.email }}</a
                    >
                  </div>
                  <div class="flex items-center">
                    <mat-icon class="text-teal-500 mr-2 text-sm"
                      >phone</mat-icon
                    >
                    <a
                      href="tel:{{ reference.phone }}"
                      class="text-blue-600 hover:underline"
                      >{{ reference.phone }}</a
                    >
                  </div>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </app-wrapper>

      <!-- Action Section -->
      <app-wrapper>
        <mat-card class="w-full shadow-lg">
          <mat-card-header
            [ngClass]="{
              'bg-yellow-50': isPending,
              'bg-green-50': isApproved,
              'bg-red-50': isRejected,
            }"
          >
            <mat-card-title
              class="flex items-center"
              [ngClass]="{
                'text-yellow-800': isPending,
                'text-green-800': isApproved,
                'text-red-800': isRejected,
              }"
            >
              <mat-icon
                class="mr-3"
                [ngClass]="{
                  'text-yellow-600': isPending,
                  'text-green-600': isApproved,
                  'text-red-600': isRejected,
                }"
              >
                {{
                  isPending ? 'pending' : isApproved ? 'check_circle' : 'cancel'
                }}
              </mat-icon>
              {{ getStatusTitle() }}
            </mat-card-title>
          </mat-card-header>

          <mat-card-content class="p-8">
            <!-- Pending Actions -->
            <div *ngIf="canTakeAction" class="text-center">
              <div *ngIf="isProcessing" class="mb-4">
                <div
                  class="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-lg"
                >
                  <div
                    class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"
                  ></div>
                  Processing request...
                </div>
              </div>
              <p class="text-gray-600 mb-6">
                Review the assessor's profile and decide on their application
                status.
              </p>
              <div class="flex flex-col sm:flex-row justify-center gap-4">
                <button
                  mat-raised-button
                  color="primary"
                  (click)="approveFormOpen = true"
                  [disabled]="isProcessing"
                  class="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <mat-icon class="mr-2">check_circle</mat-icon>
                  Approve Assessor
                </button>
                <button
                  mat-raised-button
                  (click)="rejectFormOpen = true"
                  [disabled]="isProcessing"
                  class="px-8 py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <mat-icon class="mr-2">cancel</mat-icon>
                  Reject Application
                </button>
              </div>
            </div>

            <!-- Approved Status -->
            <div *ngIf="isApproved" class="text-center">
              <div
                class="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4"
              >
                <mat-icon class="text-3xl text-green-600"
                  >check_circle</mat-icon
                >
              </div>
              <h3 class="text-xl font-bold text-green-800 mb-2">
                Application Approved
              </h3>
              <p class="text-gray-600 mb-4">
                This assessor has been verified and approved for assessments.
              </p>
              <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                <div
                  class="flex items-center justify-center text-sm text-green-800"
                >
                  <mat-icon class="mr-2 text-sm">schedule</mat-icon>
                  <span
                    >Approved on
                    {{ profile.assessor.dateVerified | date: 'fullDate' }}</span
                  >
                </div>
              </div>
            </div>

            <!-- Rejected Status -->
            <div *ngIf="isRejected" class="text-center">
              <div
                class="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4"
              >
                <mat-icon class="text-3xl text-red-600">cancel</mat-icon>
              </div>
              <h3 class="text-xl font-bold text-red-800 mb-2">
                Application Rejected
              </h3>
              <p class="text-gray-600 mb-4">
                This application has been rejected and requires revision.
              </p>
              <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                <div
                  class="flex items-center justify-center text-sm text-red-800 mb-2"
                >
                  <mat-icon class="mr-2 text-sm">schedule</mat-icon>
                  <span
                    >Rejected on
                    {{ profile.assessor.dateRejected | date: 'fullDate' }}</span
                  >
                </div>
                <div *ngIf="profile.assessor.rejectionReason" class="text-left">
                  <p class="font-semibold text-red-800 mb-1">
                    Rejection Reason:
                  </p>
                  <p class="text-red-700 text-sm">
                    {{ profile.assessor.rejectionReason }}
                  </p>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </app-wrapper>

      <app-dialog
        [open]="pdfViewerOpen"
        (onClose)="handlePdfViewerClose($event)"
        width="900px"
        title="Document Viewer"
      >
        <ng-template>
          <app-pdf-viewer [base64]="selectedItem.filePath" />
        </ng-template>
      </app-dialog>
      <app-dialog
        [open]="rejectFormOpen"
        (onClose)="handleRejectFormClose($event)"
        width="600px"
        title="Assessor Rejection Form"
      >
        <ng-template>
          <app-assessor-rejection-form
            (onRejectSubmit)="reject($event)"
            [assessor]="profile.assessor"
          ></app-assessor-rejection-form>
        </ng-template>
      </app-dialog>
      <app-dialog
        [open]="approveFormOpen"
        (onClose)="handleApproveFormClose($event)"
        width="600px"
        title="Assessor Approval Form"
      >
        <ng-template>
          <app-assessor-approval-form
            (onApproveSubmit)="approve($event)"
            [assessor]="profile.assessor"
          ></app-assessor-approval-form>
        </ng-template>
      </app-dialog>
    </container>
  `,
})
export class AssessorProfileComponent implements OnInit {
  @Input() uuid: string;
  @Output() onSuccess = new EventEmitter<string>();
  pdfViewerOpen = false;
  approveFormOpen = false;
  rejectFormOpen = false;
  isProcessing = false;
  selectedItem: any;
  profileSubject: BehaviorSubject<AssessorProfile> = new BehaviorSubject(null);

  constructor(
    private assessorService: AssessorService,
    private sanitizer: DomSanitizer,
    private toast: ToastService,
  ) {}

  ngOnInit() {
    this.loadProfile();
  }

  handlePdfViewerClose(result: boolean): void {
    this.pdfViewerOpen = false;
    this.selectedItem = null;
  }

  openPdfDialog(data: AssessorDocument): void {
    this.selectedItem = data;
    this.pdfViewerOpen = true;
  }

  loadProfile() {
    this.assessorService.profile(this.uuid).subscribe({
      next: (res) => {
        this.profileSubject.next(res.data);
      },
      error: (err) => {
        console.error('Failed to load profile', err);
      },
    });
  }

  getProfile(): Observable<AssessorProfile> {
    return this.profileSubject.asObservable();
  }

  cleanPhoto(photo: string): any {
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      'data:image/jpg;base64,' + photo,
    );
  }

  getProfilePictureSrc(profile: AssessorProfile): string | null {
    // Priority 1: Use profilePhoto object if available (new API structure)
    if (profile?.assessor?.profilePhoto?.uuid) {
      return `/api/v1/uploads/${profile.assessor.profilePhoto.uuid}/view`;
    }

    // Priority 2: Use photo field if available (legacy/fallback)
    if (profile?.assessor?.photo) {
      return profile.assessor.photo;
    }

    return null;
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
    });
  }

  formatPropertyTypeLabel(enumValue: string): string {
    return enumValue
      .split('_')
      .map((word) => word.charAt(0) + word.substring(1).toLowerCase())
      .join(' ');
  }

  downloadDocument(doc: AssessorDocument): void {
    // Create a download link for the document
    if (doc.filePath) {
      const link = document.createElement('a');
      link.href = doc.filePath;
      link.download = doc.title || 'document';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  get assessorStatus() {
    const profile = this.profileSubject.value;
    return profile?.assessor?.status?.toString() || 'PENDING';
  }

  get isPending() {
    return this.assessorStatus === 'PENDING' || this.assessorStatus === 'DRAFT';
  }

  get isApproved() {
    const profile = this.profileSubject.value;
    return (
      this.assessorStatus === 'APPROVED' && profile?.assessor?.dateVerified
    );
  }

  get isRejected() {
    const profile = this.profileSubject.value;
    return (
      this.assessorStatus === 'REJECTED' && profile?.assessor?.dateRejected
    );
  }

  get canTakeAction() {
    return this.isPending;
  }

  getStatusTitle(): string {
    if (this.isPending) return 'Pending Review';
    if (this.isApproved) return 'Application Approved';
    if (this.isRejected) return 'Application Rejected';
    return 'Application Status';
  }

  getStatusDescription(): string {
    if (this.isPending)
      return 'This application is awaiting administrator review.';
    if (this.isApproved)
      return 'This assessor has been verified and can perform assessments.';
    if (this.isRejected)
      return 'This application was rejected and needs revision.';
    return '';
  }

  handleRejectFormClose(result: boolean): void {
    this.rejectFormOpen = false;
    this.selectedItem = null;
  }

  handleApproveFormClose(result: boolean): void {
    this.approveFormOpen = false;
    this.selectedItem = null;
  }

  reject(event: any) {
    if (this.isProcessing) return;

    this.isProcessing = true;
    this.assessorService.reject(event).subscribe({
      next: (res) => {
        this.toast.success('Assessor application rejected successfully');
        this.loadProfile();
        this.rejectFormOpen = false;
        this.isProcessing = false;
        this.onSuccess.emit('rejected');
      },
      error: (err) => {
        console.error('Failed to reject assessor', err);
        this.toast.error(
          err?.error?.message || 'Failed to reject assessor application',
        );
        this.isProcessing = false;
      },
    });
  }

  approve(event: any) {
    if (this.isProcessing) return;

    this.isProcessing = true;
    this.assessorService.approve(event).subscribe({
      next: (res) => {
        this.toast.success('Assessor application approved successfully');
        this.loadProfile();
        this.approveFormOpen = false;
        this.isProcessing = false;
        this.onSuccess.emit('approved');
      },
      error: (err) => {
        console.error('Failed to approve assessor', err);
        this.toast.error(
          err?.error?.message || 'Failed to approve assessor application',
        );
        this.isProcessing = false;
      },
    });
  }
}
