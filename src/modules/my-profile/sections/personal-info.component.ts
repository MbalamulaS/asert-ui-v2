import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AssessorService } from 'modules/assessment/assessor.service';
import { Assessor } from 'modules/assessment/assessment';
import { ContainerComponent } from 'components/container/container.component';
import { HeaderComponent } from 'components/header/header.component';
import { WrapperComponent } from 'components/wrapper/wrapper.component';
import { TextInputComponent } from 'components/text-field/text-field.component';
import { SelectComponent } from 'components/select/select.component';
import { DatepickerComponent } from 'components/datepicker/datepicker.component';
import { AutocompleteAsyncComponent } from 'components/autocomplete/autocomplete-async.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ToastService } from 'app/toast.service';
import { DomSanitizer } from '@angular/platform-browser';
import { HttpService } from 'app/api/api.service';
import { ProfilePictureComponent } from 'components/profile-picture/profile-picture.component';
import { DialogComponent } from 'components/dialog/dialog.component';
import { FileUploadComponent } from 'components/file-upload/file-upload.component';
import { UploadTypes, UploadedFile } from 'components/file-upload/types';
import {
  PhotoCropperComponent,
  CroppedImageData,
} from 'components/photo-cropper/photo-cropper.component';
import { TextAreaComponent } from 'components/text-area/text-area.component';

