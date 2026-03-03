import { Component, OnInit } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import {
  heroCog6Tooth,
  heroMagnifyingGlass,
  heroPencilSquare,
  heroTrash,
} from '@ng-icons/heroicons/outline';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Assessor } from 'modules/assessment/assessment';
import { AssessorService } from 'modules/assessment/assessor.service';
import { DEFAULT_SEARCH_PARAMS } from 'utils/helpers';
import { lastValueFrom } from 'rxjs';
import { AssessorProfileComponent } from 'modules/assessor-management/assessor-profile.component';
import { ContainerComponent } from 'components/container/container.component';
import { DialogComponent } from 'components/dialog/dialog.component';
import { HeaderComponent } from 'components/header/header.component';
import { IconButtonComponent } from 'components/icon-button/icon-button.component';
import { TableComponent } from 'components/table/table.component';
import { WrapperComponent } from 'components/wrapper/wrapper.component';
import { SearchComponent } from 'components/search/search.component';

@Component({
  selector: 'app-assessor-approved-applications',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
    AssessorProfileComponent,
    ContainerComponent,
    DialogComponent,
    HeaderComponent,
    IconButtonComponent,
    TableComponent,
    WrapperComponent,
    SearchComponent,
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
      <app-header icon="verified" title="Approved Applications" />
      <app-wrapper>
        <app-search
          class="w-full md:w-auto border border-gray-300 rounded-lg"
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
            icon="visibility"
            tooltip="View"
            (action)="view(item)"
            color="primary"
          />
        </ng-template>
      </app-table>

      <app-dialog
        [open]="isOpen"
        (onClose)="handleClose($event)"
        width="900px"
        title="{{ title }} Assessor Profile"
      >
        <ng-template>
          <app-assessor-profile
            [uuid]="selectedIem.uuid"
            (onSuccess)="handleAssessorActionSuccess($event)"
          />
        </ng-template>
      </app-dialog>
    </container>
  `,
})
export class AssessorApprovedApplicationComponent implements OnInit {
  isOpen = false;
  data: Assessor[] = [];
  selectedIem!: Assessor;
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
    { label: 'Date', value: 'dateVerified' },
    { label: 'First Name', value: 'firstName' },
    { label: 'Middle Name', value: 'middleName' },
    { label: 'Last Name', value: 'lastName' },
  ];

  constructor(public service: AssessorService) {}

  ngOnInit(): void {
    this.fetchItems();
  }

  handleSearch(query: string): void {
    this.searchTerm = query;
    // Reset to the first page
    this.page = 0;
    this.paginationParams.page = 0;
    this.fetchItems();
  }

  async fetchItems() {
    let query = {
      ...this.paginationParams,
      ...DEFAULT_SEARCH_PARAMS,
      sort: 'dateVerified,asc',
      status: 'APPROVED',
    };

    if (this.searchTerm && this.searchTerm.length > 0) {
      query['firstName'] = this.searchTerm;
      query['lastName'] = this.searchTerm;
      query['middleName'] = this.searchTerm;
    }

    const response = await lastValueFrom(
      this.service.get({ ...query, size: this.pageSize }),
    );

    const { page, size, total, data } = response;

    this.paginationParams = {
      page: page - 1,
      size,
    };

    this.data = this.mapData(data);
    this.dataLength = total;
  }

  handleClose(result: boolean): void {
    this.isOpen = false;
  }

  handleAssessorActionSuccess(action: string): void {
    this.isOpen = false;
    this.fetchItems(); // Reload the data
  }

  async getPaginatedData(event: { page: number; size: number }) {
    this.paginationParams.page = event.page;
    this.paginationParams.size = event.size;
    this.pageSize = event.size;
    await this.fetchItems();
  }

  mapData = (data: Assessor[]) => {
    return data.map((item: Assessor) => ({
      ...item,
    }));
  };

  view(row: Assessor): void {
    this.selectedIem = row;
    this.isOpen = true;
  }
}
