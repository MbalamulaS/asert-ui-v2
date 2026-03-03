import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  OnDestroy,
  Output,
} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  BED_TYPE_OPTIONS,
  FACILITY_TYPE_OPTIONS,
  Hotel,
  HotelFacilityTypes,
  HotelMedia,
  PROPERTY_TYPE_OPTIONS,
  ROOM_AMENITIES,
} from '../types';
import { finalize } from 'rxjs/operators';
import { HotelService } from '../services/hotel.service';
import { SelectComponent } from 'components/select/select.component';
import { TextInputComponent } from 'components/text-field/text-field.component';
import { TextAreaComponent } from 'components/text-area/text-area.component';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FetcherComponent } from 'components/fetcher/fetcher.component';
import { MediaUploadFormComponent } from './media-upload-form.component';
import { DialogComponent } from 'components/dialog/dialog.component';
import { FileUploadComponent } from 'components/file-upload/file-upload.component';
import { UploadedFile, UploadTypes } from 'components/file-upload/types';
import { MatTooltip } from '@angular/material/tooltip';
import { TimePickerComponent } from 'components/time-picker/time-picker.component';
import { AutocompleteAsyncComponent } from 'components/autocomplete/autocomplete-async.component';

@Component({
  selector: 'app-hotel-form',
  standalone: true,
  template: `
    <div>
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <!-- Main Info Section -->
        <div class="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 class="text-lg font-medium text-gray-800 mb-4">
            Basic Information
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <app-text-input
              label="Hotel Name"
              name="name"
              formControlName="name"
              [required]="true"
            />

            <app-text-input
              label="Website"
              name="website"
              formControlName="website"
            />

            <app-text-input
              label="Email"
              name="email"
              formControlName="email"
              [required]="true"
              type="email"
            />

            <app-text-input
              label="Phone Number"
              name="phone"
              formControlName="phone"
              [required]="true"
            />

            <app-fetcher
              api="hotels/get-types"
              [defaultParams]="{ size: '15' }"
              loadingLabel="Fetching Hotel Types.."
            >
              <ng-template let-response>
                <div *ngIf="response; else noData">
                  <app-select
                    label="Select Hotel Type"
                    formControlName="propertyType"
                    [options]="response.data"
                  />
                </div>
                <ng-template #noData>No data available</ng-template>
              </ng-template>
            </app-fetcher>

            <app-autocomplete-async
              label="Select Location"
              formControlName="locationId"
              api="admin-hierarchies"
              searchParam="name"
              displayProperty="name"
              valueProperty="id"
              [required]="false"
              placeholder="Type to search for parent area..."
            />
          </div>

          <div class="mt-6">
            <h4 class="text-md font-medium text-gray-700 mb-2">
              Geographic Location
            </h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <app-text-input
                label="Latitude"
                name="latitude"
                formControlName="latitude"
                type="number"
              />

              <app-text-input
                label="Longitude"
                name="longitude"
                formControlName="longitude"
                type="number"
              />
            </div>

            <app-text-area
              label="Description"
              name="description"
              formControlName="description"
              rows="4"
              [required]="true"
            />
          </div>
        </div>

        <!-- Room Types Section -->
        <div class="bg-white rounded-lg shadow-md p-6 mb-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium text-gray-800">Room Types</h3>
            <button
              type="button"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              (click)="hotelService.addRoomType()"
            >
              Add Room Type
            </button>
          </div>

          <div formArrayName="roomTypes">
            <div
              *ngFor="
                let roomTypeForm of hotelService.roomTypesFormArray.controls;
                let i = index
              "
              class="p-4 border border-gray-200 rounded-md mb-4"
            >
              <div class="flex justify-between items-center mb-4">
                <h4 class="text-md font-medium text-gray-700">
                  Room Type #{{ i + 1 }}
                </h4>
                <button
                  type="button"
                  class="p-1 text-red-500 hover:text-red-700 focus:outline-none"
                  (click)="hotelService.removeRoomType(i)"
                >
                  <span class="material-icons">delete</span>
                </button>
              </div>

              <div
                [formGroupName]="i"
                class="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                <app-fetcher
                  api="bed-room-types"
                  [defaultParams]="{ size: '100' }"
                  loadingLabel="Fetching Bed Room Types.."
                >
                  <ng-template let-response>
                    <div *ngIf="response; else noData">
                      <app-select
                        label="Bed Room Type"
                        formControlName="bedRoomTypeId"
                        [options]="response.data"
                      />
                    </div>
                    <ng-template #noData>No data available</ng-template>
                  </ng-template>
                </app-fetcher>
                <app-fetcher
                  api="bed-types"
                  [defaultParams]="{ size: '100' }"
                  loadingLabel="Fetching Bed Types.."
                >
                  <ng-template let-response>
                    <div *ngIf="response; else noData">
                      <app-select
                        label="Bed Type"
                        formControlName="bedTypeId"
                        [options]="response.data"
                      />
                    </div>
                    <ng-template #noData>No data available</ng-template>
                  </ng-template>
                </app-fetcher>

                <app-text-input
                  label="How Many Rooms?"
                  name="quantity"
                  formControlName="quantity"
                  [required]="true"
                  type="number"
                />

                <app-text-input
                  label="Max Occupancy"
                  name="maxOccupancy"
                  formControlName="maxOccupancy"
                  type="number"
                />

                <!--<div class="md:col-span-2">-->
                <app-select
                  label="Amenities"
                  formControlName="amenities"
                  [multiple]="true"
                  [options]="roomAmenityOptions"
                />
                <!--</div>-->
              </div>
            </div>

            <div
              *ngIf="hotelService.roomTypesFormArray.length === 0"
              class="p-6 border border-gray-200 border-dashed rounded-md text-center text-gray-500"
            >
              No room types added. Click "Add Room Type" to add your first room
              type.
            </div>
          </div>
        </div>

        <!-- Facilities Section -->
        <div class="bg-white rounded-lg shadow-md p-6 mb-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium text-gray-800">Facilities</h3>
            <button
              type="button"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              (click)="hotelService.addFacility()"
            >
              Add Facility
            </button>
          </div>

          <div formArrayName="facilities">
            <div
              *ngFor="
                let facilityForm of hotelService.facilitiesFormArray.controls;
                let i = index
              "
              class="p-4 border border-gray-200 rounded-md mb-4"
            >
              <div class="flex justify-between items-center mb-4">
                <h4 class="text-md font-medium text-gray-700">
                  Facility #{{ i + 1 }}
                </h4>
                <button
                  type="button"
                  class="p-1 text-red-500 hover:text-red-700 focus:outline-none"
                  (click)="hotelService.removeFacility(i)"
                >
                  <span class="material-icons">delete</span>
                </button>
              </div>

              <div
                [formGroupName]="i"
                class="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                <app-text-input
                  label="Facility Name"
                  name="name"
                  formControlName="name"
                  [required]="true"
                />

                <app-select
                  label="Facility Type"
                  formControlName="facilityType"
                  name="facilityType"
                  [options]="facilityTypes"
                  [required]="true"
                />

                <app-text-input
                  label="Capacity"
                  name="capacity"
                  formControlName="capacity"
                  type="number"
                />

                <div class="-mt-6">
                  <label class="field-label">Opening Time</label>
                  <app-time-picker
                    label="Opening Hours"
                    name="openingHours"
                    formControlName="openingHours"
                    hourLabel="Hour"
                    minuteLabel="Min"
                    name="openingTime"
                    [required]="true"
                  />
                </div>

                <div class="md:col-span-2">
                  <app-text-area
                    label="Description"
                    name="description"
                    formControlName="description"
                    [rows]="3"
                  />
                </div>
              </div>
            </div>

            <div
              *ngIf="hotelService.facilitiesFormArray.length === 0"
              class="p-6 border border-gray-200 border-dashed rounded-md text-center text-gray-500"
            >
              No facilities added. Click "Add Facility" to add your first
              facility.
            </div>
          </div>
        </div>

        <!-- Media Upload Section (for new hotels) -->
        <div *ngIf="!editMode" class="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 class="text-lg font-medium text-gray-800 mb-4">Hotel Images</h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Exterior Images -->
            <div>
              <h4 class="text-md font-medium text-gray-700 mb-2">
                Exterior Images
              </h4>
              <file-upload
                label="Upload exterior photos"
                accept=".png, .jpg, .jpeg"
                [multiple]="true"
                [autoUpload]="true"
                [uploadType]="uploadType.HOTEL_EXTERIOR"
                (onSuccess)="handleFileUploaded($event, 'HOTEL_EXTERIOR')"
              />
            </div>

            <!-- Interior Images -->
            <div>
              <h4 class="text-md font-medium text-gray-700 mb-2">
                Interior Images
              </h4>
              <file-upload
                label="Upload interior photos"
                accept=".png, .jpg, .jpeg"
                [multiple]="true"
                [autoUpload]="true"
                [uploadType]="uploadType.HOTEL_INTERIOR"
                (onSuccess)="handleFileUploaded($event, 'HOTEL_INTERIOR')"
              ></file-upload>
            </div>

            <!-- Room Images -->
            <div>
              <h4 class="text-md font-medium text-gray-700 mb-2">
                Room Images
              </h4>
              <file-upload
                label="Upload room photos"
                accept=".png, .jpg, .jpeg"
                [multiple]="true"
                [autoUpload]="true"
                [uploadType]="uploadType.HOTEL_ROOM"
                (onSuccess)="handleFileUploaded($event, 'HOTEL_ROOM')"
              ></file-upload>
            </div>

            <!-- Additional Images -->
            <div>
              <h4 class="text-md font-medium text-gray-700 mb-2">
                Additional Images
              </h4>
              <file-upload
                label="Upload additional photos"
                accept=".png, .jpg, .jpeg"
                [multiple]="true"
                [autoUpload]="true"
                [uploadType]="uploadType.HOTEL_AMENITIES"
                (onSuccess)="handleFileUploaded($event, 'HOTEL_AMENITIES')"
              ></file-upload>
            </div>
          </div>

          <!-- Upload Summary -->
          <div
            *ngIf="getTotalUploadedImages() > 0"
            class="mt-6 p-4 bg-blue-50 rounded-md"
          >
            <h4 class="text-md font-medium text-blue-800 mb-2">
              Uploaded Images Summary
            </h4>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div *ngIf="getImagesByType('HOTEL_EXTERIOR').length > 0">
                <span class="font-medium">Exterior:</span>
                {{ getImagesByType('HOTEL_EXTERIOR').length }} images
              </div>
              <div *ngIf="getImagesByType('HOTEL_INTERIOR').length > 0">
                <span class="font-medium">Interior:</span>
                {{ getImagesByType('HOTEL_INTERIOR').length }} images
              </div>
              <div *ngIf="getImagesByType('HOTEL_ROOM').length > 0">
                <span class="font-medium">Rooms:</span>
                {{ getImagesByType('HOTEL_ROOM').length }} images
              </div>
              <div *ngIf="getImagesByType('HOTEL_AMENITIES').length > 0">
                <span class="font-medium">Additional:</span>
                {{ getImagesByType('HOTEL_AMENITIES').length }} images
              </div>
            </div>
            <p class="mt-2 text-blue-700">
              <strong>Total: {{ getTotalUploadedImages() }} images</strong>
              ready to be included with your hotel registration.
            </p>
          </div>
        </div>

        <!-- Media Section (if hotel already exists) -->
        <div *ngIf="editMode" class="bg-white rounded-lg shadow-md p-6 mb-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium text-gray-800">Hotel Images</h3>
            <button
              type="button"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              (click)="openUploadDialog()"
            >
              Upload Images
            </button>
          </div>

          <div
            *ngIf="!mediaItems || mediaItems.length === 0"
            class="p-6 border border-gray-200 border-dashed rounded-md text-center text-gray-500"
          >
            No images uploaded. Click "Upload Images" to add photos of your
            hotel.
          </div>

          <div
            *ngIf="mediaItems && mediaItems.length > 0"
            class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            <div *ngFor="let media of mediaItems" class="relative group">
              <div class="rounded-md overflow-hidden border border-gray-200">
                <img
                  [src]="getImageDataUrl(media.mediaUrl, media.mediaFileType)"
                  [alt]="media.description"
                  class="w-full h-40 object-cover"
                />
                <div class="p-2">
                  <p class="text-sm truncate">{{ media.description }}</p>
                </div>
              </div>

              <div
                class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100"
              >
                <button
                  type="button"
                  class="p-1 bg-white rounded-full m-1 shadow-md hover:bg-gray-100"
                  [class.text-yellow-500]="media.isDefault"
                  (click)="setAsDefaultImage(media.uuid)"
                  matTooltip="Set as default image"
                >
                  <span class="material-icons">{{
                    media.isDefault ? 'star' : 'star_border'
                  }}</span>
                </button>

                <button
                  type="button"
                  class="p-1 bg-white rounded-full m-1 shadow-md hover:bg-gray-100 text-red-500"
                  (click)="deleteMedia(media.uuid)"
                  matTooltip="Delete image"
                >
                  <span class="material-icons">delete</span>
                </button>
              </div>

              <div
                *ngIf="media.isDefault"
                class="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full"
              >
                Default
              </div>
            </div>
          </div>
        </div>

        <!-- Submit Buttons -->
        <div class="flex justify-end space-x-4">
          <button
            type="button"
            class="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            (click)="cancel()"
          >
            Cancel
          </button>

          <button
            type="submit"
            class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {{ editMode ? 'Update Hotel' : 'Register Hotel' }}
          </button>
        </div>
        <!--<pre>{{ form.value | json }}</pre>-->
      </form>
      <app-dialog
        [open]="isMediaDialogOpen"
        [title]="'Upload Hotel Image'"
        (onClose)="closeMediaDialog()"
      >
        <ng-template>
          <app-media-upload-form
            [hotelUuid]="currentHotelUuid"
            (uploadComplete)="handleMediaUploadComplete()"
            (cancel)="closeMediaDialog()"
          ></app-media-upload-form>
        </ng-template>
      </app-dialog>
    </div>
  `,
  imports: [
    SelectComponent,
    TextInputComponent,
    TextAreaComponent,
    ReactiveFormsModule,
    CommonModule,
    FetcherComponent,
    MediaUploadFormComponent,
    DialogComponent,
    FileUploadComponent,
    MatTooltip,
    TimePickerComponent,
    AutocompleteAsyncComponent,
  ],
})
export class HotelFormComponent implements OnInit, OnDestroy {
  @Output() formSubmitted = new EventEmitter<Hotel>();
  @Output() cancelClicked = new EventEmitter<void>();
  @Input() editMode = false;
  protected readonly uploadType = UploadTypes;

