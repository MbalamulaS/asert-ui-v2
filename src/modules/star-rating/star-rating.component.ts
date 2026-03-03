import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  TableComponent,
  ColumnDefDirective,
} from 'components/table/table.component';
import { MatIconModule } from '@angular/material/icon';
import { provideIcons } from '@ng-icons/core';
import {
  heroPencilSquare,
  heroTrash,
  heroMagnifyingGlass,
  heroCog6Tooth,
} from '@ng-icons/heroicons/outline';
import { DialogComponent } from 'components/dialog/dialog.component';
import { HeaderComponent } from 'components/header/header.component';
import { SearchComponent } from 'components/search/search.component';
import { ConfirmDialogComponent } from 'components/confirm/confirm.dialog';
import { CantPipe } from 'pipes/cant.pipe';
import { lastValueFrom } from 'rxjs';
import { DEFAULT_SEARCH_PARAMS } from 'utils/helpers';
import { Router } from '@angular/router';
import { WrapperComponent } from 'components/wrapper/wrapper.component';
import { ActionButtonComponent } from 'components/action-button/action-button.component';
import { IconButtonComponent } from 'components/icon-button/icon-button.component';
import { ContainerComponent } from 'components/container/container.component';
import { SelectComponent } from 'components/select/select.component';
import { StarRatingFormComponent } from './forms/star-rating-form.component';
import { StarRatingService } from './star-rating.service';
import { PropertyType } from 'modules/portal/hotels/types';
import { StarRating } from './star-rating';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  viewProviders: [
    provideIcons({
      heroCog6Tooth,
      heroPencilSquare,
      heroTrash,
      heroMagnifyingGlass,
    }),
  ],
  imports: [
    CommonModule,
    FormsModule,
    TableComponent,
    ColumnDefDirective,
    MatIconModule,
    DialogComponent,
    HeaderComponent,
    SearchComponent,
    ConfirmDialogComponent,
    StarRatingFormComponent,
    CantPipe,
    WrapperComponent,
    ActionButtonComponent,
    IconButtonComponent,
    ContainerComponent,
    SelectComponent,
  ],
  template: `
    <container>
      <app-header title="Manage StarRatings" />
      <app-wrapper>
        <app-search
          class="w-full md:w-auto"
          (onSearch)="handleSearch($event)"
        />
        <div class="flex flex-col md:flex-row gap-4">
          <app-select
            label="Filter by Property Type"
            [options]="propertyTypeFilterOptions"
            [(ngModel)]="selectedPropertyType"
            (onOptionSelected)="handlePropertyTypeFilter($event)"
            placeholder="All Property Types"
            class="w-full md:w-auto min-w-[200px]"
          />
          <action-button
            label="ADD NEW"
            class="w-full md:w-auto"
            icon="add"
            [isDisabled]="'' | cant: 'create' : 'RatingCriteria'"
            (action)="openDialog()"
          />
        </div>
      </app-wrapper>
      <app-table
        [data]="data"
        [columns]="columns"
        [dataLength]="dataLength"
        [tableClass]="'min-w-full bg-white rounded-lg shadow-lg'"
        (handePagination)="getPaginatedData($event)"
        [pageSize]="pageSize"
        [page]="page"
      >
        <ng-template columnDef="propertyType" let-item>
          <span
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
          >
            {{ getPropertyTypeDisplayName(item.propertyType) }}
          </span>
        </ng-template>

        <ng-template columnDef="stars" let-item>
          <div class="flex items-center">
            <mat-icon
              *ngFor="let star of getStarArray(item.starLevel)"
              class="h-4 w-4 text-yellow-400"
              >star</mat-icon
            >
            <mat-icon
              *ngFor="let star of getEmptyStarArray(item.starLevel)"
              class="h-4 w-4 text-gray-300"
              >star_border</mat-icon
            >
            <span class="ml-2 text-sm text-gray-600"
              >{{ item.starLevel }} Star{{
                item.starLevel !== 1 ? 's' : ''
              }}</span
            >
          </div>
        </ng-template>

        <ng-template #actionTemplate let-item>
          <icon-button
            [isDisabled]="'' | cant: 'update' : 'RatingCriteria'"
            icon="launch"
            tooltip="Edit Criteria"
            (action)="openDialog(item)"
            color="primary"
          />

          <icon-button
            [isDisabled]="'' | cant: 'delete' : 'RatingCriteria'"
            icon="delete_outline"
            tooltip="Delete Criteria"
            color="accent"
            (action)="openConfirmDialog(item)"
          />
        </ng-template>
      </app-table>

      <app-dialog
        [open]="isOpen"
        (onClose)="handleClose($event)"
        width="740px"
        title="{{ title }} Rating Criteria"
      >
        <ng-template>
          <star-rating-form (onSubmit)="saveData($event)" />
        </ng-template>
      </app-dialog>

      <app-confirm-dialog
        [open]="isDialogOpen"
        [title]="'Delete Rating Criteria'"
        [message]="'Are you sure you want to delete this rating criteria?'"
        (onClose)="closeConfirmDialog($event)"
        (onConfirm)="handleConfirm()"
      />
    </container>
  `,
})
export class StarRatingComponent implements OnInit {
  isOpen = false;
  isDialogOpen = false;
  data: StarRating[] = [];
  selectedIem!: StarRating;
  title: string = '';