@Component({
  selector: 'app-personal-info',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ContainerComponent,
    HeaderComponent,
    WrapperComponent,
    TextInputComponent,
    TextAreaComponent,
    SelectComponent,
    DatepickerComponent,
    AutocompleteAsyncComponent,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    ProfilePictureComponent,
    DialogComponent,
    FileUploadComponent,
    PhotoCropperComponent,
  ],
  template: `
    <container>
      <app-wrapper>
        <div class="flex items-center mb-6">
          <button
            mat-icon-button
            (click)="goBack()"
            class="mr-4 hover:bg-gray-100 rounded-full"
          >
            <mat-icon>arrow_back</mat-icon>
          </button>
          <app-header
            title="Personal Information"
            subtitle="Complete your basic details, photo, ID and location"
          />
        </div>
      </app-wrapper>

      <app-wrapper>
        <div class="max-w-4xl mx-auto">
          <mat-card class="relative overflow-hidden">
            <div
              class="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 transform rotate-45 translate-x-8 -translate-y-8"
            ></div>

            <mat-card-content class="p-6">
              <form [formGroup]="personalForm" class="space-y-6">
                <!-- Profile Photo Upload -->
                <div
                  class="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
                >
                  <app-profile-picture
                    [src]="getProfilePictureSrc()"
                    alt="Profile Picture"
                    size="4rem"
                    [clickable]="true"
                    clickIcon="camera_alt"
                    placeholderText=""
                    shadowSize="sm"
                    (click)="openPhotoUploadDialog()"
                  />
                  <div class="flex-1">
                    <h4 class="font-medium text-gray-900">Profile Photo</h4>
                    <p class="text-sm text-gray-600">
                      Upload a professional headshot
                    </p>
                    <button
                      type="button"
                      class="mt-2 text-sm text-blue-600 hover:text-blue-700"
                      (click)="openPhotoUploadDialog()"
                    >
                      {{
                        assessor?.profilePhoto?.uuid || assessor?.photo
                          ? 'Change Photo'
                          : 'Upload Photo'
                      }}
                    </button>
                  </div>
                </div>

                <!-- Basic Information -->
                <div class="space-y-4">
                  <h3 class="text-lg font-medium text-gray-900 border-b pb-2">
                    Basic Information
                  </h3>
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <app-text-input
                      label="First Name"
                      [formControl]="personalForm.get('firstName')"
                      [required]="true"
                    />
                    <app-text-input
                      label="Middle Name"
                      [formControl]="personalForm.get('middleName')"
                    />
                    <app-text-input
                      label="Last Name"
                      [formControl]="personalForm.get('lastName')"
                      [required]="true"
                    />
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <app-select
                      label="Title"
                      [formControl]="personalForm.get('title')"
                      [options]="titleOptions"
                      [required]="true"
                    />
                    <app-select
                      label="Gender"
                      [formControl]="personalForm.get('sex')"
                      [options]="genderOptions"
                      [required]="true"
                    />
                    <app-datepicker
                      label="Date of Birth"
                      [formControl]="personalForm.get('dob')"
                      [required]="true"
                    />
                  </div>

                  <app-text-area
                    label="Description"
                    [formControl]="personalForm.get('description')"
                    rows="4"
                    [required]="true"
                  />
                </div>

                <!-- Contact Information -->
                <div class="space-y-4">
                  <h3 class="text-lg font-medium text-gray-900 border-b pb-2">
                    Contact Information
                  </h3>
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <app-text-input
                      label="Email Address"
                      type="email"
                      [formControl]="personalForm.get('email')"
                      [required]="true"
                    />
                    <app-text-input
                      label="Phone Number"
                      [formControl]="personalForm.get('phone')"
                      [required]="true"
                    />
                    <app-text-input
                      label="Phone Number #2"
                      [formControl]="personalForm.get('phoneTwo')"
                      [required]="false"
                    />
                  </div>
                </div>

                <!-- Identification & Location -->
                <div class="space-y-4">
                  <h3 class="text-lg font-medium text-gray-900 border-b pb-2">
                    Identification & Location
                  </h3>
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <app-select
                      label="ID Type"
                      [formControl]="personalForm.get('identificationType')"
                      [options]="idTypeOptions"
                      [required]="true"
                    />
                    <app-text-input
                      label="ID Number"
                      [formControl]="personalForm.get('identificationId')"
                      [required]="true"
                    />
                    <app-autocomplete-async
                      label="Location"
                      api="admin-hierarchies"
                      [defaultParams]="{ size: '35' }"
                      displayKey="name"
                      searchParam="name"
                      valueKey="id"
                      formControlName="locationId"
                      name="locationId"
                      loadingLabel="Loading Locations..."
                      [required]="true"
                      (onOptionSelect)="onLocationSelected($event)"
                    />
                  </div>
                </div>
              </form>
            </mat-card-content>

            <!-- Action Buttons -->
            <div
              class="flex justify-between items-center p-6 bg-gray-50 border-t"
            >
              <button
                mat-button
                (click)="goBack()"
                class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <mat-icon class="mr-2">arrow_back</mat-icon>
                Back to Overview
              </button>

              <div class="flex space-x-3">
                <button
                  mat-button
                  (click)="saveDraft()"
                  class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Save Draft
                </button>
                <button
                  mat-raised-button
                  color="primary"
                  (click)="saveAndContinue()"
                  [disabled]="personalForm.invalid"
                  class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save & Continue
                </button>
              </div>
            </div>
          </mat-card>
        </div>
      </app-wrapper>

      <!-- Photo Upload Dialog -->
      <app-dialog
        [open]="showPhotoUploadDialog"
        [title]="'Upload Profile Photo'"
        width="500px"
        headerBgColor="bg-gray-100"
        headerTextColor="text-gray-900"
        (onClose)="onPhotoDialogClose($event)"
      >
        <ng-template>
          <div class="p-6">
            <p class="text-sm text-gray-600 mb-4">
              Upload a professional headshot for your profile.
            </p>

            <input
              type="file"
              accept=".png,.jpg,.jpeg"
              (change)="onFileSelected($event)"
              class="mb-4"
            />

            <div *ngIf="selectedFile" class="bg-gray-50 rounded-lg p-3 mt-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <mat-icon class="text-gray-500 mr-2">image</mat-icon>
                  <span class="text-sm">{{ selectedFile.name }}</span>
                </div>
                <button
                  mat-icon-button
                  (click)="removeSelectedFile()"
                  class="text-red-500 hover:bg-red-50"
                >
                  <mat-icon>close</mat-icon>
                </button>
              </div>
            </div>

            <div
              class="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200"
            >
              <button
                mat-button
                (click)="cancelPhotoDialog()"
                class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                mat-raised-button
                color="primary"
                (click)="proceedToCropper()"
                [disabled]="!selectedFile"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Crop Photo
              </button>
            </div>
          </div>
        </ng-template>
      </app-dialog>

      <!-- Photo Cropper -->
      <app-photo-cropper
        [open]="showPhotoCropper"
        [title]="'Crop Profile Photo'"
        [imageChangedEvent]="imageChangedEvent"
        [maintainAspectRatio]="true"
        [aspectRatio]="1"
        [resizeToWidth]="300"
        [resizeToHeight]="300"
        [cropperMinWidth]="200"
        [cropperMinHeight]="200"
        [roundCropper]="false"
        (onClose)="onPhotoCropperClose($event)"
        (onSaveCropped)="onPhotoCropped($event)"
        (onCancel)="onPhotoCropperCancel()"
      />
    </container>
  `,
  styles: [
    `
      .mat-mdc-card {
        @apply shadow-sm border border-gray-100;
      }
    `,
  ],
})
export class PersonalInfoComponent implements OnInit {
  assessor: Assessor | undefined = undefined;
  personalForm: FormGroup;
  selectedLocation: any = null;
  showPhotoUploadDialog = false;
  showPhotoCropper = false;
  selectedFile: File | null = null;
  imageChangedEvent: Event | null = null;
  selectedPhoto: UploadedFile | null = null;
  protected readonly uploadType = UploadTypes;