  form: FormGroup;

  isSubmitting = false;
  mediaItems: HotelMedia[] = [];
  propertyTypeOptions = PROPERTY_TYPE_OPTIONS;
  facilityTypeOptions = FACILITY_TYPE_OPTIONS;
  bedTypeOptions = BED_TYPE_OPTIONS;
  facilityTypes = HotelFacilityTypes;
  locationOptions = [];
  isMediaDialogOpen: boolean = false;
  currentHotelUuid: string = '';

  roomAmenityOptions = ROOM_AMENITIES.map((amenity) => ({
    name: amenity,
    id: amenity,
  }));

  uploadedFiles: UploadedFile[] = [];

  constructor(
    public hotelService: HotelService,
    private snackBar: MatSnackBar,
  ) {
    this.form = this.hotelService.form;
  }

  ngOnInit(): void {
    this.loadLocations();

    if (this.editMode && this.hotelService.form.get('uuid').value) {
      this.loadHotelMedia();
    }
  }

  loadLocations(): void {
    // This would typically fetch from your location/admin hierarchy service
    // For now, we'll mock some locations with the correct value/viewValue format
    this.locationOptions = [
      { value: '1', viewValue: 'Dar es Salaam' },
      { value: '2', viewValue: 'Arusha' },
      { value: '3', viewValue: 'Zanzibar' },
      { value: '4', viewValue: 'Mwanza' },
      { value: '5', viewValue: 'Dodoma' },
    ];
  }

