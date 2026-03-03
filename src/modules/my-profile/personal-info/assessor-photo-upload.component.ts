import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {provideIcons} from '@ng-icons/core';
import {heroCog6Tooth, heroMagnifyingGlass, heroPencilSquare, heroTrash,} from '@ng-icons/heroicons/outline';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {ImageCroppedEvent, ImageCropperModule} from "ngx-image-cropper";
import {DomSanitizer} from "@angular/platform-browser";
import {ToastService} from "app/toast.service";
import {NgIf} from "@angular/common";
import {HttpService} from "app/api/api.service";
import {HttpEventType, HttpResponse} from "@angular/common/http";

@Component({
  selector: 'app-assessor-photo-upload',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    ImageCropperModule,
    NgIf,

  ],
  viewProviders: [
    provideIcons({
      heroCog6Tooth,
      heroPencilSquare,
      heroTrash,
      heroMagnifyingGlass,
    }),
  ],
  template: `
    <div class="space-y-6">
      <!-- File Input -->
      <div>
        <input
          type="file"
          accept=".jpg,.png,.jpeg"
          (change)="fileChangeEvent($event)"
          class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
             file:rounded-full file:border-0 file:text-sm file:font-semibold
             file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>

      <!-- Crop Area and Output Side by Side -->
      <div class="flex flex-col lg:flex-row gap-8">
        <!-- Cropper Left -->
        <div class="w-full lg:w-2/3">
          <image-cropper
            [imageChangedEvent]="imageChangedEvent"
            [maintainAspectRatio]="true"
            [aspectRatio]="1"
            [resizeToWidth]="200"
            format="png"
            class="rounded-md border border-gray-200 shadow-sm"
            (imageCropped)="imageCropped($event)"
            (imageLoaded)="imageLoaded()"
            (cropperReady)="cropperReady()"
            (loadImageFailed)="loadImageFailed()"
          ></image-cropper>
        </div>

        <!-- Cropped Preview Right -->
        <div class="w-full lg:w-1/3 flex flex-col items-center justify-center space-y-4">
          <img
            *ngIf="croppedImage"
            [src]="croppedImage"
            alt="Cropped Image"
            class="w-40 h-40 object-cover rounded-full border shadow"
          />
          <span *ngIf="!croppedImage" class="text-gray-400 text-sm">No image cropped yet</span>
        </div>
      </div>

      <!-- Upload Button -->
      <div class="flex justify-end">
        <button
          mat-raised-button
          color="primary"
          type="button"
          class="flex items-center gap-2"
          (click)="upload()"
          [disabled]="!croppedImageBlob || isSubmitting"
        >
          <mat-icon>save</mat-icon>
          Upload
        </button>
      </div>
    </div>
  `,
})
export class AssessorPhotoUploadComponent implements OnInit {
  imageChangedEvent: any = '';
  croppedImage: any = '';
  croppedImageBlob: Blob | null = null;
  photoBase64: any;
  isSubmitting = false;

  @Output() onSubmit = new EventEmitter<{fileUploadId: number}>();


  constructor(private sanitizer: DomSanitizer,
              private toast: ToastService,
              private httpService: HttpService) {
  }

  ngOnInit() {
  }


  fileChangeEvent(event: any): void {
    this.imageChangedEvent = event;
  }

  imageCropped(event: ImageCroppedEvent): void {
    this.croppedImage = this.sanitizer.bypassSecurityTrustUrl(event.objectUrl);
    this.croppedImageBlob = event.blob;
    this.blobToBase64(event.blob).then((base64String) => {
      this.photoBase64 = base64String;
    }).catch((error) => {
      console.error("Error converting blob to base64:", error);
    });
  }

  blobToBase64(blob: Blob): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        resolve(base64String.split(",")[1]);
      };
      reader.onerror = () => {
        reject(reader.error);
      };
      reader.readAsDataURL(blob);
    });
  }

  imageLoaded() {
    this.toast.success('Image Loaded!', 'Ready!');
  }

  cropperReady() {
    this.toast.success('Image Cropper Ready!', 'Ready');
  }

  loadImageFailed() {
    this.toast.error('Image Could Not Be Loaded!', 'Error');
  }

  upload() {
    if (!this.croppedImageBlob) {
      this.toast.error('No image to upload', 'Error');
      return;
    }

    this.isSubmitting = true;
    
    // Convert the cropped image blob to file
    this.blobToFile(this.croppedImageBlob, 'profile-photo.png').then((file) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('uploadType', 'PROFILE_PHOTO');

      this.httpService.postWithProgress('uploads', formData).subscribe({
        next: (event) => {
          if (event.type === HttpEventType.UploadProgress) {
            // Handle progress if needed
          } else if (event instanceof HttpResponse) {
            const response = event.body as any;
            this.toast.success('Photo uploaded successfully!', 'Success');
            this.onSubmit.emit({fileUploadId: response.data.id});
            this.isSubmitting = false;
          }
        },
        error: (error) => {
          this.toast.error('Failed to upload photo', 'Error');
          this.isSubmitting = false;
        }
      });
    }).catch((error) => {
      this.toast.error('Failed to process image', 'Error');
      this.isSubmitting = false;
    });
  }

  blobToFile(blob: Blob, fileName: string): Promise<File> {
    return new Promise((resolve) => {
      const file = new File([blob], fileName, {
        type: blob.type,
        lastModified: Date.now()
      });
      resolve(file);
    });
  }
}
