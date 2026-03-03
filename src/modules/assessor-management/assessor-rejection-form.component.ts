import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import {
  heroCog6Tooth,
  heroMagnifyingGlass,
  heroPencilSquare,
  heroTrash,
} from '@ng-icons/heroicons/outline';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Assessor } from 'modules/assessment/assessment';
import { AssessorService } from 'modules/assessment/assessor.service';
import { AutocompleteComponent } from 'components/autocomplete/autocomplete.component';
import { FetcherComponent } from 'components/fetcher/fetcher.component';
import { NgIf } from '@angular/common';
import { TextAreaComponent } from 'components/text-area/text-area.component';

@Component({
  selector: 'app-assessor-rejection-form',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
    AutocompleteComponent,
    FetcherComponent,
    NgIf,
    TextAreaComponent,
  ],
  viewProviders: [
    provideIcons({
      heroCog6Tooth,
      heroPencilSquare,
      heroTrash,
      heroMagnifyingGlass,
    }),
  ],
  template: `
    <form
      [formGroup]="formGroup"
      (ngSubmit)="submitForm()"
      class="w-full lg:w-[100%] space-y-4 bg-white border border-gray-200 p-6 rounded-lg shadow-sm"
    >
      <app-fetcher
        api="assessor-rejection-reasons"
        [defaultParams]="{ size: '100' }"
        loadingLabel="Fetching Reasons.."
      >
        <ng-template let-response>
          <div *ngIf="response; else noData">
            <app-autocomplete
              label="Select Reason"
              formControlName="reasonId"
              [displayLabel]="'name'"
              [options]="response.data"
            />
          </div>
          <ng-template #noData>No data available</ng-template>
        </ng-template>
      </app-fetcher>

      <app-text-area
        label="Description"
        name="rejectionReason"
        formControlName="rejectionReason"
      />

      <div class="flex justify-end">
        <button
          mat-raised-button
          color="primary"
          type="submit"
          [disabled]="formGroup.invalid"
        >
          Reject
        </button>
      </div>
    </form>
  `,
})
export class AssessorRejectionFormComponent implements OnInit {
  @Input() assessor: Assessor;
  formGroup: FormGroup;

  isSubmitting = false;

  @Output() onRejectSubmit = new EventEmitter<any>();

  constructor(
    private fb: FormBuilder,
    public service: AssessorService,
  ) {}

  ngOnInit() {
    this.initForm();
  }

  initForm(): void {
    this.formGroup = this.fb.group({
      reasonId: [null, Validators.required],
      rejectionReason: ['', Validators.required],
    });
  }

  async submitForm() {
    if (this.formGroup.invalid) {
      return;
    }

    this.isSubmitting = true;

    try {
      const formData = this.formGroup.value;
      formData.id = this.assessor.id;
      this.onRejectSubmit.emit(formData);
    } catch (error) {
    } finally {
      this.isSubmitting = false;
    }
  }
}
