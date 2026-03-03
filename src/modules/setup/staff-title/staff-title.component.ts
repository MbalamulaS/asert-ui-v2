import { Component } from '@angular/core';
import { CantPipe } from 'app/pipes/cant.pipe';
import { ConfirmDialogComponent } from 'components/confirm/confirm.dialog';
import { DialogComponent } from 'components/dialog/dialog.component';
import { HeaderComponent } from 'components/header/header.component';
import { SearchComponent } from 'components/search/search.component';
import { TableComponent } from 'components/table/table.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DEFAULT_SEARCH_PARAMS } from 'utils/helpers';
import { lastValueFrom } from 'rxjs';
import { StaffTitle, StaffTitleService } from './staff-title.service';
import { StaffTitleFormComponent } from './form/staff-title-form.component';
import { ContainerComponent } from 'components/container/container.component';
import { WrapperComponent } from 'components/wrapper/wrapper.component';
import { ActionButtonComponent } from 'components/action-button/action-button.component';
import { IconButtonComponent } from 'components/icon-button/icon-button.component';
import { CommonModule, NgIf } from '@angular/common';

@Component({
  selector: 'app-staff-title',
  standalone: true,
  imports: [
    HeaderComponent,
    SearchComponent,
    TableComponent,
    DialogComponent,
    ConfirmDialogComponent,
    CantPipe,
    MatIconModule,
    MatButtonModule,
    StaffTitleFormComponent,
    ContainerComponent,
    WrapperComponent,
    ActionButtonComponent,
    IconButtonComponent,
    NgIf,
    CommonModule,
  ],
  template: `
    <container>
      <app-header title="Manage Staff titles" />
      <app-wrapper>
        <app-search
          class="w-full md:w-auto"
          (onSearch)="handleSearch($event)"
        />

        <action-button
          label="ADD NEW"
          class="w-full md:w-auto"
          icon="add"
          [isDisabled]="'' | cant: 'create' : 'StaffTitle'"
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
        <ng-template #htmlTemplate let-value="value" let-column="column">
          <mat-icon *ngIf="column === 'isMedicalStaff'">home</mat-icon>
          <span *ngIf="column !== 'isMedicalStaff'">{{ value }}</span>
        </ng-template>

        <ng-template #actionTemplate let-item>
          <icon-button
            [isDisabled]="'' | cant: 'update' : 'StaffTitle'"
            icon="launch"
            tooltip="Edit Staff Title"
            (action)="openDialog(item)"
            color="primary"
          />

          <icon-button
            [isDisabled]="'' | cant: 'delete' : 'StaffTitle'"
            icon="delete_outline"
            tooltip="Delete Staff Title"
            color="accent"
            (action)="openConfirmDialog(item)"
          />
        </ng-template>
      </app-table>

      <app-dialog
        [open]="isOpen"
        (onClose)="handleClose($event)"
        width="740px"
        title="{{ title }} Facility Type"
      >
        <ng-template>
          <staff-title-form (onSubmit)="saveData($event)" />
        </ng-template>
      </app-dialog>

      <app-confirm-dialog
        [open]="isDialogOpen"
        [title]="'Delete Staff Title'"
        [message]="'Are you sure you want to delete this staff title?'"
        (onClose)="closeConfirmDialog($event)"
        (onConfirm)="handleConfirm()"
      />
    </container>
  `,
})
export class StaffTitleComponent {
  isOpen = false;
  isDialogOpen = false;
  data: StaffTitle[] = [];
  selectedIem!: StaffTitle;
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
    { label: 'Medical Staff?', value: 'isMedicalStaff' },
  ];

  constructor(public service: StaffTitleService) {}

  ngOnInit(): void {
    this.fetchStaffTitle();
  }

  async fetchStaffTitle() {
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
    // Reset to the first page
    this.page = 0;
    this.paginationParams.page = 0;
    this.fetchStaffTitle();
  }

  closeConfirmDialog(event: any) {
    this.isDialogOpen = false;
  }

  async handleConfirm() {
    await lastValueFrom(this.service.delete(this.selectedIem.uuid));
    this.page = 0;
    this.paginationParams.page = 0;
    this.fetchStaffTitle();
  }

  async saveData(data: any) {
    try {
      if (data.uuid) {
        await lastValueFrom(this.service.update(data.uuid, data));
      } else {
        await lastValueFrom(this.service.create(data));
      }
      this.isOpen = false;
      await this.fetchStaffTitle();
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
    await this.fetchStaffTitle();
  }
}
