import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  standalone: true,
  selector: 'action-button',
  imports: [MatIconModule, CommonModule],
  template: `
    <button
      class="flex items-center justify-center w-full md:w-auto px-5 py-4 bg-blue-500 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:text-gray-700"
      [disabled]="isDisabled"
      (click)="handleClick()"
    >
      <span>{{ label }}</span>
      <mat-icon class="ml-2 mt-0" color="white">{{ icon }}</mat-icon>
    </button>
  `,
})
export class ActionButtonComponent {
  @Input() label: string = '';
  @Input() icon: string = '';
  @Input() isDisabled: boolean = false;
  @Output() action = new EventEmitter<void>();

  handleClick() {
    this.action.emit();
  }
}
