import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DialogComponent } from 'components/dialog/dialog.component';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

export interface DocumentPreviewDialogData {
  file: {
    attachmentId: number;
    name: string;
    fileSize: number;
    fileType: string;
    uploadType: string;
  };
  fileUrl?: string; // Optional direct file URL
}

@Component({
  selector: 'app-document-preview-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    DialogComponent,
  ],
  template: `
    <app-dialog
      [open]="open"
      [title]="getDialogTitle()"
      [width]="'95vw'"
      [height]="'95vh'"
      [showFullScreen]="true"
      (onClose)="onClose()"
    >
      <ng-template>
        <div class="flex flex-col h-full">
          <!-- File Info Header -->
          <div
            class="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50"
          >
            <div class="flex items-center space-x-3">
              <mat-icon class="text-gray-600">{{ getFileIcon() }}</mat-icon>
              <div>
                <h3 class="text-lg font-medium text-gray-900">
                  {{ data?.file?.name }}
                </h3>
                <p class="text-sm text-gray-500">
                  {{ formatFileSize(data?.file?.fileSize || 0) }} •
                  {{ data?.file?.fileType }}
                </p>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <button
                type="button"
                mat-raised-button
                color="primary"
                (click)="downloadFile()"
                class="flex items-center space-x-2"
              >
                <mat-icon>download</mat-icon>
                <span>Download</span>
              </button>
              <button
                type="button"
                mat-icon-button
                (click)="onClose()"
                class="text-gray-600 hover:text-gray-800"
              >
                <mat-icon>close</mat-icon>
              </button>
            </div>
          </div>

          <!-- Preview Content -->
          <div class="flex-1 overflow-hidden">
            <!-- Loading State -->
            <div
              *ngIf="loading"
              class="flex items-center justify-center h-full"
            >
              <div class="text-center">
                <mat-spinner class="mx-auto mb-4"></mat-spinner>
                <p class="text-gray-600">Loading document preview...</p>
              </div>
            </div>

            <!-- Error State -->
            <div
              *ngIf="error && !loading"
              class="flex items-center justify-center h-full"
            >
              <div class="text-center">
                <mat-icon class="text-red-500 text-6xl mb-4"
                  >error_outline</mat-icon
                >
                <h3 class="text-lg font-medium text-gray-900 mb-2">
                  Preview Not Available
                </h3>
                <p class="text-gray-600 mb-4">{{ error }}</p>
                <button
                  type="button"
                  mat-raised-button
                  color="primary"
                  (click)="downloadFile()"
                >
                  Download File Instead
                </button>
              </div>
            </div>

            <!-- PDF Preview -->
            <div
              *ngIf="isPDF() && previewUrl && !error && !loading"
              class="h-full relative"
            >
              <iframe
                [src]="previewUrl"
                class="w-full h-full border-0"
                title="PDF Preview"
                (load)="onIframeLoad()"
                (error)="onIframeError()"
              ></iframe>

              <!-- Floating action buttons -->
              <div class="absolute top-4 right-4 flex space-x-2">
                <button
                  type="button"
                  mat-mini-fab
                  color="primary"
                  (click)="openInNewTab()"
                  title="Open in New Tab"
                >
                  <mat-icon>open_in_new</mat-icon>
                </button>
                <button
                  type="button"
                  mat-mini-fab
                  color="accent"
                  (click)="downloadFile()"
                  title="Download PDF"
                >
                  <mat-icon>download</mat-icon>
                </button>
              </div>
            </div>

            <!-- Image Preview -->
            <div
              *ngIf="isImage() && previewUrl && !error && !loading"
              class="h-full flex items-center justify-center p-4"
            >
              <img
                [src]="previewUrl"
                [alt]="data?.file?.name"
                class="max-w-full max-h-full object-contain shadow-lg rounded-lg"
                (load)="onImageLoad()"
                (error)="onImageError()"
              />
            </div>

            <!-- Video Preview -->
            <div
              *ngIf="isVideo() && previewUrl && !error && !loading"
              class="h-full flex items-center justify-center p-4"
            >
              <video
                [src]="previewUrl"
                controls
                class="max-w-full max-h-full shadow-lg rounded-lg"
                (loadeddata)="onVideoLoad()"
                (error)="onVideoError()"
              >
                Your browser does not support the video tag.
              </video>
            </div>

            <!-- Text/Document Preview -->
            <div
              *ngIf="isTextDocument() && previewUrl && !error && !loading"
              class="h-full"
            >
              <iframe
                [src]="previewUrl"
                class="w-full h-full border-0"
                title="Document Preview"
                (load)="onIframeLoad()"
                (error)="onIframeError()"
              ></iframe>
            </div>

            <!-- Unsupported File Type -->
            <div
              *ngIf="!canPreview() && !loading && !error"
              class="flex items-center justify-center h-full"
            >
              <div class="text-center">
                <mat-icon class="text-gray-400 text-6xl mb-4"
                  >insert_drive_file</mat-icon
                >
                <h3 class="text-lg font-medium text-gray-900 mb-2">
                  Preview Not Supported
                </h3>
                <p class="text-gray-600 mb-4">
                  This file type ({{ data?.file?.fileType }}) cannot be
                  previewed in the browser.
                </p>
                <button
                  type="button"
                  mat-raised-button
                  color="primary"
                  (click)="downloadFile()"
                >
                  Download File to View
                </button>
              </div>
            </div>
          </div>
        </div>
      </ng-template>
    </app-dialog>
  `,
  styles: [
    `
      ::ng-deep .mat-dialog-container {
        padding: 0 !important;
      }

      iframe {
        border: none;
      }

      .mat-spinner {
        margin: 0 auto;
      }
    `,
  ],
})
export class DocumentPreviewDialogComponent {
  @Input() open = false;
  @Input() data: DocumentPreviewDialogData | null = null;
  @Output() onResult = new EventEmitter<void>();

