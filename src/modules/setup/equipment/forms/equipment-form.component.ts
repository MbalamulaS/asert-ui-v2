import { Component, EventEmitter, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TextInputComponent } from 'components/text-field/text-field.component';
import { FetcherComponent } from 'components/fetcher/fetcher.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EquipmentService } from 'modules/setup/equipment/equipment.service';
import { Equipment } from 'modules/setup/equipment/equipment';
import { SubmitButtonComponent } from 'components/submit-button/submit-button.component';
import { AutocompleteComponent } from 'components/autocomplete/autocomplete.component';

interface Item {
  id: number;
  name: string;
}

@Component({
  selector: 'app-equipment-form',
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
  ],
  template: `
    <form [formGroup]="form" class="space-y-4">
      <app-text-input label="Name" name="name" formControlName="name" />
      <app-text-input label="Code" name="code" formControlName="code" />
      <app-fetcher
        api="equipment-categories"
        [defaultParams]="{ size: '100' }"
        loadingLabel="Fetching Categories.."
      >
        <ng-template let-response>
          <div *ngIf="response; else noData">
            <app-autocomplete
              label="Select Category"
              formControlName="equipmentCategoryId"
              [displayLabel]="'name'"
              (onOptionSelected)="handleOptionSelected($event)"
              [options]="response.data"
            />
          </div>
          <ng-template #noData>No data available</ng-template>
        </ng-template>
      </app-fetcher>

      <div class="mt-4 flex justify-end">
        <submit-button
          [isDisabled]="!form.dirty || form.invalid || isSubmitting"
          [isSubmitting]="isSubmitting"
          [buttonText]="form.get('id')?.value ? 'UPDATE' : 'CREATE'"
          (action)="submitForm()"
        />
      </div>
    </form>
  `,
})
export class EquipmentFormComponent {
  form: FormGroup;
  selectedItems: Item[] = [];
  isSubmitting = false;
  @Output() onSubmit = new EventEmitter<Equipment>();

  constructor(public service: EquipmentService) {
    this.form = this.service.form;
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

  handleOptionSelected(event: any) {}

  onSelectionChanged(selectedItems: any[]): void {
    this.selectedItems = selectedItems;
  }
}
