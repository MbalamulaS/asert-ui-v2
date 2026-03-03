import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AssessorService } from 'modules/assessment/assessor.service';
import { AssessorCertificationService } from 'modules/assessment/assessor-certification.service';
import { ContainerComponent } from 'components/container/container.component';
import { HeaderComponent } from 'components/header/header.component';
import { WrapperComponent } from 'components/wrapper/wrapper.component';
import { TextInputComponent } from 'components/text-field/text-field.component';
import { DatepickerComponent } from 'components/datepicker/datepicker.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ToastService } from 'app/toast.service';
import { DialogComponent } from 'components/dialog/dialog.component';

@Component({
  selector: 'app-certifications',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ContainerComponent,
    HeaderComponent,
    WrapperComponent,
    TextInputComponent,
    DatepickerComponent,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatCheckboxModule,
    DialogComponent,
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
            title="Professional Certifications"
            subtitle="Manage your professional certifications and credentials"
          />
        </div>
      </app-wrapper>

      <!-- Certifications List -->
      <app-wrapper>
        <div class="w-full max-w-4xl mx-auto">
          <div
            class="mat-mdc-card-header flex items-center justify-between mb-4"
          >
            <div>
              <mat-card-title class="flex items-center">
                <mat-icon class="text-indigo-600 mr-3">verified</mat-icon>
                Your Certifications
              </mat-card-title>
              <mat-card-subtitle
                >{{ certifications.length }} certifications
                added</mat-card-subtitle
              >
            </div>
            <button
              mat-raised-button
              (click)="openAddDialog()"
              class="bg-white text-black border border-gray-300 hover:bg-gray-50 shrink-0 mt-1"
            >
              <mat-icon class="mr-2">add</mat-icon>
              Add Certification
            </button>
          </div>
          <mat-card class="mb-6">
            <mat-card-content>
              <div *ngIf="certifications.length === 0" class="text-center py-8">
                <mat-icon class="text-gray-400 text-4xl mb-4"
                  >verified</mat-icon
                >
                <h3 class="text-lg font-medium text-gray-900 mb-2">
                  No certifications added yet
                </h3>
                <p class="text-gray-600 mb-4">
                  This section is optional but recommended for professional
                  credibility
                </p>
                <button
                  mat-raised-button
                  color="primary"
                  (click)="openAddDialog()"
                  class="bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  <mat-icon class="mr-2">add</mat-icon>
                  Add Your First Certification
                </button>
              </div>

              <div
                *ngIf="certifications.length > 0"
                class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                <div
                  *ngFor="let cert of certifications; trackBy: trackByIndex"
                  class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
                >
                  <div class="mb-3">
                    <h4 class="text-lg font-medium text-gray-900 mb-2">
                      {{ cert.title }}
                    </h4>
                    <mat-chip-listbox *ngIf="!cert.expiryDate" class="mb-3">
                      <mat-chip class="bg-green-100 text-green-800">
                        No Expiration
                      </mat-chip>
                    </mat-chip-listbox>
                    <p class="text-gray-600 mb-2 text-sm">{{ cert.issuer }}</p>
                    <p
                      class="text-xs text-gray-500 mb-2"
                      *ngIf="cert.description"
                    >
                      {{ cert.description }}
                    </p>
                    <div class="flex items-center text-xs text-gray-500">
                      <mat-icon class="text-sm mr-1">calendar_today</mat-icon>
                      Issued: {{ formatDate(cert.issueDate) }}
                      <span *ngIf="cert.expiryDate" class="ml-2">
                        Expires: {{ formatDate(cert.expiryDate) }}
                      </span>
                    </div>
                  </div>

                  <div
                    class="flex items-center justify-end space-x-1 pt-3 border-t border-gray-100"
                  >
                    <button
                      mat-icon-button
                      (click)="openEditDialog(cert)"
                      class="text-blue-600 hover:bg-blue-50"
                      [attr.aria-label]="'Edit certification'"
                    >
                      <mat-icon class="text-lg">edit</mat-icon>
                    </button>
                    <button
                      mat-icon-button
                      (click)="deleteCertification(cert)"
                      class="text-red-600 hover:bg-red-50"
                      [attr.aria-label]="'Delete certification'"
                    >
                      <mat-icon class="text-lg">delete</mat-icon>
                    </button>
                  </div>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </app-wrapper>

      <!-- Add/Edit Certification Dialog -->
      <app-dialog
        [open]="showAddForm"
        [title]="
          editingCertification ? 'Edit Certification' : 'Add New Certification'
        "
        width="600px"
        headerBgColor="bg-gray-100"
        headerTextColor="text-gray-900"
        (onClose)="onDialogClose($event)"
      >
        <ng-template>
          <div class="p-6">
            <form [formGroup]="certificationForm" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <app-text-input
                  label="Certification Title"
                  [formControl]="certificationForm.get('title')"
                  [required]="true"
                />
                <app-text-input
                  label="Issuing Organization"
                  [formControl]="certificationForm.get('issuer')"
                  [required]="true"
                />
              </div>

              <app-text-input
                label="Description"
                [formControl]="certificationForm.get('description')"
                [required]="true"
                placeholder="Brief description of the certification"
              />

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <app-datepicker
                  label="Issue Date"
                  [formControl]="certificationForm.get('issueDate')"
                  [required]="true"
                />
                <app-datepicker
                  label="Expiry Date"
                  [formControl]="certificationForm.get('expiryDate')"
                  placeholder="Leave empty if no expiration"
                  [disabled]="certificationForm.get('noExpiration')?.value"
                />
              </div>

              <div class="flex items-center">
                <mat-checkbox
                  [formControl]="certificationForm.get('noExpiration')"
                  (change)="onNoExpirationChange($event)"
                >
                  This certification does not expire
                </mat-checkbox>
              </div>
            </form>

            <div
              class="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200"
            >
              <button
                mat-button
                (click)="cancelForm()"
                class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                mat-raised-button
                color="primary"
                (click)="saveCertification()"
                [disabled]="certificationForm.invalid"
                class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                {{ editingCertification ? 'Update' : 'Add' }} Certification
              </button>
            </div>
          </div>
        </ng-template>
      </app-dialog>

      <!-- Info Card -->
      <app-wrapper>
        <div class="max-w-4xl mx-auto">
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div class="flex items-start">
              <mat-icon class="text-blue-600 mr-3 mt-1">info</mat-icon>
              <div>
                <h4 class="font-medium text-blue-900 mb-1">
                  About Professional Certifications
                </h4>
                <p class="text-blue-800 text-sm">
                  Professional certifications help demonstrate your expertise
                  and credibility. While this section is optional, adding
                  relevant certifications can strengthen your profile.
                </p>
              </div>
            </div>
          </div>
        </div>
      </app-wrapper>

      <!-- Navigation -->
      <app-wrapper>
        <div class="w-full max-w-4xl mx-auto">
          <div class="flex justify-between items-center">
            <button
              mat-button
              (click)="goBack()"
              class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <mat-icon class="mr-2">arrow_back</mat-icon>
              Back to Overview
            </button>
          </div>
        </div>
      </app-wrapper>
    </container>
  `,
})
export class CertificationsComponent implements OnInit {
  certifications: any[] = [];
  certificationForm: FormGroup;
  showAddForm = false;
  editingCertification: any = null;

  constructor(
    private fb: FormBuilder,
    private assessorService: AssessorService,
    private certificationService: AssessorCertificationService,
    private router: Router,
    private toast: ToastService,
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadCertifications();
  }

  initializeForm(): void {
    this.certificationForm = this.fb.group({
      uuid: [null],
      title: ['', Validators.required],
      issuer: ['', Validators.required],
      description: ['', Validators.required],
      issueDate: ['', Validators.required],
      expiryDate: [''],
      noExpiration: [false],
    });
  }

  loadCertifications(): void {
    this.assessorService.getCurrentUserAssessorData().subscribe({
      next: (response) => {
        const data = response.data;
        if (data.certificationDtoList) {
          this.certifications = data.certificationDtoList;
        }
      },
      error: (error) => {
        console.error('Error loading certifications:', error);
      },
    });
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  goBack(): void {
    this.router.navigate(['/assessor/onboarding']);
  }

  saveAndContinue(): void {
    this.toast.success('Certifications section completed');
    this.router.navigate(['/assessor/onboarding/references']);
  }

  onNoExpirationChange(event: any): void {
    if (event.checked) {
      this.certificationForm.get('expiryDate')?.setValue('');
      this.certificationForm.get('expiryDate')?.disable();
    } else {
      this.certificationForm.get('expiryDate')?.enable();
    }
  }

  editCertification(certification: any): void {
    this.editingCertification = certification;
    const noExpiration = !certification.expiryDate;

    this.certificationForm.patchValue({
      ...certification,
      noExpiration,
    });

    if (noExpiration) {
      this.certificationForm.get('expiryDate')?.disable();
    }

    this.showAddForm = true;
  }

  deleteCertification(certification: any): void {
    if (confirm('Are you sure you want to delete this certification?')) {
      if (certification.uuid) {
        this.certificationService.delete(certification.uuid).subscribe({
          next: () => {
            this.certifications = this.certifications.filter(
              (c) => c !== certification,
            );
            this.toast.success('Certification deleted successfully');
          },
          error: (error) => {
            console.error('Error deleting certification:', error);
            this.toast.error('Failed to delete certification');
          },
        });
      } else {
        this.certifications = this.certifications.filter(
          (c) => c !== certification,
        );
        this.toast.success('Certification removed');
      }
    }
  }

  saveCertification(): void {
    if (this.certificationForm.valid) {
      const formData = this.certificationForm.value;

      // Remove UI-only fields
      const { noExpiration, ...certDataForApi } = formData;

      // If no expiration, ensure expiryDate is null
      if (noExpiration) {
        certDataForApi.expiryDate = null;
      }

      if (this.editingCertification && this.editingCertification.uuid) {
        // Update existing certification
        this.certificationService
          .update(this.editingCertification.uuid, certDataForApi)
          .subscribe({
            next: (response) => {
              const index = this.certifications.findIndex(
                (c) => c.uuid === this.editingCertification.uuid,
              );
              if (index !== -1) {
                this.certifications[index] = response.data;
              }
              this.toast.success('Certification updated successfully');
              this.cancelForm();
            },
            error: (error) => {
              console.error('Error updating certification:', error);
              this.toast.error('Failed to update certification');
            },
          });
      } else {
        // Create new certification
        this.certificationService.create(certDataForApi).subscribe({
          next: (response) => {
            this.certifications.push(response.data);
            this.toast.success('Certification added successfully');
            this.cancelForm();
          },
          error: (error) => {
            console.error('Error creating certification:', error);
            this.toast.error('Failed to add certification');
          },
        });
      }
    } else {
      this.toast.error('Please fill in all required fields');
    }
  }

  cancelForm(): void {
    this.showAddForm = false;
    this.editingCertification = null;
    this.certificationForm.reset();
    this.certificationForm.get('expiryDate')?.enable();
  }

  openAddDialog(): void {
    this.editingCertification = null;
    this.certificationForm.reset();
    this.certificationForm.get('expiryDate')?.enable();
    this.showAddForm = true;
  }

  openEditDialog(certification: any): void {
    this.editingCertification = certification;
    const noExpiration = !certification.expiryDate;

    this.certificationForm.patchValue({
      ...certification,
      noExpiration,
    });

    if (noExpiration) {
      this.certificationForm.get('expiryDate')?.disable();
    }

    this.showAddForm = true;
  }

  onDialogClose(result: any): void {
    this.showAddForm = false;
    if (!result) {
      this.cancelForm();
    }
  }

  trackByIndex(index: number): number {
    return index;
  }
}
