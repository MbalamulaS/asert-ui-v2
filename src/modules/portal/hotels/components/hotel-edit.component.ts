import {
  Component,
  Input,
  OnInit,
  Output,
  EventEmitter,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { Hotel } from '../types';
import { HotelService } from '../services/hotel.service';
import { lastValueFrom } from 'rxjs';
import { HotelFormComponent } from '../forms/hotel-form.component';
import { ConfirmDialogComponent } from 'components/confirm/confirm.dialog';

@Component({
  selector: 'app-hotel-edit',
  templateUrl: './hotel-details.component.html',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatIconModule,
    ConfirmDialogComponent,
    HotelFormComponent,
  ],
})
export class HotelComponent implements OnInit {
  @Input() hotel: Hotel;
  @Output() close = new EventEmitter<void>();
  @Output() edit = new EventEmitter<Hotel>();

  hotelService = inject(HotelService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  isConfirmDialogOpen = false;
  isEditMode = false;
  isLoading = true;
  hotelUuid: string;

  activeTab = 'rooms';

  constructor() {}

  ngOnInit(): void {
    // Check if we're in a route-based context or component input context
    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.hotelUuid = params['id'];
        this.loadHotelData();
      } else if (this.hotel) {
        this.isLoading = false;
      }
    });

    // Check for edit mode from query parameters
    this.route.queryParams.subscribe((queryParams) => {
      this.isEditMode = queryParams['mode'] === 'edit';
    });

    // console.log('init hotel', this.hotel);
  }

  loadHotelData(): void {
    if (this.hotelUuid) {
      this.isLoading = true;
      this.hotelService.findByUuid(this.hotelUuid).subscribe({
        next: (hotel) => {
          this.hotel = hotel;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading hotel:', error);
          this.isLoading = false;
          // Navigate back to listings on error
          this.router.navigate(['/manage-listings']);
        },
      });
    }
  }

  closeDialog(): void {
    // If we're in route context, navigate back
    if (this.hotelUuid) {
      this.router.navigate(['/manage-listings']);
    } else {
      this.close.emit();
    }
  }

  editHotel(): void {
    if (this.hotelUuid) {
      // Toggle edit mode when in route context
      this.isEditMode = !this.isEditMode;

      // If entering edit mode, populate the form
      if (this.isEditMode && this.hotel) {
        this.hotelService.populateForm(this.hotel);
      }

      // Update URL to reflect edit mode
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: this.isEditMode ? { mode: 'edit' } : {},
        queryParamsHandling: 'merge',
      });
    } else {
      this.edit.emit(this.hotel);
    }
  }

  onFormSubmitted(hotel: Hotel): void {
    // Exit edit mode and reload data
    this.isEditMode = false;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
      queryParamsHandling: 'merge',
    });
    this.loadHotelData();
  }

  onFormCancelled(): void {
    this.isEditMode = false;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
      queryParamsHandling: 'merge',
    });
  }

  getImageDataUrl(mediaUrl: string, mediaFileType?: string): string {
    if (!mediaUrl) return '';

    // Default to jpeg if no type specified
    const mimeType = mediaFileType || 'image/jpeg';
    return `data:${mimeType};base64,${mediaUrl}`;
  }

  getFacilityIcon(facilityType: string): string {
    // Return appropriate icon based on facility type
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
}
