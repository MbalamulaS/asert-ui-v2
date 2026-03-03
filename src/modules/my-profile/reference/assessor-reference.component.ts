import { Component, OnInit } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import { heroCog6Tooth, heroMagnifyingGlass, heroPencilSquare, heroTrash, } from '@ng-icons/heroicons/outline';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AssessorReference } from "modules/assessment/assessment";
import { AssessorReferenceService } from "modules/assessment/assessor-reference.service";
import { ActionButtonComponent } from "components/action-button/action-button.component";
import { AssessorProgressComponent } from "modules/my-profile/assessor-progress.component";
import { CantPipe } from "pipes/cant.pipe";
import { ConfirmDialogComponent } from "components/confirm/confirm.dialog";
import { ContainerComponent } from "components/container/container.component";
import { NgForOf, NgIf } from "@angular/common";
import { DialogComponent } from "components/dialog/dialog.component";
import { HeaderComponent } from "components/header/header.component";
import { WrapperComponent } from "components/wrapper/wrapper.component";
import { AssessorReferenceFormComponent } from "modules/my-profile/reference/assessor-reference-form.component";

@Component({
  selector: 'app-assessor-references',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    ActionButtonComponent,
    AssessorProgressComponent,
    CantPipe,
    ConfirmDialogComponent,
    ContainerComponent,
    DialogComponent,
    HeaderComponent,
    NgForOf,
    NgIf,
    WrapperComponent,
    AssessorReferenceFormComponent
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
    <container>
      <app-header title="References"/>

      <!-- Profile Completion Bar -->
      <app-wrapper>
        <app-assessor-progress></app-assessor-progress>
      </app-wrapper>

      <app-wrapper>
        <action-button
          label="Add Reference"
          class="w-full md:w-auto"
          icon="add"
          [isDisabled]="'' | cant: 'create' : 'AssessorReference'"
          (action)="openForm()"
        />
      </app-wrapper>

      <app-wrapper>
        <!-- Reference List -->
        <div *ngIf="referenceList.length > 0; else noData" class="space-y-4">
          <div
            *ngFor="let ref of referenceList"
            class="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
          >
            <div class="flex justify-between items-start gap-4">
              <!-- Left Content -->
              <div>
                <h3 class="text-base font-semibold text-gray-800">{{ ref.name }}</h3>
                <p class="text-xs text-gray-500 italic">{{ ref.relationship }}</p>
                <div class="mt-2 flex flex-col gap-1 text-sm text-blue-600">
                  <a [href]="'tel:' + ref.phone" class="flex items-center hover:underline">
                    <mat-icon class="mr-1 text-base text-blue-500">call</mat-icon>
                    {{ ref.phone }}
                  </a>
                  <a [href]="'mailto:' + ref.email" class="flex items-center hover:underline">
                    <mat-icon class="mr-1 text-base text-blue-500">email</mat-icon>
                    {{ ref.email }}
                  </a>
                </div>
              </div>

              <!-- Edit/Delete -->
              <div class="flex items-center gap-2 ml-4">
                <button
                  mat-icon-button
                  color="primary"
                  (click)="openForm(ref)"
                  aria-label="Edit"
                  class="text-blue-600 hover:text-blue-800"
                >
                  <mat-icon>edit</mat-icon>
                </button>

                <button
                  mat-icon-button
                  color="warn"
                  (click)="openConfirmDialog(ref)"
                  aria-label="Delete"
                  class="text-red-600 hover:text-red-800"
                >
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            </div>
          </div>
        </div>

        <ng-template #noData>
          <div class="text-center text-gray-500 mt-10">
            <p class="text-sm">No references added yet.</p>
            <p class="mt-2 text-sm">Click "Add Reference" to include someone who can vouch for you.</p>
          </div>
        </ng-template>

        <!-- Add/Edit Dialog -->
        <app-dialog
          [open]="isOpen"
          (onClose)="handleClose($event)"
          width="740px"
          title="Employment History Form"
        >
          <ng-template>
            <app-assessor-reference-form (onSubmit)="saveData($event)"/>
          </ng-template>
        </app-dialog>

        <!-- Delete Confirmation Dialog -->
        <app-confirm-dialog
          [open]="isDeleteConfirmationDialogOpen"
          [title]="'Delete Employment History'"
          [message]="'Are you sure you want to delete this item?'"
          (onClose)="closeConfirmDialog($event)"
          (onConfirm)="handleConfirmDelete()"
        />
      </app-wrapper>
    </container>
  `,
})
export class AssessorReferenceComponent implements OnInit {
  referenceList: AssessorReference[] = [];
  isOpen = false;
  selectedItem: AssessorReference | null = null;
  isDeleteConfirmationDialogOpen = false;

  constructor(private service: AssessorReferenceService) {
  }

  ngOnInit(): void {
    this.loadList();
  }

  loadList(): void {
    this.service.get().subscribe({
      next: res => this.referenceList = res.data,
      error: err => console.error('Failed to load data', err)
    });
  }

  openForm(entry: AssessorReference | null = null): void {
    this.selectedItem = entry;
    this.service.populateForm(this.selectedItem)
    this.isOpen = true;
  }

  handleClose(result: boolean): void {
    this.isOpen = false;
    this.selectedItem = null;
    this.loadList();
  }

  async saveData(data: any) {
    if (data.uuid) {
      this.service.update(data.uuid, data).subscribe({
        next: response => {
          this.isOpen = false;
          this.loadList();
          this.service.clearForm();
        },
        error: error => {
        }
      });
    } else {
      this.service.create(data).subscribe({
        next: response => {
          this.isOpen = false;
          this.loadList();
          this.service.clearForm();
        },
        error: error => {
        }
      });
    }
  }


  openConfirmDialog(data: AssessorReference) {
    this.selectedItem = data;
    this.isDeleteConfirmationDialogOpen = true;
  }

  closeConfirmDialog(event: any) {
    this.isDeleteConfirmationDialogOpen = false;
  }

  handleConfirmDelete() {
    this.service.delete(this.selectedItem.uuid).subscribe({
      next: () => {
        this.loadList();
      },
    })
  }
}