  titleOptions = [
    { value: 'Mr', label: 'Mr' },
    { value: 'Mrs', label: 'Mrs' },
    { value: 'Ms', label: 'Ms' },
    { value: 'Dr', label: 'Dr' },
    { value: 'Prof', label: 'Prof' },
  ];

  genderOptions = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
  ];

  idTypeOptions = [
    { value: 'NIN', label: 'National ID' },
    { value: 'PASSPORT', label: 'Passport' },
  ];

  constructor(
    private fb: FormBuilder,
    private assessorService: AssessorService,
    private router: Router,
    private toast: ToastService,
    private sanitizer: DomSanitizer,
    private httpService: HttpService,
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadAssessorData();
  }

  initializeForm(): void {
    this.personalForm = this.fb.group({
      firstName: ['', Validators.required],
      middleName: [''],
      lastName: ['', Validators.required],
      title: ['', Validators.required],
      sex: ['', Validators.required],
      dob: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      description: ['', Validators.required],
      phoneTwo: [''],
      photo: [''],
      identificationType: ['', Validators.required],
      identificationId: ['', Validators.required],
      locationId: ['', Validators.required],
    });
  }

  loadAssessorData(): void {
    this.assessorService.getCurrentUserAssessorData().subscribe({
      next: (response) => {
        const data = response.data;
        this.assessor = data.assessor || data;

        if (this.assessor) {
          this.populateForm();
        }
      },
      error: (error) => {
        console.error('Error loading assessor data:', error);
      },
    });
  }

  populateForm(): void {
    if (!this.assessor) return;

    this.personalForm.patchValue({
      firstName: this.assessor.firstName,
      middleName: this.assessor.middleName,
      lastName: this.assessor.lastName,
      title: this.assessor.title,
      sex: this.assessor.sex,
      dob: this.assessor.dob,
      email: this.assessor.email,
      phone: this.assessor.phone,
      description: this.assessor.description,
      phoneTwo: this.assessor.phoneTwo,
      identificationType: this.assessor.identificationType,
      identificationId: this.assessor.identificationId,
      locationId: this.assessor.locationId,
      photo: this.assessor.photo,
    });
  }

  onLocationSelected(location: any): void {
    this.selectedLocation = location;
  }

  openPhotoUploadDialog(): void {
    this.showPhotoUploadDialog = true;
    this.selectedFile = null;
    this.selectedPhoto = null;
  }

  onPhotoDialogClose(result: any): void {
    this.showPhotoUploadDialog = false;
    if (!result) {
      this.cancelPhotoDialog();
    }
  }

  cancelPhotoDialog(): void {
    this.showPhotoUploadDialog = false;
    this.selectedFile = null;
    this.selectedPhoto = null;
  }

  handlePhotoUploaded(uploadedFiles: UploadedFile[]): void {
    if (uploadedFiles && uploadedFiles.length > 0) {
      this.selectedPhoto = uploadedFiles[0];
      console.log('selectedPhoto', this.selectedPhoto);
    } else {
      this.selectedPhoto = null;
    }
  }

  removeSelectedPhoto(): void {
    this.selectedPhoto = null;
  }

  // New methods for photo cropping workflow
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.toast.error('Please select a valid image file');
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        this.toast.error('File size must be less than 5MB');
        return;
      }

      this.selectedFile = file;
      this.imageChangedEvent = event;
    }
  }

  removeSelectedFile(): void {
    this.selectedFile = null;
    this.imageChangedEvent = null;
  }

  proceedToCropper(): void {
    if (this.selectedFile && this.imageChangedEvent) {
      this.showPhotoUploadDialog = false;
      this.showPhotoCropper = true;
    }
  }

  onPhotoCropperClose(result: boolean): void {
    this.showPhotoCropper = false;
    if (!result) {
      this.onPhotoCropperCancel();
    }
  }

  onPhotoCropperCancel(): void {
    this.showPhotoCropper = false;
    this.showPhotoUploadDialog = true; // Go back to upload dialog
  }

  onPhotoCropped(croppedData: CroppedImageData): void {
    this.showPhotoCropper = false;

    // Upload the cropped image
    this.uploadCroppedImage(croppedData);
  }

  private uploadCroppedImage(croppedData: CroppedImageData): void {
    const formData = new FormData();
    formData.append('file', croppedData.file);
    formData.append('uploadType', this.uploadType.PROFILE_PHOTO);

    this.httpService.post('uploads', formData).subscribe({
      next: (response: any) => {
        const data = response.data;

        this.selectedPhoto = {
          id: data.id,
          uuid: data.uuid,
          name: data.name,
          fileSize: data.fileSize,
          uploadType: data.uploadType,
          fileType: data.fileType,
          size: data.size || '',
          editName: data.name,
        };

        // Use the set-profile-photo API instead of direct update
        this.setProfilePhoto(data.id);
      },
      error: (error) => {
        console.error('Error uploading cropped image:', error);
        this.toast.error('Failed to upload photo');
      },
    });
  }

  private setProfilePhoto(fileUploadId: number): void {
    console.log('Setting profile photo for assessor :', this.assessor);
    if (!this.assessor?.id) {
      // If assessor data is not loaded yet, wait for it
      console.warn('Assessor data not loaded yet, waiting...');
      this.assessorService.getCurrentUserAssessorData().subscribe({
        next: (response) => {
          const data = response.data;
          this.assessor = data.assessor || data;

          if (!this.assessor?.id) {
            this.toast.error('Assessor ID not found');
            return;
          }

          // Retry setting profile photo now that we have assessor data
          this.setProfilePhotoWithAssessor(fileUploadId);
        },
        error: (error) => {
          console.error('Error loading assessor data:', error);
          this.toast.error('Failed to load assessor information');
        },
      });
      return;
    }

    this.setProfilePhotoWithAssessor(fileUploadId);
  }

  private setProfilePhotoWithAssessor(fileUploadId: number): void {
    if (!this.assessor?.id) {
      this.toast.error('Assessor ID not found');
      return;
    }

    this.assessorService
      .setProfilePhoto(this.assessor.id, fileUploadId)
      .subscribe({
        next: () => {
          if (this.assessor && this.selectedPhoto) {
            this.assessor.profilePhotoId = fileUploadId;
            this.assessor.photo = this.selectedPhoto.mediaUrl || '';

            // Update profilePhoto object with the uploaded file details
            this.assessor.profilePhoto = {
              id: this.selectedPhoto.id || 0,
              uuid: this.selectedPhoto.uuid || '',
              name: this.selectedPhoto.name,
              uploadType: this.selectedPhoto.uploadType,
              filePath: '',
              fileType: this.selectedPhoto.fileType,
              fileSize: this.selectedPhoto.fileSize,
            };
          }

          // Close all dialogs
          this.showPhotoUploadDialog = false;
          this.showPhotoCropper = false;
          this.selectedFile = null;
          this.selectedPhoto = null;
          this.imageChangedEvent = null;

          this.toast.success('Profile photo updated successfully');
          // Refresh assessor data to get updated profile photo from server
          this.loadAssessorData();
        },
        error: (error) => {
          console.error('Error setting profile photo:', error);
          this.toast.error('Failed to set profile photo');
        },
      });
  }

  savePhoto(): void {
    // This method is now handled by the cropping workflow
    // Legacy method kept for backward compatibility with the old file upload dialog
    if (this.selectedPhoto && this.assessor) {
      this.setProfilePhoto(this.selectedPhoto.id);
    }
  }

  cleanPhoto(photo: string): any {
    if (!photo) return null;
    return this.sanitizer.bypassSecurityTrustUrl(photo);
  }

  getProfilePictureSrc(): string | null {
    // Priority 1: Use profilePhoto object if available (new API structure)
    if (this.assessor?.profilePhoto?.uuid) {
      return `/api/v1/uploads/${this.assessor.profilePhoto.uuid}/view`;
    }

    // Priority 2: Use photo field if available (legacy/fallback)
    if (this.assessor?.photo) {
      return this.assessor.photo;
    }

    return null;
  }

  goBack(): void {
    this.router.navigate(['/assessor/onboarding']);
  }

  saveDraft(): void {
    const formData = this.personalForm.value;
    // Save as draft logic
    this.toast.success('Draft saved successfully');
  }

  saveAndContinue(): void {
    if (this.personalForm.valid) {
      const formData = this.personalForm.value;

      const payload = {
        ...formData,
        profilePhoto:
          this.assessor != null ? this.assessor?.profilePhoto : null,
      };

      this.assessorService
        .update(this.assessor?.uuid || '', payload)
        .subscribe({
          next: () => {
            this.toast.success('Personal information saved successfully');
            this.router.navigate(['/assessor/onboarding/education']);
          },
          error: (error) => {
            console.error('Error saving personal info:', error);
            this.toast.error('Failed to save personal information');
          },
        });
    } else {
      this.toast.error('Please fill in all required fields');
    }
  }
}
