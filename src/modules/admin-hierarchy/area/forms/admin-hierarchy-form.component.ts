import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TextInputComponent } from 'components/text-field/text-field.component';
import { SubmitButtonComponent } from 'components/submit-button/submit-button.component';
import { FetcherComponent } from 'components/fetcher/fetcher.component';
import { SelectComponent } from 'components/select/select.component';
import { AutocompleteAsyncComponent } from 'components/autocomplete/autocomplete-async.component';
import { AdminHierarchyService } from '../admin-hierarchy.service';

export type Position = {
  id: number;
  name: string;
};

@Component({
  selector: 'admin-hierarchy-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TextInputComponent,
    SubmitButtonComponent,
    FetcherComponent,
    SelectComponent,
    AutocompleteAsyncComponent,
  ],
  template: `
    <form [formGroup]="form" class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <app-text-input label="Name" name="name" formControlName="name" />
        <app-text-input label="Code" name="code" formControlName="code" />
        <app-text-input
          label="ISO Code"
          name="isoCode"
          formControlName="isoCode"
        />

        <app-fetcher
          api="admin-hierarchy-levels"
          [defaultParams]="{ size: '100' }"
          loadingLabel="Fetching Levels.."
        >
          <ng-template let-response>
            <div *ngIf="response; else noData">
              <app-select
                label="Select Level"
                [form]="form"
                name="adminHierarchyLevelId"
                [options]="response.data"
                [required]="true"
              />
            </div>
            <ng-template #noData>No data available</ng-template>
          </ng-template>
        </app-fetcher>

        <app-autocomplete-async
          label="Select Parent"
          formControlName="parentId"
          api="admin-hierarchies"
          searchParam="name"
          displayProperty="name"
          valueProperty="id"
          [required]="false"
          placeholder="Type to search for parent area..."
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
      <!-- <pre>{{ form.value | json }}</pre> -->
    </form>
  `,
})
export class AdminHierarchyFormComponent {
  form: FormGroup;
  isSubmitting = false;
  @Output() onSubmit = new EventEmitter<string>();
  @Input() positions: Position[];

  constructor(private fb: FormBuilder, public service: AdminHierarchyService) {
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
}
