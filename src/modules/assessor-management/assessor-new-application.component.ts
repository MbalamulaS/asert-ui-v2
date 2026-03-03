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
import { HeaderComponent } from 'components/header/header.component';
import { lastValueFrom } from 'rxjs';
import { DEFAULT_SEARCH_PARAMS } from 'utils/helpers';
import { ContainerComponent } from 'components/container/container.component';
import { AssessorService } from 'modules/assessment/assessor.service';
import { Assessor } from 'modules/assessment/assessment';
import { IconButtonComponent } from 'components/icon-button/icon-button.component';
import { DialogComponent } from 'components/dialog/dialog.component';
import { AssessorProfileComponent } from 'modules/assessor-management/assessor-profile.component';
import { SearchComponent } from 'components/search/search.component';
import { WrapperComponent } from 'components/wrapper/wrapper.component';

@Component({
  selector: 'app-assessor-new-applications',
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
    HeaderComponent,
    ContainerComponent,
    IconButtonComponent,
    DialogComponent,
    AssessorProfileComponent,
    SearchComponent,
    WrapperComponent,
  ],
  template: `
    <container>
      <app-header title="New Applications" />
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
export class AssessorNewApplicationComponent implements OnInit {
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
    { label: 'Date', value: 'dateApplied' },
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
      sort: 'dateApplied,asc',
      status: 'PENDING',
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
