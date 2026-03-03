import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { provideIcons } from '@ng-icons/core';
import {
  heroMagnifyingGlass,
  heroPencilSquare,
  heroTrash,
} from '@ng-icons/heroicons/outline';
import { ConfirmDialogComponent } from 'components/confirm/confirm.dialog';
import { ContainerComponent } from 'components/container/container.component';
import { DialogComponent } from 'components/dialog/dialog.component';
import { HeaderComponent } from 'components/header/header.component';
import { IconButtonComponent } from 'components/icon-button/icon-button.component';
import { SearchComponent } from 'components/search/search.component';
import { TableComponent } from 'components/table/table.component';
import { WrapperComponent } from 'components/wrapper/wrapper.component';
import { lastValueFrom } from 'rxjs';
import { DEFAULT_SEARCH_PARAMS } from 'utils/helpers';
import { BillService } from './bill.service';
import { Bill } from './types';
import { BillWsService } from 'app/ws/services/bill-ws-service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-bills',
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
    WrapperComponent,
    IconButtonComponent,
    ContainerComponent,
  ],
  template: `
    <container>
      <app-header title="Bill Management" />
      <app-wrapper>
        <app-search
          class="w-full md:w-auto"
          (onSearch)="handleSearch($event)"
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
            [isDisabled]="hasControlNumber(item)"
            icon="sync"
            tooltip="Request Control Number"
            (action)="openControlNumberDialog(item)"
            color="primary"
          />
        </ng-template>
      </app-table>

      <app-dialog
        [open]="isOpen"
        (onClose)="handleClose()"
        width="880px"
        title="{{ title }} Bill"
      >
        <ng-template>
          <h2>Bill</h2>
        </ng-template>
      </app-dialog>

      <app-confirm-dialog
        [open]="isControlNumberDialogOpen"
        [title]="'Request Control Number'"
        [message]="
          'Are you sure you want to request control number for this bill?'
        "
        (onClose)="closeControlNumberDialog()"
        (onConfirm)="handleRequestControlNumber()"
      />
    </container>
  `,
})
export class BillComponent implements OnInit {
  isOpen = false;
  isDialogOpen = false;
  data: Array<Bill> = [];
  title: string = '';
  selectedIem!: Bill;
  isControlNumberDialogOpen = false;

  searchTerm: string = '';

  paginationParams: any = {
    page: 0,
    size: 10,
  };

  dataLength = 0;
  pageSize = 10;
  page = 0;

  constructor(
    public service: BillService,
    private billWebSocketService: BillWsService,
  ) {}

  columns = [
    { label: 'BillID', value: 'uuid' },
    { label: 'Date Generated', value: 'generationDate' },
    { label: 'Status', value: 'status' },
    { label: 'Billed Amt', value: 'billedAmount' },
    { label: 'Paid Amt', value: 'paidAmount' },
    { label: 'Currency', value: 'currency' },
    { label: 'Description', value: 'description' },
    { label: 'Control #', value: 'controlNumber' },
    { label: 'Control # Request Status', value: 'controlNumberStatus' },
  ];

  ngOnInit(): void {
    this.fetData();

    this.billWebSocketService.getBillUpdates().subscribe({
      next: this.successWebSocket.bind(this),
      error: this.errorWebSocket.bind(this),
    });
  }

  successWebSocket(bill: Bill): void {
    console.log('received', bill);
    const index = this.data.findIndex((b) => b.id === bill.id);
    if (index !== -1) {
      this.data = [
        ...this.data.slice(0, index),
        bill,
        ...this.data.slice(index + 1),
      ];
      this.dataLength = this.data.length;
    } else {
      console.log('it is -1');
      this.data = [bill, ...this.data];
      this.dataLength = this.data.length;
    }
  }

  errorWebSocket(error: HttpErrorResponse): void {
    console.log('Websocket error', error);
  }

  async fetData() {
    let query = {
      ...this.paginationParams,
      ...DEFAULT_SEARCH_PARAMS,
      sort: 'id,desc',
    };

    if (this.searchTerm && this.searchTerm.length > 0) {
      query['spCode'] = this.searchTerm;
      query['receiptNumber'] = this.searchTerm;
      query['generationDate'] = this.searchTerm;
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

  openDialog(data: any) {
    this.title = data ? 'Edit' : 'Create';
  }

  handleClose() {
    this.isOpen = false;
  }

  handleConfirm() {}

  handleSearch(query: string): void {
    this.searchTerm = query;
    this.page = 0;
    this.paginationParams.page = 0;
    this.fetData();
  }

  async getPaginatedData(event: { page: number; size: number }) {
    this.paginationParams.page = event.page;
    this.paginationParams.size = event.size;
    this.pageSize = event.size;
    await this.fetData();
  }

  openConfirmDialog(data: any) {
    this.selectedIem = data;
  }

  openControlNumberDialog(data: any) {
    this.selectedIem = data;
    this.isControlNumberDialogOpen = true;
  }

  hasControlNumber(item: any) {
    return item.controlNumber !== '' && item.controlNumber !== null;
  }

  async handleRequestControlNumber() {
    console.log('Requesting control number for:', this.selectedIem);
    const response = await lastValueFrom(
      this.service.requestControlNumber(this.selectedIem.uuid, {
        currency: 'TZS',
      }),
    );

    if (response.status === 200) {
      this.isControlNumberDialogOpen = false;
    }
  }

  closeControlNumberDialog() {
    this.isControlNumberDialogOpen = false;
  }

  closeConfirmDialog() {
    this.isDialogOpen = false;
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
}
