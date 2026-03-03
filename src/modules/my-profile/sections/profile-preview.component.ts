import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AssessorService } from 'modules/assessment/assessor.service';
import { ContainerComponent } from 'components/container/container.component';
import { HeaderComponent } from 'components/header/header.component';
import { WrapperComponent } from 'components/wrapper/wrapper.component';
import { ProfilePictureComponent } from 'components/profile-picture/profile-picture.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ToastService } from 'app/toast.service';
import { ConfirmDialogComponent } from 'components/confirm/confirm.dialog';
import { DialogComponent } from 'components/dialog/dialog.component';
import { PdfViewerDialogComponent } from 'modules/my-profile/pdf-viewer';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-profile-preview',
  standalone: true,
  imports: [
    CommonModule,
    ContainerComponent,
    HeaderComponent,
    WrapperComponent,
    ProfilePictureComponent,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatDividerModule,
    MatProgressBarModule,
    ConfirmDialogComponent,
    DialogComponent,
    PdfViewerDialogComponent,
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
            title="Profile Preview"
            subtitle="Review your complete assessor profile before submission"
          />
        </div>
      </app-wrapper>

      <div *ngIf="loading" class="flex justify-center items-center py-16">
        <div class="text-center">
          <div
            class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"
          ></div>
          <p class="text-gray-600">Loading your profile...</p>
        </div>
      </div>

      <div *ngIf="generatingPDF" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-8 max-w-sm w-full mx-4">
          <div class="text-center">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">Generating PDF</h3>
            <p class="text-gray-600 mb-4">Please wait while we prepare your professional resume...</p>
            <mat-progress-bar mode="indeterminate" class="w-full"></mat-progress-bar>
          </div>
        </div>
      </div>

      <!-- Hidden PDF Content -->
      <div id="pdf-content" class="hidden">
        <div class="max-w-4xl mx-auto p-8 bg-white" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          <!-- PDF Header -->
          <div class="border-b-4 border-blue-600 pb-6 mb-8">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <h1 class="text-4xl font-bold text-gray-900 mb-2">
                  {{ assessor?.title }} {{ assessor?.firstName }} {{ assessor?.lastName }}
                </h1>
                <p class="text-xl text-blue-600 mb-4">Professional Assessor</p>
                <div class="grid grid-cols-2 gap-4 text-sm text-gray-700">
                  <div class="flex items-center"><strong>Email:</strong> {{ assessor?.email }}</div>
                  <div class="flex items-center"><strong>Phone:</strong> {{ assessor?.phone }}</div>
                  <div class="flex items-center"><strong>Location:</strong> {{ getLocationName() }}</div>
                  <div class="flex items-center"><strong>ID:</strong> {{ assessor?.identificationType }}: {{ assessor?.identificationId }}</div>
                </div>
              </div>
              <div class="ml-6" *ngIf="getProfilePictureSrc()">
                <img [src]="getProfilePictureSrc()" alt="Profile Photo" class="w-32 h-32 rounded-lg object-cover border-2 border-gray-300">
              </div>
            </div>
          </div>

          <!-- PDF Academic Qualifications -->
          <div class="mb-8" *ngIf="qualifications.length > 0">
            <h2 class="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-green-200 pb-2">Academic Qualifications</h2>
            <div class="space-y-4">
              <div *ngFor="let qualification of qualifications" class="border-l-4 border-green-500 pl-4">
                <h3 class="text-lg font-semibold text-gray-900">{{ qualification.course }}</h3>
                <p class="text-gray-700 font-medium">{{ qualification.institution }}</p>
                <div class="text-sm text-gray-600 mt-1">
                  <span class="inline-block mr-4">{{ getEducationLevelLabel(qualification.educationLevelId) }}</span>
                  <span class="inline-block mr-4">{{ formatDate(qualification.fromDate) }} - {{ qualification.toDate ? formatDate(qualification.toDate) : 'Present' }}</span>
                  <span *ngIf="qualification.graduated" class="text-green-600 font-medium">✓ Graduated</span>
                </div>
              </div>
            </div>
          </div>

          <!-- PDF Work Experience -->
          <div class="mb-8" *ngIf="experience.length > 0">
            <h2 class="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-purple-200 pb-2">Work Experience</h2>
            <div class="space-y-4">
              <div *ngFor="let position of experience" class="border-l-4 border-purple-500 pl-4">
                <h3 class="text-lg font-semibold text-gray-900">{{ position.positionHeld }}</h3>
                <p class="text-gray-700 font-medium">{{ position.company }}</p>
                <div class="text-sm text-gray-600 mt-1">
                  <span>{{ formatDate(position.fromDate) }} - {{ position.toDate ? formatDate(position.toDate) : 'Present' }}</span>
                  <span *ngIf="!position.toDate" class="ml-2 text-green-600 font-medium">(Current)</span>
                </div>
              </div>
            </div>
          </div>

          <!-- PDF Professional Certifications -->
          <div class="mb-8" *ngIf="certifications.length > 0">
            <h2 class="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-indigo-200 pb-2">Professional Certifications</h2>
            <div class="grid grid-cols-2 gap-4">
              <div *ngFor="let cert of certifications" class="border border-gray-200 rounded p-3">
                <h3 class="font-semibold text-gray-900">{{ cert.title }}</h3>
                <p class="text-gray-700 text-sm">{{ cert.issuer }}</p>
                <p class="text-gray-600 text-xs mt-1" *ngIf="cert.description">{{ cert.description }}</p>
                <div class="text-xs text-gray-500 mt-2">
                  <div>Issued: {{ formatDate(cert.issueDate) }}</div>
                  <div *ngIf="cert.expiryDate">Expires: {{ formatDate(cert.expiryDate) }}</div>
                  <div *ngIf="!cert.expiryDate" class="text-green-600">No Expiration</div>
                </div>
              </div>
            </div>
          </div>

          <!-- PDF Supporting Certificates -->
          <div class="mb-8" *ngIf="certificates.length > 0">
            <h2 class="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-blue-200 pb-2">Supporting Certificates</h2>
            <div class="grid grid-cols-2 gap-4">
              <div *ngFor="let certificate of certificates" class="border border-gray-200 rounded p-3">
                <h3 class="font-semibold text-gray-900">{{ certificate.certificateName }}</h3>
                <p class="text-gray-700 text-sm">{{ certificate.issuingAuthority }}</p>
                <div class="text-xs text-gray-500 mt-2">
                  <div>Type: {{ formatCertificateType(certificate.certificateType) }}</div>
                  <div>Issued: {{ formatDate(certificate.issueDate) }}</div>
                  <div *ngIf="certificate.expiryDate">Expires: {{ formatDate(certificate.expiryDate) }}</div>
                  <div *ngIf="certificate.certificateNumber">Number: {{ certificate.certificateNumber }}</div>
                  <div class="mt-1">
                    <span class="px-2 py-1 text-xs rounded" 
                          [ngClass]="{
                            'bg-green-100 text-green-800': certificate.verificationStatus === 'VERIFIED',
                            'bg-yellow-100 text-yellow-800': certificate.verificationStatus === 'PENDING',
                            'bg-red-100 text-red-800': certificate.verificationStatus === 'REJECTED'
                          }">
                      {{ certificate.statusDisplayName }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- PDF Professional References -->
          <div class="mb-8" *ngIf="references.length > 0">
            <h2 class="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-teal-200 pb-2">Professional References</h2>
            <div class="grid grid-cols-2 gap-4">
              <div *ngFor="let reference of references" class="border border-gray-200 rounded p-3">
                <h3 class="font-semibold text-gray-900">{{ reference.name }}</h3>
                <p class="text-gray-700 text-sm">{{ reference.relationship }}</p>
                <div class="text-xs text-gray-500 mt-2">
                  <div>{{ reference.email }}</div>
                  <div>{{ reference.phone }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- PDF Assessment Preferences -->
          <div class="mb-8" *ngIf="preferences.length > 0">
            <h2 class="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-orange-200 pb-2">Assessment Preferences</h2>
            <div class="flex flex-wrap gap-2">
              <span *ngFor="let preference of preferences" 
                    class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                {{ formatPropertyTypeLabel(preference.preference) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="!loading" class="w-full max-w-5xl mx-auto">
        <!-- Enhanced Profile Header -->
        <app-wrapper>
          <mat-card class="mb-8 overflow-hidden w-full shadow-lg">
            <div class="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-8 relative">
              <div class="absolute inset-0 bg-black opacity-10"></div>
              <div class="relative z-10 flex items-start space-x-8">
                <div class="flex-shrink-0">
                  <app-profile-picture
                    [src]="getProfilePictureSrc()"
                    alt="Professional Profile Photo"
                    size="8rem"
                    [clickable]="false"
                    shadowSize="xl"
                    borderColor="border-white"
                  />
                </div>
                <div class="flex-1 min-w-0">
                  <h1 class="text-4xl font-bold mb-3">
                    {{ assessor?.title }} {{ assessor?.firstName }} {{ assessor?.lastName }}
                  </h1>
                  <div class="flex items-center mb-4">
                    <mat-icon class="mr-2">verified_user</mat-icon>
                    <span class="text-xl text-blue-100">Professional Assessor</span>
                    <span class="ml-4 px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm">
                      {{ assessor?.status || 'Pending Review' }}
                    </span>
                  </div>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div class="flex items-center">
                      <mat-icon class="mr-2 text-blue-200">email</mat-icon>
                      <span class="truncate">{{ assessor?.email }}</span>
                    </div>
                    <div class="flex items-center">
                      <mat-icon class="mr-2 text-blue-200">phone</mat-icon>
                      {{ assessor?.phone }}
                    </div>
                    <div class="flex items-center">
                      <mat-icon class="mr-2 text-blue-200">location_on</mat-icon>
                      {{ getLocationName() }}
                    </div>
                    <div class="flex items-center">
                      <mat-icon class="mr-2 text-blue-200">badge</mat-icon>
                      {{ assessor?.identificationType }}: {{ assessor?.identificationId }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </mat-card>
        </app-wrapper>

        <!-- Profile Summary Stats -->
        <app-wrapper>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <mat-card class="text-center p-4">
              <div class="text-2xl font-bold text-green-600">{{ qualifications.length }}</div>
              <div class="text-sm text-gray-600">Qualifications</div>
            </mat-card>
            <mat-card class="text-center p-4">
              <div class="text-2xl font-bold text-purple-600">{{ experience.length }}</div>
              <div class="text-sm text-gray-600">Work Experience</div>
            </mat-card>
            <mat-card class="text-center p-4">
              <div class="text-2xl font-bold text-blue-600">{{ certificates.length }}</div>
              <div class="text-sm text-gray-600">Certificates</div>
            </mat-card>
            <mat-card class="text-center p-4">
              <div class="text-2xl font-bold text-teal-600">{{ references.length }}</div>
              <div class="text-sm text-gray-600">References</div>
            </mat-card>
          </div>
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
              <div *ngIf="qualifications.length === 0" class="text-center py-8 text-gray-500">
                <mat-icon class="text-6xl text-gray-300 mb-4">school</mat-icon>
                <p>No academic qualifications added</p>
              </div>
              <div class="space-y-6">
                <div *ngFor="let qualification of qualifications" 
                     class="bg-white border border-green-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <h4 class="text-lg font-bold text-gray-900 mb-1">{{ qualification.course }}</h4>
                      <p class="text-green-700 font-medium mb-2">{{ qualification.institution }}</p>
                      <div class="flex flex-wrap gap-2 text-sm">
                        <span class="bg-green-100 text-green-800 px-2 py-1 rounded">
                          {{ getEducationLevelLabel(qualification.educationLevelId) }}
                        </span>
                        <span class="bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {{ formatDate(qualification.fromDate) }} - {{ qualification.toDate ? formatDate(qualification.toDate) : 'Present' }}
                        </span>
                        <span *ngIf="qualification.graduated" class="bg-green-100 text-green-800 px-2 py-1 rounded">
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
              <div *ngIf="experience.length === 0" class="text-center py-8 text-gray-500">
                <mat-icon class="text-6xl text-gray-300 mb-4">work</mat-icon>
                <p>No work experience added</p>
              </div>
              <div class="space-y-6">
                <div *ngFor="let position of experience" 
                     class="bg-white border border-purple-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <h4 class="text-lg font-bold text-gray-900 mb-1">{{ position.positionHeld }}</h4>
                      <p class="text-purple-700 font-medium mb-2">{{ position.company }}</p>
                      <div class="flex flex-wrap gap-2 text-sm">
                        <span class="bg-purple-100 text-purple-800 px-2 py-1 rounded">
                          {{ formatDate(position.fromDate) }} - {{ position.toDate ? formatDate(position.toDate) : 'Present' }}
                        </span>
                        <span *ngIf="!position.toDate" class="bg-green-100 text-green-800 px-2 py-1 rounded">
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
          <mat-card class="w-full mb-8 shadow-md" *ngIf="certifications.length > 0">
            <mat-card-header class="bg-indigo-50">
              <mat-card-title class="flex items-center text-indigo-800">
                <mat-icon class="text-indigo-600 mr-3">verified</mat-icon>
                Professional Certifications
              </mat-card-title>
            </mat-card-header>
            <mat-card-content class="p-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div *ngFor="let cert of certifications" 
                     class="bg-white border border-indigo-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div class="flex items-start justify-between mb-3">
                    <h4 class="text-lg font-bold text-gray-900">{{ cert.title }}</h4>
                    <mat-icon class="text-indigo-500">verified</mat-icon>
                  </div>
                  <p class="text-indigo-700 font-medium mb-2">{{ cert.issuer }}</p>
                  <p class="text-gray-600 text-sm mb-3" *ngIf="cert.description">{{ cert.description }}</p>
                  <div class="space-y-1 text-xs">
                    <div class="flex justify-between">
                      <span class="text-gray-500">Issued:</span>
                      <span class="font-medium">{{ formatDate(cert.issueDate) }}</span>
                    </div>
                    <div class="flex justify-between" *ngIf="cert.expiryDate">
                      <span class="text-gray-500">Expires:</span>
                      <span class="font-medium">{{ formatDate(cert.expiryDate) }}</span>
                    </div>
                    <div *ngIf="!cert.expiryDate" class="text-center">
                      <span class="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">No Expiration</span>
                    </div>
                  </div>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </app-wrapper>

        <!-- Supporting Certificates -->
        <app-wrapper>
          <mat-card class="w-full mb-8 shadow-md" *ngIf="certificates.length > 0">
            <mat-card-header class="bg-blue-50">
              <mat-card-title class="flex items-center text-blue-800">
                <mat-icon class="text-blue-600 mr-3">verified_user</mat-icon>
                Supporting Certificates
                <span class="ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">{{ certificates.length }}</span>
              </mat-card-title>
            </mat-card-header>
            <mat-card-content class="p-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div *ngFor="let certificate of certificates" 
                     class="bg-white border border-blue-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div class="flex items-start justify-between mb-3">
                    <h4 class="text-lg font-bold text-gray-900">{{ certificate.certificateName }}</h4>
                    <div class="flex items-center">
                      <mat-icon *ngIf="certificate.hasFile" class="text-blue-500 mr-1" title="File Attached">attachment</mat-icon>
                      <mat-icon class="text-blue-500">verified_user</mat-icon>
                    </div>
                  </div>
                  <p class="text-blue-700 font-medium mb-2">{{ certificate.issuingAuthority }}</p>
                  <div class="space-y-2 text-sm">
                    <div class="flex justify-between">
                      <span class="text-gray-500">Type:</span>
                      <span class="font-medium">{{ formatCertificateType(certificate.certificateType) }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-gray-500">Issued:</span>
                      <span class="font-medium">{{ formatDate(certificate.issueDate) }}</span>
                    </div>
                    <div class="flex justify-between" *ngIf="certificate.expiryDate">
                      <span class="text-gray-500">Expires:</span>
                      <span class="font-medium">{{ formatDate(certificate.expiryDate) }}</span>
                    </div>
                    <div class="flex justify-between" *ngIf="certificate.certificateNumber">
                      <span class="text-gray-500">Number:</span>
                      <span class="font-medium">{{ certificate.certificateNumber }}</span>
                    </div>
                    <div class="flex justify-between items-center mt-3">
                      <span class="text-gray-500">Status:</span>
                      <span class="px-2 py-1 text-xs rounded" 
                            [ngClass]="{
                              'bg-green-100 text-green-800': certificate.verificationStatus === 'VERIFIED',
                              'bg-yellow-100 text-yellow-800': certificate.verificationStatus === 'PENDING',
                              'bg-red-100 text-red-800': certificate.verificationStatus === 'REJECTED'
                            }">
                        {{ certificate.statusDisplayName }}
                      </span>
                    </div>
                  </div>
                  <div *ngIf="certificate.description" class="mt-3 pt-3 border-t border-gray-200">
                    <p class="text-gray-600 text-sm">{{ certificate.description }}</p>
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
              <div *ngIf="references.length === 0" class="text-center py-8 text-gray-500">
                <mat-icon class="text-6xl text-gray-300 mb-4">contacts</mat-icon>
                <p>No professional references added</p>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div *ngFor="let reference of references" 
                     class="bg-white border border-teal-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div class="flex items-start justify-between mb-3">
                    <h4 class="text-lg font-bold text-gray-900">{{ reference.name }}</h4>
                    <mat-icon class="text-teal-500">person</mat-icon>
                  </div>
                  <p class="text-teal-700 font-medium mb-3">{{ reference.relationship }}</p>
                  <div class="space-y-2 text-sm">
                    <div class="flex items-center">
                      <mat-icon class="text-teal-500 mr-2 text-sm">email</mat-icon>
                      <span class="text-gray-600">{{ reference.email }}</span>
                    </div>
                    <div class="flex items-center">
                      <mat-icon class="text-teal-500 mr-2 text-sm">phone</mat-icon>
                      <span class="text-gray-600">{{ reference.phone }}</span>
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
              <div *ngIf="preferences.length === 0" class="text-center py-8 text-gray-500">
                <mat-icon class="text-6xl text-gray-300 mb-4">tune</mat-icon>
                <p>No assessment preferences selected</p>
              </div>
              <div class="flex flex-wrap gap-3">
                <span *ngFor="let preference of preferences" 
                      class="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full text-sm font-medium shadow-md hover:shadow-lg transition-shadow">
                  {{ formatPropertyTypeLabel(preference.preference) }}
                </span>
              </div>
            </mat-card-content>
          </mat-card>
        </app-wrapper>

        <!-- Documents -->
        <app-wrapper>
          <mat-card class="w-full mb-8 shadow-md" *ngIf="documents.length > 0">
            <mat-card-header class="bg-blue-50">
              <mat-card-title class="flex items-center text-blue-800">
                <mat-icon class="text-blue-600 mr-3">description</mat-icon>
                Uploaded Documents
                <span class="ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">{{ documents.length }}</span>
              </mat-card-title>
            </mat-card-header>
            <mat-card-content class="p-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div *ngFor="let doc of documents" 
                     class="bg-white border border-blue-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div class="flex items-start justify-between mb-3">
                    <div class="flex-1">
                      <h4 class="text-lg font-bold text-gray-900 mb-1">{{ doc.title }}</h4>
                      <p class="text-blue-700 font-medium mb-2">{{ doc.documentTypeName }}</p>
                      <div class="text-sm text-gray-600">
                        <div class="flex items-center mb-1">
                          <mat-icon class="text-blue-500 mr-1 text-sm">calendar_today</mat-icon>
                          {{ doc.uploadedAt | date: 'shortDate' }}
                        </div>
                      </div>
                    </div>
                    <div class="flex items-center">
                      <mat-icon class="text-blue-500 mr-1" title="File Attached">attachment</mat-icon>
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

        <!-- Enhanced Action Buttons -->
        <app-wrapper>
          <div class="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-8 shadow-lg">
            <div class="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <button
                mat-button
                (click)="goBack()"
                class="px-8 py-3 border-2 border-gray-300 rounded-xl hover:bg-white hover:shadow-md transition-all duration-200 font-medium"
              >
                <mat-icon class="mr-2">arrow_back</mat-icon>
                Back to Overview
              </button>

              <div class="flex space-x-4">
                <button
                  mat-raised-button
                  (click)="downloadPDF()"
                  [disabled]="generatingPDF"
                  class="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-md hover:shadow-lg transition-all duration-200 font-medium"
                >
                  <mat-icon class="mr-2">{{ generatingPDF ? 'hourglass_empty' : 'download' }}</mat-icon>
                  {{ generatingPDF ? 'Generating...' : 'Download PDF Resume' }}
                </button>
                <button
                  mat-raised-button
                  color="primary"
                  (click)="openSubmitDialog()"
                  [disabled]="!canSubmitApplication()"
                  [class]="canSubmitApplication() ? 'px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 shadow-md hover:shadow-lg transition-all duration-200 font-medium' : 'px-8 py-3 bg-gray-400 text-white rounded-xl shadow-md font-medium cursor-not-allowed'"
                >
                  <mat-icon class="mr-2">
                    {{ isPendingReview() ? 'schedule' : isApproved() ? 'check_circle' : 'send' }}
                  </mat-icon>
                  {{ getSubmitButtonText() }}
                </button>
              </div>
            </div>
          </div>
        </app-wrapper>
      </div>

      <!-- PDF Viewer Dialog -->
      <app-dialog
        [open]="pdfViewerOpen"
        (onClose)="handlePdfViewerClose($event)"
        width="900px"
        title="Document Viewer"
      >
        <ng-template>
          <app-pdf-viewer [base64]="selectedDocument?.filePath" />
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

      .animate-spin {
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }
    `,
  ],
})
export class ProfilePreviewComponent implements OnInit {
  loading = true;
  generatingPDF = false;
  isSubmitDialogOpen = false;
  pdfViewerOpen = false;
  selectedDocument: any;
  assessor: any = {};
  qualifications: any[] = [];
  experience: any[] = [];
  certifications: any[] = [];
  certificates: any[] = [];
  references: any[] = [];
  preferences: any[] = [];
  documents: any[] = [];

  educationLevelOptions = [
    { value: 1, label: 'Primary Education' },
    { value: 2, label: 'Secondary Education' },
    { value: 3, label: 'Certificate' },
    { value: 4, label: 'Diploma' },
    { value: 5, label: "Bachelor's Degree" },
    { value: 6, label: "Master's Degree" },
    { value: 7, label: 'Doctorate/PhD' },
  ];

  constructor(
    private assessorService: AssessorService,
    private router: Router,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.loadProfileData();
  }

  loadProfileData(): void {
    this.assessorService.getCurrentUserAssessorData().subscribe({
      next: (response) => {
        const data = response.data;
        this.assessor = data.assessor || data;
        this.qualifications = data.educationBackgroundList || [];
        this.experience = data.employmentHistoryDtoList || [];
        this.certifications = data.certificationDtoList || [];
        this.certificates = data.certificateList || [];
        this.references = data.referenceDtoList || [];
        this.preferences = data.preferenceDtoList || [];
        this.documents = data.documentDtoList || [];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading profile data:', error);
        this.toast.error('Failed to load profile data');
        this.loading = false;
      },
    });
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
    });
  }

  getEducationLevelLabel(levelId: number): string {
    const level = this.educationLevelOptions.find((l) => l.value === levelId);
    return level ? level.label : 'Unknown';
  }

  formatPropertyTypeLabel(enumValue: string): string {
    return enumValue
      .split('_')
      .map((word) => word.charAt(0) + word.substring(1).toLowerCase())
      .join(' ');
  }

  getLocationName(): string {
    return this.assessor?.locationName || 'Location not specified';
  }

  getProfilePictureSrc(): string | null {
    // Priority 1: Use profilePhoto object if available (new API structure)
    if (this.assessor?.profilePhoto?.uuid) {
      return `/api/v1/uploads/${this.assessor.profilePhoto.uuid}/view`;
    }
    
    // Priority 2: Use photo field if available (legacy/fallback)
    if (this.assessor?.photo) {
      return this.assessor.photo;
    }
    
    return null;
  }

  formatCertificateType(certificateType: string): string {
    if (!certificateType) return 'N/A';
    return certificateType
      .split('_')
      .map(word => word.charAt(0) + word.substring(1).toLowerCase())
      .join(' ');
  }

  goBack(): void {
    this.router.navigate(['/assessor/onboarding']);
  }

  downloadPDF(): void {
    this.generatingPDF = true;
    
    // Get the PDF content element
    const pdfContent = document.getElementById('pdf-content');
    if (!pdfContent) {
      this.toast.error('PDF content not found');
      this.generatingPDF = false;
      return;
    }
    
    // Temporarily show the hidden content
    pdfContent.classList.remove('hidden');
    
    // Generate PDF
    html2canvas(pdfContent, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 0;
      
      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      
      // Generate filename
      const fileName = `${this.assessor?.firstName || 'Assessor'}_${this.assessor?.lastName || 'Profile'}_Resume.pdf`;
      
      // Save the PDF
      pdf.save(fileName);
      
      // Hide the content again
      pdfContent.classList.add('hidden');
      
      this.generatingPDF = false;
      this.toast.success('PDF downloaded successfully');
    }).catch(error => {
      console.error('Error generating PDF:', error);
      pdfContent.classList.add('hidden');
      this.generatingPDF = false;
      this.toast.error('Failed to generate PDF');
    });
  }

  openSubmitDialog(): void {
    if (!this.canSubmitApplication()) {
      return;
    }
    this.isSubmitDialogOpen = true;
  }

  closeSubmitDialog(event: any): void {
    this.isSubmitDialogOpen = false;
  }

  handleSubmitConfirm(): void {
    this.submitProfile();
  }

  submitProfile(): void {
    this.assessorService.submitApplication().subscribe({
      next: (response) => {
        this.toast.success(
          this.isRejectedApplication()
            ? 'Application re-submitted for approval successfully!'
            : 'Application submitted for approval successfully!'
        );
        this.router.navigate(['/assessor/onboarding']);
      },
      error: (error) => {
        console.error('Error submitting application:', error);
        this.toast.error('Failed to submit application');
      },
    });
  }

  getSubmitButtonText(): string {
    if (this.isPendingReview()) {
      return 'Under Review';
    }
    if (this.isApproved()) {
      return 'Approved';
    }
    return this.isRejectedApplication() ? 'Re-submit' : 'Submit for Approval';
  }

  canSubmitApplication(): boolean {
    return !this.isPendingReview() && !this.isApproved();
  }

  getSubmitConfirmationMessage(): string {
    if (this.isRejectedApplication()) {
      return 'Are you sure you want to re-submit your application for approval? This will update your application status and notify the administrators.';
    }
    return 'Are you sure you want to submit your application for approval? Once submitted, you will not be able to make changes until the review is complete.';
  }

  isRejectedApplication(): boolean {
    return this.assessor?.status === 'REJECTED' || this.assessor?.status === 'Rejected';
  }

  isPendingReview(): boolean {
    return this.assessor?.status === 'PENDING' || this.assessor?.status === 'Pending' || this.assessor?.status === 'SUBMITTED';
  }

  isApproved(): boolean {
    return this.assessor?.status === 'APPROVED' || this.assessor?.status === 'Approved';
  }

  openPdfDialog(doc: any): void {
    this.selectedDocument = doc;
    this.pdfViewerOpen = true;
  }

  handlePdfViewerClose(result: boolean): void {
    this.pdfViewerOpen = false;
    this.selectedDocument = null;
  }

  downloadDocument(doc: any): void {
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
}
