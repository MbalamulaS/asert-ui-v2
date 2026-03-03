import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageComponent } from 'components/image/image.component';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-profile-picture',
  standalone: true,
  imports: [CommonModule, ImageComponent, MatIconModule],
  template: `
    <div [class]="containerClasses" [ngStyle]="{ width: size, height: size }">
      <app-image
        [src]="src"
        [alt]="alt || 'Profile picture'"
        [rounded]="'full'"
        [aspectRatio]="'square'"
        [placeholderIcon]="'person'"
        [placeholderText]="placeholderText"
        [isBase64]="isBase64"
        width="100%"
        height="100%"
        [containerClass]="imageContainerClass"
      >
        <!-- Optional click overlay -->
        <div
          *ngIf="clickable"
          class="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 cursor-pointer rounded-full flex items-center justify-center group"
        >
          <mat-icon
            class="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            {{ clickIcon || 'edit' }}
          </mat-icon>
        </div>

        <!-- Status indicator -->
        <div
          *ngIf="status"
          [class]="statusClasses"
          class="absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white"
        ></div>
      </app-image>
    </div>
  `,
})
export class ProfilePictureComponent {
  @Input() src: string | null = null;
  @Input() alt: string = '';
  @Input() size: string = '10rem'; // Default 160px (40 in Tailwind = 10rem)
  @Input() clickable: boolean = false;
  @Input() clickIcon: string = 'edit';
  @Input() isBase64: boolean = false;
  @Input() placeholderText: string = '';
  @Input() status: 'online' | 'offline' | 'away' | 'busy' | null = null;
  @Input() borderColor: string = 'border-gray-200';
  @Input() shadowSize: 'sm' | 'md' | 'lg' | 'xl' = 'md';

  get containerClasses(): string {
    const classes = [
      'relative',
      'rounded-full',
      'overflow-hidden',
      this.borderColor,
      'border-2',
      `shadow-${this.shadowSize}`,
    ];

    if (this.clickable) {
      classes.push('cursor-pointer', 'transition-transform', 'hover:scale-105');
    }

    return classes.join(' ');
  }

  get imageContainerClass(): string {
    return 'rounded-full';
  }

  get statusClasses(): string {
    const baseClasses = 'z-10';

    switch (this.status) {
      case 'online':
        return `${baseClasses} bg-green-500`;
      case 'away':
        return `${baseClasses} bg-yellow-500`;
      case 'busy':
        return `${baseClasses} bg-red-500`;
      case 'offline':
        return `${baseClasses} bg-gray-400`;
      default:
        return baseClasses;
    }
  }
}
