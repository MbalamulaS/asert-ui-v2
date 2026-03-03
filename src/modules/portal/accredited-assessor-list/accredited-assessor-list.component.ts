import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AssessorService } from 'modules/assessment/assessor.service';
import { DEFAULT_SEARCH_PARAMS } from 'utils/helpers';
import { HotelService } from 'modules/portal/hotels/services/hotel.service';
import {
  AdminHierarchy,
  AdminHierarchyService,
} from 'modules/admin-hierarchy/area/admin-hierarchy.service';
import { Assessor } from 'modules/assessment/assessment';
import { AssessorCardComponent } from './assessor-card/assessor-card.component';
import { DialogComponent } from 'components/dialog/dialog.component';

@Component({
  selector: 'app-accredited-assessor-list',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatPaginatorModule,
    ReactiveFormsModule,
    AssessorCardComponent,
    DialogComponent,
    DatePipe,
  ],
  template: `
    <div class="py-8 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-12 mt-16 py-8 rounded-lg shadow-sm">
          <h1 class="text-4xl font-bold text-gray-900 mb-4">
            Accredited Grading Assessors
          </h1>
          <div
            class="w-32 h-1 bg-blue-600 mx-auto mb-8 shadow-sm rounded-full"
          ></div>
          <!-- Improved centered paragraph -->
          <div class="max-w-3xl mx-auto">
            <p class="text-gray-600 text-center text-xl leading-relaxed">
              Our experienced accredited grading assessors are ready to help
              evaluate your accommodation. Find a qualified professional in your
              area to ensure your facility meets AserT's quality standards.
            </p>
          </div>
        </div>

        <!-- Enhanced Search Section with subtle animation -->
        <div
          class="bg-white rounded-lg shadow-md p-6 mb-8 transform transition duration-500 hover:shadow-lg"
        >
          <form
            [formGroup]="searchForm"
            (ngSubmit)="searchAssessors()"
            class="space-y-4 md:space-y-0 md:flex md:items-end md:space-x-4"
          >
            <div class="flex-1">
              <label
                for="province"
                class="block text-sm font-medium text-gray-700 mb-1"
                >Region</label
              >
              <mat-select
                formControlName="province"
                id="province"
                class="w-full bg-gray-50 border border-gray-300 rounded-md py-2 px-3 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <mat-option value="">All Provinces</mat-option>
                <mat-option
                  *ngFor="let province of locations"
                  [value]="province.id"
                  >{{ province.name }}
                </mat-option>
              </mat-select>
            </div>
            <div class="flex-1">
              <label
                for="category"
                class="block text-sm font-medium text-gray-700 mb-1"
                >Category</label
              >
              <mat-select
                formControlName="category"
                id="category"
                class="w-full bg-gray-50 border border-gray-300 rounded-md py-2 px-3 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <mat-option value="">All Categories</mat-option>
                <mat-option
                  *ngFor="let category of establishmentTypes"
                  [value]="category.id"
                  >{{ category.name }}
                </mat-option>
              </mat-select>
            </div>
            <div>
              <button
                type="submit"
                class="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition duration-300 ease-in-out flex items-center justify-center transform hover:scale-105"
              >
                <mat-icon class="mr-1">search</mat-icon>
                Search
              </button>
            </div>
          </form>
        </div>

        <!-- Enhanced Assessors Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          <app-assessor-card
            *ngFor="let assessor of data"
            [assessor]="assessor"
            (viewMore)="onViewMore($event)"
          ></app-assessor-card>
        </div>

        <!-- Enhanced Empty State -->
        <div
          *ngIf="dataLength === 0"
          class="text-center py-12 bg-gray-50 rounded-lg shadow-sm"
        >
          <mat-icon class="text-gray-400 text-6xl mb-4">search_off</mat-icon>
          <h3 class="text-xl font-medium text-gray-900 mb-2">
            No assessors found
          </h3>
          <p class="text-gray-600 max-w-md mx-auto mb-4">
            Try adjusting your search filters or check back later as we continue
            to add more assessors to our network.
          </p>
          <button
            (click)="resetFilters()"
            class="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition duration-300 ease-in-out transform hover:scale-105"
          >
            Reset Filters
          </button>
        </div>

        <!-- Enhanced Pagination -->
        <div *ngIf="dataLength > 0" class="mt-8 flex justify-center">
          <mat-paginator
            [length]="dataLength"
            [pageSize]="pageSize"
            [pageSizeOptions]="[6, 12, 24]"
            (page)="onPageChange($event)"
            class="bg-white rounded-lg shadow-sm"
          >
          </mat-paginator>
        </div>
      </div>

      <!-- Assessor Profile Dialog -->
      <app-dialog
        [open]="isOpen"
        [title]="'Assessor Profile'"
        (onClose)="handleClose($event)"
        width="800px"
        height="auto"
      >
        <ng-template>
          <div class="bg-gray-50 min-h-screen">
            <div
              class="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden"
            >
              <!-- Profile Header -->
              <div
                class="relative bg-gradient-to-r from-blue-600 to-purple-600 h-48 flex items-end"
              >
                <div class="absolute inset-0 bg-black/20"></div>
                <div class="relative z-10 p-6 text-white">
                  <div class="flex items-center space-x-4">
                    <div
                      class="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center border-4 border-white/30 overflow-hidden"
                    >
                      <img
                        *ngIf="selectedIem?.profilePhoto?.uuid"
                        [src]="
                          '/api/v1/uploads/' +
                          selectedIem.profilePhoto.uuid +
                          '/view'
                        "
                        alt="Profile Photo"
                        class="w-full h-full object-cover"
                      />
                      <mat-icon
                        *ngIf="!selectedIem?.profilePhoto?.uuid"
                        class="text-4xl"
                        >person</mat-icon
                      >
                    </div>
                    <div>
                      <h1 class="text-2xl font-bold">
                        {{
                          (selectedIem?.title ? selectedIem.title + ' ' : '') +
                            selectedIem?.name
                        }}
                      </h1>
                      <div class="flex items-center mt-2">
                        <mat-icon class="text-yellow-300 mr-1">star</mat-icon>
                        <span class="text-sm">Accredited</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Profile Content -->
              <div class="p-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <!-- Personal Information -->
                  <div class="space-y-4">
                    <h2
                      class="text-xl font-semibold text-gray-900 border-b pb-2"
                    >
                      Personal Information
                    </h2>
                    <div class="space-y-3">
                      <div class="flex items-center">
                        <mat-icon class="text-blue-600 mr-3">person</mat-icon>
                        <div>
                          <p class="text-sm text-gray-500">Full Name</p>
                          <p class="font-medium">{{ selectedIem?.name }}</p>
                        </div>
                      </div>
                      <div class="flex items-center">
                        <mat-icon class="text-blue-600 mr-3">cake</mat-icon>
                        <div>
                          <p class="text-sm text-gray-500">Date of Birth</p>
                          <p class="font-medium">
                            {{ selectedIem?.dob | date: 'mediumDate' }}
                          </p>
                        </div>
                      </div>
                      <div class="flex items-center">
                        <mat-icon class="text-blue-600 mr-3">wc</mat-icon>
                        <div>
                          <p class="text-sm text-gray-500">Gender</p>
                          <p class="font-medium">{{ selectedIem?.sex }}</p>
                        </div>
                      </div>
                      <div class="flex items-center">
                        <mat-icon class="text-blue-600 mr-3"
                          >location_on</mat-icon
                        >
                        <div>
                          <p class="text-sm text-gray-500">Location</p>
                          <p class="font-medium">
                            {{ selectedIem?.locationName }}
                          </p>
                        </div>
                      </div>
                      <div class="flex items-center">
                        <mat-icon class="text-blue-600 mr-3">category</mat-icon>
                        <div>
                          <p class="text-sm text-gray-500">Category</p>
                          <p class="font-medium">
                            {{ selectedIem?.category || 'Not specified' }}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Contact Information -->
                  <div class="space-y-4">
                    <h2
                      class="text-xl font-semibold text-gray-900 border-b pb-2"
                    >
                      Contact Information
                    </h2>
                    <div class="space-y-3">
                      <div class="flex items-center">
                        <mat-icon class="text-blue-600 mr-3">email</mat-icon>
                        <div>
                          <p class="text-sm text-gray-500">Email</p>
                          <a
                            [href]="'mailto:' + selectedIem?.email"
                            class="font-medium text-blue-600 hover:underline"
                            >{{ selectedIem?.email }}</a
                          >
                        </div>
                      </div>
                      <div class="flex items-center">
                        <mat-icon class="text-blue-600 mr-3">phone</mat-icon>
                        <div>
                          <p class="text-sm text-gray-500">Phone</p>
                          <a
                            [href]="'tel:' + selectedIem?.phone"
                            class="font-medium text-blue-600 hover:underline"
                            >{{ selectedIem?.phone }}</a
                          >
                        </div>
                      </div>
                      <div
                        *ngIf="selectedIem?.phoneTwo"
                        class="flex items-center"
                      >
                        <mat-icon class="text-blue-600 mr-3"
                          >phone_android</mat-icon
                        >
                        <div>
                          <p class="text-sm text-gray-500">Secondary Phone</p>
                          <a
                            [href]="'tel:' + selectedIem?.phoneTwo"
                            class="font-medium text-blue-600 hover:underline"
                            >{{ selectedIem?.phoneTwo }}</a
                          >
                        </div>
                      </div>

                    </div>
                  </div>
                </div>

                <!-- Description -->
                <div class="mt-6">
                  <h2
                    class="text-xl font-semibold text-gray-900 border-b pb-2 mb-4"
                  >
                    About
                  </h2>
                  <p class="text-gray-700 leading-relaxed">
                    {{ selectedIem?.description }}
                  </p>
                </div>

                <!-- Status and Dates -->
                <div class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div class="bg-green-50 p-4 rounded-lg">
                    <mat-icon class="text-green-600 mb-2">verified</mat-icon>
                    <h3 class="font-medium text-gray-900">Status</h3>
                    <p class="text-green-700">{{ selectedIem?.status }}</p>
                  </div>
                  <div class="bg-blue-50 p-4 rounded-lg">
                    <mat-icon class="text-blue-600 mb-2"
                      >calendar_today</mat-icon
                    >
                    <h3 class="font-medium text-gray-900">Date Verified</h3>
                    <p class="text-blue-700">
                      {{ selectedIem?.dateVerified | date: 'mediumDate' }}
                    </p>
                  </div>
                  <div class="bg-purple-50 p-4 rounded-lg">
                    <mat-icon class="text-purple-600 mb-2">schedule</mat-icon>
                    <h3 class="font-medium text-gray-900">Date Applied</h3>
                    <p class="text-purple-700">
                      {{ selectedIem?.dateApplied | date: 'mediumDate' }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ng-template>
      </app-dialog>
    </div>
  `,
  styleUrls: ['./accredited-assessor-list.component.scss'],
})
export class AccreditedAssessorListComponent implements OnInit {
  isOpen = false;
  data: Assessor[] = [];
  selectedIem!: Assessor;
  title: string = '';
  searchTerm: string = '';
  searchForm: FormGroup;
  pageSize = 6;
  pageSizeOptions: number[] = [3, 6, 9, 12];
  pageIndex = 0;
  establishmentTypes: { id: string; name: string }[] = [];
  locations: AdminHierarchy[] = [];
  categories: string[] = [];
  category = 'ALL';
  locationId = 0;
  paginationParams: any = {
    page: 0,
    size: 10,
  };

