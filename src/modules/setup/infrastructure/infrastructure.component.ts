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
import { WrapperComponent } from 'components/wrapper/wrapper.component';
import { ActionButtonComponent } from 'components/action-button/action-button.component';
import { IconButtonComponent } from 'components/icon-button/icon-button.component';
import { ContainerComponent } from 'components/container/container.component';
import { InfrastructureService } from 'modules/setup/infrastructure/infrastructure.service';
import { Infrastructure } from 'modules/setup/infrastructure/infrastructure';
import { FormComponent } from 'modules/setup/infrastructure/forms/form.component';

@Component({
  selector: 'app-infrastructure',
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
    WrapperComponent,
    ActionButtonComponent,
    IconButtonComponent,
    FormComponent,
    ContainerComponent,
    FormComponent,
  ],
  template: `
    <container>
      <app-header title="Manage Infrastructure" />
      <app-wrapper>
        <app-search
          class="w-full md:w-auto"
          (onSearch)="handleSearch($event)"
        />
        <action-button
          label="ADD NEW"
          class="w-full md:w-auto"
          icon="add"
          [isDisabled]="'' | cant: 'create' : 'Infrastructure'"
          (action)="openDialog()"
        />
      </app-wrapper>
      <app-table
        [data]="roles"
        [columns]="columns"
        [dataLength]="dataLength"
        [tableClass]="'min-w-full bg-white rounded-lg shadow-lg'"
        (handePagination)="getPaginatedData($event)"
        [pageSize]="pageSize"
        [page]="page"
      >
        <ng-template #actionTemplate let-item>
          <icon-button
            [isDisabled]="'' | cant: 'update' : 'Infrastructure'"
            icon="launch"
            tooltip="Edit Infrastructure"
            (action)="openDialog(item)"
            color="primary"
          />

          <icon-button
            [isDisabled]="'' | cant: 'delete' : 'Infrastructure'"
            icon="delete_outline"
            tooltip="Delete Infrastructure"
            color="accent"
            (action)="openConfirmDialog(item)"
          />
        </ng-template>
      </app-table>

      <app-dialog
        [open]="isOpen"
        (onClose)="handleClose($event)"
        width="740px"
        title="{{ title }} Infrastructure"
      >
        <ng-template>
          <app-infrastructure-form (onSubmit)="saveData($event)" />
        </ng-template>
      </app-dialog>

      <app-confirm-dialog
        [open]="isDialogOpen"
        [title]="'Delete Infrastructure'"
        [message]="'Are you sure you want to delete this Infrastructure?'"
        (onClose)="closeConfirmDialog($event)"
        (onConfirm)="handleConfirm()"
      />
    </container>
  `,
})
export class InfrastructureComponent implements OnInit {
  isOpen = false;
  isDialogOpen = false;
  roles: Infrastructure[] = [];
  selectedIem!: Infrastructure;
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
    { label: 'Category', value: 'infrastructureCategoryName' },
  ];

  constructor(public service: InfrastructureService) {}

  ngOnInit(): void {
    this.fetchData();
  }

  async fetchData() {
    let query = {
      ...this.paginationParams,
      ...DEFAULT_SEARCH_PARAMS,
      sort: 'id,asc',
    };

    if (this.searchTerm && this.searchTerm.length > 0) {
      query['name'] = this.searchTerm;
    }

    const response = await lastValueFrom(
      this.service.get({ ...query, size: this.pageSize }),
    );

    const { page, size, total, data } = response;

    this.paginationParams = {
      page: page - 1,
      size,
    };

    this.roles = data;
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
    this.fetchData();
  }

  closeConfirmDialog(event: any) {
    console.log('closeConfirmDialog', event);
    this.isDialogOpen = false;
  }

  async handleConfirm() {
    await lastValueFrom(this.service.delete(this.selectedIem.uuid));
    this.page = 0;
    this.paginationParams.page = 0;
    this.fetchData();
  }

  async saveData(data: any) {
    try {
      if (data.uuid) {
        await lastValueFrom(this.service.update(data.uuid, data));
      } else {
        await lastValueFrom(this.service.create(data));
      }
      this.isOpen = false;
      await this.fetchData();
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
    await this.fetchData();
  }
}
