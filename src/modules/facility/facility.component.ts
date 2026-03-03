import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';
import { HotelService } from './services/hotel.service';
import { TextInputComponent } from 'components/text-field/text-field.component';
import { SelectComponent } from 'components/select/select.component';
import { CommonModule } from '@angular/common';
import {
  MatProgressSpinner,
  MatSpinner,
} from '@angular/material/progress-spinner';
import { ContainerComponent } from 'components/container/container.component';
import { HeaderComponent } from 'components/header/header.component';
import { WrapperComponent } from 'components/wrapper/wrapper.component';
import { DomSanitizer } from '@angular/platform-browser';
import { Hotel } from 'modules/portal/hotels/types';
import { HotelCardComponent } from './components/facility-card.component';
import { FetcherComponent } from 'components/fetcher/fetcher.component';

@Component({
  selector: 'app-hotel',
  standalone: true,
  template: `
    <container>
      <app-wrapper>
        <app-header
          title="Hotel Assessment Requests"
          subtitle="Manage Property Assessment Requests"
        />
      </app-wrapper>
      <div *ngIf="!showForm" class="mb-6">
        <div
          class="flex flex-col md:flex-row md:justify-between md:items-center"
        ></div>

        <!-- Search and Filter -->
        <div
          class="mt-6 bg-white rounded-lg shadow-sm flex flex-wrap items-start gap-4"
        >
          <div class="w-full md:w-auto flex-grow">
            <app-text-input
              label="Search Hotels"
              [formControl]="searchControl"
              placeholder="Enter hotel name..."
            />
          </div>

          <div class="w-full md:w-auto">
            <app-fetcher
              api="hotels/get-types"
              [defaultParams]="{ size: '15' }"
              loadingLabel="Fetching Hotel Types.."
            >
              <ng-template let-response>
                <div *ngIf="response; else noData">
                  <app-select
                    placeholder="All Types"
                    label="Filter By Property Type"
                    [formControl]="propertyTypeFilter"
                    [options]="response.data"
                  />
                </div>
                <ng-template #noData>No data available</ng-template>
              </ng-template>
            </app-fetcher>
          </div>

          <div class="w-full md:w-auto">
            <button
              (click)="resetFilters()"
              class="px-4 py-4 border border-gray-300 text-blue-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-auto"
            >
              Reset
            </button>
          </div>
        </div>

        <!-- Loading Indicator -->
        <div *ngIf="isLoading" class="flex justify-center mt-8">
          <mat-spinner diameter="40"></mat-spinner>
        </div>

        <!-- No Results -->
        <div
          *ngIf="!hotels || hotels.length === 0"
          class="mt-8 p-8 bg-white rounded-lg shadow-sm text-center"
        >
          <div class="text-gray-400 mb-4">
            <span class="material-icons text-6xl">hotel</span>
          </div>
          <h3 class="text-lg font-medium text-gray-800 mb-2">
            No Hotels Found
          </h3>
          <p class="text-gray-600 mb-4">
            You don't have any hotels yet, or none match your filters.
          </p>
        </div>

        <!-- Hotel Cards -->
        <div
          *ngIf="!isLoading && hotels && hotels.length > 0"
          class="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <app-hotel-card
            *ngFor="let hotel of hotels"
            [hotel]="hotel"
            [onView]="getViewHandler(hotel)"
            [onViewScore]="getHotelAssessmentResults(hotel)"
          ></app-hotel-card>
        </div>

        <!-- Pagination -->
        <div
          *ngIf="
            !isLoading && hotels && hotels.length > 0 && totalItems > pageSize
          "
          class="mt-6 flex justify-center"
        >
          <mat-paginator
            [length]="totalItems"
            [pageSize]="pageSize"
            [pageSizeOptions]="[5, 10, 25, 50]"
            (page)="onPageChange($event)"
            aria-label="Select page"
          >
          </mat-paginator>
        </div>
      </div>
    </container>
  `,
  imports: [
    TextInputComponent,
    SelectComponent,
    ReactiveFormsModule,
    MatPaginatorModule,
    CommonModule,
    MatSpinner,
    ContainerComponent,
    HeaderComponent,
    WrapperComponent,
    MatProgressSpinner,
    HotelCardComponent,
    FetcherComponent,
  ],
})
export class FacilityComponent implements OnInit, OnDestroy {
  hotels: Hotel[] = [];
  showForm = false;
  selectedHotel: Hotel = null;
  isLoading = false;
  isOpen: boolean = false;
  showDetailsDialog: boolean = false;

  // For confirm dialog
  isConfirmDialogOpen = false;
  hotelToDelete: Hotel = null;

  // For hotel details dialog
  isDetailsDialogOpen = false;
  hotelToView: Hotel = null;

  // For media upload dialog
  isMediaDialogOpen = false;
  currentHotelUuid: string = null;

  // Pagination
  pageSize = 10;
  pageIndex = 0;
  totalItems = 0;

