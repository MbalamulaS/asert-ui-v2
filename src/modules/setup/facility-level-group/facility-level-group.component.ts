import { Component, OnInit } from '@angular/core';
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
import { Router } from '@angular/router';
import { FacilityLevelGroupService as FacilityLevelGroupService } from 'modules/setup/facility-level-group/facility-level-group.service';
import { ActionButtonComponent } from 'components/action-button/action-button.component';
import { IconButtonComponent } from 'components/icon-button/icon-button.component';
import { ContainerComponent } from 'components/container/container.component';
import { FacilityLevelGroup as FacilityLevelGroup } from './facility-level-group';
import { FormComponent } from 'modules/setup/facility-level-group/forms/form.component';

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
    TableComponent,
    MatIconModule,
    DialogComponent,
    HeaderComponent,
    SearchComponent,
    ConfirmDialogComponent,
    CantPipe,
    ActionButtonComponent,
    IconButtonComponent,
    ContainerComponent,
    FormComponent,
  ],
  template: `
    <container>
      <app-header title="Manage Facility Level Groups" />
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
        [tableClass]="'min-w-full bg-white rounded-lg shadow-lg justify-end'"
        (handePagination)="getPaginatedData($event)"
        [pageSize]="pageSize"
        [page]="page"
      >
        <ng-template #actionTemplate let-item>
          <div class="flex flex-row gap-1">
            <icon-button
              [isDisabled]="'' | cant: 'update' : 'FacilityLevelGroup'"
              icon="launch"
              tooltip="Edit Facility Level Group"
              (action)="openDialog(item)"
              color="primary"
            />

            <icon-button
              [isDisabled]="'' | cant: 'delete' : 'FacilityLevelGroup'"
              icon="delete_outline"
              tooltip="Delete Facility Level Group"
              color="accent"
              (action)="openConfirmDialog(item)"
            />
          </div>
        </ng-template>
      </app-table>

      <app-dialog
        [open]="isOpen"
        (onClose)="handleClose($event)"
        width="740px"
        title="{{ title }} Facility Level"
      >
        <ng-template>
          <app-facility-level-group-form (onSubmit)="saveData($event)" />
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
export class FacilityLevelGroupComponent implements OnInit {
  isOpen = false;
  isDialogOpen = false;
  items: FacilityLevelGroup[] = [];
  selectedIem!: FacilityLevelGroup;
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
    { label: 'S/N', value: 'id' },
    { label: 'Name', value: 'name' },
    { label: 'Code', value: 'code' },
  ];

  constructor(
    public service: FacilityLevelGroupService,
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

    const response = await lastValueFrom(
      this.service.get({ ...query, size: this.pageSize }),
    );

    const { page, size, total, data } = response;

    this.paginationParams = {
      page: page - 1,
      size,
    };

    this.items = data;
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
    this.page = 0;
    this.paginationParams.page = 0;
    this.loadData();
  }

  async closeConfirmDialog(event: any) {
    await lastValueFrom(this.service.delete(this.selectedIem.uuid));
    await this.loadData();
    this.isDialogOpen = false;
  }

  async saveData(data: FacilityLevelGroup) {
    try {
      if (data.uuid) {
        await lastValueFrom(this.service.update(data.uuid, data));
      } else {
        await lastValueFrom(this.service.create(data));
      }
      this.isOpen = false;
      await this.loadData();
    } catch (error) {
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
    this.pageSize = event.size;
    await this.loadData();
  }
}
