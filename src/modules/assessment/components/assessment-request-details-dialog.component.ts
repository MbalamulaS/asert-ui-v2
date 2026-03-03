import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { DialogComponent } from 'components/dialog/dialog.component';
import { AssessmentRequest } from '../assessment-request.service';
import {
  DocumentPreviewDialogComponent,
  DocumentPreviewDialogData,
} from './document-preview-dialog.component';

export interface AssessmentRequestDetailsDialogData {
  request: AssessmentRequest;
}

export interface AssessmentRequestDetailsDialogResult {
  action: 'approve' | 'reject' | 'cancel';
  notes?: string;
}

@Component({
  selector: 'app-assessment-request-details-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatProgressBarModule,
    MatDividerModule,
    DialogComponent,
    DocumentPreviewDialogComponent,
  ],
  template: `
    <app-dialog
      [open]="open"
      [title]="'Assessment Request Details'"
      [width]="'1000px'"
      [showFullScreen]="true"
      (onClose)="onClose()"
    >
      <div class="p-6 space-y-6">
        <div *ngIf="data?.request">
          <!-- Completion Status Alert -->
          <div
            [class]="getCompletionAlertClass()"
            class="p-4 rounded-lg border"
          >
            <div class="flex items-center">
              <mat-icon [class]="getCompletionIconClass()" class="mr-2">
                {{ getCompletionIcon() }}
              </mat-icon>
              <div class="flex-1">
                <h4 class="font-semibold">
                  Completion Status: {{ getCompletionPercentage() }}%
                </h4>
                <p class="text-sm mt-1">
                  {{ getCompletionMessage() }}
                </p>
              </div>
            </div>
            <div class="mt-3">
              <mat-progress-bar
                mode="determinate"
                [value]="getCompletionPercentage()"
                [class]="getProgressBarClass()"
              ></mat-progress-bar>
            </div>
          </div>

          <!-- Facility Information -->
          <mat-card>
            <mat-card-header>
              <mat-card-title class="flex items-center">
                <mat-icon class="mr-2 text-blue-600">business</mat-icon>
                Facility Information
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label class="text-sm font-medium text-gray-600">
                    Facility Name
                  </label>
                  <p class="text-gray-900">
                    {{ data.request?.facilityName || 'N/A' }}
                  </p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-600">
                    Facility Type
                  </label>
                  <p class="text-gray-900">
                    {{ data.request?.facilityType || 'N/A' }}
                  </p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-600">
                    Contact Person
                  </label>
                  <p class="text-gray-900">
                    {{ data.request.contactPerson || 'N/A' }}
                  </p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-600">
                    Email
                  </label>
                  <p class="text-gray-900">
                    {{ data.request.email || 'N/A' }}
                  </p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-600">
                    Phone Number
                  </label>
                  <p class="text-gray-900">
                    {{ data.request.phoneNumber || 'N/A' }}
                  </p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-600">
                    Requested Date
                  </label>
                  <p class="text-gray-900">
                    {{
                      data.request.requestedDate
                        ? (data.request.requestedDate | date)
                        : 'N/A'
                    }}
                  </p>
                </div>
              </div>
              <div class="mt-4" *ngIf="data.request.address">
                <label class="text-sm font-medium text-gray-600">
                  Address
                </label>
                <p class="text-gray-900">
                  {{ data.request.address }}
                </p>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Essential Items Compliance -->
          <mat-card>
            <mat-card-header>
              <mat-card-title class="flex items-center">
                <mat-icon class="mr-2 text-green-600">fact_check</mat-icon>
                Essential Items Compliance
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <!-- Summary Stats -->
              <div class="grid grid-cols-3 gap-4 mb-6">
                <div class="text-center p-4 bg-green-50 rounded-lg">
                  <div class="text-2xl font-bold text-green-600">
                    {{ getCompliantCount() }}
                  </div>
                  <div class="text-sm text-gray-600">Compliant</div>
                </div>
                <div class="text-center p-4 bg-red-50 rounded-lg">
                  <div class="text-2xl font-bold text-red-600">
                    {{ getNonCompliantCount() }}
                  </div>
                  <div class="text-sm text-gray-600">Non-Compliant</div>
                </div>
                <div class="text-center p-4 bg-gray-50 rounded-lg">
                  <div class="text-2xl font-bold text-gray-600">
                    {{ getPendingCount() }}
                  </div>
                  <div class="text-sm text-gray-600">Pending</div>
                </div>
              </div>

              <!-- Essential Items List -->
              <div class="space-y-3">
                <div
                  *ngFor="let item of data.request.essentialItems"
                  class="border border-gray-200 rounded-lg p-4"
                >
                  <div class="flex items-start justify-between mb-2">
                    <div class="flex-1">
                      <h4 class="font-medium text-gray-900">
                        {{ item.itemNo }}. {{ item.description }}
                      </h4>
                      <p class="text-sm text-gray-600 mt-1">
                        {{ item.complianceRequirement }}
                      </p>
                    </div>
                    <mat-chip-set>
                      <mat-chip [class]="getItemStatusClass(item.compliance)">
                        {{ getItemStatusText(item.compliance) }}
                      </mat-chip>
                    </mat-chip-set>
                  </div>
                  <div *ngIf="item.notes" class="mt-2">
                    <label class="text-xs font-medium text-gray-600">
                      Notes:
                    </label>
                    <p class="text-sm text-gray-800">{{ item.notes }}</p>
                  </div>
                  <div
                    *ngIf="item.evidenceProvided"
                    class="mt-3 border-t border-gray-100 pt-3"
                  >
                    <div class="flex items-center mb-2">
                      <mat-icon class="text-sm mr-1 text-blue-600"
                        >attach_file</mat-icon
                      >
                      <span class="text-sm font-medium text-gray-700">
                        Evidence provided ({{ item.evidenceType }})
                      </span>
                    </div>
                    <div class="space-y-2">
                      <div
                        *ngFor="
                          let file of getFilesForEssentialItem(item.itemNo)
                        "
                        class="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                      >
                        <div class="flex items-center flex-1">
                          <mat-icon class="text-sm mr-2 text-gray-600">
                            {{ getFileIcon(file.fileType) }}
                          </mat-icon>
                          <div class="flex-1">
                            <div class="text-sm font-medium text-gray-900">
                              {{ file.name }}
                            </div>
                            <div class="text-xs text-gray-500">
                              {{ formatFileSize(file.fileSize) }} •
                              {{ file.fileType }}
                            </div>
                          </div>
                        </div>
                        <div class="flex items-center space-x-1">
                          <button
                            type="button"
                            mat-icon-button
                            class="text-blue-600 hover:text-blue-800"
                            (click)="previewFile(file)"
                            title="Preview file"
                          >
                            <mat-icon class="text-sm">visibility</mat-icon>
                          </button>
                          <button
                            type="button"
                            mat-icon-button
                            class="text-blue-600 hover:text-blue-800"
                            (click)="downloadFile(file)"
                            title="Download file"
                          >
                            <mat-icon class="text-sm">download</mat-icon>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Additional Comments -->
          <mat-card *ngIf="data.request.additionalComments">
            <mat-card-header>
              <mat-card-title class="flex items-center">
                <mat-icon class="mr-2 text-purple-600">comment</mat-icon>
                Additional Comments
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <p class="text-gray-900 mt-4">
                {{ data.request.additionalComments }}
              </p>
            </mat-card-content>
          </mat-card>

          <!-- Footer Actions -->
          <div
            class="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50"
          >
            <div class="text-sm text-gray-600">
              <span *ngIf="canApprove()" class="text-green-600 font-medium">
                ✓ Eligible for approval
              </span>
              <span *ngIf="!canApprove()" class="text-red-600 font-medium">
                ✗ Cannot approve - minimum 75% completion required
              </span>
            </div>
            <div class="flex space-x-3">
              <button
                type="button"
                mat-button
                (click)="onClose()"
                class="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="button"
                mat-raised-button
                color="warn"
                (click)="onReject()"
                class="px-4 py-2"
              >
                Reject
              </button>
              <button
                type="button"
                mat-raised-button
                color="primary"
                [disabled]="!canApprove()"
                (click)="onApprove()"
                class="px-4 py-2"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      </div>
    </app-dialog>

    <!-- Document Preview Dialog -->
    <app-document-preview-dialog
      [open]="isPreviewDialogOpen"
      [data]="previewDialogData"
      (onResult)="closePreviewDialog()"
    />
  `,
  styles: [
    `
      .mat-chip.compliant {
        background-color: #dcfce7;
        color: #166534;
      }
      .mat-chip.non-compliant {
        background-color: #fef2f2;
        color: #dc2626;
      }
      .mat-chip.pending {
        background-color: #f3f4f6;
        color: #6b7280;
      }
    `,
  ],
})
export class AssessmentRequestDetailsDialogComponent {
  @Input() open = false;
  @Input() data: AssessmentRequestDetailsDialogData | null = null;
  @Output() onResult = new EventEmitter<AssessmentRequestDetailsDialogResult>();

