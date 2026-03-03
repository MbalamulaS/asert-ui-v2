import { Component, OnInit } from '@angular/core';
import { TableComponent } from 'components/table/table.component';
import { MatIconModule } from '@angular/material/icon';
import { provideIcons } from '@ng-icons/core';
import {
  heroPencilSquare,
  heroTrash,
  heroMagnifyingGlass,
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
import { ApiKey, ApiKeyService, ApiKeyApproveDto } from './api-key.service';
import { ApiKeyFormComponent } from './forms/api-key.form.component';

@Component({
  selector: 'app-',
  standalone: true,
  viewProviders: [
    provideIcons({ heroPencilSquare, heroTrash, heroMagnifyingGlass }),
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
    ContainerComponent,
    ApiKeyFormComponent,
  ],
  template: `
    <container>
      <app-header title="ApiKeys Management" />
      <app-wrapper>
        <app-search
          class="w-full md:w-auto"
          (onSearch)="handleSearch($event)"
        />
        <action-button
          label="ADD NEW"
          class="w-full md:w-auto"
          icon="add"
          [isDisabled]="'' | cant: 'create' : 'ApiKey'"
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
            [isDisabled]="'' | cant: 'update' : 'ApiKey'"
            icon="launch"
            tooltip="Edit ApiKey"
            (action)="openDialog(item)"
            color="primary"
          />

          <icon-button
            [isDisabled]="
              item.isRetired || ('' | cant: 'changeStatus' : 'ApiKey')
            "
            [icon]="getApproveToggleButtonConfig(item).approveIcon"
            [tooltip]="getApproveToggleButtonConfig(item).approveTooltip"
            [color]="getApproveToggleButtonConfig(item).approveColor"
            (action)="openConfirmDialog(item)"
          />

          <icon-button
            [isDisabled]="
              item.isRetired || ('' | cant: 'changeStatus' : 'ApiKey')
            "
            [icon]="getRetireToggleButtonConfig(item).retireIcon"
            [tooltip]="getRetireToggleButtonConfig(item).retireTooltip"
            [color]="getRetireToggleButtonConfig(item).retireColor"
            (action)="openRetireDialog(item)"
          />
        </ng-template>
      </app-table>

      <app-dialog
        [open]="isOpen"
        (onClose)="handleClose($event)"
        width="880px"
        title="{{ title }} ApiKey"
      >
        <ng-template>
          <api-key-form (onSubmit)="saveData($event)" />
        </ng-template>
      </app-dialog>

      <app-confirm-dialog
        [open]="isApproveOpen"
        [title]="dialogTitle"
        [message]="dialogMessage"
        (onClose)="closeConfirmDialog($event)"
        (onConfirm)="handleApproveChangeStatus('approve')"
      ></app-confirm-dialog>

      <app-confirm-dialog
        [open]="isRetireOpen"
        [title]="dialogTitle"
        [message]="dialogMessage"
        (onClose)="closeRetireDialog($event)"
        (onConfirm)="handleApproveChangeStatus('retire')"
      />
    </container>
  `,
})
export class ApiKeyComponent implements OnInit {
  isOpen = false;
  isApproveOpen = false;
  isRetireOpen = false;
  data: Array<ApiKey> = [];
  title: string = '';
  selectedIem!: ApiKey;
  searchTerm: string = '';

  dialogTitle: string = '';
  dialogMessage: string = '';
  selectedItem: any = null;

  paginationParams: any = {
    page: 0,
    size: 10,
  };

  dataLength = 0;
  pageSize = 10;
  page = 0;

  constructor(public service: ApiKeyService) {}

  columns = [
    { label: 'System Name', value: 'systemName' },
    { label: 'System IP', value: 'systemIp' },
    { label: 'Status', value: 'status' },
    { label: 'Contact Email', value: 'contactEmail' },
    { label: 'Expiry Date', value: 'expiryDate' },
    { label: 'Api Key', value: 'apiKey' },
  ];

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
      query['systemName'] = this.searchTerm;
    }

    const response = await lastValueFrom(
      this.service.get({ ...query, size: this.pageSize }),
    );

    const { page, size, total, data } = response;

    this.paginationParams = {
      page: page - 1,
      size,
    };

    this.data = response.data;
    this.dataLength = total;
  }

  handleSearch(query: string): void {
    this.searchTerm = query;
    this.page = 0;
    this.paginationParams.page = 0;
    this.fetchData();
  }

  async getPaginatedData(event: { page: number; size: number }) {
    this.paginationParams.page = event.page;
    this.paginationParams.size = event.size;
    this.pageSize = event.size;
    await this.fetchData();
  }

  handleClose(result: boolean): void {
    this.service.clearForm();
    this.isOpen = false;
  }

  openConfirmDialog(item: any) {
    this.selectedItem = item;

    if (item.isApproved) {
      this.dialogTitle = 'Disapprove ApiKey';
      this.dialogMessage = 'Are you sure you want to disapprove this ApiKey?';
    } else {
      this.dialogTitle = 'Approve ApiKey';
      this.dialogMessage = 'Are you sure you want to approve this ApiKey?';
    }

    this.isApproveOpen = true;
  }

  openRetireDialog(item: any) {
    this.selectedItem = item;

    if (!item.isRetired) {
      this.dialogTitle = 'Retire ApiKey';
      this.dialogMessage = 'Are you sure you want to retire this ApiKey?';
    }

    this.isRetireOpen = true;
  }

  closeConfirmDialog(event: any) {
    this.isApproveOpen = false;
  }

  closeRetireDialog(event: any) {
    this.isRetireOpen = false;
  }

  onEdit(element: any) {
    console.log('Edit element:', element);
  }

  onRefresh(element: any) {
    console.log('Refresh element:', element);
  }

  onDelete(element: any) {
    console.log('Delete element:', element);
  }

  openDialog(data?: any) {
    this.isOpen = true;
    if (data && data.id) {
      this.title = 'Update';
      this.service.populateForm(data);
    } else {
      this.title = 'Create';
      this.service.clearForm();
    }
  }

  async handleApproveChangeStatus(action: 'approve' | 'retire') {
    const approveDto: ApiKeyApproveDto = {
      apiKeyUuid: this.selectedItem.uuid, // UUID of the selected API key
      isRetired: this.selectedItem.isRetired, // Current value of isRetired
      isApproved: this.selectedItem.isApproved, // Current value of isApproved
    };

    // Toggle only the respective property based on the action
    if (action === 'approve') {
      approveDto.isApproved = !this.selectedItem.isApproved;
    } else if (action === 'retire') {
      approveDto.isRetired = !this.selectedItem.isRetired;
    }

    // Ensure that if we toggle 'retire', the 'isApproved' value stays intact
    if (action === 'retire' && approveDto.isApproved === null) {
      approveDto.isApproved = this.selectedItem.isApproved;
    }

    console.log('APPROVE DTO', approveDto);

    // Call the service to change the status
    await lastValueFrom(this.service.changeStatus(approveDto));

    // Reset pagination and fetch data
    this.page = 0;
    this.paginationParams.page = 0;
    this.fetchData();

    // Close the relevant dialogs based on the action
    if (action === 'approve') {
      this.isApproveOpen = false;
    } else if (action === 'retire') {
      this.isRetireOpen = false;
    }
  }

  getApproveToggleButtonConfig(item: any) {
    return {
      approveIcon: item.isApproved ? 'toggle_on' : 'toggle_off',
      approveTooltip: item.isApproved ? 'Disapprove ApiKey' : 'Approve ApiKey',
      approveColor: item.isApproved ? 'primary' : 'secondary',
    };
  }

  getRetireToggleButtonConfig(item: any) {
    return {
      retireIcon: item.isRetired ? 'toggle_on' : 'toggle_off',
      retireTooltip: item.isRetired ? 'ApiKey Retired' : 'Retire ApiKey',
      retireColor: item.isRetired ? 'secondary' : 'warn',
    };
  }

  async saveData(data: any) {
    const payload = {
      ...data,
    };

    const { uuid } = data;
    try {
      if (data.uuid) {
        await lastValueFrom(this.service.update(uuid, payload));
      } else {
        await lastValueFrom(this.service.create(payload));
      }
      this.isOpen = false;
      await this.fetchData();
    } catch (error) {
      // Handle error
      console.log(error);
    }
  }
}
