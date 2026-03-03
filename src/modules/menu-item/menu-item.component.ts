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
import { DialogComponent } from 'components/dialog/dialog.component';
import { HeaderComponent } from 'components/header/header.component';
import { SearchComponent } from 'components/search/search.component';
import { CantPipe } from 'pipes/cant.pipe';
import { lastValueFrom } from 'rxjs';
import { DEFAULT_SEARCH_PARAMS } from 'utils/helpers';
import { Router } from '@angular/router';
import { WrapperComponent } from 'components/wrapper/wrapper.component';
import { ActionButtonComponent } from 'components/action-button/action-button.component';
import { IconButtonComponent } from 'components/icon-button/icon-button.component';
import { MenuItem } from 'modules/menu-item/menu-item.service';
import { MenuItemService } from 'modules/menu-item/menu-item.service';
import { MenuGroup } from 'layouts/main-layout/nav/menu-items';
import { MenuGroupService } from 'modules/menu-group/menu-group.service';
import { menuItems } from 'layouts/main-layout/nav/menu-items';
import { NgIf } from '@angular/common';
import { MenuItemPermissionFormComponent } from './menu-item-permission-form.component';
import { AutocompleteComponent } from 'components/autocomplete/autocomplete.component';
import { FetcherComponent } from 'components/fetcher/fetcher.component';

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
  template: ` <div class="p-4">
      <app-header title="Manage Menu Items" />
      <app-wrapper>
        <div class="flex w-full md:w-auto md:flex-1">
          <app-search
            class="w-full md:w-auto"
            (onSearch)="handleSearch($event)"
          />
        </div>
        <div class="flex space-x-4 items-center">
          <app-fetcher
            api="menu-groups"
            class="!mt-5 !w-[100%] md:!w-[300px]"
            [defaultParams]="{ size: '100' }"
            loadingLabel="Fetching menu items.."
          >
            <ng-template let-response>
              <div *ngIf="response; else noData">
                <app-autocomplete
                  label="Filter By Menu Groups..."
                  formControlName="menuGroupId"
                  [displayLabel]="'name'"
                  (onOptionSelected)="handleOptionSelected($event)"
                  [options]="response.data"
                />
              </div>
              <ng-template #noData>No data available</ng-template>
            </ng-template>
          </app-fetcher>
          <action-button
            label="SYNC"
            class="w-full md:w-auto"
            icon="sync"
            [isDisabled]="'' | cant: 'create' : 'MenuItem'"
            (action)="syncMenus(menus)"
          />
        </div>
      </app-wrapper>

      <app-table
        [data]="menuItems"
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

        <ng-template #actionTemplate let-item>
          <icon-button
            [isDisabled]="'' | cant: 'assignPermission' : 'MenuItem'"
            icon="settings"
            tooltip="Assign Permissions"
            color="primary"
            (action)="openDialog(item)"
          />
        </ng-template>
      </app-table>

      <app-dialog
        [open]="isOpen"
        (onClose)="handleClose($event)"
        width="740px"
        [title]="'Assign Permission ' + selectedItem?.name + ' Menu Item'"
      >
        <ng-template>
          <menu-item-permission-form
            [selectedItems]="selectedItem.permissions"
            (onSubmit)="saveData($event)"
          />
        </ng-template>
      </app-dialog>
    </div>
    ...`,
  imports: [
    TableComponent,
    MatIconModule,
    DialogComponent,
    HeaderComponent,
    SearchComponent,
    CantPipe,
    WrapperComponent,
    ActionButtonComponent,
    IconButtonComponent,
    NgIf,
    MenuItemPermissionFormComponent,
    AutocompleteComponent,
    FetcherComponent,
  ],
})
export class MenuItemComponent implements OnInit {
  isOpen = false;
  isDialogOpen = false;
  menuItems: MenuItem[] = [];
  menus: any[] = menuItems;
  selectedItem!: MenuItem;
  title: string = '';
  mappedMenus: any[] = [];
  menuGroup: string = '';

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
    { label: 'State', value: 'state' },
    { label: 'Name', value: 'name' },
    { label: 'Menu Group', value: 'menuGroupName' },
    { label: 'Translation Label', value: 'translationLabel' },
    { label: 'Sort Order', value: 'sortOrder' },
  ];

  constructor(
    public service: MenuItemService,
    public menuGroupService: MenuGroupService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.fetchMenuItems();
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
    this.fetchMenuItems();
  }

  // Unchanged methods: fetchMenuItems, saveData, handleClose, handleSearch,
  async fetchMenuItems() {
    let query = {
      ...this.paginationParams,
      ...DEFAULT_SEARCH_PARAMS,
      sort: 'id,asc',
    };

    if (this.searchTerm && this.searchTerm.length > 0) {
      query['name'] = this.searchTerm;
    }

    if (this.menuGroup && this.menuGroup.length != 0) {
      query['menuGroupId'] = this.menuGroup;
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

    const withoutGroups = mappedData.filter(
      (menu) => menu.menuGroupId === null,
    );
    const menus = [
      ...new Set([
        ...withoutGroups,
        ...mappedData.sort((a, b) => (a.menuGroupId > b.menuGroupId ? 1 : -1)),
      ]),
    ];

    this.menuItems = menus;
    this.dataLength = total;
  }

  async saveData(data) {
    const payload = {
      menuItemUuid: data.menuItemUuid,
      permissionIds: data.permissions,
    };

    const response = await lastValueFrom(
      this.service.assignPermissions(payload),
    );

    if (response.status === 201) {
      this.isOpen = false;
    }
  }

  // closeConfirmDialog, mappedMenuItems, openDialog, getPaginatedData,
  closeConfirmDialog(event: any) {
    this.isDialogOpen = false;
  }

  mappedMenuItems = () => {
    return this.menuItems.map((item) => ({
      ...item,
    }));
  };

  async openDialog(data?: any) {
    const response = await lastValueFrom(
      this.service.getMenuItemByUuid(data.uuid),
    );

    this.selectedItem = response.data;

    const payload = {
      menuItemUuid: data.uuid,
      menuItemId: data.id,
      permissions: response.data.authorityIds,
      permission: response.data.permissions[0]?.resource || '',
    };

    this.isOpen = true;
    this.service.populateForm(payload);
  }

  async getPaginatedData(event: { page: number; size: number }) {
    this.paginationParams.page = event.page;
    this.paginationParams.size = event.size;
    // Update the pageSize to reflect the new size
    this.pageSize = event.size;
    await this.fetchMenuItems();
  }

  handleOptionSelected(query: string): void {
    this.menuGroup = query;
    this.page = 0;
    this.paginationParams.page = 0;
    this.fetchMenuItems();
  }

  mapData = (data: MenuItem[]) => {
    return data.map((item: MenuItem) => ({
      ...item,
      icon: item.icon ? item.icon : 'expand_more',
    }));
  };
  // handleOptionSelected, mapData

  syncMenus = async (items: Array<MenuItem>) => {
    try {
      // Fetch all existing menu items and groups
      const allMenuItemsResponse = await lastValueFrom(
        this.service.get({ size: 1000 }),
      );
      const allMenuItems = allMenuItemsResponse.data;

      const allMenuGroupsResponse = await lastValueFrom(
        this.menuGroupService.get({ size: 200 }),
      );
      const allMenuGroups = allMenuGroupsResponse.data;

      // Process menu items (create/update)
      await this.processBatchSync(items, allMenuItems, allMenuGroups);

      // Delete menu items that are in the database but not in the JSON file
      await this.deleteRemovedMenuItems(items, allMenuItems, allMenuGroups);

      // Refresh the displayed data
      await this.fetchMenuItems();
    } catch (error) {
      console.error('Error synchronizing menus:', error);
    }
  };

  /**
   * Process a batch of menu items for sync
   */
  processBatchSync = async (
    items: MenuItem[],
    existingMenuItems: MenuItem[],
    existingMenuGroups: MenuGroup[],
  ) => {
    const syncPromises = items.map(async (item) => {
      if (item.children && item.children.length > 0) {
        // Handle menu group and its children
        await this.syncMenuGroup(item, existingMenuGroups, existingMenuItems);
      } else {
        // Handle simple menu item
        await this.syncMenuItem(item, existingMenuItems);
      }
    });

    await Promise.all(syncPromises);
  };

  /**
   * Sync a menu group and its children
   */
  syncMenuGroup = async (
    item: MenuItem,
    existingMenuGroups: MenuGroup[],
    existingMenuItems: MenuItem[],
  ) => {
    let menuGroup: MenuGroup | null = null;

    const foundMenuGroup = existingMenuGroups.find(
      (mg: MenuGroup) =>
        mg.name.trim().toUpperCase() === item.name.trim().toUpperCase(),
    );

    if (foundMenuGroup) {
      const updatedMenuGroup = {
        ...foundMenuGroup,
        translationLabel: item.translationLabel,
        icon: item.icon || foundMenuGroup.icon,
        state: item.state || foundMenuGroup.state,
      };

      if (
        updatedMenuGroup.translationLabel !== foundMenuGroup.translationLabel ||
        updatedMenuGroup.icon !== foundMenuGroup.icon ||
        updatedMenuGroup.state !== foundMenuGroup.state
      ) {
        await lastValueFrom(
          this.menuGroupService.update(foundMenuGroup.uuid, updatedMenuGroup),
        );
      }

      menuGroup = updatedMenuGroup;
    } else {
      const response = await lastValueFrom(
        this.menuGroupService.create({
          name: item.name,
          translationLabel: item.translationLabel,
          icon: item.icon || 'folder',
          state: item.state || null,
        }),
      );
      menuGroup = response.data;
    }

    if (item.children && menuGroup) {
      const childPromises = item.children.map(async (childItem) => {
        const enrichedChildItem = {
          ...childItem,
          menuGroupId: menuGroup!.id,
        };

        await this.syncMenuItem(enrichedChildItem, existingMenuItems);
      });

      await Promise.all(childPromises);
    }
  };

  /**
   * Sync an individual menu item
   */
  syncMenuItem = async (item: MenuItem, existingMenuItems: MenuItem[]) => {
    const existingItemByName = existingMenuItems.find(
      (mi: MenuItem) =>
        mi.name.trim().toLowerCase() === item.name.trim().toLowerCase() &&
        mi.menuGroupId === (item.menuGroupId || null),
    );

    const existingItemByState = !existingItemByName
      ? existingMenuItems.find((mi) => mi.state === item.state)
      : null;

    const existingItem = existingItemByName || existingItemByState;

    if (existingItem) {
      const isStateChange = existingItem.state !== item.state;
      const needsUpdate =
        isStateChange || this.menuItemNeedsUpdate(item, existingItem);

      if (needsUpdate) {
        console.log(
          `Updating menu item: ${item.name} (${existingItem.state} → ${item.state})`,
        );

        const updatePayload = {
          ...item,
          uuid: existingItem.uuid,
          id: existingItem.id,
          menuGroupId:
            item.menuGroupId !== undefined
              ? item.menuGroupId
              : existingItem.menuGroupId,
          sortOrder:
            item.sortOrder !== undefined
              ? item.sortOrder
              : existingItem.sortOrder,
        };

        await lastValueFrom(
          this.service.update(existingItem.uuid, updatePayload),
        );
      }
    } else {
      console.log(`Creating new menu item: ${item.name} (${item.state})`);
      await lastValueFrom(this.service.create(item));
    }
  };

  /**
   * Determines if a menu item needs to be updated
   */
  menuItemNeedsUpdate = (
    newItem: MenuItem,
    existingItem: MenuItem,
  ): boolean => {
    if (
      newItem.name !== existingItem.name ||
      newItem.state !== existingItem.state ||
      newItem.icon !== existingItem.icon ||
      newItem.translationLabel !== existingItem.translationLabel ||
      newItem.sortOrder !== existingItem.sortOrder ||
      (newItem.menuGroupId !== undefined &&
        newItem.menuGroupId !== existingItem.menuGroupId)
    ) {
      return true;
    }

    return false;
  };

  /**
   * Delete menu items that are in the database but not in the JSON file
   */
  deleteRemovedMenuItems = async (
    jsonItems: MenuItem[],
    existingMenuItems: MenuItem[],
    existingMenuGroups: MenuGroup[],
  ) => {
    // Flatten JSON items to include children
    const jsonMenuItems = this.flattenMenuItems(jsonItems, existingMenuGroups);

    // Find database items that are not in the JSON file
    const itemsToDelete = existingMenuItems.filter((dbItem) => {
      return !jsonMenuItems.some((jsonItem) =>
        this.isMatchingMenuItem(jsonItem, dbItem),
      );
    });

    // Delete the identified items
    const deletePromises = itemsToDelete.map(async (item) => {
      console.log(`Deleting menu item: ${item.name} (${item.state})`);
      await lastValueFrom(this.service.delete(item.uuid));
    });

    await Promise.all(deletePromises);
  };

  /**
   * Flatten menu items from JSON, including children, and map menu group names to IDs
   */
  flattenMenuItems = (
    items: MenuItem[],
    existingMenuGroups: MenuGroup[],
  ): MenuItem[] => {
    const flattened: MenuItem[] = [];

    items.forEach((item) => {
      // Find the menu group ID for this item (if it's a group)
      const menuGroup = existingMenuGroups.find(
        (mg) => mg.name.trim().toUpperCase() === item.name.trim().toUpperCase(),
      );

      // Add the item itself (if it has no children, it's a menu item)
      if (!item.children || item.children.length === 0) {
        flattened.push({
          ...item,
          menuGroupId: menuGroup ? menuGroup.id : null,
        });
      }

      // Add children (if any)
      if (item.children) {
        item.children.forEach((child) => {
          flattened.push({
            ...child,
            menuGroupId: menuGroup ? menuGroup.id : null,
          });
        });
      }
    });

    return flattened;
  };

  /**
   * Check if two menu items match (for comparison)
   */
  isMatchingMenuItem = (jsonItem: MenuItem, dbItem: MenuItem): boolean => {
    // Match by name (case-insensitive) and menu group ID
    const nameMatch =
      jsonItem.name.trim().toLowerCase() === dbItem.name.trim().toLowerCase();
    const groupMatch = jsonItem.menuGroupId === dbItem.menuGroupId;

    // Match by state as a fallback if names don't match
    const stateMatch = jsonItem.state === dbItem.state;

    return (nameMatch && groupMatch) || stateMatch;
  };
}
