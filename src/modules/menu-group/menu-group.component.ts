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
import { lastValueFrom } from 'rxjs';
import { DEFAULT_SEARCH_PARAMS } from 'utils/helpers';
import { Router } from '@angular/router';
import { WrapperComponent } from 'components/wrapper/wrapper.component';
import { MenuGroup } from 'layouts/main-layout/nav/menu-items';
import { MenuGroupService } from 'modules/menu-group/menu-group.service';
import { menuItems } from 'layouts/main-layout/nav/menu-items';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-menu-item',
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
    WrapperComponent,
    NgIf,
  ],
  template: `
    <div class="p-4">
      <app-header title="Manage Menu Groups" />
      <app-wrapper>
        <app-search
          class="w-full md:w-auto"
          (onSearch)="handleSearch($event)"
        />
      </app-wrapper>

      <app-table
        [data]="menuGroups"
        [columns]="columns"
        [dataLength]="dataLength"
        [tableClass]="'min-w-full bg-white rounded-lg shadow-lg'"
        (handePagination)="getPaginatedData($event)"
        [pageSize]="pageSize"
        [page]="page"
        [htmlTemplate]="htmlTemplate"
      >
        <ng-template #htmlTemplate let-value="value" let-column="column">
          <mat-icon color="primary" *ngIf="column === 'icon'">{{
            value
          }}</mat-icon>
          <span *ngIf="column !== 'icon'">{{ value }}</span>
        </ng-template>
      </app-table>
    </div>
  `,
})
export class MenuGroupComponent implements OnInit {
  isOpen = false;
  isDialogOpen = false;
  menuGroups: MenuGroup[] = [];
  menus: any[] = menuItems;
  selectedItem!: MenuGroup;
  title: string = '';
  mappedMenus: any[] = [];

  searchTerm: string = '';

  paginationParams: any = {
    page: 0,
    size: 10,
  };

  dataLength = 0;
  pageSize = 10;
  page = 0;

  columns = [
    { label: 'Icon', value: 'icon' },
    { label: 'Name', value: 'name' },
    { label: 'Translation Label', value: 'translationLabel' },
    { label: 'Sort Order', value: 'sortOrder' },
  ];

  constructor(
    public service: MenuGroupService,
    // public menuGroupService: MenuGroupService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.fetchMenuGroups();
  }

  async fetchMenuGroups() {
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
      page: page - 1,
      size,
    };

    const mappedData = this.mapData(data);

    this.menuGroups = mappedData;
    this.dataLength = total;
  }

  handleClose(result: boolean): void {
    this.service.clearForm();
    this.isOpen = false;
  }

  handleSearch(query: string): void {
    this.searchTerm = query;
    // Reset to the first page
    this.page = 0;
    this.paginationParams.page = 0;
    this.fetchMenuGroups();
  }

  closeConfirmDialog(event: any) {
    this.isDialogOpen = false;
  }

  mappedMenuItems = () => {
    return this.menuGroups.map((item) => ({
      ...item,
    }));
  };

  async getPaginatedData(event: { page: number; size: number }) {
    this.paginationParams.page = event.page;
    this.paginationParams.size = event.size;
    // Update the pageSize to reflect the new size
    this.pageSize = event.size;
    await this.fetchMenuGroups();
  }

  mapData = (data: MenuGroup[]) => {
    return data.map((item: MenuGroup) => ({
      ...item,
      icon: item.icon ? item.icon : 'expand_more',
    }));
  };
}
