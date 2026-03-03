import {Component, OnInit} from '@angular/core';
import {provideIcons} from '@ng-icons/core';
import {heroCog6Tooth, heroMagnifyingGlass, heroPencilSquare, heroTrash,} from '@ng-icons/heroicons/outline';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {AssessorCertification} from "modules/assessment/assessment";
import {DatePipe, NgForOf, NgIf} from "@angular/common";
import {AssessorCertificationService} from "modules/assessment/assessor-certification.service";
import {ActionButtonComponent} from "components/action-button/action-button.component";
import {AssessorProgressComponent} from "modules/my-profile/assessor-progress.component";
import {CantPipe} from "pipes/cant.pipe";
import {ContainerComponent} from "components/container/container.component";
import {HeaderComponent} from "components/header/header.component";
import {WrapperComponent} from "components/wrapper/wrapper.component";
import {DialogComponent} from "components/dialog/dialog.component";
import {ConfirmDialogComponent} from "components/confirm/confirm.dialog";
import {
  AssessorCertificationFormComponent
} from "modules/my-profile/certification/assessor-certification-form.component";

@Component({
  selector: 'app-assessor-certification',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    ActionButtonComponent,
    AssessorProgressComponent,
    CantPipe,
    ContainerComponent,
    HeaderComponent,
    WrapperComponent,
    DialogComponent,
    ConfirmDialogComponent,
    AssessorCertificationFormComponent,
    DatePipe,
    NgIf,
    NgForOf,

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
      <app-header title="Career Certifications"/>
      <app-wrapper>
        <app-assessor-progress></app-assessor-progress>
      </app-wrapper>
      <app-wrapper>
        <action-button
          label="Add Certification"
          class="w-full md:w-auto"
          icon="add"
          [isDisabled]="'' | cant: 'create' : 'AssessorCertification'"
          (action)="openForm()"
        />
      </app-wrapper>

      <app-wrapper>
        <!-- Certification List -->
        <div *ngIf="itemList.length > 0; else noData" class="space-y-4">
          <div
            *ngFor="let item of itemList"
            class="bg-white border border-gray-200 rounded-lg p-4 shadow-sm flex justify-between items-start"
          >
            <!-- Left: Certification Info -->
            <div>
              <div class="text-sm font-semibold text-gray-800">
                {{ item.title }}
              </div>

              <div class="text-xs text-gray-500 mt-1">
                Issued by {{ item.issuer }} —
                {{ item.issueDate | date: 'MMMM yyyy' }}
                <span *ngIf="item.expiryDate"> • Expires {{ item.expiryDate | date: 'MMMM yyyy' }}</span>
              </div>

              <div *ngIf="item.description" class="text-xs text-gray-400 mt-1 line-clamp-2">
                {{ item.description }}
              </div>
            </div>

            <!-- Right: Action Buttons -->
            <div class="flex items-center gap-2 ml-4">
              <button
                mat-icon-button
                color="primary"
                (click)="openForm(item)"
                aria-label="Edit"
                class="text-blue-600 hover:text-blue-800"
              >
                <mat-icon>edit</mat-icon>
              </button>

              <button
                mat-icon-button
                color="warn"
                (click)="openConfirmDialog(item)"
                aria-label="Delete"
                class="text-red-600 hover:text-red-800"
              >
                <mat-icon>delete</mat-icon>
              </button>
            </div>
          </div>
        </div>

        <!-- No Data Fallback -->
        <ng-template #noData>
          <div class="text-center text-gray-500 mt-10">
            <p class="text-sm">No certifications found.</p>
            <p class="mt-2 text-sm">Click "Add Certification" to get started.</p>
          </div>
        </ng-template>

        <!-- Add/Edit Dialog -->
        <app-dialog
          [open]="isOpen"
          (onClose)="handleClose($event)"
          width="740px"
          title="Certification Form"
        >
          <ng-template>
            <app-assessor-certification-form (onSubmit)="saveData($event)"/>
          </ng-template>
        </app-dialog>

        <!-- Delete Confirmation Dialog -->
        <app-confirm-dialog
          [open]="isDeleteConfirmationDialogOpen"
          [title]="'Delete Certification'"
          [message]="'Are you sure you want to delete this certification?'"
          (onClose)="closeConfirmDialog($event)"
          (onConfirm)="handleConfirmDelete()"
        />
      </app-wrapper>
    </container>
  `,
})
export class AssessorCertificationComponent implements OnInit {
  itemList: AssessorCertification[] = [];
  isOpen = false;
  selectedItem: AssessorCertification | null = null;
  isDeleteConfirmationDialogOpen = false;

  constructor(private service: AssessorCertificationService, private datePipe: DatePipe,) {
  }

  ngOnInit(): void {
    this.loadList();
  }

  loadList(): void {
    this.service.get().subscribe({
      next: res => this.itemList = res.data,
      error: err => console.error('Failed to load certifications', err)
    });
  }

  openForm(entry: AssessorCertification | null = null): void {
    this.selectedItem = entry;
    if (entry) {
      this.selectedItem.issueDate = this.datePipe.transform(this.selectedItem.issueDate, 'yyyy-MM-dd');
      this.selectedItem.expiryDate = this.datePipe.transform(this.selectedItem.expiryDate, 'yyyy-MM-dd');
    }
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


  openConfirmDialog(data: AssessorCertification) {
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
