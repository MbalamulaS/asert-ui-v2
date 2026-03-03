import {Component, Input, OnInit} from '@angular/core';
import {MatDialogModule} from '@angular/material/dialog';
import {CommonModule} from '@angular/common';
import {DomSanitizer} from "@angular/platform-browser";

@Component({
  selector: 'app-pdf-viewer',
  standalone: true,
  imports: [MatDialogModule, CommonModule],
  template: `
    <mat-dialog-content class="p-0">
      <object
        [data]="attachment"
        type="application/pdf"
        class="w-full h-[80vh] border rounded"
      >
      </object>
    </mat-dialog-content>
  `,
})
export class PdfViewerDialogComponent implements OnInit {
  attachment: any;
  @Input() base64: string;

  constructor(private sanitizer: DomSanitizer) {

  }

  ngOnInit(): void {
    this.attachment = this.sanitizer.bypassSecurityTrustResourceUrl('data:application/pdf;base64,' + this.base64);
  }
}