  // Filters
  searchControl = new FormControl('');
  propertyTypeFilter = new FormControl('');
  statusFilter = new FormControl('');

  private destroy$ = new Subject<void>();

  constructor(
    public hotelService: HotelService,
    private snackBar: MatSnackBar,
    private sanitizer: DomSanitizer,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadHotels();
    this.setupFilterListeners();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setupFilterListeners(): void {
    // Listen for search input changes
    this.searchControl.valueChanges
      .pipe(debounceTime(500), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.pageIndex = 0;
        this.loadHotels();
      });

    // Listen for property type filter changes
    this.propertyTypeFilter.valueChanges
      .pipe(distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.pageIndex = 0;
        this.loadHotels();
      });

    // Listen for status filter changes
    this.statusFilter.valueChanges
      .pipe(distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.pageIndex = 0;
        this.loadHotels();
      });
  }

  loadHotels(): void {
    this.isLoading = true;

    const params: Record<string, any> = {
      page: this.pageIndex,
      size: this.pageSize,
      sort: 'createdAt,desc',
    };

    // Add filters if they have values
    if (this.searchControl.value) {
      params['name'] = this.searchControl.value;
    }

    if (this.propertyTypeFilter.value) {
      params['propertyType'] = this.propertyTypeFilter.value;
    }

    if (this.statusFilter.value) {
      params['status'] = this.statusFilter.value;
    }

    this.hotelService.get('1230232323', params).subscribe(
      (response) => {
        this.isLoading = false;
        if (response && response.data) {
          console.log('response', response);
          this.hotels = response.data || [];
          this.totalItems = response.data.total || 0;
        } else {
          this.hotels = [];
          this.totalItems = 0;
        }
      },
      (error) => {
        this.isLoading = false;
        this.snackBar.open('Failed to load hotels', 'Close', {
          duration: 3000,
        });
      },
    );
  }

  getHotelAssessmentResults(hotel: Hotel): () => void {
    return () => this.getResults(hotel);
  }

  async getResults(hotel: Hotel) {
    this.router.navigate(['establishment-assessment-results', hotel.uuid]);
  }

  resetFilters(): void {
    this.searchControl.setValue('');
    this.propertyTypeFilter.setValue('');
    this.statusFilter.setValue('');
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.loadHotels();
  }

  openUploadDialog(hotelUuid: string): void {
    this.currentHotelUuid = hotelUuid;
    this.isMediaDialogOpen = true;
  }

  // Confirm Dialog methods
  deleteHotel(hotel: Hotel): void {
    this.hotelToDelete = hotel;
    this.isConfirmDialogOpen = true;
  }

  // Details Dialog methods
  closeDetailsDialog(): void {
    this.isDetailsDialogOpen = false;
    this.hotelToView = null;
  }

  // Media Upload Dialog methods
  closeMediaDialog(result: any): void {
    this.isMediaDialogOpen = false;
    if (result && result.success) {
      this.loadHotels();
    }
    this.currentHotelUuid = null;
  }

  onFormSubmitted(hotel: Hotel): void {
    this.showForm = false;
    this.loadHotels();
  }

  onFormCancelled(): void {
    this.showForm = false;
    this.selectedHotel = null;
  }

  setAsDefaultImage(hotelUuid: string, mediaUuid: string): void {
    if (!hotelUuid || !mediaUuid) return;

    this.hotelService.setDefaultImage(hotelUuid, mediaUuid).subscribe(
      (response) => {
        if (response) {
          this.snackBar.open('Default image updated successfully', 'Close', {
            duration: 3000,
          });
          this.loadHotels();
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

  handleConfirm() {
    console.log('console');
  }

  closeDialog(event: any) {
    this.isOpen = false;
  }

  openDialog(data?: Hotel) {
    this.showDetailsDialog = false;
    this.isOpen = true;
    this.showForm = true;
    this.selectedHotel = data || null;
  }

  onCloseDetails(): void {
    this.showDetailsDialog = false;
    this.selectedHotel = null;
  }

  onEditHotel(hotel: Hotel): void {
    // Redirect to edit form or open edit dialog
    this.showDetailsDialog = false;
    this.openDialog(hotel);
  }

  // Helper method to open edit form
  openEditForm(hotel: Hotel): void {
    this.router.navigate(['/establishment-details', hotel.uuid, 'edit']);
  }

  // Method to open the details dialog
  viewHotelDetails(hotel: Hotel): void {
    this.selectedHotel = hotel;
    this.showDetailsDialog = true;
  }

  viewHotel(hotel: Hotel): void {
    this.router.navigate(['/establishment-details'], {
      queryParams: { uuid: hotel.uuid },
    });
  }

  getViewHandler(hotel: Hotel): () => void {
    return () => this.viewHotel(hotel);
  }

  getDeleteHandler(hotel: Hotel): () => void {
    return () => this.deleteHotel(hotel);
  }

  getEditHandler(hotel: Hotel) {}
}
