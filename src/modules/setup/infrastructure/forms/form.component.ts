import {Component, EventEmitter, Output} from '@angular/core';
import {FormGroup, ReactiveFormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {MatFormFieldModule} from '@angular/material/form-field';
import {TextInputComponent} from 'components/text-field/text-field.component';
import {FetcherComponent} from 'components/fetcher/fetcher.component';
import {SubmitButtonComponent} from 'components/submit-button/submit-button.component';
import {AutocompleteComponent} from 'components/autocomplete/autocomplete.component';
import {Service} from "modules/setup/service/service";
import {InfrastructureService} from "modules/setup/infrastructure/infrastructure.service";

@Component({
  selector: 'app-infrastructure-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    TextInputComponent,
    FetcherComponent,
    SubmitButtonComponent,
    AutocompleteComponent,
  ],
  template: `
    <form [formGroup]="form" class="space-y-4">
      <app-text-input label="Name" name="name" formControlName="name"/>
      <app-text-input label="Code" name="code" formControlName="code"/>

      <app-fetcher
        api="infrastructure-categories"
        [defaultParams]="{ size: '100' }"
        loadingLabel="Fetching Categories.."
      >
        <ng-template let-response>
          <div *ngIf="response; else noData">
            <app-autocomplete
              label="Select Category"
              formControlName="infrastructureCategoryId"
              [displayLabel]="'name'"
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
export class FormComponent {
  form: FormGroup;
  selectedItems: Service[] = [];
  isSubmitting = false;
  @Output() onSubmit = new EventEmitter<string>();

  constructor(
    public serviceService: InfrastructureService,
  ) {
    this.form = this.serviceService.form;
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
}
