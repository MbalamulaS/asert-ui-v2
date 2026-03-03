import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-pdf-viewer',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="flex flex-col h-full">
      <!-- Action Buttons -->
      <div class="flex justify-end gap-2 p-4 bg-gray-50 border-b">
        <button
          mat-raised-button
          color="primary"
          (click)="downloadPdf()"
          class="flex items-center gap-2"
        >
          <mat-icon>download</mat-icon>
          Download
        </button>
        <button
          mat-raised-button
          (click)="printPdf()"
          class="flex items-center gap-2"
        >
          <mat-icon>print</mat-icon>
          Print
        </button>
      </div>

      <!-- PDF Viewer -->
      <div class="flex-1 relative bg-gray-100">
        <div
          *ngIf="isLoading"
          class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10"
        >
          <mat-spinner></mat-spinner>
        </div>

        <iframe
          *ngIf="pdfSrc"
          [src]="pdfSrc"
          class="w-full h-full border-0"
          (load)="onLoad()"
        ></iframe>

        <div
          *ngIf="!pdfSrc && !isLoading"
          class="absolute inset-0 flex items-center justify-center"
        >
          <div class="text-center text-gray-500">
            <mat-icon class="text-6xl mb-4">picture_as_pdf</mat-icon>
            <p>No PDF loaded</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100%;
      }
    `,
  ],
})
export class PdfViewerComponent implements OnInit {
  @Input() pdfBase64: string = '';
  @Input() filename: string = 'document.pdf';

  pdfSrc: SafeResourceUrl | null = null;
  pdfBlob: Blob | null = null;
  isLoading = true;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit() {
    if (this.pdfBase64) {
      this.loadPdf();
    }
  }

  loadPdf() {
    try {
      this.isLoading = true;

      // Convert base64 to blob
      const binaryString = atob(this.pdfBase64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      this.pdfBlob = new Blob([bytes], { type: 'application/pdf' });

      // Create object URL and sanitize it
      const url = window.URL.createObjectURL(this.pdfBlob);
      this.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    } catch (error) {
      console.error('Error loading PDF:', error);
      this.isLoading = false;
    }
  }

  onLoad() {
    this.isLoading = false;
  }

  downloadPdf() {
    if (!this.pdfBlob) return;

    const url = window.URL.createObjectURL(this.pdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = this.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  printPdf() {
    if (!this.pdfBlob) return;

    const url = window.URL.createObjectURL(this.pdfBlob);
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = url;
    document.body.appendChild(iframe);

    iframe.onload = () => {
      iframe.contentWindow?.print();
      setTimeout(() => {
        document.body.removeChild(iframe);
        window.URL.revokeObjectURL(url);
      }, 100);
    };
  }
}
