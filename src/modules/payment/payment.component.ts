import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { provideIcons } from '@ng-icons/core';
import {
  heroMagnifyingGlass,
  heroPencilSquare,
  heroTrash,
} from '@ng-icons/heroicons/outline';
import { PaymentWsService } from 'app/ws/services/payment-ws-service';
import { ConfirmDialogComponent } from 'components/confirm/confirm.dialog';
import { ContainerComponent } from 'components/container/container.component';
import { DialogComponent } from 'components/dialog/dialog.component';
import { HeaderComponent } from 'components/header/header.component';
import { IconButtonComponent } from 'components/icon-button/icon-button.component';
import { SearchComponent } from 'components/search/search.component';
import { TableComponent } from 'components/table/table.component';
import { WrapperComponent } from 'components/wrapper/wrapper.component';
import { CantPipe } from 'pipes/cant.pipe';
import { lastValueFrom } from 'rxjs';
import { DEFAULT_SEARCH_PARAMS } from 'utils/helpers';
import { PaymentService } from './payment.service';
import { Payment } from './types';
import { HttpErrorResponse } from '@angular/common/http';
import { dateFormat } from 'utils/date.helpers';

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
    CantPipe,
    WrapperComponent,
    IconButtonComponent,
    ContainerComponent,
  ],
  template: `
    <container>
      <app-header title="Payment Management" />
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
            [isDisabled]="'' | cant: 'update' : 'Payment'"
            icon="launch"
            tooltip="Edit Payment"
            (action)="openDialog(item)"
            color="primary"
          />

          <icon-button
            [isDisabled]="'' | cant: 'delete' : 'Payment'"
            icon="delete_outline"
            tooltip="Delete Payment"
            color="accent"
            (action)="openConfirmDialog(item)"
          />
        </ng-template>
      </app-table>

      <app-dialog
        [open]="isOpen"
        (onClose)="handleClose()"
        width="880px"
        title="{{ title }} Payment"
      >
        <ng-template>
          <h2>Bill</h2>
        </ng-template>
      </app-dialog>

      <app-confirm-dialog
        [open]="isDialogOpen"
        [title]="'Delete Payment'"
        [message]="'Are you sure you want to delete this payment?'"
        (onClose)="closeConfirmDialog()"
        (onConfirm)="handleConfirm()"
      />
    </container>
  `,
})
export class PaymentComponent implements OnInit {
  isOpen = false;
  isDialogOpen = false;
  data: Array<Payment> = [];
  title: string = '';
  selectedIem!: Payment;

  searchTerm: string = '';

  paginationParams: any = {
    page: 0,
    size: 10,
  };

  dataLength = 0;
  pageSize = 10;
  page = 0;

  constructor(
    public service: PaymentService,
    private paymentWebSocketService: PaymentWsService,
  ) {}

  columns = [
    { label: 'Date', value: 'datePaid' },
    { label: 'Amount', value: 'amount' },
    { label: 'Receipt Number', value: 'receiptNumber' },
    { label: 'SP Code', value: 'spCode' },
    { label: 'Description', value: 'description' },
  ];

  ngOnInit(): void {
    this.fetData();

    this.paymentWebSocketService.getPaymentUpdates().subscribe({
      next: this.paymentWebSocketSuccess.bind(this),
      error: this.paymentWebSocketError.bind(this),
    });
  }

  paymentWebSocketSuccess(payment: Payment): void {
    const index = this.data.findIndex((p) => p.id === payment.id);
    if (index !== -1) {
      this.data = [
        ...this.data.slice(0, index),
        payment,
        ...this.data.slice(index + 1),
      ];
      this.data = this.data.map((item: Payment) => ({
        ...item,
        datePaid: dateFormat(new Date(item.datePaid)),
      }));
      this.dataLength = this.data.length;
    } else {
      this.data = [payment, ...this.data];

      this.data = this.data.map((item: Payment) => ({
        ...item,
        datePaid: dateFormat(new Date(item.datePaid)),
      }));

      this.dataLength = this.data.length;
    }
  }

  paymentWebSocketError(error: HttpErrorResponse): void {
    console.log('Websocket error', error);
  }

  // if we were to send back payments via websockets
  sendPayment() {
    const payment: Payment = {
      id: 1,
      uuid: 'some-uuid',
      amount: 1000.0,
      receiptNumber: '12345',
      isFullAmount: true,
      paymentChannel: 'TestChannel',
      spCode: '1010',
      datePaid: '2024-01-02',
      description: 'Malipo',
    };

    this.paymentWebSocketService.sendPayment(payment);
  }

  async fetData() {
    let query = {
      ...this.paginationParams,
      ...DEFAULT_SEARCH_PARAMS,
      sort: 'id,desc',
    };

    if (this.searchTerm && this.searchTerm.length > 0) {
      query['firstName'] = this.searchTerm;
      query['lastName'] = this.searchTerm;
      query['email'] = this.searchTerm;
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
    this.data = this.data.map((item: Payment) => ({
      ...item,
      datePaid: dateFormat(new Date(item.datePaid)),
    }));
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
