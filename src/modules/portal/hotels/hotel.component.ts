import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';
import {
  Hotel,
  PROPERTY_TYPE_OPTIONS,
  REGISTRATION_STATE_OPTIONS,
} from './types';
import { HotelService } from './services/hotel.service';
import { TextInputComponent } from 'components/text-field/text-field.component';
import { SelectComponent } from 'components/select/select.component';
import { ConfirmDialogComponent } from 'components/confirm/confirm.dialog';
import { DialogComponent } from 'components/dialog/dialog.component';
import { CommonModule } from '@angular/common';
import {
  MatProgressSpinner,
  MatSpinner,
} from '@angular/material/progress-spinner';
import { HotelDetailsComponent } from './components/hotel-details.component';
import { HotelFormComponent } from './forms/hotel-form.component';
import { MediaUploadFormComponent } from './forms/media-upload-form.component';
import { ContainerComponent } from 'components/container/container.component';
import { HeaderComponent } from 'components/header/header.component';
import { WrapperComponent } from 'components/wrapper/wrapper.component';
import { ActionButtonComponent } from 'components/action-button/action-button.component';
import { CantPipe } from 'app/pipes/cant.pipe';
import { HotelCardComponent } from './components/hotel-card.component';
import { DomSanitizer } from '@angular/platform-browser';
import { FetcherComponent } from 'components/fetcher/fetcher.component';
import { HotelSearchFormComponent } from './forms/hotel-search-form.component';

