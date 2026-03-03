import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AssessorEducationBackgroundService } from 'modules/assessment/assessor-education-background.service';
import { AssessorService } from 'modules/assessment/assessor.service';
import { ContainerComponent } from 'components/container/container.component';
import { HeaderComponent } from 'components/header/header.component';
import { WrapperComponent } from 'components/wrapper/wrapper.component';
import { TextInputComponent } from 'components/text-field/text-field.component';
import { SelectComponent } from 'components/select/select.component';
import { DatepickerComponent } from 'components/datepicker/datepicker.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { ToastService } from 'app/toast.service';
import { DialogComponent } from 'components/dialog/dialog.component';

@Component({
  selector: 'app-academic-qualifications',
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
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
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
            title="Academic Qualifications"
            subtitle="Manage your education background and qualifications"
          />
        </div>
      </app-wrapper>

      <!-- Existing Qualifications List -->
      <app-wrapper>
        <div class="w-full max-w-4xl mx-auto">
          <div
            class="mat-mdc-card-header flex items-center justify-between mb-4"
          >
            <div>
              <mat-card-title class="flex items-center">
                <mat-icon class="text-green-600 mr-3">school</mat-icon>
                Your Qualifications
              </mat-card-title>
              <mat-card-subtitle
                >{{ qualifications.length }} qualifications
                added</mat-card-subtitle
              >
            </div>
            <button
              mat-raised-button
              (click)="openAddDialog()"
              class="bg-white text-black border border-gray-300 hover:bg-gray-50 shrink-0 mt-1"
            >
              <mat-icon class="mr-2">add</mat-icon>
              Add Qualification
            </button>
          </div>
          <mat-card class="mb-6">
            <mat-card-content>
              <div *ngIf="qualifications.length === 0" class="text-center py-8">
                <mat-icon class="text-gray-400 text-4xl mb-4">school</mat-icon>
                <h3 class="text-lg font-medium text-gray-900 mb-2">
                  No qualifications added yet
                </h3>
                <p class="text-gray-600 mb-4">
                  Add your first academic qualification to get started
                </p>
                <button
                  mat-raised-button
                  (click)="openAddDialog()"
                  class="bg-green-600 text-white hover:bg-green-700"
                >
                  <mat-icon class="mr-2">add</mat-icon>
                  Add Your First Qualification
                </button>
              </div>

              <div
                *ngIf="qualifications.length > 0"
                class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                <div
                  *ngFor="
                    let qualification of qualifications;
                    trackBy: trackByIndex
                  "
                  class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
                >
                  <div class="mb-3">
                    <h4 class="text-lg font-medium text-gray-900 mb-2">
                      {{ qualification.course }}
                    </h4>
                    <mat-chip-listbox class="mb-3">
                      <mat-chip class="bg-green-100 text-green-800">
                        {{
                          getEducationLevelLabel(qualification.educationLevelId)
                        }}
                      </mat-chip>
                    </mat-chip-listbox>
                    <p class="text-gray-600 mb-2 text-sm">
                      {{ qualification.institution }}
                    </p>
                    <div class="flex items-center text-xs text-gray-500 mb-2">
                      <mat-icon class="text-sm mr-1">calendar_today</mat-icon>
                      {{ formatDate(qualification.fromDate) }} -
                      {{
                        qualification.toDate
                          ? formatDate(qualification.toDate)
                          : 'Present'
                      }}
                    </div>
                    <div
                      *ngIf="qualification.graduated"
                      class="flex items-center text-xs text-green-600"
                    >
                      <mat-icon class="text-sm mr-1">check_circle</mat-icon>
                      Graduated
                    </div>
                  </div>

                  <div
                    class="flex items-center justify-end space-x-1 pt-3 border-t border-gray-100"
                  >
                    <button
                      mat-icon-button
                      (click)="openEditDialog(qualification)"
                      class="text-blue-600 hover:bg-blue-50"
                      [attr.aria-label]="'Edit qualification'"
                    >
                      <mat-icon class="text-lg">edit</mat-icon>
                    </button>
                    <button
                      mat-icon-button
                      (click)="deleteQualification(qualification)"
                      class="text-red-600 hover:bg-red-50"
                      [attr.aria-label]="'Delete qualification'"
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

      <!-- Add/Edit Qualification Dialog -->
      <app-dialog
        [open]="showAddForm"
        [title]="
          editingQualification ? 'Edit Qualification' : 'Add New Qualification'
        "
        width="600px"
        headerBgColor="bg-gray-100"
        headerTextColor="text-gray-900"
        (onClose)="onDialogClose($event)"
      >
        <ng-template>
          <div class="p-6">
            <form [formGroup]="qualificationForm" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <app-text-input
                  label="Institution"
                  [formControl]="qualificationForm.get('institution')"
                  [required]="true"
                />
                <app-text-input
                  label="Degree/Course"
                  [formControl]="qualificationForm.get('course')"
                  [required]="true"
                />
              </div>

              <app-select
                label="Education Level"
                [formControl]="qualificationForm.get('educationLevelId')"
                [options]="educationLevelOptions"
                [required]="true"
              />

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <app-datepicker
                  label="Start Date"
                  [formControl]="qualificationForm.get('fromDate')"
                  [required]="true"
                />
                <app-datepicker
                  label="End Date"
                  [formControl]="qualificationForm.get('toDate')"
                  placeholder="Leave empty if ongoing"
                />
              </div>

              <div class="flex items-center">
                <input
                  type="checkbox"
                  id="graduated"
                  [formControl]="qualificationForm.get('graduated')"
                  class="mr-2"
                />
                <label for="graduated" class="text-sm text-gray-700"
                  >I have graduated from this program</label
                >
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
                (click)="saveQualification()"
                [disabled]="qualificationForm.invalid"
                class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                {{ editingQualification ? 'Update' : 'Add' }} Qualification
              </button>
            </div>
          </div>
        </ng-template>
      </app-dialog>

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
  styles: [
    `
      .mat-mdc-card {
        @apply shadow-sm border border-gray-100;
      }
    `,
  ],
})
export class AcademicQualificationsComponent implements OnInit {
  qualifications: any[] = [];
  qualificationForm: FormGroup;
  showAddForm = false;
  editingQualification: any = null;

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
    private fb: FormBuilder,
    private assessorService: AssessorService,
    private educationService: AssessorEducationBackgroundService,
    private router: Router,
    private toast: ToastService,
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadQualifications();
  }

  initializeForm(): void {
    this.qualificationForm = this.fb.group({
      uuid: [null],
      institution: ['', Validators.required],
      course: ['', Validators.required],
      fromDate: ['', Validators.required],
      toDate: [''],
      educationLevelId: [null, Validators.required],
      graduated: [true],
    });
  }

  loadQualifications(): void {
    this.assessorService.getCurrentUserAssessorData().subscribe({
      next: (response) => {
        const data = response.data;
        if (data.educationBackgroundList) {
          this.qualifications = data.educationBackgroundList;
        }
      },
      error: (error) => {
        console.error('Error loading qualifications:', error);
      },
    });
  }

  getEducationLevelLabel(levelId: number): string {
    const level = this.educationLevelOptions.find((l) => l.value === levelId);
    return level ? level.label : 'Unknown';
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
    });
  }

  editQualification(qualification: any): void {
    this.editingQualification = qualification;
    this.qualificationForm.patchValue(qualification);
    this.showAddForm = true;
  }

  deleteQualification(qualification: any): void {
    if (confirm('Are you sure you want to delete this qualification?')) {
      if (qualification.uuid) {
        this.educationService.delete(qualification.uuid).subscribe({
          next: () => {
            this.qualifications = this.qualifications.filter(
              (q) => q !== qualification,
            );
            this.toast.success('Qualification deleted successfully');
          },
          error: (error) => {
            console.error('Error deleting qualification:', error);
            this.toast.error('Failed to delete qualification');
          },
        });
      } else {
        this.qualifications = this.qualifications.filter(
          (q) => q !== qualification,
        );
        this.toast.success('Qualification removed');
      }
    }
  }

  saveQualification(): void {
    if (this.qualificationForm.valid) {
      const formData = this.qualificationForm.value;

      if (this.editingQualification && this.editingQualification.uuid) {
        // Update existing qualification
        this.educationService
          .update(this.editingQualification.uuid, formData)
          .subscribe({
            next: (response) => {
              const index = this.qualifications.findIndex(
                (q) => q.uuid === this.editingQualification.uuid,
              );
              if (index !== -1) {
                this.qualifications[index] = response.data;
              }
              this.toast.success('Qualification updated successfully');
              this.cancelForm();
            },
            error: (error) => {
              console.error('Error updating qualification:', error);
              this.toast.error('Failed to update qualification');
            },
          });
      } else {
        // Create new qualification
        this.educationService.create(formData).subscribe({
          next: (response) => {
            this.qualifications.push(response.data);
            this.toast.success('Qualification added successfully');
            this.cancelForm();
          },
          error: (error) => {
            console.error('Error creating qualification:', error);
            this.toast.error('Failed to add qualification');
          },
        });
      }
    } else {
      this.toast.error('Please fill in all required fields');
    }
  }

  cancelForm(): void {
    this.showAddForm = false;
    this.editingQualification = null;
    this.qualificationForm.reset();
    this.qualificationForm.patchValue({
      graduated: true,
    });
  }

  goBack(): void {
    this.router.navigate(['/assessor/onboarding']);
  }

  saveAndContinue(): void {
    if (this.qualifications.length > 0) {
      this.toast.success('Academic qualifications completed');
      this.router.navigate(['/assessor/onboarding/employment']);
    } else {
      this.toast.error('Please add at least one qualification');
    }
  }

  openAddDialog(): void {
    this.editingQualification = null;
    this.qualificationForm.reset();
    this.qualificationForm.patchValue({
      graduated: true,
    });
    this.showAddForm = true;
  }

  openEditDialog(qualification: any): void {
    this.editingQualification = qualification;
    this.qualificationForm.patchValue(qualification);
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
