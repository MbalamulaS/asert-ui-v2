import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableComponent } from 'components/table/table.component';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { provideIcons } from '@ng-icons/core';
import {
  heroPencilSquare,
  heroTrash,
  heroMagnifyingGlass,
} from '@ng-icons/heroicons/outline';
import { DialogComponent } from 'components/dialog/dialog.component';
import { UserFormComponent } from 'modules/user/forms/user-form.component';
import { HeaderComponent } from 'components/header/header.component';
import { SearchComponent } from 'components/search/search.component';
import { User, UserService } from './user.service';
import { ConfirmDialogComponent } from 'components/confirm/confirm.dialog';
import { CantPipe } from 'pipes/cant.pipe';
import { lastValueFrom } from 'rxjs';
import { DEFAULT_SEARCH_PARAMS } from 'utils/helpers';
import { WrapperComponent } from 'components/wrapper/wrapper.component';
import { ActionButtonComponent } from 'components/action-button/action-button.component';
import { IconButtonComponent } from 'components/icon-button/icon-button.component';
import { ContainerComponent } from 'components/container/container.component';

@Component({
  selector: 'app-user',
  standalone: true,
  viewProviders: [
    provideIcons({ heroPencilSquare, heroTrash, heroMagnifyingGlass }),
  ],
  imports: [
    CommonModule,
    TableComponent,
    MatIconModule,
    MatTabsModule,
    DialogComponent,
    UserFormComponent,
    HeaderComponent,
    SearchComponent,
    ConfirmDialogComponent,
    CantPipe,
    WrapperComponent,
    ActionButtonComponent,
    IconButtonComponent,
    ContainerComponent,
  ],
  template: `
    <container>
      <app-header title="User Management" />
      <app-wrapper>
        <app-search
          class="w-full md:w-auto border border-gray-300 rounded-lg"
          (onSearch)="handleSearch($event)"
        />
        <action-button
          label="ADD NEW"
          class="w-full md:w-auto"
          icon="add"
          [isDisabled]="'' | cant: 'create' : 'User'"
          (action)="openDialog()"
        />
      </app-wrapper>

      <!-- Tabbed Navigation -->
      <mat-tab-group
        [(selectedIndex)]="activeTab"
        (selectedTabChange)="onTabChange($event)"
        class="mt-4"
      >
        <!-- Approved Users Tab -->
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon class="mr-2">verified_user</mat-icon>
            Approved Users
            <span
              class="ml-2 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs"
            >
              {{ dataLength }}
            </span>
          </ng-template>

          <app-table
            [data]="approvedUsers"
            [columns]="columns"
            [dataLength]="dataLength"
            [tableClass]="'min-w-full bg-white rounded-lg shadow-lg'"
            (handePagination)="getPaginatedData($event)"
            [pageSize]="pageSize"
            [page]="page"
          >
            <ng-template #actionTemplate let-item>
              <icon-button
                [isDisabled]="'' | cant: 'update' : 'User'"
                icon="launch"
                tooltip="Edit User"
                (action)="openDialog(item)"
                color="primary"
              />

              <icon-button
                [isDisabled]="'' | cant: 'delete' : 'User'"
                icon="delete_outline"
                tooltip="Delete User"
                color="accent"
                (action)="openConfirmDialog(item)"
              />
            </ng-template>
          </app-table>
        </mat-tab>

        <!-- Awaiting Approval Tab -->
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon class="mr-2">hourglass_empty</mat-icon>
            Awaiting Approval
            <span
              class="ml-2 bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs"
            >
              {{ awaitingDataLength }}
            </span>
          </ng-template>

          <app-table
            [data]="awaitingApprovalUsers"
            [columns]="awaitingColumns"
            [dataLength]="awaitingDataLength"
            [tableClass]="'min-w-full bg-white rounded-lg shadow-lg'"
            (handePagination)="getAwaitingPaginatedData($event)"
            [pageSize]="pageSize"
            [page]="awaitingPage"
          >
            <ng-template #actionTemplate let-item>
              <icon-button
                [isDisabled]="'' | cant: 'update' : 'User'"
                icon="check_circle"
                tooltip="Approve User"
                (action)="openApprovalDialog(item)"
                color="primary"
              />

              <icon-button
                [isDisabled]="'' | cant: 'update' : 'User'"
                icon="launch"
                tooltip="Edit User"
                (action)="openDialog(item)"
                color="primary"
              />

              <icon-button
                [isDisabled]="'' | cant: 'delete' : 'User'"
                icon="delete_outline"
                tooltip="Delete User"
                color="accent"
                (action)="openConfirmDialog(item)"
              />
            </ng-template>
          </app-table>
        </mat-tab>
      </mat-tab-group>

      <app-dialog
        [open]="isOpen"
        (onClose)="handleClose($event)"
        width="880px"
        title="{{ title }} User"
      >
        <ng-template>
          <user-form (onSubmit)="saveData($event)" />
        </ng-template>
      </app-dialog>

      <app-confirm-dialog
        [open]="isDialogOpen"
        [title]="'Delete User'"
        [message]="'Are you sure you want to delete this user?'"
        (onClose)="closeConfirmDialog($event)"
        (onConfirm)="handleConfirm()"
      />

      <app-confirm-dialog
        [open]="isApprovalDialogOpen"
        [title]="'Approve User'"
        [message]="
          'Are you sure you want to approve this user? This will grant them access to the system.'
        "
        (onClose)="closeApprovalDialog($event)"
        (onConfirm)="handleApprovalConfirm()"
      />
    </container>
  `,
})
export class UserComponent implements OnInit {
  isOpen = false;
  isDialogOpen = false;
  isApprovalDialogOpen = false;
  users: Array<User> = [];
  approvedUsers: Array<User> = [];
  awaitingApprovalUsers: Array<User> = [];
  title: string = '';
  selectedIem!: User;
  selectedApprovalUser!: User;
  activeTab: number = 0;

