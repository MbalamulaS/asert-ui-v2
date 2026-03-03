import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TextInputComponent } from 'components/text-field/text-field.component';
import { FetcherComponent } from 'components/fetcher/fetcher.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FacilityLevelService } from 'modules/setup/facility-level/facility-level.service';
import { SubmitButtonComponent } from 'components/submit-button/submit-button.component';
import { AutocompleteComponent } from 'components/autocomplete/autocomplete.component';
import { DualMultiSelectComponent } from 'components/dual-multiselect/dual-multiselect.component';
import { ActionButtonComponent } from 'components/action-button/action-button.component';
import { FlatTableComponent } from 'components/table/flat-table.component';
import { IconButtonComponent } from 'components/icon-button/icon-button.component';
import { FacilityLevel } from 'modules/setup/facility-level/facility-level';
import { Infrastructure } from 'modules/setup/infrastructure/infrastructure';
import { Equipment } from 'modules/setup/equipment/equipment';
import { Premise } from 'modules/setup/premise/premise';
import { StaffTitle } from 'modules/setup/staff-title/staff-title.service';

interface Service {
  id: number;
  name: string;
}

@Component({
  selector: 'facility-level-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    TextInputComponent,
    FetcherComponent,
    MatProgressSpinnerModule,
    SubmitButtonComponent,
    AutocompleteComponent,
    DualMultiSelectComponent,
    ActionButtonComponent,
    FlatTableComponent,
    IconButtonComponent,
  ],
  template: `
    <form [formGroup]="facilityLevelForm" class="space-y-4">
      <app-text-input label="Name" name="name" formControlName="name" />

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <app-text-input label="Code" name="code" formControlName="code" />
        <app-fetcher
          api="facility-level-groups"
          [defaultParams]="{ size: '100' }"
          loadingLabel="Fetching Groups.."
        >
          <ng-template let-response>
            <div *ngIf="response; else noData">
              <app-autocomplete
                label="Select Group"
                formControlName="facilityLevelGroupId"
                [displayLabel]="'name'"
                (onOptionSelected)="handleOptionSelected($event)"
                [options]="response.data"
              />
            </div>
            <ng-template #noData>No data available</ng-template>
          </ng-template>
        </app-fetcher>
      </div>

      <!-- Rank and Price Fields -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <app-text-input
          label="Rank"
          name="rank"
          formControlName="levelRank"
          type="number"
        />
        <app-text-input label="Price" name="price" formControlName="price" />
      </div>

      <div>
        <app-fetcher
          api="services"
          [defaultParams]="{ size: '100' }"
          loadingLabel="Fetching Services.."
        >
          <ng-template let-response>
            <div *ngIf="response; else noData">
              <app-dual-multi-select
                [title]="'Select Services for this level'"
                [items]="response.data"
                [selectedItems]="facilityLevelForm.value.services"
                (onAddRemove)="handleAddRemoveService($event)"
              />
            </div>
            <ng-template #noData>No data available</ng-template>
          </ng-template>
        </app-fetcher>
      </div>

      <h3 style="margin-top: 30px">Assign Required Equipment</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-2">
        <app-fetcher
          api="equipments"
          [defaultParams]="{ size: 10000 }"
          loadingLabel="Fetching Equipment.."
        >
          <ng-template let-response>
            <div *ngIf="response; else noData">
              <app-autocomplete
                label="Select Equipment"
                name="equipmentId"
                [returnObject]="true"
                [formControl]="equipmentControl"
                [displayLabel]="'name'"
                [options]="response.data"
              ></app-autocomplete>
            </div>
            <ng-template #noData>No data available</ng-template>
          </ng-template>
        </app-fetcher>
        <app-text-input
          type="number"
          label="Quantity"
          name="quantity"
          [formControl]="equipmentQtyControl"
        ></app-text-input>
        <action-button
          label="Add"
          icon="add"
          class="w-full md:w-auto"
          [isDisabled]="equipmentControl.invalid || equipmentQtyControl.invalid"
          (action)="addEquipment()"
        />
      </div>
      <div
        class="grid grid-cols-1 gap-x-4 gap-y-2 mt-5"
        *ngIf="equipments.length > 0"
      >
        <flat-table
          [data]="equipments"
          [columns]="equipmentColumns"
          [dataLength]="equipments.length"
          [showPagination]="true"
        >
          <ng-template #actionTemplate let-item>
            <icon-button
              icon="delete_outline"
              tooltip="Remove Equipment"
              color="accent"
              (action)="removeEquipment(item.id)"
            />
          </ng-template>
        </flat-table>
      </div>
      <h3 style="margin-top: 30px">Assign Required Premises</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-2">
        <app-fetcher
          api="premises"
          [defaultParams]="{ size: 10000 }"
          loadingLabel="Fetching Premises.."
        >
          <ng-template let-response>
            <div *ngIf="response; else noData">
              <app-autocomplete
                label="Select Premise"
                name="premiseId"
                [returnObject]="true"
                [formControl]="premiseControl"
                [displayLabel]="'name'"
                [options]="response.data"
              ></app-autocomplete>
            </div>
            <ng-template #noData>No data available</ng-template>
          </ng-template>
        </app-fetcher>
        <app-text-input
          type="number"
          label="Quantity"
          name="quantity"
          [formControl]="premiseQtyControl"
        ></app-text-input>
        <action-button
          label="Add"
          icon="add"
          class="w-full md:w-auto"
          [isDisabled]="premiseControl.invalid || premiseQtyControl.invalid"
          (action)="addPremise()"
        />
      </div>
      <div
        class="grid grid-cols-1 gap-x-4 gap-y-2 mt-5"
        *ngIf="premises.length > 0"
      >
        <flat-table
          [data]="premises"
          [columns]="premiseColumns"
          [dataLength]="premises.length"
          [showPagination]="true"
        >
          <ng-template #actionTemplate let-item>
            <icon-button
              icon="delete_outline"
              tooltip="Remove Premise"
              color="accent"
              (action)="removePremise(item.id)"
            />
          </ng-template>
        </flat-table>
      </div>

      <h3 style="margin-top: 30px">Assign Required Infrastructure</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-2">
        <app-fetcher
          api="infrastructures"
          [defaultParams]="{ size: 10000 }"
          loadingLabel="Fetching Infrastructures.."
        >
          <ng-template let-response>
            <div *ngIf="response; else noData">
              <app-autocomplete
                label="Select Infrastructure"
                name="infrastructureId"
                [returnObject]="true"
                [formControl]="infrastructureControl"
                [displayLabel]="'name'"
                [options]="response.data"
              ></app-autocomplete>
            </div>
            <ng-template #noData>No data available</ng-template>
          </ng-template>
        </app-fetcher>
        <app-text-input
          type="number"
          label="Quantity"
          name="quantity"
          [formControl]="infrastructureQtyControl"
        ></app-text-input>
        <action-button
          label="Add"
          icon="add"
          class="w-full md:w-auto"
          [isDisabled]="
            infrastructureControl.invalid || infrastructureQtyControl.invalid
          "
          (action)="addInfrastructure()"
        />
      </div>
      <div
        class="grid grid-cols-1 gap-x-4 gap-y-2 mt-5"
        *ngIf="infrastructures.length > 0"
      >
        <flat-table
          [data]="infrastructures"
          [columns]="infrastructureColumns"
          [dataLength]="infrastructures.length"
          [showPagination]="true"
        >
          <ng-template #actionTemplate let-item>
            <icon-button
              icon="delete_outline"
              tooltip="Remove Infrastructure"
              color="accent"
              (action)="removeInfrastructure(item.id)"
            />
          </ng-template>
        </flat-table>
      </div>

      <h3 style="margin-top: 30px">Assign Required Staff</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-2">
        <app-fetcher
          api="staff-titles"
          [defaultParams]="{ size: 10000 }"
          loadingLabel="Fetching Staffs.."
        >
          <ng-template let-response>
            <div *ngIf="response; else noData">
              <app-autocomplete
                label="Select Staff"
                name="staffId"
                [returnObject]="true"
                [formControl]="staffControl"
                [displayLabel]="'name'"
                [options]="response.data"
              ></app-autocomplete>
            </div>
            <ng-template #noData>No data available</ng-template>
          </ng-template>
        </app-fetcher>
        <app-text-input
          type="number"
          label="Quantity"
          name="quantity"
          [formControl]="staffQtyControl"
        ></app-text-input>
        <action-button
          label="Add"
          icon="add"
          class="w-full md:w-auto"
          [isDisabled]="staffControl.invalid || staffQtyControl.invalid"
          (action)="addStaff()"
        />
      </div>
      <div
        class="grid grid-cols-1 gap-x-4 gap-y-2 mt-5"
        *ngIf="staffTitles.length > 0"
      >
        <flat-table
          [data]="staffTitles"
          [columns]="staffColumns"
          [dataLength]="staffTitles.length"
          [showPagination]="true"
        >
          <ng-template #actionTemplate let-item>
            <icon-button
              icon="delete_outline"
              tooltip="Remove Staff"
              color="accent"
              (action)="removeStaff(item.id)"
            />
          </ng-template>
        </flat-table>
      </div>

      <div class="mt-4 flex justify-end">
        <submit-button
          [isDisabled]="
            !facilityLevelForm.dirty ||
            facilityLevelForm.invalid ||
            isSubmitting
          "
          [isSubmitting]="isSubmitting"
          [buttonText]="
            facilityLevelForm.get('id')?.value ? 'UPDATE' : 'CREATE'
          "
          (action)="submitForm()"
        />
      </div>
    </form>
  `,
})
export class FacilityLevelFormComponent implements OnInit {
  facilityLevelForm: FormGroup;
  isSubmitting = false;
  @Output() onSubmit = new EventEmitter<any>();
  @Input() facilityLevel?: FacilityLevel;
  equipments: Equipment[] = [];
  premises: Premise[] = [];
  infrastructures: Infrastructure[] = [];
  staffTitles: StaffTitle[] = [];