  dataLength = 0;
  page = 0;

  constructor(
    public service: AssessorService,
    private hotelService: HotelService,
    private adminHierarchyService: AdminHierarchyService,
    private fb: FormBuilder,
  ) {
    this.searchForm = this.fb.group({
      province: [null],
      category: [null],
    });
  }

  ngOnInit(): void {
    this.fetchItems(this.locationId, this.category);
    this.loadEstablishmentTypes();
    this.loadLocations();
  }

  loadLocations(): void {
    this.adminHierarchyService.getPortalRegions().subscribe({
      next: (response) => {
        this.locations = response.data;
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  loadEstablishmentTypes(): void {
    this.hotelService.getEstablishmentTypes().subscribe({
      next: (response) => {
        this.establishmentTypes = response.data;
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  fetchItems(locationId: number, category: string) {
    let query = {
      ...this.paginationParams,
      ...DEFAULT_SEARCH_PARAMS,
      sort: 'dateVerified,asc',
      locationId: locationId,
      preference: category,
    };
    this.service
      .portalApprovedApplications({ ...query, size: this.pageSize })
      .subscribe({
        next: (response) => {
          const { page, size, total, data } = response;
          this.paginationParams = {
            page: page - 1,
            size,
          };
          this.data = this.mapData(data);
          this.dataLength = total;
        },
        error: (error) => {
          console.log(error);
        },
      });
  }

  handleClose(result: boolean): void {
    this.isOpen = false;
  }

  mapData = (data: Assessor[]) => {
    return data.map((item: Assessor) => ({
      ...item,
    }));
  };

  onViewMore(assessor: Assessor): void {
    this.selectedIem = assessor;
    this.isOpen = true;
  }

  view(row: Assessor): void {
    this.selectedIem = row;
    this.isOpen = true;
  }

  onPageChange(event: PageEvent): void {
    this.paginationParams.page = event.pageIndex;
    this.paginationParams.size = event.pageSize;
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.fetchItems(this.locationId, this.category);
  }

  resetFilters() {
    this.searchForm.reset({
      province: '',
      category: '',
    });
    this.locationId = 0;
    this.category = 'ALL';
    this.fetchItems(this.locationId, this.category);
  }

  searchAssessors(): void {
    const form = this.searchForm.value;
    this.locationId = form.province ? form.province : 0;
    this.category = form.category ? form.category : 'ALL';
    this.fetchItems(this.locationId, this.category);
  }
}
