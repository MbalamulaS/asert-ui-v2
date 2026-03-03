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
import { AssessorReferenceService } from 'modules/assessment/assessor-reference.service';
import { ContainerComponent } from 'components/container/container.component';
import { HeaderComponent } from 'components/header/header.component';
import { WrapperComponent } from 'components/wrapper/wrapper.component';
import { TextInputComponent } from 'components/text-field/text-field.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ToastService } from 'app/toast.service';
import { DialogComponent } from 'components/dialog/dialog.component';

@Component({
  selector: 'app-references',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ContainerComponent,
    HeaderComponent,
    WrapperComponent,
    TextInputComponent,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
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
            title="Professional References"
            subtitle="Manage your professional references and recommendations"
          />
        </div>
      </app-wrapper>

      <!-- References List -->
      <app-wrapper>
        <div class="w-full max-w-4xl mx-auto">
          <div
            class="mat-mdc-card-header flex items-center justify-between mb-4"
          >
            <div>
              <mat-card-title class="flex items-center">
                <mat-icon class="text-teal-600 mr-3">contacts</mat-icon>
                Your Professional References
              </mat-card-title>
              <mat-card-subtitle
                >{{ references.length }} references added</mat-card-subtitle
              >
            </div>
            <button
              mat-raised-button
              (click)="openAddDialog()"
              class="bg-white text-black border border-gray-300 hover:bg-gray-50 shrink-0 mt-1"
            >
              <mat-icon class="mr-2">add</mat-icon>
              Add Reference
            </button>
          </div>
          <mat-card class="mb-6">
            <mat-card-content>
              <div *ngIf="references.length === 0" class="text-center py-8">
                <mat-icon class="text-gray-400 text-4xl mb-4"
                  >contacts</mat-icon
                >
                <h3 class="text-lg font-medium text-gray-900 mb-2">
                  No references added yet
                </h3>
                <p class="text-gray-600 mb-4">
                  Add professional references who can vouch for your work
                  experience
                </p>
                <button
                  mat-raised-button
                  (click)="openAddDialog()"
                  class="bg-teal-600 text-white hover:bg-teal-700"
                >
                  <mat-icon class="mr-2">add</mat-icon>
                  Add Your First Reference
                </button>
              </div>

              <div
                *ngIf="references.length > 0"
                class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                <div
                  *ngFor="let reference of references; trackBy: trackByIndex"
                  class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
                >
                  <div class="mb-3">
                    <h4 class="text-lg font-medium text-gray-900 mb-2">
                      {{ reference.name }}
                    </h4>
                    <p class="text-gray-600 mb-2 text-sm">
                      {{ reference.relationship }}
                    </p>
                    <div class="flex items-center text-xs text-gray-500">
                      <mat-icon class="text-sm mr-1">email</mat-icon>
                      {{ reference.email }}
                    </div>
                    <div class="flex items-center text-xs text-gray-500 mt-1">
                      <mat-icon class="text-sm mr-1">phone</mat-icon>
                      {{ reference.phone }}
                    </div>
                  </div>

                  <div
                    class="flex items-center justify-end space-x-1 pt-3 border-t border-gray-100"
                  >
                    <button
                      mat-icon-button
                      (click)="openEditDialog(reference)"
                      class="text-blue-600 hover:bg-blue-50"
                      [attr.aria-label]="'Edit reference'"
                    >
                      <mat-icon class="text-lg">edit</mat-icon>
                    </button>
                    <button
                      mat-icon-button
                      (click)="deleteReference(reference)"
                      class="text-red-600 hover:bg-red-50"
                      [attr.aria-label]="'Delete reference'"
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

      <!-- Add/Edit Reference Dialog -->
      <app-dialog
        [open]="showAddForm"
        [title]="editingReference ? 'Edit Reference' : 'Add New Reference'"
        width="600px"
        headerBgColor="bg-gray-100"
        headerTextColor="text-gray-900"
        (onClose)="onDialogClose($event)"
      >
        <ng-template>
          <div class="p-6">
            <form [formGroup]="referenceForm" class="space-y-4">
              <app-text-input
                label="Full Name"
                [formControl]="referenceForm.get('name')"
                [required]="true"
              />

              <app-text-input
                label="Relationship"
                [formControl]="referenceForm.get('relationship')"
                [required]="true"
                placeholder="e.g., Former Supervisor, Direct Manager, Colleague"
              />

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <app-text-input
                  label="Email Address"
                  type="email"
                  [formControl]="referenceForm.get('email')"
                  [required]="true"
                />
                <app-text-input
                  label="Phone Number"
                  [formControl]="referenceForm.get('phone')"
                  [required]="true"
                />
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
                (click)="saveReference()"
                [disabled]="referenceForm.invalid"
                class="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
              >
                {{ editingReference ? 'Update' : 'Add' }} Reference
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
export class ReferencesComponent implements OnInit {
  references: any[] = [];
  referenceForm: FormGroup;
  showAddForm = false;
  editingReference: any = null;

  constructor(
    private fb: FormBuilder,
    private assessorService: AssessorService,
    private referenceService: AssessorReferenceService,
    private router: Router,
    private toast: ToastService,
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadReferences();
  }

  initializeForm(): void {
    this.referenceForm = this.fb.group({
      uuid: [null],
      name: ['', Validators.required],
      relationship: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
    });
  }

  loadReferences(): void {
    this.assessorService.getCurrentUserAssessorData().subscribe({
      next: (response) => {
        const data = response.data;
        if (data.referenceDtoList) {
          this.references = data.referenceDtoList;
        }
      },
      error: (error) => {
        console.error('Error loading references:', error);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/assessor/onboarding']);
  }

  saveAndContinue(): void {
    this.toast.success('References section completed');
    this.router.navigate(['/assessor/onboarding/preferences']);
  }

  editReference(reference: any): void {
    this.editingReference = reference;
    this.referenceForm.patchValue(reference);
    this.showAddForm = true;
  }

  deleteReference(reference: any): void {
    if (confirm('Are you sure you want to delete this reference?')) {
      if (reference.uuid) {
        this.referenceService.delete(reference.uuid).subscribe({
          next: () => {
            this.references = this.references.filter((r) => r !== reference);
            this.toast.success('Reference deleted successfully');
          },
          error: (error) => {
            console.error('Error deleting reference:', error);
            this.toast.error('Failed to delete reference');
          },
        });
      } else {
        this.references = this.references.filter((r) => r !== reference);
        this.toast.success('Reference removed');
      }
    }
  }

  saveReference(): void {
    if (this.referenceForm.valid) {
      const formData = this.referenceForm.value;

      if (this.editingReference && this.editingReference.uuid) {
        // Update existing reference
        this.referenceService
          .update(this.editingReference.uuid, formData)
          .subscribe({
            next: (response) => {
              const index = this.references.findIndex(
                (r) => r.uuid === this.editingReference.uuid,
              );
              if (index !== -1) {
                this.references[index] = response.data;
              }
              this.toast.success('Reference updated successfully');
              this.cancelForm();
            },
            error: (error) => {
              console.error('Error updating reference:', error);
              this.toast.error('Failed to update reference');
            },
          });
      } else {
        // Create new reference
        this.referenceService.create(formData).subscribe({
          next: (response) => {
            this.references.push(response.data);
            this.toast.success('Reference added successfully');
            this.cancelForm();
          },
          error: (error) => {
            console.error('Error creating reference:', error);
            this.toast.error('Failed to add reference');
          },
        });
      }
    } else {
      this.toast.error('Please fill in all required fields');
    }
  }

  cancelForm(): void {
    this.showAddForm = false;
    this.editingReference = null;
    this.referenceForm.reset();
  }

  openAddDialog(): void {
    this.editingReference = null;
    this.referenceForm.reset();
    this.showAddForm = true;
  }

  openEditDialog(reference: any): void {
    this.editingReference = reference;
    this.referenceForm.patchValue(reference);
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
