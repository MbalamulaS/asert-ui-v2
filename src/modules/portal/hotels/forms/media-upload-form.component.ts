import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UploadTypes, UploadedFile } from 'components/file-upload/types';
import { finalize } from 'rxjs/operators';
import { HotelService } from '../services/hotel.service';
import { FileUploadComponent } from 'components/file-upload/file-upload.component';
import { SelectComponent } from 'components/select/select.component';
import { TextAreaComponent } from 'components/text-area/text-area.component';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-media-upload-form',
  standalone: true,
  template: `
    <div class="p-4">
      <form [formGroup]="form" class="grid grid-cols-1 gap-4">
        <!-- File Upload Component -->
        <div class="mb-4">
          <file-upload
            label="Upload Hotel Image"
            accept=".png, .jpg, .jpeg"
            [multiple]="false"
            [uploadType]="form.get('uploadType').value"
            (onSuccess)="handleFileUploaded($event)"
          ></file-upload>
        </div>

        <app-select
          label="Image Type"
          formControlName="uploadType"
          [options]="imageTypes"
          [required]="true"
        ></app-select>

        <app-text-area
          label="Image Description"
          formControlName="description"
          [required]="true"
          placeholder="Describe what this image shows..."
          rows="3"
        ></app-text-area>

        <mat-checkbox formControlName="isDefault" class="mt-2">
          Set as default hotel image
        </mat-checkbox>
      </form>

      <div class="flex justify-end mt-6 space-x-4">
        <button
          type="button"
          class="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          (click)="cancel.emit()"
        >
          Cancel
        </button>

        <button
          type="button"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          [disabled]="form.invalid || !uploadedFile || isSubmitting"
          (click)="onSubmit()"
        >
          Save
        </button>
      </div>
    </div>
  `,
  imports: [
    FileUploadComponent,
    ReactiveFormsModule,
    SelectComponent,
    TextAreaComponent,
    MatCheckboxModule,
  ],
})
export class MediaUploadFormComponent implements OnInit {
  @Input() hotelUuid: string;
  @Output() uploadComplete = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  form: FormGroup;
  isSubmitting = false;
  uploadedFile: UploadedFile = null;

  // Available image types for hotel images - formatted for app-select
  imageTypes = [
    { id: UploadTypes.HOTEL_EXTERIOR, name: 'Hotel Exterior' },
    { id: UploadTypes.HOTEL_INTERIOR, name: 'Hotel Interior' },
    { id: UploadTypes.HOTEL_LOBBY, name: 'Hotel Lobby' },
    { id: UploadTypes.HOTEL_ROOM, name: 'Room' },
    { id: UploadTypes.HOTEL_BATHROOM, name: 'Bathroom' },
    { id: UploadTypes.HOTEL_RESTAURANT, name: 'Restaurant' },
    { id: UploadTypes.HOTEL_BAR, name: 'Bar' },
    { id: UploadTypes.HOTEL_POOL, name: 'Swimming Pool' },
    { id: UploadTypes.HOTEL_GYM, name: 'Gym' },
    { id: UploadTypes.HOTEL_SPA, name: 'Spa' },
    { id: UploadTypes.HOTEL_CONFERENCE, name: 'Conference Room' },
    { id: UploadTypes.HOTEL_AMENITIES, name: 'Amenities' },
    { id: UploadTypes.HOTEL_VIEW, name: 'View from Hotel' },
  ];

  constructor(
    private fb: FormBuilder,
    private hotelService: HotelService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      description: ['', [Validators.required]],
      isApproved: [true],
      mediaId: [null, [Validators.required]],
      isDefault: [false],
      uploadType: [UploadTypes.HOTEL_EXTERIOR, [Validators.required]], // Default to exterior
    });
  }

  handleFileUploaded(file: UploadedFile | UploadedFile[]): void {
    if (!file) {
      // File was removed
      this.uploadedFile = null;
      this.form.patchValue({ mediaId: null });
      return;
    }

    // Since we have multiple=false, we should only get one file
    if (Array.isArray(file)) {
      if (file.length > 0) {
        this.uploadedFile = file[0];
        this.form.patchValue({ mediaId: this.uploadedFile.id });

        // If the filename contains a type keyword, try to match the upload type
        this.tryToMatchUploadType(this.uploadedFile.name);
      }
    } else {
      this.uploadedFile = file;
      this.form.patchValue({ mediaId: this.uploadedFile.id });

      // If the filename contains a type keyword, try to match the upload type
      this.tryToMatchUploadType(this.uploadedFile.name);
    }
  }

  // Attempt to match filename to an appropriate upload type
  tryToMatchUploadType(filename: string): void {
    filename = filename.toLowerCase();

    if (filename.includes('exterior') || filename.includes('outside')) {
      this.form.patchValue({ uploadType: UploadTypes.HOTEL_EXTERIOR });
    } else if (filename.includes('interior')) {
      this.form.patchValue({ uploadType: UploadTypes.HOTEL_INTERIOR });
    } else if (filename.includes('lobby')) {
      this.form.patchValue({ uploadType: UploadTypes.HOTEL_LOBBY });
    } else if (filename.includes('room')) {
      this.form.patchValue({ uploadType: UploadTypes.HOTEL_ROOM });
    } else if (filename.includes('bath')) {
      this.form.patchValue({ uploadType: UploadTypes.HOTEL_BATHROOM });
    } else if (filename.includes('restaurant') || filename.includes('dining')) {
      this.form.patchValue({ uploadType: UploadTypes.HOTEL_RESTAURANT });
    } else if (filename.includes('bar')) {
      this.form.patchValue({ uploadType: UploadTypes.HOTEL_BAR });
    } else if (filename.includes('pool') || filename.includes('swim')) {
      this.form.patchValue({ uploadType: UploadTypes.HOTEL_POOL });
    } else if (filename.includes('gym') || filename.includes('fitness')) {
      this.form.patchValue({ uploadType: UploadTypes.HOTEL_GYM });
    } else if (filename.includes('spa')) {
      this.form.patchValue({ uploadType: UploadTypes.HOTEL_SPA });
    } else if (
      filename.includes('conference') ||
      filename.includes('meeting')
    ) {
      this.form.patchValue({ uploadType: UploadTypes.HOTEL_CONFERENCE });
    } else if (filename.includes('amenity') || filename.includes('amenities')) {
      this.form.patchValue({ uploadType: UploadTypes.HOTEL_AMENITIES });
    } else if (filename.includes('view') || filename.includes('scenery')) {
      this.form.patchValue({ uploadType: UploadTypes.HOTEL_VIEW });
    }
  }

  onSubmit(): void {
    if (this.form.invalid || !this.uploadedFile) {
      return;
    }

    this.isSubmitting = true;
    const mediaData = this.form.value;

    this.hotelService
      .uploadMedia(this.hotelUuid, mediaData)
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe(
        (response) => {
          if (response) {
            this.snackBar.open('Image uploaded successfully', 'Close', {
              duration: 3000,
            });
            this.uploadComplete.emit();
          } else {
            this.snackBar.open(
              response.message || 'Failed to upload image',
              'Close',
              { duration: 3000 }
            );
          }
        },
        (error) => {
          this.snackBar.open('Failed to upload image', 'Close', {
            duration: 3000,
          });
        }
      );
  }
}
