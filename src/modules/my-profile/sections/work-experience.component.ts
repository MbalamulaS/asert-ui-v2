import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AssessorEmploymentHistoryService } from 'modules/assessment/assessor-employment-history.service';
import { AssessorService } from 'modules/assessment/assessor.service';
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
  selector: 'app-work-experience',
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
            title="Work Experience"
            subtitle="Manage your employment history and professional experience"
          />
        </div>
      </app-wrapper>

      <!-- Existing Experience List -->
      <app-wrapper>
        <div class="w-full max-w-4xl mx-auto">
          <div
            class="mat-mdc-card-header flex items-center justify-between mb-4"
          >
            <div>
              <mat-card-title class="flex items-center">
                <mat-icon class="text-purple-600 mr-3">work</mat-icon>
                Your Work Experience
              </mat-card-title>
              <mat-card-subtitle
                >{{ experience.length }} positions added</mat-card-subtitle
              >
            </div>
            <button
              mat-raised-button
              (click)="openAddDialog()"
              class="bg-white text-black border border-gray-300 hover:bg-gray-50 shrink-0 mt-1"
            >
              <mat-icon class="mr-2">add</mat-icon>
              Add Position
            </button>
          </div>
          <mat-card class="mb-6">
            <mat-card-header class="flex items-start justify-between">
            </mat-card-header>

            <mat-card-content>
              <div *ngIf="experience.length === 0" class="text-center py-8">
                <mat-icon class="text-gray-400 text-4xl mb-4">work</mat-icon>
                <h3 class="text-lg font-medium text-gray-900 mb-2">
                  No work experience added yet
                </h3>
                <p class="text-gray-600 mb-4">
                  Add your first position to get started
                </p>
                <button
                  mat-raised-button
                  color="primary"
                  (click)="openAddDialog()"
                  class="bg-purple-600 text-white hover:bg-purple-700"
                >
                  <mat-icon class="mr-2">add</mat-icon>
                  Add Your First Position
                </button>
              </div>

              <div
                *ngIf="experience.length > 0"
                class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                <div
                  *ngFor="let position of experience; trackBy: trackByIndex"
                  class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
                >
                  <div class="mb-3">
                    <h4 class="text-lg font-medium text-gray-900 mb-2">
                      {{ position.positionHeld }}
                    </h4>
                    <mat-chip-listbox *ngIf="!position.toDate" class="mb-3">
                      <mat-chip class="bg-green-100 text-green-800">
                        Current Position
                      </mat-chip>
                    </mat-chip-listbox>
                    <p class="text-gray-600 mb-2 text-sm">
                      {{ position.company }}
                    </p>
                    <div class="flex items-center text-xs text-gray-500">
                      <mat-icon class="text-sm mr-1">calendar_today</mat-icon>
                      {{ formatDate(position.fromDate) }} -
                      {{
                        position.toDate
                          ? formatDate(position.toDate)
                          : 'Present'
                      }}
                    </div>
                  </div>

                  <div
                    class="flex items-center justify-end space-x-1 pt-3 border-t border-gray-100"
                  >
                    <button
                      mat-icon-button
                      (click)="openEditDialog(position)"
                      class="text-blue-600 hover:bg-blue-50"
                      [attr.aria-label]="'Edit position'"
                    >
                      <mat-icon class="text-lg">edit</mat-icon>
                    </button>
                    <button
                      mat-icon-button
                      (click)="deletePosition(position)"
                      class="text-red-600 hover:bg-red-50"
                      [attr.aria-label]="'Delete position'"
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

      <!-- Add/Edit Position Dialog -->
      <app-dialog
        [open]="showAddForm"
        [title]="editingPosition ? 'Edit Position' : 'Add New Position'"
        width="600px"
        headerBgColor="bg-gray-100"
        headerTextColor="text-gray-900"
        (onClose)="onDialogClose($event)"
      >
        <ng-template>
          <div class="p-6">
            <form [formGroup]="positionForm" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <app-text-input
                  label="Company"
                  [formControl]="positionForm.get('company')"
                  [required]="true"
                />
                <app-text-input
                  label="Position/Title"
                  [formControl]="positionForm.get('positionHeld')"
                  [required]="true"
                />
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <app-datepicker
                  label="Start Date"
                  [formControl]="positionForm.get('fromDate')"
                  [required]="true"
                />
                <app-datepicker
                  label="End Date"
                  [formControl]="positionForm.get('toDate')"
                  placeholder="Leave empty if current"
                  [disabled]="positionForm.get('isCurrent')?.value"
                />
              </div>

              <div class="flex items-center">
                <mat-checkbox
                  [formControl]="positionForm.get('isCurrent')"
                  (change)="onCurrentChange($event)"
                >
                  This is my current position
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
                (click)="savePosition()"
                [disabled]="positionForm.invalid"
                class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                {{ editingPosition ? 'Update' : 'Add' }} Position
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
})
export class WorkExperienceComponent implements OnInit {
  experience: any[] = [];
  positionForm: FormGroup;
  showAddForm = false;
  editingPosition: any = null;