  infrastructureControl = new FormControl(null, [Validators.required]);

  equipmentControl = new FormControl(null, [Validators.required]);
  equipmentQtyControl = new FormControl(1, [Validators.required]);

  premiseControl = new FormControl(null, [Validators.required]);
  premiseQtyControl = new FormControl(1, [Validators.required]);

  staffControl = new FormControl(null, [Validators.required]);
  staffQtyControl = new FormControl(1, [Validators.required]);
  infrastructureQtyControl = new FormControl(1, [Validators.required]);

  equipmentColumns = [
    { label: 'Equipment', value: 'name' },
    { label: 'Quantity', value: 'quantity' },
  ];

  staffColumns = [
    { label: 'Staff', value: 'name' },
    { label: 'Quantity', value: 'quantity' },
  ];

  premiseColumns = [
    { label: 'Premise', value: 'name' },
    { label: 'Quantity', value: 'quantity' },
  ];

  infrastructureColumns = [
    { label: 'Infrastructure', value: 'name' },
    { label: 'Quantity', value: 'quantity' },
  ];

  constructor(
    private fb: FormBuilder,
    public facilityLevelService: FacilityLevelService,
  ) {
    this.facilityLevelForm = this.fb.group({
      name: ['', Validators.required],
      code: ['', Validators.required],
      facilityLevelGroupId: ['', Validators.required], // For group selection
      levelRank: ['', Validators.required],
      levelPrice: ['', Validators.required],
      services: [[], Validators.required],
      equipments: [
        this.facilityLevel?.equipments ? this.facilityLevel?.equipments : [],
        Validators.required,
      ],
      premises: [
        this.facilityLevel?.premises ? this.facilityLevel?.premises : [],
        Validators.required,
      ],
      infrastructures: [
        this.facilityLevel?.infrastructures
          ? this.facilityLevel?.infrastructures
          : [],
        Validators.required,
      ],
      staffTitles: [
        this.facilityLevel?.staffTitles ? this.facilityLevel?.staffTitles : [],
        Validators.required,
      ],
    });
  }

