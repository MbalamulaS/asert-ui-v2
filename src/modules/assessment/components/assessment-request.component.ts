import { Component, OnInit } from '@angular/core';
import { TableComponent } from 'components/table/table.component';
import { MatIconModule } from '@angular/material/icon';
import { provideIcons } from '@ng-icons/core';
import {
  heroPencilSquare,
  heroTrash,
  heroMagnifyingGlass,
  heroCog6Tooth,
} from '@ng-icons/heroicons/outline';
import { HeaderComponent } from 'components/header/header.component';
import { SearchComponent } from 'components/search/search.component';
import { Role } from 'modules/role/role.service';
import { ConfirmDialogComponent } from 'components/confirm/confirm.dialog';
import { CantPipe } from 'pipes/cant.pipe';
import { lastValueFrom } from 'rxjs';
import { DEFAULT_SEARCH_PARAMS } from 'utils/helpers';
import { Router } from '@angular/router';
import { WrapperComponent } from 'components/wrapper/wrapper.component';
import { IconButtonComponent } from 'components/icon-button/icon-button.component';
import { ContainerComponent } from 'components/container/container.component';
import {
  AssessmentRequestService,
  AssessmentRequest,
} from '../assessment-request.service';
import {
  AssessmentRequestDetailsDialogComponent,
  AssessmentRequestDetailsDialogData,
  AssessmentRequestDetailsDialogResult,
} from './assessment-request-details-dialog.component';

@Component({
  selector: 'app-assessment-request',
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
    SearchComponent,
    ConfirmDialogComponent,
    CantPipe,
    WrapperComponent,
    IconButtonComponent,
    ContainerComponent,
    AssessmentRequestDetailsDialogComponent,
  ],
  template: `
    <container>
      <app-header title="Manage Assessment Requests" />
      <app-wrapper>
        <app-search
          class="w-full md:w-auto"
          (onSearch)="handleSearch($event)"
        />
      </app-wrapper>
      <app-table
        [data]="roles"
        [columns]="columns"
        [dataLength]="dataLength"
        [tableClass]="'min-w-full bg-white rounded-lg shadow-lg'"
        (handePagination)="getPaginatedData($event)"
        [pageSize]="pageSize"
        [page]="page"
      >
        <ng-template #actionTemplate let-item>
          @if (item.status !== 'APPROVED') {
            <icon-button
              [isDisabled]="'' | cant: 'approve' : 'AssessmentRequest'"
              icon="visibility"
              tooltip="Review Request"
              color="accent"
              (action)="openRequestDetailsDialog(item)"
            />
          } @else {
            <icon-button
              icon="done_all"
              tooltip="This request is approved"
              color="green"
            />
          }
        </ng-template>
      </app-table>

      <app-assessment-request-details-dialog
        [open]="isDetailsDialogOpen"
        [data]="detailsDialogData"
        (onResult)="handleDetailsDialogResult($event)"
      />

      <app-confirm-dialog
        [open]="isDialogOpen"
        [title]="'Approve Request'"
        [message]="'Are you sure you want to approve this request?'"
        (onClose)="closeConfirmDialog($event)"
        (onConfirm)="handleConfirm()"
      />
    </container>
  `,
})
export class AssessmentRequestComponent implements OnInit {
  isOpen = false;
  isDialogOpen = false;
  isDetailsDialogOpen = false;
  roles: Role[] = [];
  requests: AssessmentRequest[] = [];
  selectedIem!: Role;
  selectedRequest!: AssessmentRequest;
  title: string = '';
  detailsDialogData: AssessmentRequestDetailsDialogData | null = null;

  searchTerm: string = '';

  paginationParams: any = {
    page: 0,
    size: 10,
  };

  dataLength = 0;
  pageSize = 10;
  page = 0;

  columns = [
    { label: 'Hotel Name', value: 'facilityName' },
    { label: 'Contact Person', value: 'contactPerson' },
    { label: 'Email', value: 'email' },
    { label: 'Phone', value: 'phoneNumber' },
    { label: 'Status', value: 'status', template: 'statusTemplate' },
    {
      label: 'Completion',
      value: 'completionPercentage',
      template: 'completionTemplate',
    },
  ];

  constructor(
    private service: AssessmentRequestService,
    private router: Router,
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
      query['hotel.name'] = this.searchTerm;
      query['hotel.propertyType'] = this.searchTerm;
    }

    const response = await lastValueFrom(
      this.service.getAll({ ...query, size: this.pageSize }),
    );

    const { page, size, total, data } = response;

    this.paginationParams = {
      page: page - 1, // Adjust for zero-indexed page
      size,
    };

    this.roles = data;
    this.requests = data; // Also store as requests for the dialog
    this.dataLength = total;
  }

  navigateToRolePermission(uuid: string): void {
    console.log('uuid', uuid);
    this.router.navigate(['/manage-roles/permissions'], {
      queryParams: { uuid },
    });
  }

  openConfirmDialog(data: any) {
    this.selectedIem = data;
    this.isDialogOpen = true;
  }

  async openRequestDetailsDialog(data: AssessmentRequest) {
    try {
      // Fetch full request details with essential items
      const response = await lastValueFrom(this.service.getOne(data.uuid!));
      const fullRequest = response.data;

      this.selectedRequest = fullRequest;
      this.detailsDialogData = {
        request: fullRequest,
      };
      this.isDetailsDialogOpen = true;
    } catch (error) {
      console.error('Error fetching request details:', error);
      // Fallback to using the data we have
      this.selectedRequest = data;
      this.detailsDialogData = {
        request: data,
      };
      this.isDetailsDialogOpen = true;
    }
  }

  async handleDetailsDialogResult(
    result: AssessmentRequestDetailsDialogResult,
  ) {
    this.isDetailsDialogOpen = false;

    if (result.action === 'approve') {
      try {
        await lastValueFrom(this.service.approve(this.selectedRequest.uuid!));
        this.page = 0;
        this.paginationParams.page = 0;
        await this.fetchData();
      } catch (error) {
        console.error('Error approving request:', error);
        // Could show error message to user here
      }
    } else if (result.action === 'reject') {
      // For now, we'll just close the dialog
      // You could implement a reject endpoint similar to approve
      console.log(
        'Request rejected (rejection functionality not implemented yet)',
      );
    }

    // Reset dialog data
    this.detailsDialogData = null;
    this.selectedRequest = null as any;
  }

  handleSearch(query: string): void {
    this.searchTerm = query;
    // Reset to the first page
    this.page = 0;
    this.paginationParams.page = 0;
    this.fetchData();
  }

  closeConfirmDialog(event: any) {
    this.isDialogOpen = false;
  }

  async handleConfirm() {
    await lastValueFrom(this.service.approve(this.selectedIem.uuid));
    this.page = 0;
    this.paginationParams.page = 0;
    this.fetchData();
  }

  async getPaginatedData(event: { page: number; size: number }) {
    this.paginationParams.page = event.page;
    this.paginationParams.size = event.size;
    // Update the pageSize to reflect the new size
    this.pageSize = event.size;
    await this.fetchData();
  }
}