  loadHotelMedia(): void {
    const hotelUuid = this.hotelService.form.get('uuid').value;
    if (!hotelUuid) return;

    this.hotelService.getMedia(hotelUuid).subscribe(
      (response) => {
        if (response && response.data) {
          this.mediaItems = response.data.content || [];
        }
      },
      (error) => {
        this.snackBar.open('Failed to load hotel images', 'Close', {
          duration: 3000,
        });
      },
    );
  }

  openUploadDialog(): void {
    const hotelUuid = this.hotelService.form.get('uuid').value;
    if (!hotelUuid) {
      this.snackBar.open(
        'Please save the hotel details first before uploading images',
        'Close',
        { duration: 5000 },
      );
      return;
    }

    this.currentHotelUuid = hotelUuid;
    this.isMediaDialogOpen = true;
  }

  setAsDefaultImage(mediaUuid: string): void {
    const hotelUuid = this.hotelService.form.get('uuid').value;
    if (!hotelUuid || !mediaUuid) return;

    this.hotelService.setDefaultImage(hotelUuid, mediaUuid).subscribe(
      (response) => {
        if (response) {
          this.snackBar.open('Default image updated successfully', 'Close', {
            duration: 3000,
          });
          this.loadHotelMedia();
        } else {
          this.snackBar.open(
            response.message || 'Failed to update default image',
            'Close',
            { duration: 3000 },
          );
        }
      },
      (error) => {
        this.snackBar.open('Failed to update default image', 'Close', {
          duration: 3000,
        });
      },
    );
  }

