import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TextInputComponent } from 'components/text-field/text-field.component';
import { FetcherComponent } from 'components/fetcher/fetcher.component';
import { RoleService } from 'modules/role/role.service';
import { SubmitButtonComponent } from 'components/submit-button/submit-button.component';
import { DualMultiSelectStringComponent } from 'components/dual-multiselect/dual-multi-select-string.component';
import { RadioButtonComponent } from 'components/radio/radio.component';
import { AutocompleteAsyncComponent } from 'components/autocomplete/autocomplete-async.component';

interface Item {
  id: number;
  name: string;
}

@Component({
  selector: 'role-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    TextInputComponent,
    FetcherComponent,
    SubmitButtonComponent,
    DualMultiSelectStringComponent,
    RadioButtonComponent,
    AutocompleteAsyncComponent,
  ],
  template: `
    <form [formGroup]="form" class="space-y-4">
      <app-text-input label="Role Name" name="name" formControlName="name" />

      <app-autocomplete-async
        api="admin-hierarchy-levels"
        label="Select Level..."
        [defaultParams]="{ size: '5', searchType: 'or' }"
        searchParam="name"
        displayKey="name"
        valueKey="id"
        formControlName="levelId"
        loadingLabel="Searching Level..."
      />

      <div class="flex flex-row gap-4">
        <div class="!mb-4">
          <app-radio-button
            label="Is Client Role?"
            name="isClient"
            formControlName="isClient"
            [options]="clientRoleOptions"
          />
        </div>

        <div class="!mb-4">
          <app-radio-button
            label="Has Approvals"
            name="hasApprovalStages"
            formControlName="hasApprovalStages"
            (selectionChange)="onApprovalSelectionChange($event)"
            [options]="options"
          />
        </div>
      </div>

      <ng-container *ngIf="form.get('hasApprovalStages')?.value">
        <app-fetcher
          api="roles/get-states"
          [defaultParams]="{ size: '100' }"
          loadingLabel="Fetching States.."
        >
          <ng-template let-response>
            <div *ngIf="response; else noData">
              <dual-multi-select-string
                [title]="'Select Approval Stages'"
                [items]="response.data"
                [selectedItems]="form.value.states"
                (onAddRemove)="handleAddRemove($event)"
              />
            </div>
            <ng-template #noData>No data available</ng-template>
          </ng-template>
        </app-fetcher>
      </ng-container>

      <div class="mt-4 flex justify-end">
        <submit-button
          [isDisabled]="!form.dirty || form.invalid || isSubmitting"
          [isSubmitting]="isSubmitting"
          [buttonText]="form.get('id')?.value ? 'UPDATE' : 'CREATE'"
          (action)="submitForm()"
        />
      </div>
      <!-- <pre>{{ form.value | json }}</pre> -->
    </form>
  `,
})
export class RoleFormComponent {
  form: FormGroup;
  selectedItems: Item[] = [];
  isSubmitting = false;
  canApprove: boolean = false;

  @Output() onSubmit = new EventEmitter<string>();

  options = [
    { value: true, label: 'Yes' },
    { value: false, label: 'No' },
  ];

  clientRoleOptions = [
    { value: true, label: 'Yes' },
    { value: false, label: 'No' },
  ];

  constructor(
    private fb: FormBuilder,
    public roleService: RoleService,
  ) {
    this.form = this.roleService.form;
  }

  async submitForm() {
    if (this.form.invalid) {
      return;
    }

    this.isSubmitting = true;

    try {
      const formData = this.form.value;
      this.onSubmit.emit(formData);
    } catch (error) {
    } finally {
      this.isSubmitting = false;
    }
  }

  handleOptionSelected(event: any) {
    this.selectedItems = event;
  }

  onSelectionChanged(selectedItems: any[]): void {
    this.selectedItems = selectedItems;
  }

  handleAddRemove(event: { added: string[]; removed: string[] }) {
    const statesControl = this.form.get('states');
    const { removed, added } = event;

    if (statesControl) {
      const currentStates = statesControl.value;
      const newRoles = [
        ...currentStates,
        ...added.filter(
          (item) => !currentStates.some((state: string) => state === item),
        ),
      ];

      const updatedRoles = newRoles.filter((state) => {
        return !removed.some((s) => s === state);
      });

      statesControl.setValue(updatedRoles);
    }
  }

  onApprovalSelectionChange(value: any): void {
    this.canApprove = value;
  }

  _canApprove() {
    const approvalControl = this.form.get('hasApprovalStages');
    if (approvalControl && approvalControl.value) {
      this.canApprove = approvalControl.value;
    }
  }
}
