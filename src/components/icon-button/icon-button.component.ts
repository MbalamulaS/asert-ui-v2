import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule, TooltipPosition } from '@angular/material/tooltip';

@Component({
  standalone: true,
  selector: 'icon-button',
  imports: [MatIconModule, MatButtonModule, MatTooltipModule],
  template: `
    <button
      mat-icon-button
      [disabled]="isDisabled"
      (click)="handleClick()"
      matTooltip="{{ tooltip }}"
      position="above"
      [color]="color"
    >
      <mat-icon>{{ icon }}</mat-icon>
    </button>
  `,
})
export class IconButtonComponent {
  @Input() isDisabled: boolean = false;
  @Input() icon: string = '';
  @Input() tooltip: string = '';
  @Input() color: string = '';
  @Output() action = new EventEmitter<void>();
  positionOptions: TooltipPosition[] = ['below', 'above', 'left', 'right'];

  handleClick() {
    this.action.emit();
  }
}
