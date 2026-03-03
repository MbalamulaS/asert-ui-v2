import { Component, OnInit } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import {
  heroCog6Tooth,
  heroMagnifyingGlass,
  heroPencilSquare,
  heroTrash,
} from '@ng-icons/heroicons/outline';
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
import { BillTypeService } from './bill-type.service';
import { FormComponent } from './forms/form.component';
import { ActionButtonComponent } from 'components/action-button/action-button.component';
import { WrapperComponent } from 'components/wrapper/wrapper.component';
import { IconButtonComponent } from 'components/icon-button/icon-button.component';
import { ContainerComponent } from 'components/container/container.component';
import { BillType } from 'modules/setup/bill-type/bill-type';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-facility-type',
  standalone: true,
  imports: [
    HeaderComponent,
    SearchComponent,
    TableComponent,
    DialogComponent,
    ConfirmDialogComponent,
    CantPipe,
    MatIconModule,
    FormComponent,
    MatButtonModule,
    ActionButtonComponent,
    WrapperComponent,
    IconButtonComponent,
    ContainerComponent,
  ],
  viewProviders: [
    provideIcons({
      heroCog6Tooth,
      heroPencilSquare,
      heroTrash,
      heroMagnifyingGlass,
    }),
  ],
  template: `
    <container>
      <app-header title="Bill Types" />
      <app-wrapper>
        <app-search
          class="w-full md:w-auto"
          (onSearch)="handleSearch($event)"
        />

        <action-button
          label="ADD NEW"
          icon="add"
          class="w-full md:w-auto"
          [isDisabled]="'' | cant: 'create' : 'BillType'"
          (action)="openDialog()"
        />
      </app-wrapper>
      <app-table
        [data]="facilityTypes"
        [columns]="columns"
        [dataLength]="dataLength"
        [tableClass]="'min-w-full bg-white rounded-lg shadow-lg'"
        (handePagination)="getPaginatedData($event)"
        [pageSize]="pageSize"
        [page]="page"
      >
        <ng-template #actionTemplate let-item>
          <div class="flex flex-row gap-1">
            <icon-button
              [isDisabled]="'' | cant: 'update' : 'BillType'"
              icon="launch"
              tooltip="Edit BillType"
              (action)="openDialog(item)"
              color="primary"
            />

            <icon-button
              [isDisabled]="'' | cant: 'delete' : 'BillType'"
              icon="delete_outline"
              tooltip="Delete BillType"
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
        title="{{ title }} Bill Type"
      >
        <ng-template>
          <app-bill-type-form (onSubmit)="saveData($event)" />
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
export class BillTypeComponent implements OnInit {
  isOpen = false;
  isDialogOpen = false;
  facilityTypes: BillType[] = [];
  selectedIem!: BillType;
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
    { label: 'Description', value: 'description' },
    { label: 'Rate', value: 'rate' },
    { label: 'Expiration Date', value: 'expirationDate' },
    { label: 'Effective Date', value: 'effectiveDate' },
    { label: 'Partial?', value: 'isPartial' },
    { label: 'Status', value: 'status' },
  ];

  constructor(
    public service: BillTypeService,
    private datePipe: DatePipe,
  ) {}

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
      page: page - 1, // Adjust for zero-indexed page
      size,
    };

    /*this.facilityTypes = data;*/

    if (data) {
      this.facilityTypes = data.map((billType: BillType) => {
        return {
          ...billType,
          effectiveDate: this.datePipe.transform(
            billType.effectiveDate,
            'MMM dd, y',
          ),
          expirationDate: this.datePipe.transform(
            billType.expirationDate,
            'MMM dd, y',
          ),
        };
      });
    }

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
    this.fetchData();
  }

  async closeConfirmDialog(event: any) {
    await lastValueFrom(this.service.delete(this.selectedIem.uuid));
    await this.fetchData();
    this.isDialogOpen = false;
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
      // Handle error
      console.log(error);
    }
  }

  async openDialog(data?: BillType) {
    this.isOpen = true;
    if (data) {
      this.title = 'Update';
      data.effectiveDate = this.datePipe.transform(
        data.effectiveDate,
        'yyyy-MM-dd',
      );
      data.expirationDate = this.datePipe.transform(
        data.expirationDate,
        'yyyy-MM-dd',
      );
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
    await this.fetchData();
  }
}
