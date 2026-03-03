import { Component, OnInit } from '@angular/core';
import { TableComponent } from 'components/table/table.component';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
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
import { FinancialYear } from './financial-year';
import { FinancialYearService } from './financial-year.service';
import { FinancialYearFormComponent } from './forms/financial-year-form.component';
import { CommonModule } from '@angular/common';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { SlideToggleComponent } from 'components/slide-toggle/slide-toggle.component';

@Component({
  selector: 'app-financial-year',
  standalone: true,
  imports: [
    TableComponent,
    MatIconModule,
    DialogComponent,
    HeaderComponent,
    SearchComponent,
    ConfirmDialogComponent,
    FinancialYearFormComponent,
    CantPipe,
    WrapperComponent,
    ActionButtonComponent,
    IconButtonComponent,
    ContainerComponent,
    MatChipsModule,
    CommonModule,
    MatSlideToggleModule,
    SlideToggleComponent,
  ],
  template: `
    <container>
      <app-header title="Manage Financial Years" />
      <app-wrapper>
        <app-search
          class="w-full md:w-auto"
          (onSearch)="handleSearch($event)"
        />
        <action-button
          label="ADD NEW"
          class="w-full md:w-auto"
          icon="add"
          [isDisabled]="'' | cant: 'create' : 'FinancialYear'"
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
        [htmlTemplate]="htmlTemplate"
      >
        <ng-template #htmlTemplate let-value="value" let-column="column">
          <mat-chip
            class="example-box"
            *ngIf="column === 'isActive'"
            cdkDrag
            [color]="getStatusColor(value)"
            >{{ value }}
          </mat-chip>
          <span *ngIf="column !== 'isActive'">{{ value }}</span>
        </ng-template>

        <ng-template #actionTemplate let-item>
          <slide-toggle
            [color]="'primary'"
            [checked]="item.isCurrent"
            [disabled]="'' | cant: 'update' : 'FinancialYear'"
            [label]="'Toggle Financial Year Status'"
            (clicked)="onToggleClick(item)"
          ></slide-toggle>

          <icon-button
            [isDisabled]="'' | cant: 'update' : 'FinancialYear'"
            icon="launch"
            tooltip="Edit FinancialYear"
            (action)="openDialog(item)"
            color="primary"
          />

          <icon-button
            [isDisabled]="'' | cant: 'delete' : 'FinancialYear'"
            icon="delete_outline"
            tooltip="Delete FinancialYear"
            color="accent"
            (action)="openConfirmDialog(item)"
          />
        </ng-template>
      </app-table>

      <app-dialog
        [open]="isOpen"
        (onClose)="handleClose($event)"
        width="740px"
        title="{{ title }} FinancialYear"
      >
        <ng-template>
          <financial-year-form (onSubmit)="saveData($event)" />
        </ng-template>
      </app-dialog>

      <app-confirm-dialog
        [open]="isDialogOpen"
        [title]="'Delete FinancialYear'"
        [message]="'Are you sure you want to delete this financial year?'"
        (onClose)="closeConfirmDialog($event)"
        (onConfirm)="handleConfirm()"
      />

      <app-confirm-dialog
        [open]="openActivationDialog"
        [title]="'Activate/De-activate FinancialYear'"
        [message]="'Are you sure you want to do this?'"
        (onClose)="closeActivationDialog($event)"
        (onConfirm)="toggleFinancialYearStatus()"
      />
    </container>
  `,
})
export class FinancialYearComponent implements OnInit {
  isOpen = false;
  isDialogOpen = false;
  data: FinancialYear[] = [];
  selectedItem!: FinancialYear;
  title: string = '';
  openActivationDialog = false;

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
    { label: 'Start Date', value: 'startDate' },
    { label: 'End Date', value: 'endDate' },
    { label: 'Current?', value: 'isActive' },
  ];

  constructor(public service: FinancialYearService) {}

  ngOnInit(): void {
    this.fetchFinancialYears();
  }

  async fetchFinancialYears() {
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
      page: page - 1, // Adjust for zero-indexed page
      size,
    };

    this.data = this.mapData(data);
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
    // Reset to the first page
    this.page = 0;
    this.paginationParams.page = 0;
    this.fetchFinancialYears();
  }

  closeConfirmDialog(event: any) {
    this.isDialogOpen = false;
  }

  async handleConfirm() {
    await lastValueFrom(this.service.delete(this.selectedItem.uuid));
    this.page = 0;
    this.paginationParams.page = 0;
    this.fetchFinancialYears();
  }

  async saveData(data: any) {
    try {
      if (data.uuid) {
        await lastValueFrom(this.service.update(data.uuid, data));
      } else {
        await lastValueFrom(this.service.create(data));
      }
      this.isOpen = false;
      await this.fetchFinancialYears();
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
      this.title = 'Create';
      this.service.clearForm();
    }
  }

  async getPaginatedData(event: { page: number; size: number }) {
    this.paginationParams.page = event.page;
    this.paginationParams.size = event.size;
    // Update the pageSize to reflect the new size
    this.pageSize = event.size;
    await this.fetchFinancialYears();
  }

  mapData(data: Array<any>) {
    return data.map((d) => ({
      ...d,
      isActive: d.isCurrent ? 'Yes' : 'No',
    }));
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Yes':
        return 'primary';
      case 'No':
        return 'warn';
      default:
        return 'warn';
    }
  }

  onToggleClick(data) {
    this.openActivationDialog = true;
    this.selectedItem = data;
  }

  closeActivationDialog($event) {
    this.openActivationDialog = false;
  }

  async toggleFinancialYearStatus() {
    const payload = {
      ...this.selectedItem,
      isCurrent: !this.selectedItem.isCurrent,
    };
    await lastValueFrom(this.service.update(payload.uuid, payload));
  }
}
