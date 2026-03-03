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
import { ConfirmDialogComponent } from 'components/confirm/confirm.dialog';
import { lastValueFrom } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { WrapperComponent } from 'components/wrapper/wrapper.component';
import { ActionButtonComponent } from 'components/action-button/action-button.component';
import { IconButtonComponent } from 'components/icon-button/icon-button.component';
import { ContainerComponent } from 'components/container/container.component';
import { Reservation } from './reservation';
import { ReservationService } from './reservation.service';
import { ReportIncidentFormComponent } from "./forms/report-incident-form.component";
import { FormComponent } from "./forms/form.component";
import { Location } from '@angular/common';
import { Visitor } from 'typescript';
import { IncidentReportService } from './incident-report.service';
import { ViewIncidentReportFormComponent } from "./forms/view-incident-report.component";


@Component({
  selector: 'app-reservation-view',
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
    WrapperComponent,
    ActionButtonComponent,
    IconButtonComponent,
    ContainerComponent,
    ReportIncidentFormComponent,
    FormComponent,
    ViewIncidentReportFormComponent,
    ConfirmDialogComponent,
  ],
  template: `
    <container>
      <app-header title="Reservation detail" />
      @if (reservation) {
      <app-wrapper>
        <action-button
          label="GUEST CHECK OUT"
          class="w-full md:w-auto"
          icon="remove"
          [isDisabled]="reservation.isCheckedOut"
          (action)="openConfirmDialog()"
        />
        <action-button
          label="BACK"
          icon="undo"
          iconPosition="start"
          [isDisabled]="false"
          (action)="navigateBack()"
        />
      </app-wrapper>
      <div class="border border-gray-300 rounded-md mb-4 p-4">
        <div class="grid md:grid-cols-6 grid-cols-1 gap-x-4 gap-y-2">
          <div class="p-3">
            <label for="" class="text-gray-500">Service code</label>
            <div class="mt-2">{{ reservation.reservationCode }}</div>
          </div>
          <div class="p-3">
            <label for="" class="text-gray-500">Hotel</label>
            <div class="mt-2">{{ reservation.hotelName }}</div>
          </div>
          <div class="p-3">
            <label for="" class="text-gray-500">Room Type</label>
            <div class="mt-2">{{ reservation.roomTypeName }}</div>
          </div>
          <div class="p-3">
            <label for="" class="text-gray-500">Room Number</label>
            <div class="mt-2">{{ reservation.roomNumber }}</div>
          </div>
          <div class="p-3">
            <label for="" class="text-gray-500">Check in date</label>
            <div class="mt-2">{{ reservation.checkInDate }}</div>
          </div>
          <div class="p-3">
            <label for="" class="text-gray-500">Check out date</label>
            <div class="mt-2">{{ reservation.checkOutDate }}</div>
          </div>
        </div>
      </div>
      }
      <app-table
        [data]="listData"
        [columns]="columns"
        [dataLength]="dataLength"
        [tableClass]="'min-w-full bg-white rounded-lg shadow-lg'"
        [pageSize]="pageSize"
        [page]="page"
        [showPagination]="false"
      >
        <ng-template #actionTemplate let-item>
          <icon-button
            [isDisabled]=""
            icon="error_utline"
            tooltip="View Incident Report"
            (action)="openViewIncidentDialog(item)"
            color="primary"
          />

          <icon-button
            [isDisabled]="reservation.isCheckedOut"
            icon="warning_amber"
            tooltip="Report Incident"
            color="accent"
            (action)="openIncidentDialog(item)"
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
        [open]="isIncidentOpen"
        (onClose)="handleClose($event)"
        width="740px"
        title="{{ title }}"
      >
        <ng-template>
          <app-report-incident-form
            (onSubmitIncident)="saveIncidentData($event)"
          />
        </ng-template>
      </app-dialog>
      <app-dialog
        [open]="isReportOpen"
        (onClose)="handleClose($event)"
        width="740px"
        title="{{ title }}"
      >
        <ng-template>
          <app-view-incident-report />
        </ng-template>
      </app-dialog>
      <app-confirm-dialog
        [open]="isDialogOpen"
        [title]="'Checking out guest'"
        [message]="'The guest will be checked out'"
        (onClose)="closeConfirmDialog($event)"
        (onConfirm)="handleConfirm()"
      />
    </container>
  `,
})
export class ReservationViewComponent implements OnInit {
  isOpen = false;
  isIncidentOpen = false;
  isReportOpen = false;
  isDialogOpen = false;
  listData: Visitor[] = [];
  reservation: Reservation;
  selectedItem!: Reservation;
  title: string = '';
  reservationUuid: string | null = null;
  searchTerm: string = '';

  paginationParams: any = {
    page: 0,
    size: 10,
  };

  dataLength = 0;
  pageSize = 10;
  page = 0;

  columns = [
    { label: 'Visitor', value: 'visitorName' },
    { label: 'Nationality', value: 'visitorCountry' },
    { label: 'Gender', value: 'visitorGender' },
  ];

  constructor(
    public service: ReservationService,
    private route: ActivatedRoute,
    private location: Location,
    private incidentReportService: IncidentReportService
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.reservationUuid = params.get('uuid');
      this.fetchReservationByUuid(this.reservationUuid);
    });
  }

  async fetchReservationByUuid(uuid: string | null) {
    if (!uuid) return;
    try {
      const reservation = await lastValueFrom(this.service.getByUuid(uuid));
      this.reservation = reservation.data;
      this.listData = reservation?.data.visitors;
    } catch (error) {
      console.error('Error fetching Incident:', error);
    }
  }

  handleClose(result: boolean): void {
    this.service.clearForm();
    this.service.clearIncidentForm();
    this.isOpen = false;
    this.isIncidentOpen = false;
    this.isReportOpen = false;
  }

  async handleConfirm() {
    await lastValueFrom(this.service.guestCheckout(this.reservationUuid));
    this.fetchReservationByUuid(this.reservationUuid);
  }

  openConfirmDialog() {
    this.isDialogOpen = true;
  }

  closeConfirmDialog(event: any) {
    this.isDialogOpen = false;
  }

  async saveIncidentData(data: any) {
    try {
      await lastValueFrom(this.incidentReportService.create(data));
      this.isIncidentOpen = false;
      await this.fetchReservationByUuid(this.reservationUuid);
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

  async openIncidentDialog(data?: any) {
    const incidentPop = {
      id: null,
      uuid: null,
      incidentTypeId: '',
      incidentDate: '',
      comment: '',
      reservationId: data.reservation.id,
      hotelId: data.reservation.hotelId,
      visitorId: data.visitor.id,
    };
    this.service.populateForm(incidentPop);
    this.isIncidentOpen = true;
    this.title = 'Report Incident';
    this.service.clearForm();
  }

  async openViewIncidentDialog(data?: any) {
    this.isReportOpen = true;
    this.title = 'Incident Report';
    const incidentReport = await lastValueFrom(
      this.incidentReportService.getIncidentReport(data.visitor.uuid)
    );
    this.incidentReportService.setReportData(incidentReport.data);
  }

  navigateBack = () => {
    this.location.back();
  };
}
