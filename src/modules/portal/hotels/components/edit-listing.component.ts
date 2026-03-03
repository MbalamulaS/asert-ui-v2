import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Hotel } from '../types';
import { HotelService } from '../services/hotel.service';
import { HotelFormComponent } from '../forms/hotel-form.component';

@Component({
  selector: 'app-edit-listing',
  standalone: true,
  imports: [CommonModule, HotelFormComponent],
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

      <!-- Edit Mode -->
      <div *ngIf="!isLoading && hotel">
        <div class="flex justify-between items-center mb-6">
          <div class="flex items-center space-x-4">
            <button
              class="px-3 py-1.5 bg-gray-500 text-white rounded-md hover:bg-gray-600 flex items-center"
              (click)="goBack()"
            >
              <span class="material-icons text-sm mr-1">arrow_back</span>
              Back to Listing
            </button>
            <h2 class="text-2xl font-bold text-gray-800">
              Edit {{ hotel.name }}
            </h2>
          </div>
          <button
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
            (click)="previewListing()"
          >
            <span class="material-icons text-sm mr-1">visibility</span>
            Preview
          </button>
        </div>

        <app-hotel-form
          [editMode]="true"
          (formSubmitted)="onFormSubmitted($event)"
          (cancelClicked)="onFormCancelled()"
        />
      </div>
    </div>
  `,
})
export class EditListingComponent implements OnInit {
  hotelService = inject(HotelService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  hotel: Hotel;
  isLoading = true;
  hotelUuid: string;

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      console.log('Edit listing route params:', params);
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
          // Populate the form with hotel data
          this.hotelService.populateForm(hotel);
          this.isLoading = false;
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

  previewListing(): void {
    this.router.navigate(['/preview-listing', this.hotelUuid]);
  }

  onFormSubmitted(hotel: Hotel): void {
    // Navigate back to listings after successful update
    this.router.navigate(['/manage-listings']);
  }

  onFormCancelled(): void {
    // Navigate back to listings on cancel
    this.router.navigate(['/manage-listings']);
  }
}
