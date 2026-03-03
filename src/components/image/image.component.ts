import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-image',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      [ngClass]="containerClass"
      [ngStyle]="{ height: height, width: width }"
      class="relative overflow-hidden {{ roundedClass }}"
    >
      <ng-container *ngIf="src; else noImage">
        <!-- Loading placeholder while image loads (for URLs only) -->
        <div
          *ngIf="!isBase64 && isLoading"
          class="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-400 animate-pulse"
        >
          <span class="material-icons text-4xl">image</span>
          <p class="mt-2 text-xs text-gray-500">Loading...</p>
        </div>
        
        <!-- Main image -->
        <img
          [src]="sanitizedSrc"
          [alt]="alt"
          class="w-full h-full object-cover"
          [class.hidden]="!isBase64 && isLoading"
          (load)="onImageLoad()"
          (error)="onImageError()"
        />
        
        <!-- Error state for failed URL images -->
        <div
          *ngIf="!isBase64 && hasError"
          class="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-400"
        >
          <span class="material-icons text-4xl">broken_image</span>
          <p class="mt-2 text-xs text-gray-500">Failed to load</p>
        </div>
      </ng-container>

      <ng-template #noImage>
        <div
          class="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-400"
        >
          <span class="material-icons text-{{ placeholderSize || '6xl' }}">{{
            placeholderIcon
          }}</span>
          <p *ngIf="placeholderText" class="mt-2 text-gray-500">
            {{ placeholderText }}
          </p>
        </div>
      </ng-template>

      <!-- Optional Badge -->
      <div
        *ngIf="badgeText"
        class="absolute {{ badgePosition || 'top-2 right-2' }} {{
          badgeClass || 'bg-yellow-500 text-white'
        }} text-xs px-2 py-1 rounded-full z-10"
      >
        {{ badgeText }}
      </div>

      <!-- Optional Gradient Overlay with Description -->
      <div
        *ngIf="description"
        class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3"
      >
        <p class="text-white text-xs truncate">{{ description }}</p>
      </div>

      <!-- Slot for extra content -->
      <ng-content></ng-content>
    </div>
  `,
})
export class ImageComponent implements OnChanges {
  @Input() src: string | null = null;
  @Input() alt: string = '';
  @Input() height: string = '100%';
  @Input() width: string = '100%';
  @Input() containerClass: string = '';
  @Input() rounded: boolean | string = true;
  @Input() aspectRatio: 'square' | 'video' | 'portrait' | string = '';

  // Placeholder options
  @Input() placeholderIcon: string = 'image';
  @Input() placeholderSize: string = '6xl';
  @Input() placeholderText: string = '';

  // Badge options
  @Input() badgeText: string = '';
  @Input() badgeClass: string = '';
  @Input() badgePosition: string = '';

  // Description overlay
  @Input() description: string = '';

  // Base64 image handling
  @Input() isBase64: boolean = false;
  
  // Image loading states (for URL-based images)
  isLoading: boolean = false;
  hasError: boolean = false;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['src'] && !this.isBase64 && this.src) {
      this.resetImageStates();
    }
  }

  get sanitizedSrc(): string | SafeResourceUrl {
    if (this.isBase64 && this.src) {
      return this.sanitizer.bypassSecurityTrustResourceUrl(
        'data:image/jpg;base64,' + this.src,
      );
    }
    return this.src || '';
  }
  
  private resetImageStates(): void {
    this.isLoading = true;
    this.hasError = false;
  }
  
  onImageLoad(): void {
    if (!this.isBase64) {
      this.isLoading = false;
      this.hasError = false;
    }
  }
  
  onImageError(): void {
    if (!this.isBase64) {
      this.isLoading = false;
      this.hasError = true;
    }
  }

  get roundedClass(): string {
    if (this.rounded === true) {
      return 'rounded-lg';
    } else if (this.rounded === 'full') {
      return 'rounded-full';
    } else if (typeof this.rounded === 'string') {
      return `rounded-${this.rounded}`;
    }
    return '';
  }

  ngOnInit() {
    // Apply aspect ratio if specified
    if (this.aspectRatio === 'square') {
      this.containerClass = `aspect-square ${this.containerClass}`;
    } else if (this.aspectRatio === 'video') {
      this.containerClass = `aspect-video ${this.containerClass}`;
    } else if (this.aspectRatio === 'portrait') {
      this.containerClass = `aspect-[3/4] ${this.containerClass}`;
    } else if (this.aspectRatio) {
      this.containerClass = `aspect-[${this.aspectRatio}] ${this.containerClass}`;
    }
  }
}
