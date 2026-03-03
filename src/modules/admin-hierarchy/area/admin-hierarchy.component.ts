import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TableComponent } from 'components/table/table.component';
import { MatIconModule } from '@angular/material/icon';
import { provideIcons } from '@ng-icons/core';
import {
  heroCog6Tooth,
  heroMagnifyingGlass,
  heroPencilSquare,
  heroTrash,
} from '@ng-icons/heroicons/outline';
import { DialogComponent } from 'components/dialog/dialog.component';
import { HeaderComponent } from 'components/header/header.component';
import { SearchComponent } from 'components/search/search.component';
import { ConfirmDialogComponent } from 'components/confirm/confirm.dialog';
import { CantPipe } from 'pipes/cant.pipe';
import { lastValueFrom } from 'rxjs';
import { DEFAULT_SEARCH_PARAMS } from 'utils/helpers';
import { WrapperComponent } from 'components/wrapper/wrapper.component';
import { ActionButtonComponent } from 'components/action-button/action-button.component';
import { IconButtonComponent } from 'components/icon-button/icon-button.component';
import { AdminHierarchyFormComponent } from 'modules/admin-hierarchy/area/forms/admin-hierarchy-form.component';
import {
  AdminHierarchy,
  AdminHierarchyService,
} from 'modules/admin-hierarchy/area/admin-hierarchy.service';
import { FetcherComponent } from 'components/fetcher/fetcher.component';
import { SelectComponent } from 'components/select/select.component';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-admin-hierarchy',
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
    TableComponent,
    MatIconModule,
    DialogComponent,
    HeaderComponent,
    SearchComponent,
    ConfirmDialogComponent,
    AdminHierarchyFormComponent,
    CantPipe,
    WrapperComponent,
    ActionButtonComponent,
    IconButtonComponent,
    AdminHierarchyFormComponent,
    FetcherComponent,
    SelectComponent,
    ReactiveFormsModule,
    NgIf,
  ],
  template: `
    <div class="p-4">
      <app-header title="Manage Admin Hierarchy" />
      <app-wrapper>
        <div class="flex w-full md:w-auto md:flex-1">
          <app-search
            class="w-full md:w-auto"
            (onSearch)="handleSearch($event)"
          />
        </div>
        <div class="flex space-x-4 items-center">
          <app-fetcher
            api="admin-hierarchy-levels"
            class="!mt-5 !w-[100%] md:!w-[300px]"
            [defaultParams]="{ size: '100' }"
            loadingLabel="Fetching menu items.."
          >
            <ng-template let-response>
              <div *ngIf="response; else noData">
                <app-select
                  label="Filter by Level..."
                  [form]="filterForm"
                  name="levelId"
                  [options]="response.data"
                  placeholder="Select level to filter..."
                />
              </div>
              <ng-template #noData>No data available</ng-template>
            </ng-template>
          </app-fetcher>
          <action-button
            label="ADD NEW"
            class="w-full md:w-auto"
            icon="add"
            [isDisabled]="'' | cant: 'create' : 'AdminHierarchy'"
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
        <ng-template #actionTemplate let-item>
          <icon-button
            [isDisabled]="'' | cant: 'update' : 'AdminHierarchy'"
            icon="launch"
            tooltip="Edit AdminHierarchy"
            (action)="openDialog(item)"
            color="primary"
          />

          <icon-button
            [isDisabled]="'' | cant: 'delete' : 'AdminHierarchy'"
            icon="delete_outline"
            tooltip="Delete AdminHierarchy"
            color="accent"
            (action)="openConfirmDialog(item)"
          />
        </ng-template>
      </app-table>

      <app-dialog
        [open]="isOpen"
        (onClose)="handleClose()"
        width="740px"
        title="{{ title }} Admin Hierarchy "
      >
        <ng-template>
          <admin-hierarchy-form (onSubmit)="saveData($event)" />
        </ng-template>
      </app-dialog>

      <app-confirm-dialog
        [open]="isDialogOpen"
        [title]="'Delete Admin Hierarchy'"
        [message]="'Are you sure you want to delete this?'"
        (onClose)="closeConfirmDialog($event)"
        (onConfirm)="handleConfirm()"
      />
    </div>
  `,
})
export class AdminHierarchyComponent implements OnInit {
  isOpen = false;
  isDialogOpen = false;
  data: AdminHierarchy[] = [];
  selectedIem!: AdminHierarchy;
  title: string = '';
  adminLevel: string = '';
  filterForm: FormGroup;

  searchTerm: string = '';

  paginationParams: any = {
    page: 0,
    size: 10,
  };

  dataLength = 0;
  pageSize = 10;
  page = 0;

  columns = [
    { label: 'Name', value: 'name' },
    { label: 'Code', value: 'code' },
    { label: 'ISO Code', value: 'isoCode' },
    { label: 'Level', value: 'adminHierarchyLevelName' },
    { label: 'Parent', value: 'parentName' },
  ];

  constructor(public service: AdminHierarchyService, private fb: FormBuilder) {
    this.filterForm = this.fb.group({
      levelId: ['']
    });
  }

  ngOnInit(): void {
    this.fetchAdminHierarchys();
    
    // Subscribe to filter form changes
    this.filterForm.get('levelId')?.valueChanges.subscribe(value => {
      this.adminLevel = value || '';
      this.page = 0;
      this.paginationParams.page = 0;
      this.fetchAdminHierarchys();
    });
  }

  async fetchAdminHierarchys() {
    let query = {
      ...this.paginationParams,
      ...DEFAULT_SEARCH_PARAMS,
      sort: 'id,asc',
    };

    if (this.searchTerm && this.searchTerm.length > 0) {
      query['name'] = this.searchTerm;
    }

    if (this.adminLevel && this.adminLevel.length != 0) {
      query['levelId'] = this.adminLevel;
    }

    const response = await lastValueFrom(
      this.service.get({ ...query, size: this.pageSize }),
    );

    const { page, size, total, data } = response;

    this.paginationParams = {
      page: page - 1, // Adjust for zero-indexed page
      size,
    };

    this.data = data;
    this.dataLength = total;
  }

  handleClose(): void {
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
    this.fetchAdminHierarchys();
  }


  closeConfirmDialog(event: any) {
    console.log('closeConfirmDialog', event);
    this.isDialogOpen = false;
  }

  async handleConfirm() {
    await lastValueFrom(this.service.delete(this.selectedIem.uuid));
    this.page = 0;
    this.paginationParams.page = 0;
    this.fetchAdminHierarchys();
  }

  async saveData(data: any) {
    try {
      if (data.uuid) {
        await lastValueFrom(this.service.update(data.uuid, data));
      } else {
        await lastValueFrom(this.service.create(data));
      }
      this.isOpen = false;
      await this.fetchAdminHierarchys();
    } catch (error) {
      // Handle error
      console.log(error);
    }
  }

  async openDialog(data?: any) {
    if (data) {
      this.title = 'Update';
      this.service.populateForm(data);
    } else {
      this.title = 'Create';
      this.service.clearForm();
    }
    this.isOpen = true;
  }

  async getPaginatedData(event: { page: number; size: number }) {
    this.paginationParams.page = event.page;
    this.paginationParams.size = event.size;
    this.pageSize = event.size;
    await this.fetchAdminHierarchys();
  }
}
