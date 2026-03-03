import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { Hotel } from '../types';
import { ConfirmDialogComponent } from 'components/confirm/confirm.dialog';
import { HotelService } from '../services/hotel.service';
import { lastValueFrom } from 'rxjs';
import { AssessmentRequestFormComponent } from 'modules/assessment/assessment-request-form.component';
import { SelfAssessmentService } from 'modules/self-assessment/services/self-assessment.service';
import { FormService } from 'modules/forms/services/form.service';
import { AuthService } from 'services/auth.service';

interface MediaProp {
  mediaUrl: string;
  description: string;
}
@Component({
  selector: 'app-preview-listing',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatIconModule,
    ConfirmDialogComponent,
    AssessmentRequestFormComponent,
  ],
  template: `
    <div class="p-6">
      <!-- Loading State -->
      <div *ngIf="isLoading" class="flex justify-center items-center h-64">
        <div class="text-center">
          <div
            class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"
          ></div>
          <p class="mt-4 text-gray-600">Loading listing details...</p>
        </div>
      </div>

      <!-- Preview Mode -->
      <div *ngIf="!isLoading && hotel" class="flex flex-col space-y-6">
        <!-- Header with Hotel Name and Actions -->
        <div class="flex justify-between items-center">
          <div class="flex items-center space-x-4">
            <button
              class="px-3 py-1.5 bg-gray-500 text-white rounded-md hover:bg-gray-600 flex items-center"
              (click)="goBack()"
            >
              <span class="material-icons text-sm mr-1">arrow_back</span>
              Back to Listings
            </button>
            <h2 class="text-2xl font-bold text-gray-800">{{ hotel.name }}</h2>
          </div>
          @if (true) {
            <div class="flex space-x-2">
              <button
                class="px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
                (click)="editListing()"
              >
                <span class="material-icons text-sm mr-1">edit</span>
                Edit
              </button>
              @if (canSelfAssess()) {
                <button
                  class="px-3 py-1.5 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center"
                  (click)="startSelfAssessment()"
                >
                  <span class="material-icons text-sm mr-1">assignment</span>
                  Self-Assessment
                </button>
              }
              <button
                class="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                (click)="openAssessmentForm()"
              >
                <span class="material-icons text-sm mr-1">grading</span>
                Request Assessment
              </button>
            </div>
          } @else {
            <div class="flex space-x-2">
              @if (canSelfAssess()) {
                <button
                  class="px-3 py-1.5 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center"
                  (click)="startSelfAssessment()"
                >
                  <span class="material-icons text-sm mr-1">assignment</span>
                  Self-Assessment
                </button>
              }
              <button
                class="px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
              >
                <span class="material-icons text-sm mr-1">edit</span>
                AWAITING_GRADING
              </button>
            </div>
          }
        </div>

        <!-- Main Content with Image and Key Info -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Main Image - Fixed height and positioning -->
          <div
            class="lg:col-span-2 h-full bg-gray-100 rounded-lg overflow-hidden shadow-sm relative"
          >
            <div class="w-full h-full absolute">
              <img
                *ngIf="selectedImage?.mediaUrl"
                [src]="selectedImage.mediaUrl"
                [alt]="selectedImage?.description"
                class="w-full h-full object-fill"
              />
              <div
                *ngIf="!hotel.defaultImage?.mediaUrl"
                class="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-400"
              >
                <span class="material-icons text-7xl">hotel</span>
                <p class="mt-2 text-gray-500">No image available</p>
              </div>
            </div>

            <!-- Status Badge - Positioned properly -->
            <div
              class="absolute top-4 right-4 px-3 py-1.5 rounded-full text-sm font-medium z-10"
              [ngClass]="{
                'bg-yellow-100 text-yellow-800':
                  hotel.status === 'PENDING' ||
                  hotel.status === 'AWAITING_APPLICATION_FEES',
                'bg-green-100 text-green-800': hotel.status === 'APPROVED',
                'bg-red-100 text-red-800': hotel.status === 'REJECTED',
              }"
            >
              {{ getStatusDisplayName(hotel.status) }}
            </div>
          </div>

          <!-- Key Information Card -->
          <div class="bg-white rounded-lg shadow-sm p-5 h-fit">
            <h3
              class="font-semibold text-gray-800 pb-3 border-b border-gray-100"
            >
              Key Information
            </h3>

            <div class="mt-4 space-y-4">
              <div class="flex items-center">
                <span class="material-icons text-gray-400 mr-3">apartment</span>
                <div>
                  <p class="text-sm text-gray-500">Property Type</p>
                  <p class="font-medium">
                    {{ hotel.propertyTypeName || hotel.propertyType }}
                  </p>
                </div>
              </div>

              <div class="flex items-center">
                <span class="material-icons text-gray-400 mr-3">email</span>
                <div>
                  <p class="text-sm text-gray-500">Email</p>
                  <p class="font-medium">{{ hotel.email }}</p>
                </div>
              </div>

              <div class="flex items-center">
                <span class="material-icons text-gray-400 mr-3">phone</span>
                <div>
                  <p class="text-sm text-gray-500">Phone</p>
                  <p class="font-medium">{{ hotel.phone }}</p>
                </div>
              </div>

              <div *ngIf="hotel.website" class="flex items-center">
                <span class="material-icons text-gray-400 mr-3">language</span>
                <div>
                  <p class="text-sm text-gray-500">Website</p>
                  <a
                    [href]="hotel.website"
                    target="_blank"
                    class="font-medium text-blue-600 hover:underline"
                  >
                    {{ hotel.website }}
                  </a>
                </div>
              </div>

              <div class="flex items-center">
                <span class="material-icons text-gray-400 mr-3"
                  >location_on</span
                >
                <div>
                  <p class="text-sm text-gray-500">Location</p>
                  <p class="font-medium">{{ hotel.locationName || 'N/A' }}</p>
                  <p
                    *ngIf="hotel.latitude && hotel.longitude"
                    class="text-xs text-gray-500 mt-1"
                  >
                    {{ hotel.latitude }}, {{ hotel.longitude }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Room Types and Facilities Tabs -->
        <div class="bg-white rounded-lg shadow-sm overflow-hidden">
          <div class="border-b border-gray-200">
            <nav class="flex -mb-px">
              <button
                class="py-4 px-6 border-b-2 font-medium text-sm"
                [class.border-blue-500]="activeTab === 'rooms'"
                [class.text-blue-600]="activeTab === 'rooms'"
                [class.border-transparent]="activeTab !== 'rooms'"
                [class.text-gray-500]="activeTab !== 'rooms'"
                [class.hover:text-gray-700]="activeTab !== 'rooms'"
                [class.hover:border-gray-300]="activeTab !== 'rooms'"
                (click)="activeTab = 'rooms'"
              >
                Room Types ({{ hotel.roomTypes?.length || 0 }})
              </button>
              <button
                class="py-4 px-6 border-b-2 font-medium text-sm"
                [class.border-blue-500]="activeTab === 'facilities'"
                [class.text-blue-600]="activeTab === 'facilities'"
                [class.border-transparent]="activeTab !== 'facilities'"
                [class.text-gray-500]="activeTab !== 'facilities'"
                [class.hover:text-gray-700]="activeTab !== 'facilities'"
                [class.hover:border-gray-300]="activeTab !== 'facilities'"
                (click)="activeTab = 'facilities'"
              >
                Facilities ({{ hotel.facilities?.length || 0 }})
              </button>
              <button
                class="py-4 px-6 border-b-2 font-medium text-sm"
                [class.border-blue-500]="activeTab === 'images'"
                [class.text-blue-600]="activeTab === 'images'"
                [class.border-transparent]="activeTab !== 'images'"
                [class.text-gray-500]="activeTab !== 'images'"
                [class.hover:text-gray-700]="activeTab !== 'images'"
                [class.hover:border-gray-300]="activeTab !== 'images'"
                (click)="activeTab = 'images'"
              >
                Images ({{ hotel.media?.length || 0 }})
              </button>
            </nav>
          </div>

          <!-- Room Types Tab Content -->
          <div *ngIf="activeTab === 'rooms'" class="p-6">
            <div
              *ngIf="!hotel.roomTypes || hotel.roomTypes.length === 0"
              class="text-gray-500 text-center p-8 border border-dashed border-gray-300 rounded-md"
            >
              <span class="material-icons text-gray-400 text-4xl mb-2"
                >hotel</span
              >
              <p>No room types have been added yet.</p>
            </div>

            <div
              *ngIf="hotel.roomTypes && hotel.roomTypes.length > 0"
              class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              <div
                *ngFor="let room of hotel.roomTypes"
                class="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
              >
                <div class="flex justify-between items-start">
                  <h4 class="text-lg font-medium text-gray-800">
                    {{ room.name }}
                  </h4>
                  <span
                    class="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full"
                  >
                    {{ room.quantity }} units
                  </span>
                </div>

                <div class="mt-4 space-y-2 text-sm">
                  <div *ngIf="room.size" class="flex items-center">
                    <span class="material-icons text-gray-400 text-sm mr-2"
                      >square_foot</span
                    >
                    <span>{{ room.size }} m²</span>
                  </div>

                  <div *ngIf="room.maxOccupancy" class="flex items-center">
                    <span class="material-icons text-gray-400 text-sm mr-2"
                      >person</span
                    >
                    <span>{{ room.maxOccupancy }} person(s)</span>
                  </div>

                  <div *ngIf="room.bedType" class="flex items-center">
                    <span class="material-icons text-gray-400 text-sm mr-2"
                      >bed</span
                    >
                    <span>{{ room.bedType }}</span>
                  </div>
                </div>

                <div
                  *ngIf="room.description"
                  class="mt-3 pt-3 border-t border-gray-100"
                >
                  <p class="text-sm text-gray-600">{{ room.description }}</p>
                </div>

                <div
                  *ngIf="room.amenities && room.amenities.length > 0"
                  class="mt-4 pt-3 border-t border-gray-100"
                >
                  <p class="text-xs text-gray-500 mb-2">Amenities:</p>
                  <div class="flex flex-wrap gap-2">
                    <span
                      *ngFor="let amenity of room.amenities"
                      class="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full"
                    >
                      <span class="material-icons text-xs mr-1">check</span>
                      {{ amenity }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Facilities Tab Content -->
          <div *ngIf="activeTab === 'facilities'" class="p-6">
            <div
              *ngIf="!hotel.facilities || hotel.facilities.length === 0"
              class="text-gray-500 text-center p-8 border border-dashed border-gray-300 rounded-md"
            >
              <span class="material-icons text-gray-400 text-4xl mb-2"
                >fitness_center</span
              >
              <p>No facilities have been added yet.</p>
            </div>

            <div
              *ngIf="hotel.facilities && hotel.facilities.length > 0"
              class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              <div
                *ngFor="let facility of hotel.facilities"
                class="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
              >
                <div class="flex items-center mb-3">
                  <span class="material-icons text-gray-500 mr-2">
                    {{ getFacilityIcon(facility.facilityType) }}
                  </span>
                  <div>
                    <h4 class="font-medium text-gray-800">
                      {{ facility.name }}
                    </h4>
                    <p class="text-xs text-purple-600">
                      {{ facility.facilityTypeName || facility.facilityType }}
                    </p>
                  </div>
                </div>

                <div class="mt-2 space-y-2 text-sm">
                  <div *ngIf="facility.capacity" class="flex items-center">
                    <span class="material-icons text-gray-400 text-sm mr-2"
                      >group</span
                    >
                    <span>Capacity: {{ facility.capacity }}</span>
                  </div>

                  <div *ngIf="facility.openingHours" class="flex items-center">
                    <span class="material-icons text-gray-400 text-sm mr-2"
                      >schedule</span
                    >
                    <span>{{ facility.openingHours }}</span>
                  </div>
                </div>

                <div
                  *ngIf="facility.description"
                  class="mt-3 pt-3 border-t border-gray-100"
                >
                  <p class="text-sm text-gray-600">
                    {{ facility.description }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Images Tab Content -->
          <div *ngIf="activeTab === 'images'" class="p-6">
            <div
              *ngIf="!hotel.media || hotel.media.length === 0"
              class="text-gray-500 text-center p-8 border border-dashed border-gray-300 rounded-md"
            >
              <span class="material-icons text-gray-400 text-4xl mb-2"
                >image</span
              >
              <p>No images have been added yet.</p>
            </div>

            <div
              *ngIf="hotel.media && hotel.media.length > 0"
              class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
            >
              <div
                *ngFor="let media of hotel.media"
                class="group relative aspect-square rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer border-2 {{
                  isActive(media.mediaUrl)
                    ? 'border-blue-500'
                    : 'border-transparent hover:border-gray-300'
                }}"
              >
                <img
                  [src]="media.mediaUrl"
                  [alt]="media.description"
                  class="w-full h-full object-cover"
                  (click)="changeImage(media)"
                />

                <div
                  class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3"
                >
                  <p class="text-white text-xs truncate">
                    {{ media.description }}
                  </p>
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
        </div>

        <!-- Metadata Section -->
        <div
          class="flex flex-col md:flex-row justify-between text-xs text-gray-500 pt-2 border-t border-gray-200"
        >
          <div>Created: {{ hotel.createdAt | date: 'medium' }}</div>
          <div *ngIf="hotel.updatedAt">
            Last Updated: {{ hotel.updatedAt | date: 'medium' }}
          </div>
        </div>
      </div>

      <!-- Assessment Form Modal -->
      <div
        *ngIf="isAssessmentFormOpen"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      >
        <div
          class="bg-white rounded-lg max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        >
          <div class="flex justify-between items-center p-6 border-b">
            <h2 class="text-xl font-semibold">
              Assessment Request - {{ hotel.name }}
            </h2>
            <button
              (click)="closeAssessmentForm()"
              class="text-gray-400 hover:text-gray-600"
            >
              <span class="material-icons">close</span>
            </button>
          </div>
          <div class="flex-1 overflow-auto">
            <app-assessment-request-form
              [hotelData]="hotel"
              (formSubmitted)="onAssessmentSubmitted($event)"
              (formCancelled)="closeAssessmentForm()"
            ></app-assessment-request-form>
          </div>
        </div>
      </div>

      <app-confirm-dialog
        [open]="isConfirmDialogOpen"
        [title]="'Request Assessment'"
        [confirmMessage]="'YES'"
        [message]="'Are you sure you want to request for assessment?'"
        (onClose)="closeConfirmDialog($event)"
        (onConfirm)="handleConfirm()"
      />
    </div>
  `,
})
export class PreviewListingComponent implements OnInit {
  hotelService = inject(HotelService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private selfAssessmentService = inject(SelfAssessmentService);
  private formService = inject(FormService);
  private authService = inject(AuthService);

  hotel: Hotel;
  isConfirmDialogOpen = false;
  isAssessmentFormOpen = false;
  isLoading = true;
  hotelUuid: string;
  activeTab = 'rooms';
  selectedImage: any;

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      console.log('Preview listing route params:', params);
      if (params['id']) {
        this.hotelUuid = params['id'];
        console.log('Hotel UUID from route:', this.hotelUuid);
        this.loadHotelData();
      } else {
        console.error('No hotel ID found in route params');
      }
    });
  }

  loadHotelData(): void {
    if (this.hotelUuid) {
      this.isLoading = true;
      this.hotelService.findByUuid(this.hotelUuid).subscribe({
        next: (hotel) => {
          this.hotel = hotel;
          this.isLoading = false;
          this.selectedImage = hotel.defaultImage;
        },
        error: (error) => {
          console.error('Error loading hotel:', error);
          this.isLoading = false;
          this.router.navigate(['/manage-listings']);
        },
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/manage-listings']);
  }

  canSelfAssess(): boolean {
    if (!this.hotel) return false;

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !currentUser.user) return false;

    // Check if current user ID matches hotel's userId
    return currentUser.user.id === this.hotel.userId;
  }

  editListing(): void {
    this.router.navigate(['/edit-listing', this.hotelUuid]);
  }

  getFacilityIcon(facilityType: string): string {
    switch (facilityType) {
      case 'RESTAURANT':
        return 'restaurant';
      case 'BAR':
        return 'local_bar';
      case 'POOL':
        return 'pool';
      case 'SPA':
        return 'spa';
      case 'GYM':
        return 'fitness_center';
      case 'PARKING':
        return 'local_parking';
      case 'CONFERENCE_ROOM':
        return 'meeting_room';
      case 'BUSINESS_CENTER':
        return 'business_center';
      case 'WIFI':
        return 'wifi';
      case 'AIRPORT_SHUTTLE':
        return 'airport_shuttle';
      case 'ROOM_SERVICE':
        return 'room_service';
      case 'LAUNDRY_SERVICE':
        return 'local_laundry_service';
      case 'PET_FRIENDLY':
        return 'pets';
      case 'ACCESSIBLE_ROOMS':
        return 'accessible';
      case 'KIDS_PLAY_AREA':
        return 'child_care';
      case 'TENNIS_COURT':
        return 'sports_tennis';
      case 'GOLF_COURSE':
        return 'golf_course';
      case 'BEACH_ACCESS':
        return 'beach_access';
      case 'SAUNA':
        return 'hot_tub';
      case 'HAIR_SALON':
        return 'content_cut';
      case 'LIBRARY':
        return 'local_library';
      default:
        return 'star';
    }
  }

  getStatusDisplayName(status: string): string {
    switch (status) {
      case 'AWAITING_APPLICATION_FEES':
        return 'Awaiting Fees';
      case 'DRAFT':
        return 'Pending';
      case 'APPROVED':
        return 'Approved';
      case 'REJECTED':
        return 'Rejected';
      default:
        return status;
    }
  }

  startSelfAssessment(): void {
    console.log('the hotel', this.hotel);

    if (!this.hotel || !this.hotel.formUuid) {
      console.error('Hotel not loaded');
      alert(
        'Unable to start self-assessment. Hotel information is incomplete.',
      );
      return;
    }

    // Navigate to self-assessment - same as assessor flow
    // The assessment-form component handles everything: loading form, hotel, and drafts
    this.router.navigate(
      [`/preview-listing/${this.hotel.formUuid}/self-assessment`],
      {
        queryParams: { uuid: this.hotel.uuid, mode: 'self-assessment' },
      },
    );
  }

  openAssessmentForm() {
    this.isAssessmentFormOpen = true;
  }

  closeAssessmentForm() {
    this.isAssessmentFormOpen = false;
  }

  onAssessmentSubmitted(assessmentData: any) {
    console.log('Assessment submitted:', assessmentData);
    this.closeAssessmentForm();
    // Show success message or navigate
  }

  openConfirmDialog() {
    this.isConfirmDialogOpen = true;
  }

  closeConfirmDialog(event: any) {
    this.isConfirmDialogOpen = false;
  }

  async handleConfirm() {
    const response = await lastValueFrom(
      this.hotelService.requestAssessment(this.hotel.uuid),
    );
    this.isConfirmDialogOpen = false;
    if (response.status === 200) {
      this.isConfirmDialogOpen = false;
    }
  }

  changeImage(media: MediaProp) {
    this.selectedImage = media;
  }

  isActive(mediaUrl: string): boolean {
    return this.selectedImage.mediaUrl === mediaUrl;
  }
}
