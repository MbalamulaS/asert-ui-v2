import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DialogComponent } from 'components/dialog/dialog.component';
import { ImageCropperModule, ImageCroppedEvent, LoadedImage } from 'ngx-image-cropper';
import { DomSanitizer } from '@angular/platform-browser';

export interface CroppedImageData {
  file: File;
  base64: string;
  blob: Blob;
}

@Component({
  selector: 'app-photo-cropper',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    DialogComponent,
    ImageCropperModule,
  ],
  template: `
    <app-dialog
      [open]="open"
      [title]="title"
      [width]="width"
      headerBgColor="bg-gray-100"
      headerTextColor="text-gray-900"
      (onClose)="onDialogClose($event)"
    >
      <ng-template>
        <div class="p-6">
          <p class="text-sm text-gray-600 mb-4">
            {{ description }}
          </p>

          <!-- Image Cropper -->
          <div class="mb-6">
            <image-cropper
              [imageChangedEvent]="imageChangedEvent"
              [maintainAspectRatio]="maintainAspectRatio"
              [aspectRatio]="aspectRatio"
              [resizeToWidth]="resizeToWidth"
              [resizeToHeight]="resizeToHeight"
              [cropperMinWidth]="cropperMinWidth"
              [cropperMinHeight]="cropperMinHeight"
              [onlyScaleDown]="onlyScaleDown"
              [roundCropper]="roundCropper"
              [canvasRotation]="canvasRotation"
              [transform]="transform"
              [alignImage]="alignImage"
              [backgroundColor]="backgroundColor"
              [cropper]="cropper"
              [checkImageType]="checkImageType"
              (imageCropped)="onImageCropped($event)"
              (imageLoaded)="onImageLoaded($event)"
              (cropperReady)="onCropperReady($event)"
              (loadImageFailed)="onLoadImageFailed($event)"
            >
            </image-cropper>
          </div>

          <!-- Preview Section -->
          <div *ngIf="croppedImage" class="mb-6">
            <div class="text-sm font-medium text-gray-700 mb-2">Preview:</div>
            <div class="flex justify-center">
              <img
                [src]="croppedImage"
                [alt]="'Cropped preview'"
                class="max-w-32 max-h-32 rounded-lg shadow-sm border border-gray-200"
              />
            </div>
          </div>

          <!-- Cropper Controls -->
          <div class="flex justify-center space-x-2 mb-6">
            <button
              mat-icon-button
              (click)="rotateLeft()"
              class="bg-gray-100 hover:bg-gray-200"
              title="Rotate Left"
            >
              <mat-icon>rotate_left</mat-icon>
            </button>
            <button
              mat-icon-button
              (click)="rotateRight()"
              class="bg-gray-100 hover:bg-gray-200"
              title="Rotate Right"
            >
              <mat-icon>rotate_right</mat-icon>
            </button>
            <button
              mat-icon-button
              (click)="flipHorizontal()"
              class="bg-gray-100 hover:bg-gray-200"
              title="Flip Horizontal"
            >
              <mat-icon>flip</mat-icon>
            </button>
            <button
              mat-icon-button
              (click)="flipVertical()"
              class="bg-gray-100 hover:bg-gray-200"
              title="Flip Vertical"
            >
              <mat-icon>flip_camera_android</mat-icon>
            </button>
            <button
              mat-icon-button
              (click)="resetImage()"
              class="bg-gray-100 hover:bg-gray-200"
              title="Reset"
            >
              <mat-icon>restore</mat-icon>
            </button>
          </div>

          <!-- Dialog Actions -->
          <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              mat-button
              (click)="handleCancel()"
              class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              mat-raised-button
              color="primary"
              (click)="onSave()"
              [disabled]="!croppedImage"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save & Continue
            </button>
          </div>
        </div>
      </ng-template>
    </app-dialog>
  `,
  styles: [
    `
      ::ng-deep .image-cropper-wrapper {
        max-height: 400px;
      }
      
      ::ng-deep .image-cropper {
        border-radius: 8px;
      }
    `,
  ],
})
export class PhotoCropperComponent implements OnInit {
  @Input() open = false;
  @Input() title = 'Crop Photo';
  @Input() width = '600px';
  @Input() description = 'Adjust and crop your photo to the desired size and position.';
  @Input() imageChangedEvent: Event | null = null;
  
  // Cropper options
  @Input() maintainAspectRatio = true;
  @Input() aspectRatio = 1; // 1:1 square by default
  @Input() resizeToWidth = 300;
  @Input() resizeToHeight = 300;
  @Input() cropperMinWidth = 200;
  @Input() cropperMinHeight = 200;
  @Input() onlyScaleDown = false;
  @Input() roundCropper = false;
  @Input() backgroundColor = 'rgba(255,255,255,0.8)';
  @Input() checkImageType = true;
  
  @Output() onClose = new EventEmitter<boolean>();
  @Output() onSaveCropped = new EventEmitter<CroppedImageData>();
  @Output() onCancel = new EventEmitter<void>();

  // Cropper state
  croppedImage: string | null = null;
  croppedImageData: CroppedImageData | null = null;
  canvasRotation = 0;
  transform = {};
  alignImage = 'center';
  cropper = { x1: -100, y1: -100, x2: 10000, y2: 10000 };

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.resetCropper();
  }

  onImageCropped(event: ImageCroppedEvent): void {
    this.croppedImage = event.objectUrl || event.base64 || null;
    
    if (event.blob) {
      // Create File object from blob
      const fileName = `cropped-photo-${Date.now()}.jpg`;
      const file = new File([event.blob], fileName, { type: 'image/jpeg' });
      
      this.croppedImageData = {
        file,
        base64: event.base64 || '',
        blob: event.blob
      };
    }
  }

  onImageLoaded(event: LoadedImage): void {
    console.log('Image loaded:', event);
  }

  onCropperReady(event: any): void {
    console.log('Cropper ready:', event);
  }

  onLoadImageFailed(event: any): void {
    console.error('Load image failed:', event);
  }

  rotateLeft(): void {
    this.canvasRotation = this.canvasRotation - 90;
    this.flipAfterRotate();
  }

  rotateRight(): void {
    this.canvasRotation = this.canvasRotation + 90;
    this.flipAfterRotate();
  }

  flipHorizontal(): void {
    this.transform = {
      ...this.transform,
      flipH: !this.transform.flipH
    };
  }

  flipVertical(): void {
    this.transform = {
      ...this.transform,
      flipV: !this.transform.flipV
    };
  }

  resetImage(): void {
    this.canvasRotation = 0;
    this.transform = {};
    this.cropper = { x1: -100, y1: -100, x2: 10000, y2: 10000 };
  }

  private flipAfterRotate(): void {
    const flippedH = this.transform.flipH;
    const flippedV = this.transform.flipV;
    this.transform = {
      ...this.transform,
      flipH: flippedV,
      flipV: flippedH
    };
  }

  private resetCropper(): void {
    this.croppedImage = null;
    this.croppedImageData = null;
    this.canvasRotation = 0;
    this.transform = {};
    this.cropper = { x1: -100, y1: -100, x2: 10000, y2: 10000 };
  }

  onDialogClose(result: boolean): void {
    if (!result) {
      this.onCancel.emit();
    }
    this.onClose.emit(result);
  }

  onSave(): void {
    if (this.croppedImageData) {
      this.onSaveCropped.emit(this.croppedImageData);
    }
  }

  handleCancel(): void {
    this.resetCropper();
    this.onCancel.emit();
  }
}