  ngOnInit(): void {
    if (this.facilityLevel !== undefined) {
      this.equipments = this.facilityLevel?.equipments;
      this.staffTitles = this.facilityLevel?.staffTitles;
      this.premises = this.facilityLevel?.premises;
      this.infrastructures = this.facilityLevel?.infrastructures;
    }
    this.facilityLevelForm = this.facilityLevelService.formGroup;
  }

  async submitForm() {
    if (this.facilityLevelForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    try {
      const formData = this.facilityLevelForm.value;
      this.onSubmit.emit(formData);
    } catch (error) {
      console.error(error);
    } finally {
      this.isSubmitting = false;
    }
  }

  handleOptionSelected(event: any) {
    // Custom logic ya ku-handle selected option if needed siku moja
    console.log(event);
  }

  handleAddRemoveService(event: { added: Service[]; removed: Service[] }) {
    const servicesControl = this.facilityLevelForm.get('services');
    const { removed, added } = event;

    if (servicesControl) {
      const currentServices = servicesControl.value;
      const newServices = [
        ...currentServices,
        ...added.filter(
          (item) =>
            !currentServices.some(
              (service: { id: number }) => service.id === item.id,
            ),
        ),
      ];

      const updatedServices = newServices.filter((service) => {
        return !removed.some((r) => r.id === service.id);
      });

      servicesControl.setValue(updatedServices);
    }
  }

  addEquipment(): void {
    const item = this.equipmentControl.value as Equipment;
    const qty = this.equipmentQtyControl.value as number;
    const equipment = {
      id: item.id,
      name: item.name,
      quantity: qty,
    } as unknown as Equipment;
    this.equipments.push(equipment);
    this.facilityLevelForm.get('equipments').setValue(this.equipments);
    this.equipmentControl.reset();
    this.equipmentQtyControl.reset(1);
  }

  removeEquipment(id: number): void {
    const index = this.equipments.findIndex((r) => r.id === id);
    this.equipments.splice(index, 1);
  }

  addPremise(): void {
    const item = this.premiseControl.value as Equipment;
    const qty = this.premiseQtyControl.value as number;
    const premise = {
      id: item.id,
      name: item.name,
      quantity: qty,
    } as unknown as Premise;
    this.premises.push(premise);
    this.facilityLevelForm.get('premises').setValue(this.premises);
    this.premiseControl.reset();
    this.premiseQtyControl.reset(1);
  }

  removePremise(id: number): void {
    const index = this.premises.findIndex((r) => r.id === id);
    this.premises.splice(index, 1);
  }

  removeInfrastructure(id: number): void {
    const index = this.infrastructures.findIndex((r) => r.id === id);
    this.infrastructures.splice(index, 1);
  }

  addStaff(): void {
    const item = this.staffControl.value as Equipment;
    const qty = this.staffQtyControl.value as number;
    const staffTitle = {
      id: item.id,
      name: item.name,
      quantity: qty,
    } as unknown as StaffTitle;
    this.staffTitles.push(staffTitle);
    this.facilityLevelForm.get('staffTitles').setValue(this.staffTitles);
    this.staffControl.reset();
    this.staffQtyControl.reset(1);
  }

  addInfrastructure(): void {
    const item = this.infrastructureControl.value as Infrastructure;
    const qty = this.infrastructureQtyControl.value as number;
    const infrastructure = {
      id: item.id,
      name: item.name,
      quantity: qty,
    } as unknown as Infrastructure;
    this.infrastructures.push(infrastructure);
    this.facilityLevelForm
      .get('infrastructures')
      .setValue(this.infrastructures);
    this.infrastructureControl.reset();
    this.infrastructureQtyControl.reset(1);
  }

  removeStaff(id: number): void {
    const index = this.staffTitles.findIndex((r) => r.id === id);
    this.staffTitles.splice(index, 1);
  }
}
