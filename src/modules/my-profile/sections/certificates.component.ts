import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ContainerComponent } from 'components/container/container.component';
import { HeaderComponent } from 'components/header/header.component';
import { WrapperComponent } from 'components/wrapper/wrapper.component';
import { TextInputComponent } from 'components/text-field/text-field.component';
import { SelectComponent } from 'components/select/select.component';
import { DatepickerComponent } from 'components/datepicker/datepicker.component';
import { DialogComponent } from 'components/dialog/dialog.component';
import { FileUploadComponent } from 'components/file-upload/file-upload.component';
import { AssessorCertificateService } from 'modules/assessment/assessor-certificate.service';
import { AssessorService } from 'modules/assessment/assessor.service';
import { ToastService } from 'app/toast.service';
import { UploadTypes, UploadedFile } from 'components/file-upload/types';

@Component({
  selector: 'app-certificates',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ContainerComponent,
    HeaderComponent,
    WrapperComponent,
    TextInputComponent,
    SelectComponent,
    DatepickerComponent,
    DialogComponent,
    FileUploadComponent,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
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
            title="Supporting Certificates"
            subtitle="Upload your professional certificates and supporting documents"
          />
        </div>
      </app-wrapper>

      <app-wrapper>
        <div class="max-w-4xl mx-auto">
          <mat-card class="relative overflow-hidden">
            <div
              class="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 transform rotate-45 translate-x-8 -translate-y-8"
            ></div>

            <mat-card-header class="flex items-start justify-between p-6 pb-0">
              <div class="flex-1">
                <h2 class="text-xl font-semibold text-gray-900">
                  Certificate Management
                </h2>
                <p class="text-sm text-gray-600 mt-1">
                  Add, edit, and manage your professional certificates
                </p>
              </div>
              <button
                mat-raised-button
                color="primary"
                (click)="openCertificateDialog()"
                class="bg-white text-black border border-gray-300 hover:bg-gray-50"
              >
                <mat-icon class="mr-2">add</mat-icon>
                Add Certificate
              </button>
            </mat-card-header>

            <mat-card-content class="p-6">
              <!-- Certificates Grid -->
              <div *ngIf="certificates.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <mat-card 
                  *ngFor="let certificate of certificates" 
                  class="relative overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  (click)="editCertificate(certificate)"
                >
                  <mat-card-content class="p-4">
                    <div class="flex items-start justify-between mb-3">
                      <div class="flex-1">
                        <h4 class="font-medium text-gray-900 line-clamp-2">
                          {{ certificate.certificateName }}
                        </h4>
                        <p class="text-sm text-gray-600 mt-1">
                          {{ certificate.issuingAuthority }}
                        </p>
                      </div>
                      <button
                        mat-icon-button
                        (click)="deleteCertificate(certificate, $event)"
                        class="text-red-500 hover:bg-red-50 flex-shrink-0"
                      >
                        <mat-icon>delete</mat-icon>
                      </button>
                    </div>
                    
                    <div class="space-y-2 text-sm">
                      <div class="flex justify-between">
                        <span class="text-gray-600">Type:</span>
                        <span class="font-medium">{{ certificate.certificateType }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-gray-600">Issue Date:</span>
                        <span class="font-medium">{{ certificate.issueDate | date:'MMM yyyy' }}</span>
                      </div>
                      <div *ngIf="certificate.expiryDate" class="flex justify-between">
                        <span class="text-gray-600">Expires:</span>
                        <span class="font-medium">{{ certificate.expiryDate | date:'MMM yyyy' }}</span>
                      </div>
                    </div>

                    <div class="mt-3 pt-3 border-t border-gray-200">
                      <div class="flex items-center justify-between">
                        <span 
                          class="text-xs px-2 py-1 rounded-full"
                          [ngClass]="{
                            'bg-green-100 text-green-700': certificate.verificationStatus === 'VERIFIED',
                            'bg-yellow-100 text-yellow-700': certificate.verificationStatus === 'PENDING',
                            'bg-red-100 text-red-700': certificate.verificationStatus === 'REJECTED'
                          }"
                        >
                          {{ certificate.statusDisplayName }}
                        </span>
                        <mat-icon 
                          *ngIf="certificate.hasFile" 
                          class="text-blue-500"
                        >
                          attachment
                        </mat-icon>
                      </div>
                    </div>
                  </mat-card-content>
                </mat-card>
              </div>

              <!-- Empty State -->
              <div *ngIf="certificates.length === 0" class="text-center py-12">
                <mat-icon class="text-gray-400 mb-4" style="font-size: 48px; width: 48px; height: 48px;">
                  verified_user
                </mat-icon>
                <h3 class="text-lg font-medium text-gray-900 mb-2">
                  No certificates uploaded yet
                </h3>
                <p class="text-gray-600 mb-4">
                  Upload your professional certificates to strengthen your profile
                </p>
                <button
                  mat-raised-button
                  color="primary"
                  (click)="openCertificateDialog()"
                  class="bg-blue-600 text-white"
                >
                  <mat-icon class="mr-2">add</mat-icon>
                  Upload First Certificate
                </button>
              </div>
            </mat-card-content>

            <!-- Action Buttons -->
            <div class="flex justify-between items-center p-6 bg-gray-50 border-t">
              <button
                mat-button
                (click)="goBack()"
                class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <mat-icon class="mr-2">arrow_back</mat-icon>
                Back to Overview
              </button>

              <div class="flex space-x-3">
                <button
                  mat-button
                  (click)="saveDraft()"
                  class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Save Draft
                </button>
                <button
                  mat-raised-button
                  color="primary"
                  (click)="saveAndContinue()"
                  class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save & Continue
                </button>
              </div>
            </div>
          </mat-card>
        </div>
      </app-wrapper>

      <!-- Certificate Dialog -->
      <app-dialog
        [open]="showCertificateDialog"
        [title]="isEditMode ? 'Edit Certificate' : 'Add Certificate'"
        width="600px"
        headerBgColor="bg-gray-100"
        headerTextColor="text-gray-900"
        (onClose)="onCertificateDialogClose($event)"
      >
        <ng-template>
          <div class="p-6">
            <form [formGroup]="certificateForm" class="space-y-4">
              <app-text-input
                label="Certificate Name"
                [formControl]="certificateForm.get('certificateName')"
                [required]="true"
                placeholder="e.g., Project Management Professional (PMP)"
              />

              <app-text-input
                label="Issuing Authority"
                [formControl]="certificateForm.get('issuingAuthority')"
                [required]="true"
                placeholder="e.g., PMI, Google, Microsoft"
              />

              <app-text-input
                label="Certificate Number"
                [formControl]="certificateForm.get('certificateNumber')"
                placeholder="Certificate/License Number (optional)"
              />

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <app-select
                  label="Certificate Type"
                  [formControl]="certificateForm.get('certificateType')"
                  [options]="certificateTypeOptions"
                  [required]="true"
                />

                <app-datepicker
                  label="Issue Date"
                  [formControl]="certificateForm.get('issueDate')"
                  [required]="true"
                />
              </div>

              <app-datepicker
                label="Expiry Date (Optional)"
                [formControl]="certificateForm.get('expiryDate')"
              />

              <app-text-input
                label="Description"
                [formControl]="certificateForm.get('description')"
                placeholder="Brief description of the certificate"
                type="textarea"
                rows="3"
              />

              <file-upload
                label="Upload certificate file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                [multiple]="false"
                [autoUpload]="true"
                [uploadType]="uploadType.ASSESSOR_CERTIFICATE"
                (onSuccess)="handleFileUploaded($event)"
              />

              <div *ngIf="selectedFile" class="bg-gray-50 rounded-lg p-3">
                <div class="flex items-center justify-between">
                  <div class="flex items-center">
                    <mat-icon class="text-gray-500 mr-2">description</mat-icon>
                    <span class="text-sm">{{ selectedFile.name }}</span>
                  </div>
                  <button
                    mat-icon-button
                    (click)="removeSelectedFile()"
                    class="text-red-500 hover:bg-red-50"
                  >
                    <mat-icon>close</mat-icon>
                  </button>
                </div>
              </div>
            </form>

            <div class="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
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
                (click)="saveCertificate()"
                [disabled]="certificateForm.invalid"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {{ isEditMode ? 'Update Certificate' : 'Save Certificate' }}
              </button>
            </div>
          </div>
        </ng-template>
      </app-dialog>
    </container>
  `,
  styles: [`
    .mat-mdc-card {
      @apply shadow-sm border border-gray-100;
    }
    
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class CertificatesComponent implements OnInit {
  certificates: any[] = [];
  certificateForm: FormGroup;
  showCertificateDialog = false;
  isEditMode = false;
  editingCertificate: any = null;
  selectedFile: UploadedFile | null = null;
  protected readonly uploadType = UploadTypes;

  certificateTypeOptions = [
    { value: 'ACADEMIC', label: 'Academic Certificate' },
    { value: 'PROFESSIONAL', label: 'Professional Certificate' },
    { value: 'TRAINING', label: 'Training Certificate' },
    { value: 'LICENSE', label: 'License/Permit' },
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private certificateService: AssessorCertificateService,
    private assessorService: AssessorService,
    private toast: ToastService
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadCertificates();
  }

  initializeForm(): void {
    this.certificateForm = this.fb.group({
      certificateName: ['', Validators.required],
      issuingAuthority: ['', Validators.required],
      certificateNumber: [''],
      certificateType: ['', Validators.required],
      issueDate: ['', Validators.required],
      expiryDate: [''],
      description: [''],
      fileUploadId: [null]
    });
  }

  loadCertificates(): void {
    this.assessorService.getCurrentUserAssessorData().subscribe({
      next: (response) => {
        const data = response.data;
        this.certificates = data.certificateList || [];
      },
      error: (error) => {
        console.error('Error loading certificates:', error);
        this.toast.error('Failed to load certificates');
      }
    });
  }

  openCertificateDialog(): void {
    this.isEditMode = false;
    this.editingCertificate = null;
    this.certificateForm.reset();
    this.selectedFile = null;
    this.showCertificateDialog = true;
  }

  editCertificate(certificate: any): void {
    this.isEditMode = true;
    this.editingCertificate = certificate;
    this.certificateForm.patchValue(certificate);
    this.showCertificateDialog = true;
  }

  deleteCertificate(certificate: any, event: Event): void {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this certificate?')) {
      this.certificateService.delete(certificate.uuid).subscribe({
        next: () => {
          this.toast.success('Certificate deleted successfully');
          this.loadCertificates();
        },
        error: (error) => {
          console.error('Error deleting certificate:', error);
          this.toast.error('Failed to delete certificate');
        }
      });
    }
  }

  onCertificateDialogClose(result: any): void {
    this.showCertificateDialog = false;
    if (!result) {
      this.cancelCertificateDialog();
    }
  }

  cancelCertificateDialog(): void {
    this.showCertificateDialog = false;
    this.isEditMode = false;
    this.editingCertificate = null;
    this.certificateForm.reset();
    this.selectedFile = null;
  }

  handleFileUploaded(uploadedFiles: UploadedFile[]): void {
    if (uploadedFiles && uploadedFiles.length > 0) {
      this.selectedFile = uploadedFiles[0];
      this.certificateForm.patchValue({ fileUploadId: this.selectedFile.id });
    }
  }

  removeSelectedFile(): void {
    this.selectedFile = null;
    this.certificateForm.patchValue({ fileUploadId: null });
  }

  saveCertificate(): void {
    if (this.certificateForm.valid) {
      const certificateData = this.certificateForm.value;
      
      if (this.isEditMode) {
        this.certificateService.update(this.editingCertificate.uuid, certificateData).subscribe({
          next: () => {
            this.toast.success('Certificate updated successfully');
            this.loadCertificates();
            this.cancelCertificateDialog();
          },
          error: (error) => {
            console.error('Error updating certificate:', error);
            this.toast.error('Failed to update certificate');
          }
        });
      } else {
        this.certificateService.create(certificateData).subscribe({
          next: () => {
            this.toast.success('Certificate added successfully');
            this.loadCertificates();
            this.cancelCertificateDialog();
          },
          error: (error) => {
            console.error('Error creating certificate:', error);
            this.toast.error('Failed to add certificate');
          }
        });
      }
    }
  }

  goBack(): void {
    this.router.navigate(['/assessor/onboarding']);
  }

  saveDraft(): void {
    this.toast.success('Draft saved successfully');
  }

  saveAndContinue(): void {
    this.toast.success('Certificates saved successfully');
    this.router.navigate(['/assessor/onboarding']);
  }
}