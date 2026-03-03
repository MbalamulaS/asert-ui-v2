import { Component, OnInit } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import {
  heroCog6Tooth,
  heroMagnifyingGlass,
  heroPencilSquare,
  heroTrash,
} from '@ng-icons/heroicons/outline';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AssessorService } from 'modules/assessment/assessor.service';
import { AssessorPersonalInfoFormComponent } from 'modules/my-profile/personal-info/assessor-personal-info-form.component';
import { DialogComponent } from 'components/dialog/dialog.component';
import { ActionButtonComponent } from 'components/action-button/action-button.component';
import { ContainerComponent } from 'components/container/container.component';
import { HeaderComponent } from 'components/header/header.component';
import { WrapperComponent } from 'components/wrapper/wrapper.component';
import { DatePipe, NgClass, NgIf } from '@angular/common';
import { Assessor } from 'modules/assessment/assessment';
import { AssessorProgressComponent } from 'modules/my-profile/assessor-progress.component';
import { AssessorPhotoUploadComponent } from 'modules/my-profile/personal-info/assessor-photo-upload.component';
import { ProfilePictureComponent } from 'components/profile-picture/profile-picture.component';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-personal-information',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    AssessorPersonalInfoFormComponent,
    DialogComponent,
    ActionButtonComponent,
    ContainerComponent,
    HeaderComponent,
    WrapperComponent,
    NgIf,
    NgClass,
    DatePipe,
    AssessorProgressComponent,
    AssessorPhotoUploadComponent,
    ProfilePictureComponent,
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
    <container>
      <app-header title="Personal Information" />

      <app-wrapper>
        <app-assessor-progress />
      </app-wrapper>

      <app-wrapper>
        <div class="w-full flex justify-end">
          <action-button
            *ngIf="assessor"
            label="{{ assessor ? 'Edit Info' : 'Initialize Profile' }}"
            icon="{{ assessor ? 'edit' : 'add' }}"
            class="w-full md:w-auto"
            (action)="openFormDialog()"
          />
        </div>
      </app-wrapper>

      <ng-container *ngIf="assessor; else noData">
        <div class="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div class="flex flex-col md:flex-row gap-6 items-start">
            <!-- Info Section -->
            <div class="w-full md:w-2/3">
              <div
                class="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-sm text-gray-700"
              >
                <div>
                  <span class="font-medium text-gray-500">Full Name:</span>
                  <div>
                    {{ assessor.title }} {{ assessor.firstName }}
                    {{ assessor.middleName }} {{ assessor.lastName }}
                  </div>
                </div>
                <div>
                  <span class="font-medium text-gray-500">Email:</span>
                  <div>{{ assessor.email }}</div>
                </div>
                <div>
                  <span class="font-medium text-gray-500">Phone:</span>
                  <div>{{ assessor.phone }}</div>
                </div>
                <div>
                  <span class="font-medium text-gray-500">Gender:</span>
                  <div>{{ assessor.sex }}</div>
                </div>
                <div>
                  <span class="font-medium text-gray-500">Date of Birth:</span>
                  <div>{{ assessor.dob | date }}</div>
                </div>
                <div>
                  <span class="font-medium text-gray-500"
                    >Current Location:</span
                  >
                  <div>{{ assessor.locationName }}</div>
                </div>
                <div>
                  <span class="font-medium text-gray-500">Status:</span>
                  <span
                    class="inline-block px-3 py-1 text-xs rounded-full font-semibold"
                    [ngClass]="{
                      'bg-green-100 text-green-800':
                        assessor.status.toString() === 'Approved',
                      'bg-yellow-100 text-yellow-800':
                        assessor.status.toString() === 'Pending',
                      'bg-red-100 text-red-800':
                        assessor.status.toString() === 'Rejected',
                    }"
                  >
                    {{ assessor.status }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Photo Section -->
            <div
              class="w-full md:w-1/3 flex flex-col items-center md:items-end text-center space-y-3"
            >
              <app-profile-picture
                [src]="getProfilePictureSrc()"
                [isBase64]="!!assessor.photo && !assessor.profilePhoto?.uuid"
                alt="Assessor Profile Picture"
                size="10rem"
                [clickable]="true"
                clickIcon="camera_alt"
                placeholderText="No Photo"
                shadowSize="md"
                (click)="openPhotoUploadFormDialog()"
              ></app-profile-picture>

              <!-- Upload Button -->
              <div
                class="text-sm text-blue-600 hover:underline cursor-pointer mr-8"
              >
                <label
                  for="photoUpload"
                  class="cursor-pointer"
                  (click)="openPhotoUploadFormDialog()"
                  >Upload Photo</label
                >
              </div>
            </div>
          </div>
        </div>
      </ng-container>

      <!-- Fallback -->
      <ng-template #noData>
        <div class="text-center text-gray-500 mt-10">
          <p class="text-sm">No personal information found.</p>
          <p class="mt-2 text-sm">Click "Initialize Profile" to get started.</p>
          <div class="mt-4 flex justify-center">
            <action-button
              label="Initialize Profile"
              icon="add"
              class="w-full md:w-auto"
              (action)="openFormDialog()"
            />
          </div>
        </div>
      </ng-template>

      <!-- Dialog -->
      <app-dialog
        [open]="isOpen"
        (onClose)="handleClose()"
        width="740px"
        title="Personal Info"
      >
        <ng-template>
          <app-assessor-personal-info-form (onSubmit)="saveData($event)" />
        </ng-template>
      </app-dialog>

      <app-dialog
        [open]="photoUploadOpen"
        (onClose)="handleClosePhotoUpload()"
        width="740px"
        title="Photo Upload Form"
      >
        <ng-template>
          <app-assessor-photo-upload (onSubmit)="uploadPhoto($event)" />
        </ng-template>
      </app-dialog>
    </container>
  `,
})
export class AssessorPersonalInformationComponent implements OnInit {
  assessor: Assessor | undefined = undefined;
  isOpen = false;
  photoUploadOpen = false;

  constructor(
    private assessorService: AssessorService,
    private sanitizer: DomSanitizer,
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.assessorService.getCurrentUserAssessorData().subscribe({
      next: (response) => {
        this.assessor = response.data;
      },
    });
  }

  openFormDialog(): void {
    this.isOpen = true;
  }

  openPhotoUploadFormDialog(): void {
    this.photoUploadOpen = true;
  }

  handleClose(): void {
    this.isOpen = false;
    this.assessorService.clearPersonalInfoForm();
    this.ngOnInit();
  }

  handleClosePhotoUpload(): void {
    this.photoUploadOpen = false;
    this.ngOnInit();
  }

  uploadPhoto(data: {fileUploadId: number}): void {
    this.assessorService
      .setProfilePhoto(this.assessor.id, data.fileUploadId)
      .subscribe({
        next: (response) => {
          this.photoUploadOpen = false;
          this.loadData();
        },
        error: (error) => {},
      });
  }

  saveData(data: any): void {
    if (data.uuid) {
      this.assessorService.update(data.uuid, data).subscribe({
        next: (response) => {
          this.isOpen = false;
          this.loadData();
        },
        error: (error) => {},
      });
    } else {
      this.assessorService.create(data).subscribe({
        next: (response) => {
          this.isOpen = false;
          this.loadData();
        },
        error: (error) => {},
      });
    }
  }

  cleanPhoto(photo: string): any {
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      'data:image/jpg;base64,' + photo,
    );
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
}
