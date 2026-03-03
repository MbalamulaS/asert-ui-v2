import {Component, OnInit} from '@angular/core';
import {provideIcons} from '@ng-icons/core';
import {heroCog6Tooth, heroMagnifyingGlass, heroPencilSquare, heroTrash,} from '@ng-icons/heroicons/outline';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {WrapperComponent} from "components/wrapper/wrapper.component";
import {DatePipe, NgForOf, NgIf} from "@angular/common";
import {FormBuilder, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {ContainerComponent} from "components/container/container.component";
import {HeaderComponent} from "components/header/header.component";
import {AssessorDocumentService} from "modules/assessment/assessor-document.service";
import {MatDialog} from "@angular/material/dialog";
import {PdfViewerDialogComponent} from "modules/my-profile/pdf-viewer";
import {AssessorProgressComponent} from "modules/my-profile/assessor-progress.component";
import {AssessorDocument} from "modules/assessment/assessment";
import {ConfirmDialogComponent} from "components/confirm/confirm.dialog";
import {DialogComponent} from "components/dialog/dialog.component";
import {AssessorDocumentFormComponent} from "modules/my-profile/document/assessor-document-form.component";
import {ActionButtonComponent} from "components/action-button/action-button.component";
import {CantPipe} from "pipes/cant.pipe";

@Component({
  selector: 'app-assessor-document',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    WrapperComponent,
    DatePipe,
    NgIf,
    NgForOf,
    FormsModule,
    ContainerComponent,
    HeaderComponent,
    ReactiveFormsModule,
    AssessorProgressComponent,
    ConfirmDialogComponent,
    DialogComponent,
    AssessorDocumentFormComponent,
    ActionButtonComponent,
    CantPipe,
    PdfViewerDialogComponent,


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
      <app-header title="Documents"/>

      <app-wrapper>
        <app-assessor-progress></app-assessor-progress>
      </app-wrapper>

      <app-wrapper>
        <action-button
          label="Upload Document"
          class="w-full md:w-auto"
          icon="upload"
          [isDisabled]="'' | cant: 'create' : 'AssessorDocument'"
          (action)="openForm()"
        />
      </app-wrapper>

      <!-- Layout Container -->
      <app-wrapper>
        <div class="flex flex-col lg:flex-row gap-6 w-full">
          <!-- Uploaded Documents (Left - wider now) -->
          <div class="w-full space-y-4">
            <div *ngIf="documentList.length > 0; else noData" class="space-y-4">
              <div
                *ngFor="let doc of documentList"
                class="bg-white border border-gray-200 p-4 rounded-lg shadow-sm flex justify-between items-start"
              >
                <div>
                  <div class="font-semibold text-gray-800">{{ doc.title }}</div>
                  <div class="text-xs text-gray-500">
                    {{ doc.documentTypeName }} • {{ doc.uploadedAt | date: 'mediumDate' }}
                  </div>
                  <div class="text-xs mt-1 text-green-600" *ngIf="doc.verified">✅ Verified</div>
                  <div class="text-xs mt-1 text-yellow-500" *ngIf="!doc.verified">⏳ Pending</div>
                </div>

                <div class="flex flex-col items-end gap-2">
                  <button
                    type="button"
                    class="text-blue-600 hover:underline text-sm"
                    (click)="openPdfDialog(doc)"
                  >
                    View PDF
                  </button>

                  <button
                    mat-icon-button
                    color="warn"
                    (click)="openConfirmDialog(doc)"
                    aria-label="Delete"
                    class="text-red-600 hover:text-red-800"
                  >
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              </div>
            </div>

            <ng-template #noData>
              <div class="text-center text-gray-500 mt-10">
                <p class="text-sm">No documents uploaded yet.</p>
                <p class="mt-2 text-sm">Upload important documents like CV, certificates, etc.</p>
              </div>
            </ng-template>
          </div>

          <!-- Upload Form (Dialog & Confirm Dialog) -->
          <app-dialog
            [open]="isOpen"
            (onClose)="handleClose($event)"
            width="740px"
            title="Document Upload Form"
          >
            <ng-template>
              <app-assessor-document-form (onSubmit)="uploadDocument($event)"/>
            </ng-template>
          </app-dialog>

          <app-confirm-dialog
            [open]="isDeleteConfirmationDialogOpen"
            [title]="'Delete Document'"
            [message]="'Are you sure you want to delete this document?'"
            (onClose)="closeConfirmDialog($event)"
            (onConfirm)="handleConfirmDelete()"
          />
        </div>
      </app-wrapper>
      <app-dialog
        [open]="pdfViewerOpen"
        (onClose)="handlePdfViewerClose($event)"
        width="900px"
        title="Document Viewer"
      >
        <ng-template>
          <app-pdf-viewer [base64]="selectedItem.filePath"/>
        </ng-template>
      </app-dialog>
    </container>
  `,
})
export class AssessorDocumentComponent implements OnInit {
  documentList: any[] = [];
  isOpen = false;
  pdfViewerOpen = false;
  selectedItem: AssessorDocument | null = null;
  isDeleteConfirmationDialogOpen = false;

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private service: AssessorDocumentService
  ) {
  }

  ngOnInit(): void {
    this.loadDocs();
  }


  uploadDocument(data: any): void {
    this.service.create(data).subscribe({
      next: () => {
        this.loadDocs();
        this.isOpen = false;
      },
      error: err => console.error('Upload failed', err)
    });
  }

  loadDocs(): void {
    this.service.get().subscribe({
      next: res => this.documentList = res.data
    });
  }

  handlePdfViewerClose(result: boolean): void {
    this.pdfViewerOpen = false;
    this.selectedItem = null;
  }

  openPdfDialog(data: AssessorDocument): void {
    this.selectedItem = data;
    this.pdfViewerOpen = true;
  }

  handleClose(result: boolean): void {
    this.isOpen = false;
    this.selectedItem = null;
    this.loadDocs();
  }

  openConfirmDialog(data: AssessorDocument) {
    this.selectedItem = data;
    this.isDeleteConfirmationDialogOpen = true;
  }

  closeConfirmDialog(event: any) {
    this.isDeleteConfirmationDialogOpen = false;
  }

  openForm(entry: AssessorDocument | null = null): void {
    this.selectedItem = entry;
    this.isOpen = true;
  }

  handleConfirmDelete() {
    this.service.delete(this.selectedItem.uuid).subscribe({
      next: () => {
        this.loadDocs();
      },
    })
  }
}
