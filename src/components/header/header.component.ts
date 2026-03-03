import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, MatIcon],
  template: `
    <div class="flex items-center gap-2 mb-4">
      <mat-icon *ngIf="icon" class="text-gray-600">{{ icon }}</mat-icon>
      <div class="flex flex-col">
        <h1 class="text-xl font-semibold text-gray-800">
          {{ title }}
        </h1>
        <p *ngIf="subtitle" class="text-sm text-gray-500 mt-0.5">
          {{ subtitle }}
        </p>
      </div>
    </div>
  `,
})
export class HeaderComponent {
  @Input() title: string = '';
  @Input() icon: string = '';
  @Input() subtitle: string = ''; // Optional subtitle input
}
