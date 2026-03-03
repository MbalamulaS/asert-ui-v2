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
import { SubmitButtonComponent } from 'components/submit-button/submit-button.component';
import { MatChipsModule } from '@angular/material/chips';
import { MaskedInputComponent } from 'components/masked-input/masked-input.component';
import { RadioButtonComponent } from 'components/radio/radio.component';
import { TreeUIWrapperComponent } from '../../../components/tree/components/tree-ui-wrapper.component';
import {
  TreeComponent,
  TreeNode,
} from '../../../components/tree/tree.component';
import { TreeService } from 'components/tree/services/tree.service';
import { AdminHierarchyService } from 'modules/admin-hierarchy/area/admin-hierarchy.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'user-registration-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TextInputComponent,
    SubmitButtonComponent,
    MatChipsModule,
    MaskedInputComponent,
    RadioButtonComponent,
    TreeUIWrapperComponent,
    TreeComponent,
  ],
  template: `
    <form [formGroup]="registrationForm" class="space-y-6">
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

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 ">
        <masked-input
          formControlName="phoneNumber"
          label="Phone Number"
          name="phoneNumber"
          pattern="(9999) 999-999"
        />
        <app-radio-button
          label="Registration Type"
          name="registrationType"
          [form]="registrationForm"
          [options]="registrationOptions"
        />
      </div>
      <div class="py-4">
        <ng-container *ngIf="currentNode; else noNode">
          <mat-chip size="small" color="primary"
            >{{ displayCurrentLocation('SELECTED', currentNode.name) }}
          </mat-chip>
        </ng-container>
        <ng-template #noNode>
          <ng-container
            *ngIf="
              registrationForm.value.id &&
                registrationForm.value.adminHierarchyName;
              else noSelection
            "
          >
            <mat-chip size="small" color="primary"
              >{{
                displayCurrentLocation(
                  'Current Selection',
                  registrationForm.value.adminHierarchyName
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
          loadingLabel="loading location tree..."
          treeLabel="Select Your Location"
          [isLoadingTree]="isLoadingTree"
        >
          <app-tree
            [nodes]="treeData"
            [selectedNodeId]="registrationForm.get('adminHierarchyId')?.value"
            (nodeSelected)="onNodeSelected($event)"
            searchLabel="search location..."
            (onSearch)="searchHierarchies($event)"
          />
          <input type="hidden" formControlName="adminHierarchyId" />
        </tree-ui-wrapper>
      </div>

      <div class="mt-4 flex justify-end">
        <submit-button
          [isDisabled]="!registrationForm.dirty || isSubmitting"
          [isSubmitting]="isSubmitting"
          [buttonText]="'Create Account'"
          (action)="submitForm()"
        />
      </div>
    </form>
    <!-- <pre> {{ registrationForm.value | json }} </pre> -->
  `,
})
export class UserRegistrationFormComponent implements OnInit {
  registrationForm: FormGroup;
  isSubmitting = false;
  @Output() onSubmit = new EventEmitter<string>();
  treeNode: TreeNode;
  currentNode: TreeNode;
  isLoadingTree = false;
  treeData: TreeNode[] = [];
  @ViewChild(TreeComponent) treeComponent: TreeComponent;
  private subscriptions: Subscription = new Subscription();

  registrationOptions = [
    { value: 'ASSESSOR', label: 'Assessor' },
    { value: 'FACILITY_OWNER', label: 'Facility/Service Owner' },
  ];

  constructor(
    public userService: UserService,
    public treeService: TreeService,
    public adminHierarchyService: AdminHierarchyService,
  ) {
    this.registrationForm = this.userService.registrationFormNew;
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
          this.registrationForm.get('adminHierarchyId')?.setValue(node.id);
          this.registrationForm.get('adminHierarchyId')?.markAsDirty();
        }
      }),
    );
  }

  async submitForm() {
    this.isSubmitting = true;

    try {
      const formData = this.registrationForm.value;

      this.onSubmit.emit(formData);
    } catch (error) {
    } finally {
      this.isSubmitting = false;
    }
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
}
