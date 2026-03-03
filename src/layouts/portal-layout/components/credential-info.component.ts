import {Component} from '@angular/core';
import {Clipboard} from '@angular/cdk/clipboard';
import {MatIconModule} from '@angular/material/icon';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {MatIconButton} from "@angular/material/button";

@Component({
  standalone: true,
  selector: `credential-info-component`,
  template: `
    <div>
      <p>User your email as username and the password bellow to login</p>
      <div class="relative flex items-center mb-4">
        <h2 class="text-lg flex-1">
          password: <strong #textToCopy>Asert2&#64;25</strong>
        </h2>
        <button
          (click)="copyText(textToCopy.textContent)"
          mat-icon-button
          class="ml-2 p-1 rounded hover:text-grey focus:outline-none"
        >
          <mat-icon>content_copy</mat-icon>
        </button>
        <div
          *ngIf="copySuccess"
          class="absolute top-0 right-0 mt-2 mr-6 bg-blue-400 text-white px-2 py-1 rounded"
        >
          Copied!
        </div>
      </div>
    </div>`,
  imports: [CommonModule, MatIconModule, RouterModule, MatIconButton],
})
export class PortalHomeComponent {
  copySuccess: boolean = false;

  constructor(private clipboard: Clipboard) {
  }

  copyText(text: string) {
    if (text) {
      this.clipboard.copy(text);
      this.copySuccess = true;

      // Hide the success message after 2 seconds
      setTimeout(() => {
        this.copySuccess = false;
      }, 2000);
    }
  }
}
