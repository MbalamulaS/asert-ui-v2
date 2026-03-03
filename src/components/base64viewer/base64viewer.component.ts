import { Component, Input, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  standalone: true,
  imports: [MatIconModule, CommonModule, NgOptimizedImage],
  selector: 'attachment-viewer',
  template: `
    <div
      class="w-full relative border-4 border-gray-300 border-dashed rounded-lg p-6 hover:border-gray-400 transition-all"
      id="dropzone"
    >
      <object
        *ngIf="mimeType === 'pdf'"
        [data]="attachment"
        width="100%"
        height="600px"
      ></object>
      <img
        *ngIf="mimeType === 'jpg'"
        height="100%"
        width="100%"
        [src]="attachment"
        alt="Attachment"
      />
      <img
        *ngIf="mimeType === 'jpeg'"
        height="100%"
        width="100%"
        [src]="attachment"
        alt="Attachment"
      />
      <img
        *ngIf="mimeType === 'png'"
        height="100%"
        width="100%"
        [src]="attachment"
        alt="Attachment"
      />
    </div>
  `,
})
export class Base64viewerComponent implements OnInit {
  attachment: any;
  @Input() base64Content: any;
  @Input() mimeType: string;
  @Input() title: string;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.loadAttachment();
  }

  loadAttachment(): void {
    if (this.mimeType === 'pdf') {
      this.mimeType = 'pdf';
      this.attachment = this.sanitizer.bypassSecurityTrustResourceUrl(
        'data:application/pdf;base64,' + this.base64Content,
      );
    } else if (this.mimeType === 'jpg') {
      this.mimeType = 'jpg';
      this.attachment = this.sanitizer.bypassSecurityTrustResourceUrl(
        'data:image/jpg;base64,' + this.base64Content,
      );
    } else if (this.mimeType === 'jpeg') {
      this.mimeType = 'jpeg';
      this.attachment = this.sanitizer.bypassSecurityTrustResourceUrl(
        'data:image/jpeg;base64,' + this.base64Content,
      );
    } else if (this.mimeType === 'png') {
      this.mimeType = 'png';
      this.attachment = this.sanitizer.bypassSecurityTrustResourceUrl(
        'data:image/png;base64,' + this.base64Content,
      );
    } else {
    }
  }
}
