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
import { FacilityLevel } from 'modules/setup/facility-level/facility-level';
import { FacilityFundSource } from './facility-fund-sources';
import { FacilityFundSourcesService } from './facility-fund-sources.service';
import { FacilityFundSourcesFormComponent } from './form/facility-fund-sources-form.component';
import { ContainerComponent } from 'components/container/container.component';
import { WrapperComponent } from 'components/wrapper/wrapper.component';
import { ActionButtonComponent } from 'components/action-button/action-button.component';
import { IconButtonComponent } from 'components/icon-button/icon-button.component';

@Component({
  selector: 'app-facility-fund-sources',
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
    FacilityFundSourcesFormComponent,
    ContainerComponent,
    WrapperComponent,
    ActionButtonComponent,
    IconButtonComponent,
  ],
  template: `
    <container>
      <app-header title="Manage Facility Fund Sources" />
      <app-wrapper>
        <app-search
          class="w-full md:w-auto"
          (onSearch)="handleSearch($event)"
        />
        <action-button
          label="ADD NEW"
          class="w-full md:w-auto"
          icon="add"
          [isDisabled]="'' | cant: 'create' : 'FacilityFundSource'"
          (action)="openDialog()"
        />
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
            [isDisabled]="'' | cant: 'update' : 'FacilityFundSource'"
            icon="launch"
            tooltip="Edit Fund Source"
            (action)="openDialog(item)"
            color="primary"
          />

          <icon-button
            [isDisabled]="'' | cant: 'delete' : 'FacilityFundSource'"
            icon="delete_outline"
            tooltip="Delete Fund Source"
            color="accent"
            (action)="openConfirmDialog(item)"
          />
        </ng-template>
      </app-table>

      <app-dialog
        [open]="isOpen"
        (onClose)="handleClose($event)"
        width="740px"
        title="{{ title }} Facility Fund Sources"
      >
        <ng-template>
          <app-facility-fund-sources-form (onSubmit)="saveData($event)" />
        </ng-template>
      </app-dialog>
      <app-confirm-dialog
        [open]="isDialogOpen"
        [title]="'Delete Facility Level'"
        [message]="'Are you sure you want to delete this facility level?'"
        (onClose)="closeConfirmDialog($event)"
        (onConfirm)="handleConfirm()"
      />
    </container>
  `,
})
export class FacilityFundSourcesComponent implements OnInit {
  isOpen = false;
  isDialogOpen = false;
  data: FacilityFundSource[] = [];
  selectedIem!: FacilityFundSource;
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
  ];

  constructor(
    public service: FacilityFundSourcesService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  async handleConfirm() {
    await lastValueFrom(this.service.delete(this.selectedIem.uuid));
    this.page = 0;
    this.paginationParams.page = 0;
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
    this.page = 0;
    this.paginationParams.page = 0;
    this.loadData();
  }

  closeConfirmDialog(event: any) {
    this.isDialogOpen = false;
  }

  async saveData(data: FacilityLevel) {
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
