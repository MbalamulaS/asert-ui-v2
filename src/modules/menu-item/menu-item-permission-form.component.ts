import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { MenuItemService } from './menu-item.service';
import { lastValueFrom } from 'rxjs';
import { RolePermissionService } from 'modules/role/components/role-permission.component.service';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { SingleColumnCheckboxTableComponent } from './single-column-checkbox-table.component';
import { startWith, map } from 'rxjs/operators';
import { SubmitButtonComponent } from 'components/submit-button/submit-button.component';

@Component({
  selector: 'menu-item-permission-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatInputModule,
    SingleColumnCheckboxTableComponent,
    SubmitButtonComponent,
  ],
  template: `
    <form [formGroup]="form">
      <div class="mb-4">
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Select Resource</mat-label>
          <input
            type="text"
            matInput
            [matAutocomplete]="auto"
            formControlName="permission"
          />
          <mat-autocomplete
            #auto="matAutocomplete"
            (optionSelected)="filterOptions($event)"
          >
            <mat-option
              *ngFor="let perm of filteredPermissions | async"
              [value]="perm.name"
            >
              {{ perm.name }}
            </mat-option>
          </mat-autocomplete>
          <mat-error *ngIf="form.get('permission')?.hasError('required')">
            * Please Select Permission
          </mat-error>
        </mat-form-field>
      </div>
      <div *ngIf="state.permissions.length > 0" class="mb-4">
        <app-single-column-checkbox-table
          [rows]="state.permissions"
          (itemChecked)="handleItemCheck($event)"
          [selectedItems]="selectedItems"
        />
      </div>

      <div class="mt-4 flex justify-end">
        <submit-button
          [isDisabled]="!form.dirty || form.invalid || isSubmitting"
          [isSubmitting]="isSubmitting"
          [buttonText]="form.get('id')?.value ? 'UPDATE' : 'CREATE'"
          (action)="submitForm()"
        />
      </div>
      <!--<pre>{{ form.value | json }}</pre>-->
    </form>
  `,
  styles: [
    `
      .container {
        @apply mx-auto p-4;
      }
    `,
  ],
})
export class MenuItemPermissionFormComponent implements OnInit {
  @Input() selectedItems: any[] = [];
  @Output() onSubmit = new EventEmitter<string>();

  form: FormGroup;
  state = {
    permissions: [],
    groupedPermissions: [],
    groupedPermissionsNames: [],
    menuItem: {} as any,
    permissionNames: [],
    ROWS: [],
  };

  permissions: any[] = [];
  filteredPermissions: any;
  selectedPermissions: any[] = [];
  isSubmitting = false;

  constructor(
    private menuItemService: MenuItemService,
    private rolePermissionService: RolePermissionService,
  ) {
    this.form = this.menuItemService.form;
  }

  ngOnInit(): void {
    // Initialize menuItem.authorities if it doesn't exist
    if (!this.state.menuItem.authorities) {
      this.state.menuItem.authorities = [];
    }

    // Add selected items to authorities if they exist
    if (this.selectedItems && this.selectedItems.length > 0) {
      this.state.menuItem.authorities = this.selectedItems;

      // Pre-select items in the form if authorities control exists
      const authCtrl = this.form.get('permissions');
      if (authCtrl) {
        authCtrl.setValue(this.selectedItems.map((item) => item.id));
        authCtrl.markAsDirty(); // Mark dirty so submit button enables
      }
    }

    this.fetchData();
    this.filteredPermissions = this.form.get('permission')?.valueChanges.pipe(
      startWith(''),
      map((value) => this._filterPermissions(value || '')),
    );
  }

  async fetchData() {
    try {
      const response = await lastValueFrom(
        this.rolePermissionService.getAllPermissions({}),
      );

      await this.fetchAuthorities();

      if (response.status === 200) {
        const permissions = response.data.sort((a, b) =>
          a.resource > b.resource ? 1 : -1,
        );

        this.state.groupedPermissions = permissions;
        await this.setRows(response.data);
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
    }
  }

  async fetchAuthorities() {
    try {
      const response = await lastValueFrom(
        this.rolePermissionService.get({ size: 500 }),
      );

      const key = 'name';

      const names = response.data.map((perm: any) => ({
        id: perm.id,
        name: perm.resource,
      }));

      const _uniquePermissions = [
        ...new Map(names.map((item) => [item[key], item])).values(),
      ].sort((a, b) => (a['name'] > b['name'] ? 1 : -1));

      this.permissions = _uniquePermissions;
    } catch (error) {
      console.error('Error fetching authorities:', error);
    }
  }

  async setRows(permissions: any[]) {
    const { permission } = this.form.value;
    const selectedPermission = permissions.find(
      (perm) => perm.resource === permission,
    );

    if (selectedPermission) {
      this.state.permissions = selectedPermission.entries;
    } else {
      this.state.permissions = [];
    }

    // If we have a permission selected and we have selectedItems,
    // we should check if any of our selected items belong to this permission
    if (permission && this.selectedItems && this.selectedItems.length > 0) {
      // Find all items from selectedItems that belong to this permission
      const selectedIds = this.selectedItems.map((item) => item.id);

      // Update the form control if it exists
      const authCtrl = this.form.get('permissions');
      if (authCtrl) {
        authCtrl.setValue(selectedIds);
      }
    }
  }

  filterOptions(event: MatAutocompleteSelectedEvent) {
    const item = event.option.value;
    let perm = this.permissions.find((pr) => pr.name === item);
    const authority = perm
      ? this.state.groupedPermissions.find((gp) => gp.resource === perm.name)
      : null;

    this.state.permissions =
      authority && authority.entries ? authority.entries : [];

    // Don't lose current selections when changing resource
    if (this.form.get('permissions')) {
      this.form.markAsDirty(); // Mark dirty to enable submit button
    }
  }

  handleItemCheck(id: string) {
    try {
      const authorityCtrl = this.form.get('permissions');
      if (!authorityCtrl) return;

      // remove item from authorityCtrl if it exists otherwise add it
      if (authorityCtrl.value.includes(id)) {
        authorityCtrl.setValue(
          authorityCtrl.value.filter((i: any) => i !== id),
        );
      } else {
        authorityCtrl.setValue([...authorityCtrl.value, id]);
      }

      // Initialize authorities array if it doesn't exist
      if (!this.state.menuItem.authorities) {
        this.state.menuItem.authorities = [];
      }

      const idx = this.state.menuItem.authorities
        ?.map((i) => parseInt(i.id))
        .indexOf(parseInt(id));

      if (idx !== -1) {
        this.state.menuItem.authorities?.splice(idx, 1);
      } else {
        const item = this.state.permissions.find(
          (entry) => parseInt(entry.id) === parseInt(id),
        );
        if (item) {
          this.state.menuItem.authorities.push(item);
        }
      }

      // Mark form as dirty so submit button enables
      this.form.markAsDirty();
    } catch (error) {
      console.error('Error handling item check:', error, id);
    }
  }

  submitForm() {
    if (this.form.invalid) {
      return;
    }

    this.isSubmitting = true;

    try {
      const formData = this.form.value;
      this.onSubmit.emit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      this.isSubmitting = false;
    }
  }

  private _filterPermissions(value: string): any[] {
    if (!value) return this.permissions;

    const filterValue = value.toLowerCase();
    return this.permissions.filter((permission) =>
      permission.name.toLowerCase().includes(filterValue),
    );
  }
}
