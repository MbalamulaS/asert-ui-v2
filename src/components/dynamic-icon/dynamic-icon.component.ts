import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'dynamic-icon',
  imports: [CommonModule, MatIconModule],
  standalone: true,
  template: `
    <ng-container *ngIf="icon">
      <mat-icon>{{ icon }}</mat-icon>
    </ng-container>
    <ng-container *ngIf="!icon">
      <mat-icon>expand_less</mat-icon>
    </ng-container>
  `,
})
export class DynamicIconComponent {
  @Input() icon: string | null = null;
}
