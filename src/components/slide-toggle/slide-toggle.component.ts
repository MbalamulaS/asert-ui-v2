import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  standalone: true,
  selector: 'slide-toggle',
  imports: [MatSlideToggleModule, MatTooltipModule],
  template: `
    <mat-slide-toggle
      [color]="color"
      [checked]="checked"
      class="!relative !-top-2"
      [disabled]="disabled"
      matTooltip="{{ label }}"
      (click)="handleClick($event)"
    >
    </mat-slide-toggle>
  `,
})
export class SlideToggleComponent {
  @Input() color: string = '';
  @Input() checked: boolean = false;
  @Input() disabled: boolean = false;
  @Input() label: string;
  @Output() toggleChange = new EventEmitter<boolean>();
  @Output() clicked = new EventEmitter<void>();

  handleChange(event: any) {
    this.toggleChange.emit(event.checked);
  }

  handleClick(event: any) {
    this.clicked.emit();
  }
}
