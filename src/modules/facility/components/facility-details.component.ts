import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { Hotel } from 'modules/portal/hotels/types';
import { HotelService } from '../services/hotel.service';
import { lastValueFrom } from 'rxjs';
import { CantPipe } from 'app/pipes/cant.pipe';
import { DialogComponent } from 'components/dialog/dialog.component';
import { HotelAssessorFormComponent } from './hotel-assessor-form.component';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { ImageComponent } from 'components/image/image.component';

@Component({
  selector: 'app-hotel-details',
  templateUrl: './facility-details.component.html',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatIconModule,
    CantPipe,
    DialogComponent,
    HotelAssessorFormComponent,
    ImageComponent,
  ],
})
export class HotelDetailsComponent implements OnInit {
  hotel: Hotel;
  @Output() close = new EventEmitter<void>();
  @Output() edit = new EventEmitter<Hotel>();
  hotelUuid: string = '';

  isDialogOpen = false;

  activeTab = 'rooms';

  constructor(
    public hotelService: HotelService,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private router: Router,
  ) {}

  ngOnInit(): void {
    // use the id in the params to get the hotel detals
    this.route.queryParamMap.subscribe((params) => {
      this.hotelUuid = params.get('uuid');
      this.fetchHotelByUuid(this.hotelUuid);
    });
  }

  async fetchHotelByUuid(uuid: string) {
    if (uuid) {
      try {
        const response = await lastValueFrom(
          this.hotelService.getHotelByUuid(uuid),
        );
        this.hotel = response.data;
      } catch (error) {
        console.error('Error fetching role or permissions:', error);
      }
    }
  }

  closeDialog(): void {
    this.close.emit();
  }

  assessHotel(): void {
    this.router.navigate(
      [`/establishment-details/assessment/${this.hotel.formUuid}`],
      {
        queryParams: { uuid: this.hotelUuid },
      },
    );
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

  openDialog() {
    const assessors = this.hotel.assessors.map((a) => ({
      ...a,
      name: `${a.firstName} ${a.lastName}`,
    }));

    this.hotelService.populateUserForm(assessors);
    this.isDialogOpen = true;
  }

  handleClose($event) {
    this.isDialogOpen = false;
  }

  async saveData(event: any) {
    const { assessors } = event;

    const assessorIds = assessors.map((a) => a.id);

    const response = lastValueFrom(
      this.hotelService.assignAssessors(this.hotel.uuid, {
        assessorIds,
      }),
    );

    console.log(response);

    this.isDialogOpen = false;

    console.log('event', event);
  }

  cleanPhoto(photo: string): any {
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      'data:image/jpg;base64,' + photo,
    );
  }

  // Helper methods for assessors
  getAssessorFullName(assessor: any): string {
    const parts = [assessor.firstName, assessor.middleName, assessor.lastName]
      .filter((part) => part && part.toLowerCase() !== 'null')
      .map(
        (name) => name.charAt(0).toUpperCase() + name.slice(1).toLowerCase(),
      );
    return parts.join(' ');
  }

  getAssessorInitials(assessor: any): string {
    const firstName = assessor.firstName || '';
    const lastName = assessor.lastName || '';
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  }

  getAssessorPhoto(photo: string): any {
    if (photo && !photo.startsWith('http')) {
      // Assume it's a base64 or file name that needs base64 prefix
      return this.sanitizer.bypassSecurityTrustResourceUrl(
        'data:image/jpg;base64,' + photo,
      );
    }
    return photo; // Already a full URL
  }
}