  loading = false;
  error: string | null = null;
  previewUrl: SafeResourceUrl | null = null;
  iframeLoaded = false;

  constructor(
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    if (this.data?.file && this.open) {
      this.loadPreview();
    }
  }

  ngOnChanges() {
    if (this.data?.file && this.open) {
      this.loadPreview();
    }
  }

  onClose(): void {
    this.onResult.emit();
  }

  getDialogTitle(): string {
    return this.data?.file?.name || 'Document Preview';
  }

  getFileIcon(): string {
    if (!this.data?.file?.fileType) return 'insert_drive_file';

    const fileType = this.data.file.fileType.toLowerCase();

    if (fileType.includes('pdf')) return 'picture_as_pdf';
    if (fileType.includes('image')) return 'image';
    if (fileType.includes('video')) return 'video_file';
    if (fileType.includes('document') || fileType.includes('word'))
      return 'description';
    if (fileType.includes('spreadsheet') || fileType.includes('excel'))
      return 'table_chart';
    if (fileType.includes('presentation') || fileType.includes('powerpoint'))
      return 'slideshow';
    return 'insert_drive_file';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  isPDF(): boolean {
    return this.data?.file?.fileType?.toLowerCase().includes('pdf') || false;
  }

  isImage(): boolean {
    return this.data?.file?.fileType?.toLowerCase().includes('image') || false;
  }

  isVideo(): boolean {
    return this.data?.file?.fileType?.toLowerCase().includes('video') || false;
  }

  isTextDocument(): boolean {
    if (!this.data?.file?.fileType) return false;
    const fileType = this.data.file.fileType.toLowerCase();
    return (
      fileType.includes('text') ||
      fileType.includes('document') ||
      fileType.includes('word') ||
      fileType.includes('rtf')
    );
  }

  canPreview(): boolean {
    return (
      this.isPDF() || this.isImage() || this.isVideo() || this.isTextDocument()
    );
  }

  private async loadPreview(): Promise<void> {
    if (!this.data?.file) return;

    this.loading = true;
    this.error = null;
    this.iframeLoaded = false;

    try {
      let fileUrl: string;

      // If a direct file URL is provided, use it
      if (this.data.fileUrl) {
        console.log('Loading preview with direct URL:', this.data.fileUrl);
        fileUrl = this.data.fileUrl;
      } else {
        // Otherwise, construct the file URL from the API endpoint
        fileUrl = this.getFileUrl();
        console.log('Loading preview with constructed URL:', fileUrl);
      }

      console.log('Setting up preview for file URL:', fileUrl);

      this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(fileUrl);

      // Stop loading immediately
      this.loading = false;
      this.cdr.detectChanges();

      console.log('Preview setup complete');
      console.log('Loading:', this.loading);
      console.log('isPDF():', this.isPDF());
      console.log('previewUrl exists:', !!this.previewUrl);
      console.log('error:', this.error);
    } catch (error) {
      console.error('Error loading preview:', error);
      this.error =
        'Failed to load document preview. Please try downloading the file instead.';
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  private getFileUrl(): string {
    // TODO: Replace with your actual file API endpoint
    // This should return the URL to fetch the file content
    const baseUrl = '/api/files'; // Adjust based on your API
    return `${baseUrl}/${this.data?.file?.attachmentId}/download`;
  }

  downloadFile(): void {
    if (!this.data?.file) return;

    // Create a temporary link element to trigger download
    const link = document.createElement('a');
    link.href = this.getFileUrl();
    link.download = this.data.file.name;
    link.target = '_blank';

    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  onImageLoad(): void {
    console.log('Image loaded successfully');
    this.loading = false;
    this.cdr.detectChanges();
  }

  onImageError(): void {
    console.error('Image failed to load');
    this.error =
      'Failed to load image. The file may be corrupted or the format is not supported.';
    this.loading = false;
    this.cdr.detectChanges();
  }

  onVideoLoad(): void {
    console.log('Video loaded successfully');
    this.loading = false;
    this.cdr.detectChanges();
  }

  onVideoError(): void {
    console.error('Video failed to load');
    this.error =
      'Failed to load video. The file may be corrupted or the format is not supported.';
    this.loading = false;
    this.cdr.detectChanges();
  }

  onIframeLoad(): void {
    console.log('Iframe loaded successfully');
    this.loading = false;
    this.iframeLoaded = true;
    this.cdr.detectChanges();
  }

  onIframeError(): void {
    console.error('Iframe failed to load');
    this.error =
      'Failed to load document. The file may be corrupted or the format is not supported.';
    this.loading = false;
    this.cdr.detectChanges();
  }

  openInNewTab(): void {
    if (this.data?.fileUrl) {
      window.open(this.data.fileUrl, '_blank');
    } else if (this.data?.file?.attachmentId) {
      const fileUrl = this.getFileUrl();
      window.open(fileUrl, '_blank');
    }
  }
}
