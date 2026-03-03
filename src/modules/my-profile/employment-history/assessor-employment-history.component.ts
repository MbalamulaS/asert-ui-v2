import {Component, OnInit} from '@angular/core';
import {provideIcons} from '@ng-icons/core';
import {heroCog6Tooth, heroMagnifyingGlass, heroPencilSquare, heroTrash,} from '@ng-icons/heroicons/outline';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {ConfirmDialogComponent} from "components/confirm/confirm.dialog";
import {ContainerComponent} from "components/container/container.component";
import {HeaderComponent} from "components/header/header.component";
import {WrapperComponent} from "components/wrapper/wrapper.component";
import {ActionButtonComponent} from "components/action-button/action-button.component";
import {DatePipe, NgForOf, NgIf} from "@angular/common";
import {DialogComponent} from "components/dialog/dialog.component";
import {CantPipe} from "pipes/cant.pipe";
import {
  AssessorEmploymentHistoryFormComponent
} from "modules/my-profile/employment-history/assessor-employment-history-form.component";
import {EmploymentHistory} from "modules/assessment/assessment";
import {AssessorEmploymentHistoryService} from "modules/assessment/assessor-employment-history.service";
import {AssessorProgressComponent} from "modules/my-profile/assessor-progress.component";

@Component({
  selector: 'app-assessor-employment-history',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    ConfirmDialogComponent,
    ContainerComponent,
    HeaderComponent,
    WrapperComponent,
    ActionButtonComponent,
    NgIf,
    NgForOf,
    DatePipe,
    DialogComponent,
    CantPipe,
    AssessorEmploymentHistoryFormComponent,
    AssessorProgressComponent

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
      <app-header title="Employment History"/>

      <!-- Profile Completion Bar -->
      <app-wrapper>
        <app-assessor-progress></app-assessor-progress>
      </app-wrapper>

      <app-wrapper>
        <action-button
          label="Add Employment History"
          class="w-full md:w-auto"
          icon="add"
          [isDisabled]="'' | cant: 'create' : 'EmploymentHistory'"
          (action)="openForm()"
        />
      </app-wrapper>

      <app-wrapper>
        <!-- Employment List -->
        <div *ngIf="employmentList.length > 0; else noData" class="space-y-4">
          <div
            *ngFor="let item of employmentList"
            class="bg-white border border-gray-200 rounded-lg p-4 shadow-sm flex justify-between items-center"
          >
            <div>
              <div class="text-sm font-semibold text-gray-800">{{ item.positionHeld }}</div>
              <div class="text-xs text-gray-500">
                {{ item.company }} —
                {{ item.fromDate | date:'MMMM yyyy' }} -
                {{ item.toDate ? (item.toDate | date:'MMMM yyyy') : 'Present' }}
              </div>
            </div>

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
            <p class="text-sm">No employment records found.</p>
            <p class="mt-2 text-sm">Click "Add Employment Record" to get started.</p>
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
            <app-assessor-employment-history-form (onSubmit)="saveData($event)"/>
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
export class AssessorEmploymentHistoryComponent implements OnInit {
  employmentList: EmploymentHistory[] = [];
  isOpen = false;
  selectedItem: EmploymentHistory | null = null;
  isDeleteConfirmationDialogOpen = false;

  constructor(private service: AssessorEmploymentHistoryService, private datePipe: DatePipe,) {
  }

  ngOnInit(): void {
    this.loadList();
  }

  loadList(): void {
    this.service.get().subscribe({
      next: res => this.employmentList = res.data,
      error: err => console.error('Failed to load data', err)
    });
  }

  openForm(entry: EmploymentHistory | null = null): void {
    this.selectedItem = entry;
    if (entry) {
      this.selectedItem.fromDate = this.datePipe.transform(this.selectedItem.fromDate, 'yyyy-MM-dd');
      this.selectedItem.toDate = this.datePipe.transform(this.selectedItem.toDate, 'yyyy-MM-dd');
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


  openConfirmDialog(data: EmploymentHistory) {
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
