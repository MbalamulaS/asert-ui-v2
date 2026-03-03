import { Component, OnInit } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { RoleService } from 'modules/role/role.service';
import { RolePermissionService } from 'modules/role/components/role-permission.component.service';
import { lastValueFrom } from 'rxjs';
import { PermissionEntryComponent } from 'components/permission-entry/permission-entry.component';
import { ContainerComponent } from 'components/container/container.component';
import { WrapperComponent } from 'components/wrapper/wrapper.component';
import { ActionButtonComponent } from 'components/action-button/action-button.component';
import { CantPipe } from 'pipes/cant.pipe';
import { SearchComponent } from 'components/search/search.component';
import { HeaderComponent } from 'components/header/header.component';

interface Permission {
  id: number;
  name: string;
}

type Role = {
  id: number;
  name: string;
  code: string;
  authorities: Permission[];
};

export type Entry = {
  id: number;
  name: string;
  uuid: string;
  action: string;
  resource: string;
};

type Perm = {
  resource: string;
  entries: Entry[];
};

@Component({
  selector: 'app-role-permissions',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    PermissionEntryComponent,
    ContainerComponent,
    WrapperComponent,
    ActionButtonComponent,
    CantPipe,
    SearchComponent,
    HeaderComponent,
  ],
  template: `
    <container>
      <app-header title="Permission For Role  {{ currentRole?.name }} " />
      <app-wrapper>
        <app-search
          label="Filter Permissions..."
          class="w-full md:w-auto"
          (onSearch)="handleSearch($event)"
        />

        <action-button
          label="Save Permissions"
          class="w-[575px] md:w-auto fixed md:static right-9 md:right-auto bottom-10 md:bottom-auto"
          icon="add"
          [isDisabled]="'' | cant: 'assignAuthorities' : 'Role'"
          (action)="savePermissions()"
        />
      </app-wrapper>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        @for (category of filteredEntries(); track category) {
          <div class="bg-white rounded-lg shadow-md border border-gray-200">
            <div class="bg-gray-100 p-2">
              <h2 class="text-sm text-gray-600 font-light pt-3 pl-3">
                {{ category.resource }}
              </h2>
            </div>
            @for (permission of category.entries; track permission.id) {
              <app-permission-entry
                [permission]="permission"
                [isSelected]="isPermissionSelected(permission.id)"
                (togglePermission)="togglePermission($event)"
              />
            }
          </div>
        }
      </div>
    </container>
  `,
  styleUrls: ['./role-permission.component.scss'],
})
export class RolePermissionsComponent implements OnInit {
  roleUuid: string | null = null;
  searchTerm: string = '';

  // all the permissions that will be looped over
  permissions: Perm[] = [];

  // all the permissions that the role has
  selectedPermissions: { [key: number]: boolean } = {};

  // the current role
  currentRole: Role | null = null;

  constructor(
    private route: ActivatedRoute,
    private roleService: RoleService,
    private rolePermissionService: RolePermissionService,
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.roleUuid = params.get('uuid');
      this.fetchRoleByUuid(this.roleUuid);
    });
  }

  handleSearch(query: string): void {
    this.searchTerm = query;
  }

  async fetchRoleByUuid(uuid: string | null): Promise<void> {
    if (!uuid) return;
    try {
      const role = await lastValueFrom(this.roleService.getRoleByUuid(uuid));
      const allPermissions = await lastValueFrom(
        this.rolePermissionService.getAllPermissions({}),
      );

      this.currentRole = role.data;
      this.selectedPermissions = this.currentRole.authorities.reduce(
        (acc, perm) => ({ ...acc, [perm.id]: true }),
        {},
      );
      this.permissions = this.removeDuplicates(allPermissions.data);
    } catch (error) {
      console.error('Error fetching role or permissions:', error);
    }
  }

  togglePermission(permissionId: number): void {
    this.selectedPermissions[permissionId] =
      !this.selectedPermissions[permissionId];
  }

  isPermissionSelected(permissionId: number): boolean {
    return !!this.selectedPermissions[permissionId];
  }

  filteredEntries(): Perm[] {
    if (!this.searchTerm) return this.permissions;

    return this.permissions.filter((p) =>
      p.resource.toLowerCase().includes(this.searchTerm.toLowerCase()),
    );
  }

  async savePermissions() {
    const selectedPermissionIds = Object.keys(this.selectedPermissions)
      .filter((id) => this.selectedPermissions[parseInt(id)])
      .map(Number)
      .filter((id) => id > 0);

    if (this.roleUuid) {
      try {
        await lastValueFrom(
          this.roleService.assignPermissions(this.roleUuid, {
            authorityIds: selectedPermissionIds,
          }),
        );
      } catch (error) {
        console.error('Error saving permissions:', error);
      }
    }
    await this.fetchRoleByUuid(this.roleUuid);
  }

  removeDuplicates(data) {
    const resourceMap = new Map();

    data.forEach((item) => {
      if (!resourceMap.has(item.resource)) {
        resourceMap.set(item.resource, item);
      }
    });

    return Array.from(resourceMap.values()).sort((a, b) =>
      a.resource.localeCompare(b.resource),
    );
  }
}
