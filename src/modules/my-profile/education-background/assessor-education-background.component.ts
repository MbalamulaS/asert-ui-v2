import { Component, OnInit } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import { heroCog6Tooth, heroMagnifyingGlass, heroPencilSquare, heroTrash, } from '@ng-icons/heroicons/outline';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ContainerComponent } from "components/container/container.component";
import { HeaderComponent } from "components/header/header.component";
import { WrapperComponent } from "components/wrapper/wrapper.component";
import { EducationBackground } from "modules/assessment/assessment";
import { AssessorEducationBackgroundService } from "modules/assessment/assessor-education-background.service";
import { ConfirmDialogComponent } from "components/confirm/confirm.dialog";
import { DialogComponent } from "components/dialog/dialog.component";
import {
  AssessorEducationBackgroundFormComponent,
} from "modules/my-profile/education-background/assessor-education-background-form.component";
import { DatePipe, NgForOf, NgIf } from "@angular/common";
import { ActionButtonComponent } from "components/action-button/action-button.component";
import { CantPipe } from "pipes/cant.pipe";
import { AssessorProgressComponent } from "modules/my-profile/assessor-progress.component";

@Component({
  selector: 'app-assessor-education-background',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    ContainerComponent,
    HeaderComponent,
    WrapperComponent,
    ConfirmDialogComponent,
    DialogComponent,
    AssessorEducationBackgroundFormComponent,
    DatePipe,
    NgIf,
    NgForOf,
    ActionButtonComponent,
    CantPipe,
    AssessorProgressComponent,
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
      <app-header title="Academic History"/>
      <app-wrapper>
        <app-assessor-progress></app-assessor-progress>
      </app-wrapper>
      <app-wrapper>
        <action-button
          label="Add Academic Record"
          class="w-full md:w-auto"
          icon="add"
          [isDisabled]="'' | cant: 'create' : 'EducationBackground'"
          (action)="openForm()"
        />
      </app-wrapper>

      <app-wrapper>
        <!-- Academic List -->
        <div *ngIf="academicList.length > 0; else noData" class="space-y-4">
          <div
            *ngFor="let item of academicList"
            class="bg-white border border-gray-200 rounded-lg p-4 shadow-sm flex justify-between items-center"
          >
            <!-- Left content -->
            <div>
              <div class="text-sm font-semibold text-gray-800">{{ item.course }}</div>
              <div class="text-xs text-gray-500">
                {{ item.institution }} —
                {{ item.fromDate | date:'MMMM, yyyy' }} -
                {{ item.toDate ? (item.toDate | date:'MMMM, yyyy') : 'Present' }}
              </div>
              <div class="text-xs text-gray-400 mt-1">
                {{ item.course }} • {{ item.graduated ? 'Graduated' : 'Ongoing' }}
              </div>
            </div>

            <!-- Right actions -->
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
            <p class="text-sm">No academic records found.</p>
            <p class="mt-2 text-sm">Click "Add Academic Record" to create one.</p>
          </div>
        </ng-template>

        <!-- Add/Edit Dialog -->
        <app-dialog
          [open]="isOpen"
          (onClose)="handleClose($event)"
          width="740px"
          title="Education Background Form"
        >
          <ng-template>
            <app-assessor-education-background-form (onSubmit)="saveData($event)"/>
          </ng-template>
        </app-dialog>

        <!-- Delete Confirmation Dialog -->
        <app-confirm-dialog
          [open]="isDeleteConfirmationDialogOpen"
          [title]="'Delete Education Background'"
          [message]="'Are you sure you want to delete this item?'"
          (onClose)="closeConfirmDialog($event)"
          (onConfirm)="handleConfirmDelete()"
        />
      </app-wrapper>
    </container>
  `,
})
export class AssessorEducationBackgroundComponent implements OnInit {
  academicList: EducationBackground[] = [];
  isOpen = false;
  selectedItem: EducationBackground | null = null;
  isDeleteConfirmationDialogOpen = false;

  constructor(private academicService: AssessorEducationBackgroundService,
              private datePipe: DatePipe,) {
  }

  ngOnInit(): void {
    this.loadList();
  }

  loadList(): void {
    this.academicService.get().subscribe({
      next: res => this.academicList = res.data,
      error: err => console.error('Failed to load academic history', err)
    });
  }

  openForm(entry: EducationBackground | null = null): void {
    this.selectedItem = entry;
    if (entry) {
      this.selectedItem.fromDate = this.datePipe.transform(this.selectedItem.fromDate, 'yyyy-MM-dd');
      this.selectedItem.toDate = this.datePipe.transform(this.selectedItem.toDate, 'yyyy-MM-dd');
    }
    this.academicService.populateForm(this.selectedItem)
    this.isOpen = true;
  }

  handleClose(result: boolean): void {
    this.isOpen = false;
    this.selectedItem = null;
    this.loadList();
  }

  async saveData(data: any) {
    if (data.uuid) {
      this.academicService.update(data.uuid, data).subscribe({
        next: response => {
          this.isOpen = false;
          this.loadList();
          this.academicService.clearForm();
        },
        error: error => {
        }
      });
    } else {
      this.academicService.create(data).subscribe({
        next: response => {
          this.isOpen = false;
          this.loadList();
          this.academicService.clearForm();
        },
        error: error => {
        }
      });
    }
  }


  openConfirmDialog(data: EducationBackground) {
    this.selectedItem = data;
    this.isDeleteConfirmationDialogOpen = true;
  }

  closeConfirmDialog(event: any) {
    this.isDeleteConfirmationDialogOpen = false;
  }

  handleConfirmDelete() {
    this.academicService.delete(this.selectedItem.uuid).subscribe({
      next: () => {
        this.loadList();
      },
    })
  }
}