  searchTerm: string = '';
  selectedPropertyType: string = '';

  paginationParams: any = {
    page: 0,
    size: 10,
  };

  dataLength = 0;
  pageSize = 10;
  page = 0;

  columns = [
    { label: 'Property Type', value: 'propertyType' },
    { label: 'Name', value: 'name' },
    { label: 'Stars', value: 'stars' },
    { label: 'Min Score', value: 'minScore' },
    { label: 'Max Score', value: 'maxScore' },
    { label: 'Total Score', value: 'totalPossibleScore' },
  ];

  // Property type filter options - include "All" option
  propertyTypeFilterOptions = [
    { id: '', name: 'All Property Types' },
    ...this.service.propertyTypeOptions,
  ];

  constructor(
    public service: StarRatingService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.fetchStarRatings();
  }

  async fetchStarRatings() {
    let query = {
      ...this.paginationParams,
      ...DEFAULT_SEARCH_PARAMS,
      sort: 'id,asc',
    };

    if (this.searchTerm && this.searchTerm.length > 0) {
      query['name'] = this.searchTerm;
    }

    if (this.selectedPropertyType && this.selectedPropertyType.length > 0) {
      query['propertyType'] = this.selectedPropertyType;
    }

    const response = await lastValueFrom(
      this.service.get({ ...query, size: this.pageSize }),
    );

    const { page, size, total, data } = response;

    console.log('Star Ratings Response:', response.data);

    this.paginationParams = {
      page: page - 1, // Adjust for zero-indexed page
      size,
    };

    this.data = data;
    this.dataLength = total;
  }

  handleClose(result: boolean): void {
    this.service.clearForm();
    this.isOpen = false;
  }

  openConfirmDialog(data: any) {
    this.selectedIem = data;
    this.isDialogOpen = true;
  }

  handleSearch(query: string): void {
    this.searchTerm = query;
    // Reset to the first page
    this.page = 0;
    this.paginationParams.page = 0;
    this.fetchStarRatings();
  }

  handlePropertyTypeFilter(propertyType: string): void {
    this.selectedPropertyType = propertyType;
    // Reset to the first page
    this.page = 0;
    this.paginationParams.page = 0;
    this.fetchStarRatings();
  }

  closeConfirmDialog(event: any) {
    this.isDialogOpen = false;
  }

  async handleConfirm() {
    await lastValueFrom(this.service.delete(this.selectedIem.uuid));
    this.page = 0;
    this.paginationParams.page = 0;
    this.fetchStarRatings();
  }

  async saveData(data: any) {
    try {
      if (data.uuid) {
        await lastValueFrom(this.service.update(data.uuid, data));
      } else {
        await lastValueFrom(this.service.create(data));
      }
      this.isOpen = false;
      await this.fetchStarRatings();
    } catch (error) {
      // Handle error
      console.log(error);
    }
  }

  async openDialog(data?: any) {
    this.isOpen = true;
    if (data) {
      this.title = 'Update';
      this.service.populateForm(data);
    } else {
      this.title = 'Create';
      this.service.clearForm();
    }
  }

  async getPaginatedData(event: { page: number; size: number }) {
    this.paginationParams.page = event.page;
    this.paginationParams.size = event.size;
    // Update the pageSize to reflect the new size
    this.pageSize = event.size;
    await this.fetchStarRatings();
  }

  // Get property type display name
  getPropertyTypeDisplayName(propertyType: string): string {
    const option = this.service.propertyTypeOptions.find(
      (opt) => opt.id === propertyType,
    );
    return option ? option.name : propertyType;
  }

  // Generate filled star array
  getStarArray(starLevel: number): number[] {
    return Array(starLevel || 0).fill(0);
  }

  // Generate empty star array
  getEmptyStarArray(starLevel: number): number[] {
    const emptyStars = Math.max(0, 5 - (starLevel || 0));
    return Array(emptyStars).fill(0);
  }
}