  searchTerm: string = '';

  paginationParams: any = {
    page: 0,
    size: 10,
  };

  awaitingPaginationParams: any = {
    page: 0,
    size: 10,
  };

  dataLength = 0;
  awaitingDataLength = 0;
  pageSize = 10;
  page = 0;
  awaitingPage = 0;

  constructor(public service: UserService) {}

  columns = [
    { label: 'Full Name', value: 'fullName' },
    { label: 'Email', value: 'email' },
    { label: 'Location', value: 'adminHierarchyName' },
    { label: 'Role', value: 'roleName' },
    { label: 'Status', value: 'status' },
  ];

  awaitingColumns = [
    { label: 'Full Name', value: 'fullName' },
    { label: 'Email', value: 'email' },
    { label: 'Location', value: 'adminHierarchyName' },
    { label: 'Role', value: 'roleName' },
    { label: 'Registration Date', value: 'createdAt' },
  ];

  ngOnInit(): void {
    this.fetchApprovedUsers();
    this.fetchAwaitingApprovalUsers();
  }

  async fetchApprovedUsers() {
    let query = {
      ...this.paginationParams,
      ...DEFAULT_SEARCH_PARAMS,
      sort: 'id,asc',
      isApproved: true, // API should return only approved users
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

    // Since API already filters by approved: true, no need to filter again
    this.approvedUsers = this.mapUsers(data);
    this.dataLength = total;
  }

  async fetchAwaitingApprovalUsers() {
    let query = {
      ...this.awaitingPaginationParams,
      ...DEFAULT_SEARCH_PARAMS,
      sort: 'id,asc',
      isApproved: false, // API should return only unapproved users
    };

    if (this.searchTerm && this.searchTerm.length > 0) {
      query['firstName'] = this.searchTerm;
      query['lastName'] = this.searchTerm;
      query['email'] = this.searchTerm;
    }

    console.log('Fetching awaiting approval users with query:', query);

    const response = await lastValueFrom(
      this.service.get({ ...query, size: this.pageSize }),
    );

    const { page, size, total, data } = response;

    console.log('API response for awaiting approval:', {
      page,
      size,
      total,
      dataCount: data.length,
    });
    console.log(
      'Sample user approval status:',
      data
        .slice(0, 3)
        .map((u) => ({ email: u.email, isApproved: u.isApproved })),
    );

    this.awaitingPaginationParams = {
      page: page - 1,
      size,
    };

    // Filter client-side since API filtering might not be working
    const unapprovedUsers = this.mapUsers(data).filter((u) => !u.isApproved);
    console.log('Filtered unapproved users:', unapprovedUsers.length);

    this.awaitingApprovalUsers = unapprovedUsers;
    this.awaitingDataLength = unapprovedUsers.length; // Use actual filtered count
  }

  async fetchUsers() {
    if (this.activeTab === 0) {
      await this.fetchApprovedUsers();
    } else {
      await this.fetchAwaitingApprovalUsers();
    }
  }

  fetchUsersWithTimeout(delay) {
    setTimeout(() => {
      this.fetchUsers();
    }, delay);
  }

  handleSearch(query: string): void {
    this.searchTerm = query;
    // Reset pagination for both tabs
    this.page = 0;
    this.awaitingPage = 0;
    this.paginationParams.page = 0;
    this.awaitingPaginationParams.page = 0;
    this.fetchUsers();
  }

  async getPaginatedData(event: { page: number; size: number }) {
    this.paginationParams.page = event.page;
    this.paginationParams.size = event.size;
    this.pageSize = event.size;
    await this.fetchApprovedUsers();
  }

  async getAwaitingPaginatedData(event: { page: number; size: number }) {
    this.awaitingPaginationParams.page = event.page;
    this.awaitingPaginationParams.size = event.size;
    this.pageSize = event.size;
    this.awaitingPage = event.page;
    await this.fetchAwaitingApprovalUsers();
  }

  onTabChange(event: any) {
    this.activeTab = event.index;
    // Reset search when switching tabs
    this.searchTerm = '';
    // Reset pagination for the new tab
    if (this.activeTab === 0) {
      this.page = 0;
      this.paginationParams.page = 0;
    } else {
      this.awaitingPage = 0;
      this.awaitingPaginationParams.page = 0;
    }
    // Fetch users for the current tab
    this.fetchUsers();
  }

  async handleApprovalConfirm() {
    this.isApprovalDialogOpen = false;
    await this.approveUser(this.selectedApprovalUser);
  }

  async approveUser(user: User) {
    try {
      const payload = {
        ...user,
        isApproved: true,
      };
      await lastValueFrom(this.service.approve(user.uuid, payload));
      // Refresh both lists
      await this.fetchApprovedUsers();
      await this.fetchAwaitingApprovalUsers();
    } catch (error) {
      console.error('Error approving user:', error);
    }
  }

  handleClose(result: boolean): void {
    this.service.clearForm();
    this.isOpen = false;
  }

  openConfirmDialog(data: any) {
    this.selectedIem = data;
    this.isDialogOpen = true;
  }

  closeConfirmDialog(event: any) {
    this.isDialogOpen = false;
  }

  openApprovalDialog(data: any) {
    this.selectedApprovalUser = data;
    this.isApprovalDialogOpen = true;
  }

  closeApprovalDialog(event: any) {
    this.isApprovalDialogOpen = false;
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

  openDialog(data?: any) {
    this.isOpen = true;
    if (data && data.id) {
      this.title = 'Update';
      this.service.populateForm(data);
    } else {
      this.title = 'Create';
      this.service.clearForm();
    }
  }

  async handleConfirm() {
    await lastValueFrom(this.service.delete(this.selectedIem.uuid));
    this.page = 0;
    this.awaitingPage = 0;
    this.paginationParams.page = 0;
    this.awaitingPaginationParams.page = 0;
    await this.fetchApprovedUsers();
    await this.fetchAwaitingApprovalUsers();
  }

  async saveData(data: any) {
    const roles = data.roles || [];

    const roleIds =
      roles.length > 1
        ? roles[0].map((r: any) => r.id)
        : roles.map((r: any) => r.id);

    const payload = {
      ...data,
      isActive: true,
      roleIds: roleIds,
    };

    console.log('Payload:', payload);

    const { uuid } = data;
    try {
      if (data.uuid) {
        await lastValueFrom(this.service.update(uuid, payload));
      } else {
        await lastValueFrom(this.service.create(payload));
      }
      this.isOpen = false;
      await this.fetchApprovedUsers();
      await this.fetchAwaitingApprovalUsers();
    } catch (error) {
      // Handle error
      console.log(error);
    }
  }

  mapUsers = (users: User[]): Array<User> => {
    return users.map((user) => ({
      ...user,
      roleName: user.roles.map((role) => role.name).join(', '),
      fullName: user.fullName
        .split(' ')
        .filter((n) => n !== 'null')
        .map((name) => name.charAt(0).toUpperCase() + name.slice(1))
        .join(' '),
      status: user.isActive ? 'Active' : 'Inactive',
    }));
  };
}
