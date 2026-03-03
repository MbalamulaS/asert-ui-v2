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
import { CantPipe } from 'pipes/cant.pipe';
import { lastValueFrom } from 'rxjs';
import { DEFAULT_SEARCH_PARAMS } from 'utils/helpers';
import { Router } from '@angular/router';
import { WrapperComponent } from 'components/wrapper/wrapper.component';
import { ActionButtonComponent } from 'components/action-button/action-button.component';
import { IconButtonComponent } from 'components/icon-button/icon-button.component';
import { ContainerComponent } from 'components/container/container.component';
import { Reservation } from './reservation';
import { ReservationService } from './reservation.service';
import { FormComponent } from "./forms/form.component";
import { FormComponent as VisitorFormComponent } from '../visitor/forms/form.component';
import { VisitorService } from '../visitor/visitor.service';


@Component({
  selector: 'app-reservation',
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
    CantPipe,
    WrapperComponent,
    ActionButtonComponent,
    IconButtonComponent,
    ContainerComponent,
    FormComponent,
    VisitorFormComponent,
  ],
  template: `
    <container>
      <app-header title="Manage Reservations" />
      <app-wrapper>
        <app-search
          class="w-full md:w-auto"
          (onSearch)="handleSearch($event)"
        />
        <action-button
          label="GUEST CHECK IN"
          class="w-full md:w-auto"
          icon="add"
          [isDisabled]="'' | cant : 'create' : 'Reservation'"
          (action)="openDialog()"
        />
      </app-wrapper>
      <app-table
        [data]="listData"
        [columns]="columns"
        [dataLength]="dataLength"
        [tableClass]="'min-w-full bg-white rounded-lg shadow-lg'"
        (handePagination)="getPaginatedData($event)"
        [pageSize]="pageSize"
        [page]="page"
      >
        <ng-template #actionTemplate let-item>
          <icon-button
            [isDisabled]="'' | cant : 'update' : 'Reservation'"
            icon="preview"
            tooltip="View Reservation"
            (action)="viewReservation(item.uuid)"
            color="primary"
          />
        </ng-template>
      </app-table>

      <app-dialog
        [open]="isOpen"
        (onClose)="handleClose($event)"
        width="740px"
        title="{{ title }}"
      >
        <ng-template>
          <app-reservation-form (onSubmit)="saveData($event)" />
        </ng-template>
      </app-dialog>
      <app-dialog
        [open]="isVisitorOpen"
        (onClose)="handleClose($event)"
        width="740px"
        title="{{ title }}"
      >
        <ng-template>
          <app-visitor-form (onSubmit)="saveVisitorData($event)" />
        </ng-template>
      </app-dialog>
    </container>
  `,
})
export class ReservationComponent implements OnInit {
  isOpen = false;
  isDialogOpen = false;
  isVisitorOpen = false;
  listData: Reservation[] = [];
  selectedItem!: Reservation;
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
    { label: 'Service code', value: 'reservationCode' },
    { label: 'Hotel', value: 'hotelName' },
    { label: 'Room type', value: 'roomTypeName' },
    { label: 'Room number', value: 'roomNumber' },
    { label: 'Visitors', value: 'countVisitors' },
    { label: 'Checked out', value: 'checkedoutStatus' },
    {
      label: 'Check in date',
      value: 'checkInDate',
    },
    { label: 'Check out date', value: 'checkOutDate' },
  ];

  constructor(public service: ReservationService,public vistorService:VisitorService, private router: Router) {}

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
      query['hotelId'] = this.searchTerm;
      query['roomNumber'] = this.searchTerm;
    }

    const response = await lastValueFrom(
      this.service.get({ ...query, size: this.pageSize })
    );

    const { page, size, total, data } = response;

    this.paginationParams = {
      page: page - 1, // Adjust for zero-indexed page
      size,
    };

    this.listData = this.mapData(data);
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
    this.fetchData();
  }

  async saveData(data: any) {
    try {
      if (data === 'openVisitor') {
        this.isOpen = false;
        this.title = 'Create Visitor';
        this.isVisitorOpen = true;
      }
      if (data.uuid) {
        await lastValueFrom(this.service.update(data.uuid, data));
      } else {
        await lastValueFrom(this.service.create(data));
      }
      this.isOpen = false;
      await this.fetchData();
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
      this.title = 'Guest Check in';
      this.service.clearForm();
    }
  }

  async getPaginatedData(event: { page: number; size: number }) {
    this.paginationParams.page = event.page;
    this.paginationParams.size = event.size;
    this.pageSize = event.size;
    await this.fetchData();
  }

  mapData = (data: any) => {
    return data.map((item: any) => ({
      ...item,
      countVisitors: item.visitors.length > 0 ? item.visitors.length : 0,
      checkedoutStatus: item.isCheckedOut ? 'Yes' : 'No',
    }));
  };

  viewReservation(uuid: string): void {
    this.router.navigate(['/manage-reservations/view'], {
      queryParams: { uuid },
    });
  }

  async saveVisitorData(data: any) {
    try {
      await lastValueFrom(this.vistorService.create(data));
      this.isVisitorOpen = false;
      await this.fetchData();
    } catch (error) {
      // Handle error
      console.log(error);
    }
  }
}