  // Preview dialog properties
  isPreviewDialogOpen = false;
  previewDialogData: DocumentPreviewDialogData | null = null;

  onClose(): void {
    this.onResult.emit({ action: 'cancel' });
  }

  onApprove(): void {
    this.onResult.emit({ action: 'approve' });
  }

  onReject(): void {
    this.onResult.emit({ action: 'reject' });
  }

  getCompletionPercentage(): number {
    if (!this.data?.request?.essentialItems) return 0;

    const total = this.data.request.essentialItems.length;
    const completed = this.data.request.essentialItems.filter(
      (item) =>
        item.compliance === 'compliant' || item.compliance === 'non-compliant',
    ).length;

    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }

  canApprove(): boolean {
    return this.getCompletionPercentage() >= 75;
  }

  getCompletionAlertClass(): string {
    const percentage = this.getCompletionPercentage();
    if (percentage >= 75) {
      return 'bg-green-50 border-green-200';
    }
    return 'bg-red-50 border-red-200';
  }

  getCompletionIconClass(): string {
    const percentage = this.getCompletionPercentage();
    if (percentage >= 75) {
      return 'text-green-600';
    }
    return 'text-red-600';
  }

  getCompletionIcon(): string {
    const percentage = this.getCompletionPercentage();
    if (percentage >= 75) {
      return 'check_circle';
    }
    return 'error';
  }