@Component({
  selector: 'app-hotel',
  standalone: true,
  template: `
    <container>
      <app-wrapper>
        <app-header
          title="Manage Your Properties"
          subtitle="Manage your hotel properties"
        />
        <div class="mt-4 md:mt-0">
          <action-button
            label="Add New Listing"
            class="w-full md:w-auto"
            icon="add"
            [isDisabled]="'' | cant: 'create' : 'Hotel'"
            (action)="openSearchDialog()"
          />
        </div>
      </app-wrapper>
      <div class="mb-6">
        <div
          class="flex flex-col md:flex-row md:justify-between md:items-center"
        ></div>

        <!-- Search and Filter -->
        <div
          class="mt-6 bg-white rounded-lg shadow-sm flex flex-wrap items-start gap-4"
        >
          <div class="w-full md:w-auto flex-grow">
            <app-text-input
              label="Search Listings"
              [formControl]="searchControl"
              placeholder="Enter listing name..."
            />
          </div>

          <div class="w-full md:w-auto">
            <app-fetcher
              api="hotels/get-types"
              [defaultParams]="{ size: '15' }"
              loadingLabel="Fetching Listing Types.."
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
            <app-select
              label="Status"
              [formControl]="statusFilter"
              [options]="registrationStateOptions"
              placeholder="All Statuses"
            />
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
          *ngIf="!isLoading && (!hotels || hotels.length === 0)"
          class="mt-8 p-8 bg-white rounded-lg shadow-sm text-center"
        >
          <div class="text-gray-400 mb-4">
            <span class="material-icons text-6xl">hotel</span>
          </div>
          <h3 class="text-lg font-medium text-gray-800 mb-2">
            No Listings Found
          </h3>
          <p class="text-gray-600 mb-4">
            You don't have any registered listings yet, or none match your
            filters.
          </p>
          <button
            (click)="openSearchDialog()"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Register Your First Listing
          </button>
        </div>

        <!-- Hotel Cards -->
        <div
          *ngIf="hotels && hotels.length > 0"
          class="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <app-hotel-card
            *ngFor="let hotel of hotels; trackBy: trackByHotelId"
            [hotel]="hotel"
            [onEdit]="hotel.editHandler"
            [onView]="hotel.viewHandler"
            [onDelete]="hotel.deleteHandler"
            [onViewScore]="hotel.assessmentHandler"
          />
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

      <!-- Hotel Form -->
      <app-dialog
        [open]="isSearchOpen"
        (onClose)="closeSearchDialog($event)"
        width="880px"
        title="Fetch Facility From MNRT Portal/TAUSI"
      >
        <ng-template>
          <app-hotel-search-form
            *ngIf="isSearchOpen"
            (formSubmitted)="onSearchFormSubmitted($event)"
            (cancelClicked)="handleCancels($event)"
          />
        </ng-template>
      </app-dialog>
      <!-- Hotel Form -->
      <app-dialog
        [open]="isOpen"
        (onClose)="closeDialog($event)"
        width="960px"
        title="{{ title }} Establishment"
      >
        <ng-template>
          <app-hotel-form
            *ngIf="showForm"
            [editMode]="selectedHotel !== null"
            (formSubmitted)="onFormSubmitted($event)"
            (cancelClicked)="onFormCancelled()"
          />
        </ng-template>
      </app-dialog>

      <!-- Dialogs -->
      <app-confirm-dialog
        [open]="isConfirmDialogOpen"
        [title]="'Delete Listing'"
        [message]="'Are you sure you want to delete this listing?'"
        (onClose)="closeConfirmDialog($event)"
        (onConfirm)="handleConfirm()"
      />

      <app-dialog
        [open]="isDetailsDialogOpen"
        (onClose)="closeDetailsDialog()"
        width="1280px"
        title="Listing Details"
      >
        <ng-template>
          <app-hotel-details
            [hotel]="selectedHotel"
            (close)="onCloseDetails()"
            (edit)="onEditHotel($event)"
          />
        </ng-template>
      </app-dialog>

      <app-dialog
        [open]="isMediaDialogOpen"
        (onClose)="closeMediaDialog($event)"
        width="500px"
        title="Upload Listing Image"
      >
        <ng-template>
          <app-media-upload-form
            [hotelUuid]="currentHotelUuid"
            (uploadComplete)="closeMediaDialog({ success: true })"
          />
        </ng-template>
      </app-dialog>
    </container>
  `,
  imports: [
    TextInputComponent,
    SelectComponent,
    ConfirmDialogComponent,
    DialogComponent,
    ReactiveFormsModule,
    MatPaginatorModule,
    CommonModule,
    MatSpinner,
    HotelDetailsComponent,
    HotelFormComponent,
    HotelSearchFormComponent,
    MediaUploadFormComponent,
    ContainerComponent,
    HeaderComponent,
    WrapperComponent,
    ActionButtonComponent,
    CantPipe,
    HotelCardComponent,
    MatProgressSpinner,
    FetcherComponent,
  ],
})
export class HotelComponent implements OnInit, OnDestroy {
  hotels: Hotel[] = [];
  showForm = false;
  title: string = '';
  selectedHotel: Hotel = null;
  isLoading = false;
  isOpen: boolean = false;
  isSearchOpen: boolean = false;
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

  // Updated options for dropdowns with id/name format
  propertyTypeOptions = [
    { id: '', name: 'All Types' },
    ...PROPERTY_TYPE_OPTIONS,
  ];

  mapPropertyTypes(data) {
    return data.map((type) => ({
      ...type,
    }));
  }

  registrationStateOptions = [
    { id: '', name: 'All Statuses' },
    ...REGISTRATION_STATE_OPTIONS.map((option) => ({
      id: option.value,
      name: option.viewValue,
    })),
  ];

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

    console.log('params', params);

