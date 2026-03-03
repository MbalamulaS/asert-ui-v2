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
import { ConfirmDialogComponent } from 'components/confirm/confirm.dialog';
import { CantPipe } from 'pipes/cant.pipe';
import { lastValueFrom } from 'rxjs';
import { DEFAULT_SEARCH_PARAMS } from 'utils/helpers';
import { WrapperComponent } from 'components/wrapper/wrapper.component';
import { ActionButtonComponent } from 'components/action-button/action-button.component';
import { IconButtonComponent } from 'components/icon-button/icon-button.component';
import {
  AdminHierarchyLevelFormComponent,
  Position,
} from 'modules/admin-hierarchy/hierarchy-level/forms/admin-hierarchy-level-form.component';
import {
  AdminHierarchyLevel,
  AdminHierarchyLevelService,
} from 'modules/admin-hierarchy/hierarchy-level/admin-hierarchy-level.service';

const POSITIONS = [
  { id: 1, name: '1' },
  { id: 2, name: '2' },
  { id: 3, name: '3' },
  { id: 4, name: '4' },
  { id: 5, name: '5' },
  { id: 6, name: '6' },
  { id: 7, name: '7' },
  { id: 8, name: '8' },
  { id: 9, name: '9' },
  { id: 10, name: '10' },
];

@Component({
  selector: 'app-admin-hierarchy-level',
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
    ConfirmDialogComponent,
    AdminHierarchyLevelFormComponent,
    CantPipe,
    WrapperComponent,
    ActionButtonComponent,
    IconButtonComponent,
  ],
  template: `
    <div class="p-4">
      <app-header title="Manage Admin Hierarchy Levels" />
      <app-wrapper>
        <app-search
          class="w-full md:w-auto"
          (onSearch)="handleSearch($event)"
        />
        <action-button
          label="ADD NEW"
          class="w-full md:w-auto"
          icon="add"
          [isDisabled]="'' | cant: 'create' : 'AdminHierarchyLevel'"
          (action)="openDialog()"
        />
      </app-wrapper>
      <app-table
        [data]="levels"
        [columns]="columns"
        [dataLength]="dataLength"
        [tableClass]="'min-w-full bg-white rounded-lg shadow-lg'"
        (handePagination)="getPaginatedData($event)"
        [pageSize]="pageSize"
        [page]="page"
      >
        <ng-template #actionTemplate let-item>
          <icon-button
            [isDisabled]="'' | cant: 'update' : 'AdminHierarchyLevel'"
            icon="launch"
            tooltip="Edit AdminHierarchyLevel"
            (action)="openDialog(item)"
            color="primary"
          />

          <icon-button
            [isDisabled]="'' | cant: 'delete' : 'AdminHierarchyLevel'"
            icon="delete_outline"
            tooltip="Delete AdminHierarchyLevel"
            color="accent"
            (action)="openConfirmDialog(item)"
          />
        </ng-template>
      </app-table>

      <app-dialog
        [open]="isOpen"
        (onClose)="handleClose($event)"
        width="740px"
        title="{{ title }} AdminHierarchy Level"
      >
        <ng-template>
          <admin-hierarchy-level-form
            [positions]="positions"
            (onSubmit)="saveData($event)"
          />
        </ng-template>
      </app-dialog>

      <app-confirm-dialog
        [open]="isDialogOpen"
        [title]="'Delete AdminHierarchyLevel'"
        [message]="'Are you sure you want to delete this role?'"
        (onClose)="closeConfirmDialog($event)"
        (onConfirm)="handleConfirm()"
      />
    </div>
  `,
})
export class AdminHierarchyLevelComponent implements OnInit {
  isOpen = false;
  isDialogOpen = false;
  levels: AdminHierarchyLevel[] = [];
  selectedIem!: AdminHierarchyLevel;
  title: string = '';
  positions: Position[] = POSITIONS;

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
  ];

  constructor(public service: AdminHierarchyLevelService) {}

  ngOnInit(): void {
    this.fetchAdminHierarchyLevels();
  }

  async fetchAdminHierarchyLevels() {
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

    this.levels = data;
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
    this.fetchAdminHierarchyLevels();
  }

  closeConfirmDialog(event: any) {
    console.log('closeConfirmDialog', event);
    this.isDialogOpen = false;
  }

  async handleConfirm() {
    await lastValueFrom(this.service.delete(this.selectedIem.uuid));
    this.page = 0;
    this.paginationParams.page = 0;
    this.fetchAdminHierarchyLevels();
  }

  async saveData(data: any) {
    try {
      if (data.uuid) {
        await lastValueFrom(this.service.update(data.uuid, data));
      } else {
        await lastValueFrom(this.service.create(data));
      }
      this.isOpen = false;
      await this.fetchAdminHierarchyLevels();
    } catch (error) {
      // Handle error
      console.log(error);
    }
  }

  async openDialog(data?: any) {
    if (data) {
      this.title = 'Update';
      this.service.populateForm(data);
    } else {
      await this.refreshPositions();
      this.title = 'Create';
      this.service.clearForm();
    }
    this.isOpen = true;
  }

  async refreshPositions() {
    return this.levels.forEach((l) => {
      const idx = this.positions.map((i) => i.id).indexOf(l.position);
      if (idx !== -1) {
        POSITIONS.splice(idx, 1);
        this.positions = POSITIONS;
      }
    });
  }

  async getPaginatedData(event: { page: number; size: number }) {
    this.paginationParams.page = event.page;
    this.paginationParams.size = event.size;
    this.pageSize = event.size;
    await this.fetchAdminHierarchyLevels();
  }
}
