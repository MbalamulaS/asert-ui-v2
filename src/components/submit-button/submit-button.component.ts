import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'submit-button',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <button
      mat-raised-button
      color="primary"
      type="button"
      [disabled]="isDisabled"
      (click)="handleClick()"
      class="flex items-center gap-x-2"
    >
      <div class="flex justify-between gap-x-2">
        <mat-spinner *ngIf="isSubmitting" diameter="20"></mat-spinner>
        <span>
          {{ isSubmitting ? 'SUBMITTING...' : buttonText }}
        </span>
      </div>
    </button>
  `,
})
export class SubmitButtonComponent {
  @Input() isDisabled: boolean = false;
  @Input() isSubmitting: boolean = false;
  @Input() buttonText: string = 'SUBMIT';
  @Output() action = new EventEmitter<void>();

  handleClick() {
    this.action.emit();
  }
}