  getCompletionMessage(): string {
    const percentage = this.getCompletionPercentage();
    if (percentage >= 75) {
      return 'This request meets the minimum completion requirements and can be approved.';
    }
    return `This request does not meet the minimum 75% completion requirement. Current completion: ${percentage}%`;
  }

  getProgressBarClass(): string {
    const percentage = this.getCompletionPercentage();
    if (percentage >= 75) {
      return 'text-green-600';
    }
    return 'text-red-600';
  }

  getCompliantCount(): number {
    if (!this.data?.request?.essentialItems) return 0;
    return this.data.request.essentialItems.filter(
      (item) => item.compliance === 'compliant',
    ).length;
  }

  getNonCompliantCount(): number {
    if (!this.data?.request?.essentialItems) return 0;
    return this.data.request.essentialItems.filter(
      (item) => item.compliance === 'non-compliant',
    ).length;
  }

  getPendingCount(): number {
    if (!this.data?.request?.essentialItems) return 0;

    return this.data.request.essentialItems.filter(
      (item) => item.compliance === undefined || item.compliance === null,
    ).length;
  }

  getItemStatusClass(compliance: string): string {
    switch (compliance) {
      case 'compliant':
        return 'compliant';
      case 'non-compliant':
        return 'non-compliant';
      default:
        return 'pending';
    }
  }

  getItemStatusText(compliance: string): string {
    switch (compliance) {
      case 'compliant':
        return 'Compliant';
      case 'non-compliant':
        return 'Non-Compliant';
      default:
        return 'Pending';
    }
  }

  /**
   * Gets uploaded files for a specific essential item
   */
  getFilesForEssentialItem(itemNo: number): any[] {
    if (!this.data?.request?.essentialItems) return [];

    const essentialItem = this.data.request.essentialItems.find(
      (item) => item.itemNo === itemNo,
    );

    console.log('The data', this.data);

    if (!essentialItem || !essentialItem.evidenceProvided) return [];

    // Map the evidence array to the format expected by the template
    return essentialItem.evidence.map((evidence) => ({
      attachmentId: evidence.fileUploadId,
      name: evidence.fileName,
      fileSize: evidence.fileSize,
      fileType: evidence.mimeType,
      uploadType: evidence.evidenceType,
      fileUrl: evidence.fileUrl,
    }));
  }

  /**
   * Gets appropriate icon for file type
   */
  getFileIcon(fileType: string): string {
    if (fileType.includes('pdf')) return 'picture_as_pdf';
    if (fileType.includes('image')) return 'image';
    if (fileType.includes('video')) return 'video_file';
    if (fileType.includes('document') || fileType.includes('word'))
      return 'description';
    if (fileType.includes('spreadsheet') || fileType.includes('excel'))
      return 'table_chart';
    return 'attach_file';
  }

  /**
   * Formats file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Opens the document preview dialog
   */
  previewFile(file: any): void {
    this.previewDialogData = {
      file: {
        attachmentId: file.attachmentId,
        name: file.name,
        fileSize: file.fileSize,
        fileType: file.fileType,
        uploadType: file.uploadType,
      },
      fileUrl: file.fileUrl, // Use the fileUrl from the API response
    };
    this.isPreviewDialogOpen = true;
  }

  /**
   * Closes the document preview dialog
   */
  closePreviewDialog(): void {
    this.isPreviewDialogOpen = false;
    this.previewDialogData = null;
  }

  /**
   * Downloads a file
   */
  downloadFile(file: any): void {
    if (!file.fileUrl) {
      console.error('File URL not available for download');
      return;
    }

    // Create a temporary link element to trigger download
    const link = document.createElement('a');
    link.href = file.fileUrl;
    link.download = file.name;
    link.target = '_blank';

    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