    this.hotelService.get(params).subscribe(
      (response) => {
        this.isLoading = false;
        if (response && response.data) {
          this.hotels = (response.data || []).map((hotel) =>
            this.bindHotelHandlers(hotel),
          );
          this.totalItems = response.data.total || 0;
        } else {
          this.hotels = [];
          this.totalItems = 0;
        }
      },
      (error) => {
        this.isLoading = false;
        this.snackBar.open('Failed to load listings', 'Close', {
          duration: 3000,
        });
      },
    );
  }

  resetFilters(): void {
    this.searchControl.setValue('');
    this.propertyTypeFilter.setValue('');
    this.statusFilter.setValue('');
  }

  bindHotelHandlers(hotel: Hotel): Hotel {
    return {
      ...hotel,
      editHandler: () => this.getEditViewHandler(hotel),
      viewHandler: () => this.getPreviewViewHandler(hotel),
      deleteHandler: () => this.deleteHotel(hotel),
      assessmentHandler: () => this.getResults(hotel),
    };
  }

  trackByHotelId(index: number, hotel: Hotel): any {
    return hotel.id || hotel.uuid || index;
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.loadHotels();
  }

  addNewHotel(): void {
    this.selectedHotel = null;
    this.hotelService.clearForms();
    this.showForm = true;
  }

  editHotel(hotel: Hotel): void {
    this.selectedHotel = hotel;
    this.hotelService.populateForm(hotel);
    this.isOpen = true;
    this.showForm = true;
  }

  viewHotel(hotel: Hotel): void {
    this.selectedHotel = hotel;
    this.hotelToView = hotel;
    this.isDetailsDialogOpen = true;
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

  closeConfirmDialog(result: boolean): void {
    this.isConfirmDialogOpen = false;
    if (!result || !this.hotelToDelete) return;

    this.performDelete();
  }

  performDelete(): void {
    this.hotelService.delete(this.hotelToDelete.uuid).subscribe(
      (response) => {
        if (response) {
          this.snackBar.open('Hotel deleted successfully', 'Close', {
            duration: 3000,
          });
          this.loadHotels();
        } else {
          this.snackBar.open(
            response.message || 'Failed to delete hotel',
            'Close',
            { duration: 3000 },
          );
        }
        this.hotelToDelete = null;
      },
      (error) => {
        this.snackBar.open('Failed to delete hotel', 'Close', {
          duration: 3000,
        });
        this.hotelToDelete = null;
      },
    );
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

  onSearchFormSubmitted(data: any) {
    this.isSearchOpen = false;
    this.openDialog(null, data);
  }

  onFormSubmitted(hotel: Hotel): void {
    this.showForm = false;
    this.isOpen = true;
    this.loadHotels();
  }

  onFormCancelled(): void {
    this.showForm = false;
    this.isOpen = true;
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
    this.showForm = false;
    this.showDetailsDialog = false;
    this.selectedHotel = null;
  }
  closeSearchDialog(event: any) {
    this.isSearchOpen = false;
  }

  openSearchDialog() {
    this.isSearchOpen = true;
  }
  openDialog(data?: Hotel, fill?: Hotel) {
    this.showDetailsDialog = false;
    this.isOpen = true;
    this.showForm = true;
    if (data) {
      this.title = 'Update';
      this.hotelService.populateForm(data);
    } else {
      this.title = 'Add New';
      this.hotelService.clearForms();
    }
    console.log(fill);
    if (fill) this.hotelService.populateForm(fill);
    this.selectedHotel = data || null;
  }

  onCloseDetails(): void {
    this.showDetailsDialog = false;
    this.selectedHotel = null;
  }

  // This method handles the edit event from the hotel details component
  onEditHotel(hotel: Hotel): void {
    // Redirect to edit form or open edit dialog
    this.showDetailsDialog = false;
    this.openDialog(hotel);
  }

  openEditForm(hotel: Hotel): void {
    this.router.navigate(['/manage-listings', hotel.uuid, 'edit']);
  }

  // Method to open the details dialog
  viewHotelDetails(hotel: Hotel): void {
    this.selectedHotel = hotel;
    this.showDetailsDialog = true;
  }

  getEditViewHandler(hotel: Hotel) {
    console.log('Navigating to edit listing for hotel:', hotel.uuid, hotel);
    this.router.navigate(['/edit-listing', hotel.uuid]);
  }

  getPreviewViewHandler(hotel: Hotel) {
    console.log('Navigating to preview listing for hotel:', hotel.uuid, hotel);
    this.router.navigate(['/preview-listing', hotel.uuid]);
  }

  async getResults(hotel: Hotel) {
    this.router.navigate(['/listing-assessment-results', hotel.uuid]);
  }

  handleCancels(event) {
    if (event) {
      this.openDialog();
    }
  }
}