  constructor(
    private fb: FormBuilder,
    private assessorService: AssessorService,
    private employmentService: AssessorEmploymentHistoryService,
    private router: Router,
    private toast: ToastService,
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadExperience();
  }

  initializeForm(): void {
    this.positionForm = this.fb.group({
      uuid: [null],
      company: ['', Validators.required],
      positionHeld: ['', Validators.required],
      fromDate: ['', Validators.required],
      toDate: [''],
      isCurrent: [false],
    });
  }

  loadExperience(): void {
    this.assessorService.getCurrentUserAssessorData().subscribe({
      next: (response) => {
        const data = response.data;
        if (data.employmentHistoryDtoList) {
          this.experience = data.employmentHistoryDtoList;
        }
      },
      error: (error) => {
        console.error('Error loading experience:', error);
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

  onCurrentChange(event: any): void {
    if (event.checked) {
      this.positionForm.get('toDate')?.setValue('');
      this.positionForm.get('toDate')?.disable();
    } else {
      this.positionForm.get('toDate')?.enable();
    }
  }

  editPosition(position: any): void {
    this.editingPosition = position;
    const isCurrent = !position.toDate;

    this.positionForm.patchValue({
      ...position,
      isCurrent,
    });

    if (isCurrent) {
      this.positionForm.get('toDate')?.disable();
    }

    this.showAddForm = true;
  }

  deletePosition(position: any): void {
    if (confirm('Are you sure you want to delete this position?')) {
      if (position.uuid) {
        this.employmentService.delete(position.uuid).subscribe({
          next: () => {
            this.experience = this.experience.filter((p) => p !== position);
            this.toast.success('Position deleted successfully');
          },
          error: (error) => {
            console.error('Error deleting position:', error);
            this.toast.error('Failed to delete position');
          },
        });
      } else {
        this.experience = this.experience.filter((p) => p !== position);
        this.toast.success('Position removed');
      }
    }
  }

  savePosition(): void {
    if (this.positionForm.valid) {
      const formData = this.positionForm.value;

      // Remove UI-only fields
      const { isCurrent, ...empDataForApi } = formData;

      // If current position, ensure toDate is null
      if (isCurrent) {
        empDataForApi.toDate = null;
      }

      if (this.editingPosition && this.editingPosition.uuid) {
        // Update existing position
        this.employmentService
          .update(this.editingPosition.uuid, empDataForApi)
          .subscribe({
            next: (response) => {
              const index = this.experience.findIndex(
                (p) => p.uuid === this.editingPosition.uuid,
              );
              if (index !== -1) {
                this.experience[index] = response.data;
              }
              this.toast.success('Position updated successfully');
              this.cancelForm();
            },
            error: (error) => {
              console.error('Error updating position:', error);
              this.toast.error('Failed to update position');
            },
          });
      } else {
        // Create new position
        this.employmentService.create(empDataForApi).subscribe({
          next: (response) => {
            this.experience.push(response.data);
            this.toast.success('Position added successfully');
            this.cancelForm();
          },
          error: (error) => {
            console.error('Error creating position:', error);
            this.toast.error('Failed to add position');
          },
        });
      }
    } else {
      this.toast.error('Please fill in all required fields');
    }
  }

  cancelForm(): void {
    this.showAddForm = false;
    this.editingPosition = null;
    this.positionForm.reset();
    this.positionForm.get('toDate')?.enable();
  }

  goBack(): void {
    this.router.navigate(['/assessor/onboarding']);
  }

  saveAndContinue(): void {
    if (this.experience.length > 0) {
      this.toast.success('Work experience completed');
      this.router.navigate(['/assessor/onboarding/references']);
    } else {
      this.toast.error('Please add at least one work experience');
    }
  }

  openAddDialog(): void {
    this.editingPosition = null;
    this.positionForm.reset();
    this.positionForm.get('toDate')?.enable();
    this.showAddForm = true;
  }

  openEditDialog(position: any): void {
    this.editingPosition = position;
    const isCurrent = !position.toDate;

    this.positionForm.patchValue({
      ...position,
      isCurrent,
    });

    if (isCurrent) {
      this.positionForm.get('toDate')?.disable();
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
