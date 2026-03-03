import { Component, OnInit } from '@angular/core';
import { TableComponent } from 'components/table/table.component';
import { MatIconModule } from '@angular/material/icon';
import { provideIcons } from '@ng-icons/core';
import { CommonModule } from '@angular/common';
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
import { Router } from '@angular/router';
import { FacilityLevelService } from 'modules/setup/facility-level/facility-level.service';
import { FacilityLevelFormComponent } from 'modules/setup/facility-level/forms/facility-level-form.component';
import { ActionButtonComponent } from 'components/action-button/action-button.component';
import { IconButtonComponent } from 'components/icon-button/icon-button.component';
import { ContainerComponent } from 'components/container/container.component';
import { FacilityLevel } from './facility-level';
import { ApiResponse } from 'app/custom-response';

@Component({
  selector: 'app-facility-level',
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
    TableComponent,
    MatIconModule,
    DialogComponent,
    HeaderComponent,
    SearchComponent,
    ConfirmDialogComponent,
    CantPipe,
    FacilityLevelFormComponent,
    ActionButtonComponent,
    IconButtonComponent,
    ContainerComponent,
  ],
  template: `
    <container>
      <app-header title="Manage Facility Levels" />
      <div
        class="mb-4 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0"
      >
        <app-search
          class="w-full md:w-auto"
          (onSearch)="handleSearch($event)"
        />
        <action-button
          label="ADD NEW"
          icon="add"
          class="w-full md:w-auto"
          [isDisabled]="'' | cant: 'create' : 'FacilityLevel'"
          (action)="openDialog()"
        />
      </div>

      <app-table
        [data]="items"
        [columns]="columns"
        [dataLength]="dataLength"
        [tableClass]="'min-w-full bg-white rounded-lg shadow-lg'"
        (handePagination)="getPaginatedData($event)"
        [pageSize]="pageSize"
        [page]="page"
      >
        <ng-template #cellTemplate let-column="column" let-item="item">
          <ng-container [ngSwitch]="column.value">
            <span *ngSwitchCase="'levelGroupName'">{{
              item.levelGroupName
            }}</span>
            <span *ngSwitchCase="'levelPrice'">{{
              item.levelPrice | currency
            }}</span>
            <span *ngSwitchCase="'levelRank'">{{ item.levelRank }}</span>
            <span *ngSwitchDefault>{{ item[column.value] }}</span>
          </ng-container>
        </ng-template>

        <!-- Action Buttons -->
        <ng-template #actionTemplate let-item>
          <div class="flex flex-row gap-1">
            <icon-button
              [isDisabled]="'' | cant: 'update' : 'FacilityLevel'"
              icon="launch"
              tooltip="Edit Facility Level"
              (action)="openDialog(item)"
              color="primary"
            />

            <icon-button
              [isDisabled]="'' | cant: 'delete' : 'FacilityLevel'"
              icon="delete_outline"
              tooltip="Delete Facility Level"
              color="accent"
              (action)="openConfirmDialog(item)"
            />
          </div>
        </ng-template>
      </app-table>
      <app-dialog
        [open]="isOpen"
        (onClose)="handleClose($event)"
        width="900px"
        title="{{ title }} Facility Level"
      >
        <ng-template>
          <facility-level-form
            [facilityLevel]="selectedItem"
            (onSubmit)="saveData($event)"
          />
        </ng-template>
      </app-dialog>

      <app-confirm-dialog
        [open]="isDialogOpen"
        [title]="'Confirm Action'"
        (onClose)="closeConfirmDialog($event)"
      />
    </container>
  `,
})
export class FacilityLevelComponent implements OnInit {
  isOpen = false;
  isDialogOpen = false;
  items: FacilityLevel[] = [];
  selectedItem!: FacilityLevel;
  title: string = '';
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
    { label: 'Group', value: 'levelGroupName' },
    { label: 'Price', value: 'price' },
    { label: 'Rank', value: 'levelRank' },
  ];

  constructor(
    public service: FacilityLevelService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  async loadData() {
    let query = {
      ...this.paginationParams,
      ...DEFAULT_SEARCH_PARAMS,
      sort: 'id,asc',
    };

    if (this.searchTerm && this.searchTerm.length > 0) {
      query['name'] = this.searchTerm;
      query['code'] = this.searchTerm;
    }

    const [response, levelGroupsResponse] = await Promise.all([
      lastValueFrom(this.service.get({ ...query, size: this.pageSize })),
      lastValueFrom(this.service.getFacilityLevelGroups()),
    ]);

    const { page, size, total, data } = response;
    const levelGroups = levelGroupsResponse.data;

    this.paginationParams = {
      page: page - 1,
      size,
    };

    // Map level group name to each item based on levelGroupId
    this.items = data.map((item) => ({
      ...item,
      levelGroupName:
        levelGroups.find((group) => group.id === item.facilityLevelGroupId)
          ?.name || 'Unknown',
    }));

    this.dataLength = total;
  }

  handleClose(result: boolean): void {
    this.service.clearForm();
    this.isOpen = false;
  }

  openConfirmDialog(data: any) {
    this.selectedItem = data;
    this.isDialogOpen = true;
  }

  handleSearch(query: string): void {
    this.searchTerm = query;
    this.page = 0;
    this.paginationParams.page = 0;
    this.loadData();
  }

  async closeConfirmDialog(event: any) {
    await lastValueFrom(this.service.delete(this.selectedItem.uuid));
    this.isDialogOpen = false;
    this.selectedItem = null;
    await this.loadData();
  }

  async saveData(data: FacilityLevel) {
    try {
      let response: ApiResponse;
      if (data.uuid) {
        await lastValueFrom(this.service.update(data.uuid, data));
      } else {
        response = await lastValueFrom(this.service.create(data));
        data.uuid = response.data.uuid;
      }

      if (data.services && data.services.length > 0) {
        const serviceIds = data.services.map((service: any) =>
          typeof service === 'string' ? service : service.id,
        );
        await lastValueFrom(
          this.service.assignServicesToFacilityLevel(data.uuid, serviceIds),
        );
      }

      this.isOpen = false;
      await this.loadData();
    } catch (error) {
      console.log(error);
    }
  }

  async openDialog(data?: any) {
    this.selectedItem = data;
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
    this.pageSize = event.size;
    await this.loadData();
  }
}