  onSubmit(): void {
    console.log('errors', this.getFormValidationErrors());
    console.log('FormValues', this.form.value);

    if (this.hotelService.form.invalid) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.hotelService.form.controls).forEach((key) => {
        const control = this.hotelService.form.get(key);
        control.markAsTouched();
      });

      this.snackBar.open(
        'Please fill in all required fields correctly.',
        'Close',
        { duration: 5000 },
      );
      return;
    }

    // For new hotels, validate that at least one image is uploaded
    if (!this.editMode && this.uploadedFiles.length === 0) {
      this.snackBar.open(
        'Please upload at least one hotel image before submitting.',
        'Close',
        { duration: 5000 },
      );
      return;
    }

    this.isSubmitting = true;
    const formValue = this.hotelService.form.value;

    if (this.editMode) {
      const uuid = formValue.uuid;
      this.hotelService
        .update(uuid, formValue)
        .pipe(finalize(() => (this.isSubmitting = false)))
        .subscribe(
          (response) => {
            if (response) {
              this.snackBar.open('Hotel updated successfully', 'Close', {
                duration: 3000,
              });
              this.formSubmitted.emit(response.data);
            } else {
              this.snackBar.open(
                response.message || 'Failed to update hotel',
                'Close',
                { duration: 3000 },
              );
            }
          },
          (error) => {
            this.snackBar.open('Failed to update hotel', 'Close', {
              duration: 3000,
            });
          },
        );
    } else {
      // Convert uploaded files to HotelMediaDto format
      const hotelMediaDtoList = this.uploadedFiles.map((file) => ({
        attachmentId: file.id,
        name: file.name,
        hotelId: null, // Will be set by backend
        userId: null, // Will be set by backend
        fileSize: file.fileSize,
      }));

      const payload = {
        ...formValue,
        hotelMediaDtoList: hotelMediaDtoList,
      };

      console.log('Hotel creation payload:', payload);
      this.hotelService
        .create(payload)
        .pipe(finalize(() => (this.isSubmitting = false)))
        .subscribe(
          (response) => {
            if (response) {
              this.snackBar.open('Hotel registered successfully', 'Close', {
                duration: 3000,
              });

              // Clear uploaded files after successful creation
              this.clearUploadedFiles();

              // Reset form
              this.hotelService.clearForm();

              this.formSubmitted.emit(response.data);
            } else {
              this.snackBar.open(
                response.message || 'Failed to register hotel',
                'Close',
                { duration: 3000 },
              );
            }
          },
          (error) => {
            this.snackBar.open('Failed to register hotel', 'Close', {
              duration: 3000,
            });
          },
        );
    }
  }

  cancel(): void {
    // Clear uploaded files when canceling
    this.clearUploadedFiles();
    this.cancelClicked.emit();
  }

  getFormValidationErrors() {
    const errors = {};
    Object.keys(this.hotelService.form.controls).forEach((key) => {
      const control = this.hotelService.form.get(key);
      if (control && !control.valid) {
        errors[key] = control.errors;
      }
    });
    return errors;
  }

  closeMediaDialog(refreshData = false): void {
    this.isMediaDialogOpen = false;
    this.currentHotelUuid = null;

    if (refreshData) {
      this.loadHotelMedia();
    }
  }

  handleMediaUploadComplete(): void {
    this.closeMediaDialog(true);
  }

  handleFileUploaded(uploadedFiles: UploadedFile[], uploadType: string) {
    console.log('Files uploaded:', uploadedFiles, 'Type:', uploadType);

    // Remove any existing files of this type
    this.uploadedFiles = this.uploadedFiles.filter(
      (file) => file.uploadType !== uploadType,
    );

    // Add new files of this type
    if (uploadedFiles && uploadedFiles.length > 0) {
      this.uploadedFiles.push(...uploadedFiles);
    }

    console.log('Total uploaded files:', this.uploadedFiles);
  }

  getImagesByType(uploadType: string): UploadedFile[] {
    return this.uploadedFiles.filter((file) => file.uploadType === uploadType);
  }

  getTotalUploadedImages(): number {
    return this.uploadedFiles.length;
  }

  clearUploadedFiles(): void {
    this.uploadedFiles = [];
  }

  getImageDataUrl(mediaUrl: string, mediaFileType?: string): string {
    if (!mediaUrl) return '';

    // Default to jpeg if no type specified
    const mimeType = mediaFileType || 'image/jpeg';
    return `data:${mimeType};base64,${mediaUrl}`;
  }

  deleteMedia(mediaUuid: string): void {
    const hotelUuid = this.hotelService.form.get('uuid').value;
    if (!hotelUuid || !mediaUuid) return;

    if (confirm('Are you sure you want to delete this image?')) {
      this.hotelService.deleteMedia(hotelUuid, mediaUuid).subscribe(
        (response) => {
          if (response) {
            this.snackBar.open('Image deleted successfully', 'Close', {
              duration: 3000,
            });
            this.loadHotelMedia(); // Refresh the media list
          } else {
            this.snackBar.open('Failed to delete image', 'Close', {
              duration: 3000,
            });
          }
        },
        (error) => {
          this.snackBar.open('Failed to delete image', 'Close', {
            duration: 3000,
          });
        },
      );
    }
  }

  ngOnDestroy(): void {
    // Clear uploaded files when component is destroyed
    this.clearUploadedFiles();
  }
}
