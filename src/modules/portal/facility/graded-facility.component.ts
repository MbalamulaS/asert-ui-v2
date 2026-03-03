import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { RouterLink, Router } from '@angular/router';
import { PortalService } from 'layouts/portal-layout/services/portal.service';
import { GradedFacilityService } from './graded-facility.service';
import { Hotel } from '../hotels/types';
import { lastValueFrom } from 'rxjs';
import { StarRating } from '../../star-rating/star-rating';
import { DEFAULT_SEARCH_PARAMS } from 'utils/helpers';
import { FetcherComponent } from 'components/fetcher/fetcher.component';
import { AutocompleteComponent } from 'components/autocomplete/autocomplete.component';
import { AutocompleteAsyncComponent } from 'components/autocomplete/autocomplete-async.component';
import { SelectComponent } from 'components/select/select.component';

// Interface for filter options
interface FilterOptions {
  types: string[];
  locations: string[];
  ratings: number[];
  amenities: string[];
}

@Component({
  selector: 'app-graded-facilities',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatFormFieldModule,
    MatCardModule,
    MatChipsModule,
    MatPaginatorModule,
    ReactiveFormsModule,
    FetcherComponent,
    AutocompleteAsyncComponent,
    SelectComponent,
  ],
  template: `
    <div class="py-8 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <!-- Header Section -->
        <div class="text-center mb-12 mt-16 py-8 rounded-lg shadow-sm">
          <h1 class="text-4xl font-bold text-gray-900 mb-4">
            Graded Accommodation Facilities
          </h1>
          <div
            class="w-32 h-1 bg-blue-600 mx-auto mb-8 shadow-sm rounded-full"
          ></div>
          <!-- Improved centered paragraph -->
          <div class="max-w-3xl mx-auto">
            <p class="text-gray-600 text-center text-xl leading-relaxed">
              Discover Tanzania's top-rated hotels, resorts, lodges and more,
              all officially graded by AserT's quality standards.
            </p>
          </div>
        </div>
        <!-- Search Bar -->
        <div class="bg-white rounded-lg shadow-md p-6 mb-8">
          <form [formGroup]="searchForm" class="space-y-4">
            <!-- Search Input -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div class="col-span-1 md:col-span-2 lg:col-span-1">
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Search facilities...</mat-label>
                  <input
                    matInput
                    formControlName="searchQuery"
                    placeholder="Enter facility name or location"
                  />
                  <mat-icon matSuffix>search</mat-icon>
                </mat-form-field>
              </div>

              <!-- Type Filter -->
              <div>
                <app-fetcher
                  api="hotels/get-facility-types"
                  loadingLabel="Fetching Facility Types.."
                >
                  <ng-template let-response>
                    <div *ngIf="response; else noData">
                      <app-select
                        label="Select Facility Type"
                        formControlName="type"
                        name="type"
                        [options]="mapFacilityTypes(response.data)"
                      />
                    </div>
                    <ng-template #noData>No data available</ng-template>
                  </ng-template>
                </app-fetcher>
              </div>

              <!-- Location Filter -->
              <div>
                <app-autocomplete-async
                  label="Search Facility Location"
                  formControlName="location"
                  api="admin-hierarchies/get-locations"
                  searchParam="name"
                  displayProperty="name"
                  valueProperty="id"
                  [required]="false"
                  placeholder="Type to search for parent area..."
                />
              </div>

              <!-- Rating Filter -->
              <div>
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Minimum Rating</mat-label>
                  <mat-select formControlName="rating">
                    <mat-option value="">Any Rating</mat-option>
                    <mat-option
                      *ngFor="let rating of filterOptions.ratings"
                      [value]="rating"
                    >
                      {{ rating }} Star{{ rating > 1 ? 's' : '' }} & Above
                    </mat-option>
                  </mat-select>
                </mat-form-field>
              </div>
            </div>

            <!-- Amenities Filter -->
            <div>
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Amenities</mat-label>
                <mat-select formControlName="amenities" multiple>
                  <mat-option
                    *ngFor="let amenity of filterOptions.amenities"
                    [value]="amenity"
                  >
                    {{ formatAmenityLabel(amenity) }}
                  </mat-option>
                </mat-select>
              </mat-form-field>
            </div>

            <!-- Action Buttons -->
            <div class="flex justify-between items-center pt-4">
              <button
                type="button"
                (click)="resetFilters()"
                mat-stroked-button
                color="primary"
                class="flex items-center space-x-2"
              >
                <mat-icon>refresh</mat-icon>
                <span>Reset Filters</span>
              </button>

              <div class="text-sm text-gray-600">
                <span class="font-medium">{{ totalFacilities }}</span>
                facilities found
              </div>
            </div>
          </form>
        </div>
        <!-- search bar ends -->
        <!-- Results Section -->
        <div class="container mx-auto px-4 py-8">
          <!-- Results Count -->
          <div class="flex justify-between items-center mb-6">
            <div class="text-gray-600">
              <span class="font-medium">{{ totalFacilities }}</span> hotels
              found
            </div>

            <!-- Sort Options (optional) -->
            <div class="flex items-center space-x-2">
              <span class="text-sm text-gray-600">Sort by:</span>
              <select
                class="text-sm border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500"
              >
                <option>Rating (High to Low)</option>
                <option>Rating (Low to High)</option>
                <option>Name (A-Z)</option>
                <option>Name (Z-A)</option>
              </select>
            </div>
          </div>

          <!-- Results Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              *ngFor="let hotel of displayedHotels"
              class="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
            >
              <!-- Hotel Image with Overlay -->
              <div class="relative h-64 w-full overflow-hidden">
                <img
                  *ngIf="getHotelImage(hotel)"
                  [src]="getHotelImage(hotel)"
                  [alt]="hotel.name"
                  class="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
                <div
                  *ngIf="!getHotelImage(hotel)"
                  class="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600"
                >
                  <mat-icon class="h-20 w-20 mb-2">hotel</mat-icon>
                  <p class="text-sm font-medium">{{ hotel.name }}</p>
                </div>

                <!-- Grade Badge -->
                <div
                  *ngIf="hotel.starRating"
                  class="absolute top-3 left-3 bg-white bg-opacity-95 px-3 py-1 rounded-full shadow-md"
                >
                  <div class="flex items-center space-x-1">
                    <mat-icon class="h-4 w-4 text-yellow-500">star</mat-icon>
                    <span class="text-sm font-bold text-gray-800">{{
                      hotel.starRating
                    }}</span>
                  </div>
                </div>

                <!-- Unclassified Badge -->
                <div
                  *ngIf="!hotel.starRating"
                  class="absolute top-3 left-3 bg-gray-100 bg-opacity-95 px-3 py-1 rounded-full shadow-md"
                >
                  <div class="flex items-center space-x-1">
                    <mat-icon class="h-4 w-4 text-gray-500"
                      >help_outline</mat-icon
                    >
                    <span class="text-sm font-bold text-gray-600">
                      Unclassified
                    </span>
                  </div>
                </div>

                <!-- Status Badge -->
                <div
                  class="absolute top-3 right-3 px-3 py-1 text-white text-xs font-semibold rounded-full shadow-md"
                  [ngClass]="{
                    'bg-emerald-500': hotel.status === 'APPROVED',
                    'bg-amber-500':
                      hotel.status === 'PENDING' ||
                      hotel.status === 'AWAITING_APPLICATION_FEES',
                    'bg-red-500': hotel.status === 'REJECTED',
                    'bg-blue-500': hotel.status === 'AWAITING_APPROVAL',
                  }"
                >
                  {{ getPublicStatusDisplayName(hotel.status) }}
                </div>

                <!-- Price Tag -->
                <!-- <div -->
                <!--   class="absolute bottom-3 right-3 bg-white bg-opacity-95 px-3 py-2 rounded-lg shadow-md" -->
                <!-- > -->
                <!--   <div class="text-right"> -->
                <!--     <div class="text-lg font-bold text-gray-800"> -->
                <!--       {{ '$' + getFakePrice(hotel) }} -->
                <!--     </div> -->
                <!--     <div class="text-xs text-gray-600">per night</div> -->
                <!--   </div> -->
                <!-- </div> -->
              </div>

              <!-- Hotel Content -->
              <div class="p-6">
                <!-- Header -->
                <div class="mb-3">
                  <h3 class="text-xl font-bold text-gray-900 mb-1 line-clamp-1">
                    {{ hotel.name }}
                  </h3>
                  <div class="flex items-center text-gray-600 text-sm">
                    <mat-icon class="h-4 w-4 mr-1 text-gray-400"
                      >location_on</mat-icon
                    >
                    <span class="truncate">{{
                      hotel.locationName || getFakeLocation()
                    }}</span>
                    <span class="mx-2 text-gray-300">•</span>
                    <span class="text-blue-600 font-medium">{{
                      hotel.propertyTypeName || hotel.propertyType || 'Hotel'
                    }}</span>
                  </div>
                </div>

                <!-- Star Rating -->
                <div class="flex items-center mb-3">
                  <div
                    class="flex items-center space-x-2"
                    *ngIf="hotel.starRating"
                  >
                    <!-- Show star icons for numeric ratings -->
                    <div
                      class="flex items-center space-x-1"
                      *ngIf="!isApprovedFacility(hotel.starRating)"
                    >
                      <!-- Full stars -->
                      <mat-icon
                        *ngFor="
                          let star of getStarArray(
                            getStarCount(hotel.starRating)
                          )
                        "
                        class="h-4 w-4 text-yellow-400"
                        >star</mat-icon
                      >
                      <!-- Half star -->
                      <mat-icon
                        *ngIf="hasHalfStar(hotel.starRating)"
                        class="h-4 w-4 text-yellow-400"
                        >star_half</mat-icon
                      >
                      <!-- Empty stars -->
                      <mat-icon
                        *ngFor="
                          let star of getEmptyStarArray(
                            getStarCount(hotel.starRating),
                            hasHalfStar(hotel.starRating)
                          )
                        "
                        class="h-4 w-4 text-gray-300"
                        >star_border</mat-icon
                      >
                      <!-- <span class="text-sm text-gray-600 ml-2" -->
                      <!--   >({{ getFakeReviews(hotel) }} reviews)</span -->
                      <!-- > -->
                    </div>

                    <!-- Show green badge for approved facilities -->
                    <div
                      *ngIf="isApprovedFacility(hotel.starRating)"
                      class="text-sm font-medium text-green-700 bg-green-100 px-3 py-1 rounded-full"
                    >
                      {{ hotel.starRating }}
                    </div>
                  </div>
                  <div
                    *ngIf="!hotel.starRating"
                    class="text-sm font-medium text-gray-500"
                  >
                    Unclassified
                  </div>
                </div>

                <!-- Amenities/Features -->
                <div class="flex flex-wrap gap-2 mb-4">
                  <span
                    *ngFor="
                      let facility of getDisplayFacilities(hotel).slice(0, 3)
                    "
                    class="inline-flex items-center px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full"
                  >
                    <mat-icon class="h-3 w-3 mr-1">{{
                      getFacilityIcon(facility.facilityType)
                    }}</mat-icon>
                    {{ facility.name }}
                  </span>
                  <span
                    *ngIf="getDisplayFacilities(hotel).length > 3"
                    class="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full"
                  >
                    +{{ getDisplayFacilities(hotel).length - 3 }} more
                  </span>
                </div>

                <!-- Quick Info -->
                <div class="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div class="flex items-center text-gray-600">
                    <mat-icon class="h-4 w-4 mr-2 text-gray-400"
                      >hotel</mat-icon
                    >
                    <span>{{ hotel.roomTypes?.length || 0 }} Room Types</span>
                  </div>
                  <div class="flex items-center text-gray-600">
                    <mat-icon class="h-4 w-4 mr-2 text-gray-400"
                      >restaurant</mat-icon
                    >
                    <span>{{ hotel.facilities?.length || 0 }} Facilities</span>
                  </div>
                </div>

                <!-- Action Button -->
                <div class="w-full">
                  <button
                    (click)="viewHotelDetails(hotel)"
                    class="block w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white text-center py-3 px-4 rounded-lg font-medium text-sm hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- No Results Message -->
          <div
            *ngIf="displayedHotels.length === 0"
            class="flex flex-col items-center justify-center py-12"
          >
            <mat-icon class="h-16 w-16 text-gray-400">search_off</mat-icon>
            <h3 class="mt-4 text-lg font-medium text-gray-900">
              No hotels found
            </h3>
            <p class="mt-1 text-gray-500">
              Try adjusting your search or filter criteria
            </p>
            <button
              (click)="resetFilters()"
              class="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Reset All Filters
            </button>
          </div>

          <!-- Pagination -->
          <div class="mt-8 flex justify-center">
            <mat-paginator
              [length]="totalFacilities"
              [pageSize]="pageSize"
              [pageSizeOptions]="pageSizeOptions"
              [pageIndex]="pageIndex"
              (page)="onPageChange($event)"
              aria-label="Select page"
            ></mat-paginator>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./graded-facilties.component.scss'],
})
export class GradedFacilitiesComponent implements OnInit {
  portalService = inject(PortalService);
  // Pagination settings
  pageSize = 6;
  pageSizeOptions: number[] = [3, 6, 9, 12];
  pageIndex = 0;
  totalFacilities = 0;

  // Pagination parameters for API calls
  paginationParams: any = {
    page: 0,
    size: 6,
  };

  searchTerm: string = '';

  // Search and filter form
  searchForm = new FormGroup({
    searchQuery: new FormControl(''),
    type: new FormControl(''),
    location: new FormControl(''),
    rating: new FormControl(''),
    amenities: new FormControl([]),
  });

  // Displayed hotels after filtering
  displayedHotels: Hotel[] = [];

  // All hotels
  allHotels: Hotel[] = [];

  // Star ratings from API
  starRatings: StarRating[] = [];

  // Filter options for the select dropdowns
  filterOptions: FilterOptions = {
    types: [], // Now loaded dynamically from API
    locations: [], // Now loaded dynamically from API
    ratings: [5, 4, 3, 2, 1],
    amenities: [
      'RESTAURANT',
      'POOL',
      'WIFI',
      'SPA',
      'GYM',
      'CONFERENCE_ROOM',
      'BEACH_ACCESS',
      'AIRPORT_SHUTTLE',
      'TV',
      'AIR_CONDITIONING',
      'PARKING',
      'BAR',
      'ROOM_SERVICE',
    ],
  };

  constructor(
    private gradedFacilityService: GradedFacilityService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.fetchHotelData();

    // Subscribe to form changes
    this.searchForm.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        this.pageIndex = 0; // Reset to first page on new search
        this.paginationParams.page = 0;
        this.handleSearch();
      });

    this.portalService.setLayoutConfig({
      contentWidth: 'w-full',
    });
  }

  // Handle page events from the paginator
  async onPageChange(event: PageEvent): Promise<void> {
    console.log('Page change event:', event);
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.paginationParams.page = event.pageIndex;
    this.paginationParams.size = event.pageSize;
    console.log(
      'Before fetch - pageIndex:',
      this.pageIndex,
      'pageSize:',
      this.pageSize,
    );
    await this.fetchHotelData();
    console.log(
      'After fetch - pageIndex:',
      this.pageIndex,
      'pageSize:',
      this.pageSize,
    );
  }

  // Handle search functionality
  async handleSearch(): Promise<void> {
    const formValues = this.searchForm.value;
    this.searchTerm = formValues.searchQuery || '';
    await this.fetchHotelData();
  }

  // Reset all filters
  async resetFilters(): Promise<void> {
    this.searchForm.reset();
    this.searchTerm = '';
    this.pageIndex = 0;
    this.paginationParams.page = 0;
    await this.fetchHotelData();
  }

  // Get hotel image URL (now returns actual URLs instead of base64)
  getHotelImage(hotel: Hotel): string {
    if (hotel.defaultImage?.mediaUrl) {
      return hotel.defaultImage.mediaUrl;
    }
    if (hotel.media && hotel.media.length > 0) {
      return hotel.media[0].mediaUrl;
    }
    return '';
  }

  // Get hotel status display
  getStatusDisplayName(status: string): string {
    switch (status) {
      case 'AWAITING_APPLICATION_FEES':
        return 'Awaiting Fees';
      case 'AWAITING_APPROVAL':
        return 'Pending';
      case 'APPROVED':
        return 'Approved';
      case 'REJECTED':
        return 'Rejected';
      default:
        return status;
    }
  }

  // Public-friendly status display
  getPublicStatusDisplayName(status: string): string {
    switch (status) {
      case 'APPROVED':
        return 'Verified';
      case 'AWAITING_APPROVAL':
        return 'Under Review';
      case 'PENDING':
        return 'Pending';
      case 'REJECTED':
        return 'Not Available';
      default:
        return 'Verified';
    }
  }

  // Check if facility is approved (not star-rated)
  isApprovedFacility(starRating: string | undefined): boolean {
    if (!starRating) return false;
    return (
      starRating === 'Approved Accommodation Facilities' ||
      starRating === 'Approved Accommodation Facilitie'
    );
  }

  // Get star count from rating string - returns full star count
  getStarCount(starRating: string | undefined): number {
    if (!starRating || this.isApprovedFacility(starRating)) {
      return 0;
    }

    if (/^\d+(\.\d+)?$/.test(starRating)) {
      const count = parseFloat(starRating);
      return Math.floor(count);
    }

    // Handle "X Star" or "X.X Star" format
    const starMatch = starRating.match(/(\d+(?:\.\d+)?)\s*Star/);
    const count = starMatch ? Math.floor(parseFloat(starMatch[1])) : 0;
    console.log('Star match result:', starMatch, 'count:', count);
    return count;
  }

  // Get full rating value (including decimals)
  getFullRating(starRating: string | undefined): number {
    if (!starRating || this.isApprovedFacility(starRating)) {
      return 0;
    }

    // Handle numeric rating levels (1-5, including decimals)
    if (/^\d+(\.\d+)?$/.test(starRating)) {
      return parseFloat(starRating);
    }

    // Handle "X Star" or "X.X Star" format
    const starMatch = starRating.match(/(\d+(?:\.\d+)?)\s*Star/);
    return starMatch ? parseFloat(starMatch[1]) : 0;
  }

  // Check if rating has a half star
  hasHalfStar(starRating: string | undefined): boolean {
    const fullRating = this.getFullRating(starRating);
    return fullRating % 1 >= 0.5;
  }

  // Get array for filled stars
  getStarArray(rating: number): number[] {
    return Array(rating).fill(0);
  }

  // Get array for empty stars (accounting for half stars)
  getEmptyStarArray(filledStars: number, hasHalf: boolean = false): number[] {
    const totalUsed = filledStars + (hasHalf ? 1 : 0);
    const emptyStars = Math.max(0, 5 - totalUsed);
    return Array(emptyStars).fill(0);
  }

  // Static price
  getFakePrice(hotel: Hotel): number {
    return 120; // Static price
  }

  // Static review count
  getFakeReviews(hotel: Hotel): number {
    return 125; // Static review count
  }

  // Static location if missing
  getFakeLocation(): string {
    return 'Dar es Salaam';
  }

  // Get real facilities or fallback
  getDisplayFacilities(hotel: Hotel): any[] {
    if (hotel.facilities && hotel.facilities.length > 0) {
      return hotel.facilities;
    }
    // Fallback facilities if none exist
    return [
      { name: 'Free WiFi', facilityType: 'WIFI' },
      { name: 'Swimming Pool', facilityType: 'POOL' },
      { name: 'Restaurant', facilityType: 'RESTAURANT' },
      { name: 'Spa', facilityType: 'SPA' },
      { name: 'Parking', facilityType: 'PARKING' },
    ];
  }

  // Get facility icon (already exists above, but keeping for consistency)
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

  // Navigate to hotel details
  viewHotelDetails(hotel: Hotel): void {
    console.log('Navigating to hotel details:', hotel.uuid);
    this.router.navigate(['/preview-graded-facility', hotel.uuid]);
  }

  // Load graded facilities data from graded facility service
  private async fetchHotelData() {
    try {
      let query = {
        ...this.paginationParams,
        ...DEFAULT_SEARCH_PARAMS,
        sort: 'id,asc',
      };

      // Add search parameters if there's a search term
      if (this.searchTerm && this.searchTerm.length > 0) {
        query['name'] = this.searchTerm;
        query['email'] = this.searchTerm;
        query['locationName'] = this.searchTerm;
      }

      // Add filter parameters
      const formValues = this.searchForm.value;
      if (formValues.type) {
        query['propertyType'] = formValues.type;
        console.log('Setting propertyType filter to:', formValues.type);
      }
      if (formValues.location) {
        query['locationName'] = formValues.location;
      }
      if (formValues.rating) {
        query['minRating'] = formValues.rating;
      }
      if (formValues.amenities && formValues.amenities.length > 0) {
        query['amenities'] = formValues.amenities.join(',');
      }

      console.log('Final query parameters:', query);

      const response = await lastValueFrom(
        this.gradedFacilityService.get(query),
      );

      if (response && response.data) {
        const { page, size, total, data } = response;

        // Update pagination parameters (API returns 0-based pages)
        this.paginationParams = {
          page: page,
          size,
        };

        this.displayedHotels = data || [];
        this.totalFacilities = total || 0;
        this.pageIndex = page;
        this.pageSize = size;
      }
    } catch (error) {
      console.error('Error fetching graded facilities:', error);
      this.displayedHotels = [];
      this.totalFacilities = 0;
    }
  }

  mapFacilityTypes(facilityTypes: any[]) {
    return facilityTypes.map((type: any) => ({
      value: type.name || type.value || type,
      label: type.displayName || this.formatPropertyTypeLabel(type.name || type.value || type),
    }));
  }

  formatPropertyTypeLabel(enumValue: string) {
    return enumValue
      .split('_')
      .map((word) => word.charAt(0) + word.substring(1).toLowerCase())
      .join(' ');
  }

  formatAmenityLabel(enumValue: string) {
    return enumValue
      .split('_')
      .map((word) => word.charAt(0) + word.substring(1).toLowerCase())
      .join(' ');
  }
}
