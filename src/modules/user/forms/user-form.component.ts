import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TextInputComponent } from 'components/text-field/text-field.component';
import { UserService } from 'modules/user/user.service';
import { RoleService } from 'modules/role/role.service';
import { DualMultiSelectComponent } from 'components/dual-multiselect/dual-multiselect.component';
import { FetcherComponent } from 'components/fetcher/fetcher.component';
import { SubmitButtonComponent } from 'components/submit-button/submit-button.component';
import { Subscription, lastValueFrom } from 'rxjs';
import { AdminHierarchyService } from 'modules/admin-hierarchy/area/admin-hierarchy.service';
import { MatChipsModule } from '@angular/material/chips';
import { UploadTypes } from 'components/file-upload/types';
import { MaskedInputComponent } from 'components/masked-input/masked-input.component';
import { TreeComponent, TreeNode } from 'components/tree/tree.component';
import { TreeUIWrapperComponent } from 'components/tree/components/tree-ui-wrapper.component';
import { TreeService } from 'components/tree/services/tree.service';

interface Item {
  id: number;
  name: string;
}

@Component({
  selector: 'user-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TextInputComponent,
    DualMultiSelectComponent,
    FetcherComponent,
    SubmitButtonComponent,
    MatChipsModule,
    MaskedInputComponent,
    TreeComponent,
    TreeUIWrapperComponent,
  ],
  template: `
    <form [formGroup]="userForm" class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <app-text-input
          label="First Name"
          name="firstName"
          formControlName="firstName"
        />

        <app-text-input
          label="Middle Name"
          name="middleName"
          formControlName="middleName"
        />

        <app-text-input
          label="Last Name"
          name="lastName"
          formControlName="lastName"
        />

        <app-text-input
          label="User Email"
          name="email"
          formControlName="email"
          type="email"
        />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 md:gap-4 lg:gap-4">
        <masked-input
          formControlName="phoneNumber"
          label="Phone Number"
          name="phoneNumber"
          pattern="(9999) 999-999"
        />
      </div>

      <div>
        <ng-container *ngIf="currentNode; else noNode">
          <mat-chip size="small" color="primary"
            >{{ displayCurrentLocation('SELECTED', currentNode.name) }}
          </mat-chip>
        </ng-container>
        <ng-template #noNode>
          <ng-container
            *ngIf="
              userForm.value.id && userForm.value.adminHierarchyName;
              else noSelection
            "
          >
            <mat-chip size="small" color="primary"
              >{{
                displayCurrentLocation(
                  'Current Selection',
                  userForm.value.adminHierarchyName
                )
              }}
            </mat-chip>
          </ng-container>
          <ng-template #noSelection>
            <p>SELECT LOCATION</p>
          </ng-template>
        </ng-template>
        <!-- hierarchy section -->
        <tree-ui-wrapper
          loadingLabel="loading stations..."
          treeLabel="Assign Locations"
          [isLoadingTree]="isLoadingTree"
        >
          <app-tree
            [nodes]="treeData"
            [selectedNodeId]="userForm.get('adminHierarchyId')?.value"
            (nodeSelected)="onNodeSelected($event)"
            searchLabel="search stations..."
            (onSearch)="searchHierarchies($event)"
          />
          <input type="hidden" formControlName="adminHierarchyId" />
        </tree-ui-wrapper>
      </div>

      <div>
        <app-fetcher
          api="roles"
          [defaultParams]="{ size: '100' }"
          loadingLabel="Fetching Roles.."
        >
          <ng-template let-response>
            <div *ngIf="response; else noData">
              <app-dual-multi-select
                [title]="'Select Roles'"
                [items]="response.data"
                [selectedItems]="userForm.value.roles"
                (onAddRemove)="handleAddRemove($event)"
              />
            </div>
            <ng-template #noData>No data available</ng-template>
          </ng-template>
        </app-fetcher>
      </div>

      <div class="mt-4 flex justify-end">
        <submit-button
          [isDisabled]="!userForm.dirty || isSubmitting"
          [isSubmitting]="isSubmitting"
          [buttonText]="userForm.get('id')?.value ? 'UPDATE' : 'CREATE'"
          (action)="submitForm()"
        />
      </div>
    </form>
  `,
})
export class UserFormComponent implements OnInit {
  userForm: FormGroup;
  selectedRoles: Item[] = [];
  isSubmitting = false;
  @Output() onSubmit = new EventEmitter<string>();
  treeNode: TreeNode;
  currentNode: TreeNode;
  uploadType: typeof UploadTypes = UploadTypes;
  isLoadingTree = false;
  treeData: TreeNode[] = [];

  @ViewChild(TreeComponent) treeComponent: TreeComponent;

  private subscriptions: Subscription = new Subscription();

  constructor(
    public userService: UserService,
    public roleService: RoleService,
    public treeService: TreeService,
    public adminHierarchyService: AdminHierarchyService,
  ) {
    this.userForm = this.userService.userForm;
  }

  ngOnInit(): void {
    this.subscriptions.add(
      this.treeService.treeData$.subscribe((data) => {
        this.treeData = data;
        if (this.treeComponent) {
          this.treeComponent.updateTree();
        }
      }),
    );

    this.subscriptions.add(
      this.treeService.isLoading$.subscribe((isLoading) => {
        this.isLoadingTree = isLoading;
      }),
    );

    this.subscriptions.add(
      this.treeService.selectedNode$.subscribe((node) => {
        if (node) {
          this.userForm.get('adminHierarchyId')?.setValue(node.id);
          this.userForm.get('adminHierarchyId')?.markAsDirty();
        }
      }),
    );

    // Fetch the tree
    this.fetchHierarchyTree();

    // If the form has a adminHierarchyId (e.g., when editing a user), search for the station
    const stationId = this.userForm.get('adminHierarchyId')?.value;
    if (stationId) {
      this.searchAreasById(stationId);
    }
  }

  handleAddRemove(event: { added: Item[]; removed: Item[] }) {
    const rolesControl = this.userForm.get('roles');
    const { removed, added } = event;

    if (rolesControl) {
      const currentRoles = rolesControl.value;
      const newRoles = [
        ...currentRoles,
        ...added.filter(
          (item) => !currentRoles.some((role) => role.id === item.id),
        ),
      ];

      const updatedRoles = newRoles.filter((role) => {
        return !removed.some((r) => r.id === role.id);
      });

      rolesControl.setValue(updatedRoles);
    }
  }

  async submitForm() {
    this.isSubmitting = true;

    try {
      const formData = this.userForm.value;
      this.onSubmit.emit(formData);
    } catch (error) {
    } finally {
      this.isSubmitting = false;
    }
  }

  onSelectionChanged(selectedItems: any[]): void {
    this.selectedRoles = selectedItems;
  }

  displayCurrentLocation(type: string, name: string): string {
    return `${type}: ${name}`;
  }

  handleUploadSuccess(data: any) {
    console.log('Uploaded files:', data);
  }

  async fetchHierarchyTree() {
    await this.treeService.fetchTree(
      this.adminHierarchyService.getTree.bind(this.adminHierarchyService),
    );
  }

  async onNodeSelected(node: TreeNode) {
    await this.treeService.selectNode(node, (uuid) =>
      this.adminHierarchyService.getChildren(uuid),
    );
  }

  async searchHierarchies(searchTerm: string) {
    await this.treeService.searchTree(searchTerm, (query) =>
      this.adminHierarchyService.searchTree(query),
    );
  }

  async searchAreasById(stationId: string | number) {
    await this.treeService.searchTreeById(stationId, (query) =>
      this.adminHierarchyService.searchTree(query),
    );
  }
}
