import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {MatFormFieldModule} from '@angular/material/form-field';
import {TextInputComponent} from "components/text-field/text-field.component";
import {AutocompleteComponent} from "components/autocomplete/autocomplete.component";
import {FetcherComponent} from "components/fetcher/fetcher.component";
import {MatButton} from "@angular/material/button";
import {AssessorDocumentService} from "modules/assessment/assessor-document.service";

interface Item {
  id: number;
  name: string;
}

@Component({
  selector: 'app-assessor-document-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    TextInputComponent,
    AutocompleteComponent,
    FetcherComponent,
    MatButton,

  ],
  template: `
    <form
      [formGroup]="documentForm"
      (ngSubmit)="submitForm()"
      class="w-full lg:w-[100%] space-y-4 bg-white border border-gray-200 p-6 rounded-lg shadow-sm"
    >
      <app-text-input
        label="Title"
        name="title"
        formControlName="title"
      />

      <app-fetcher
        api="document-types"
        [defaultParams]="{ size: '100' }"
        loadingLabel="Fetching Document Types.."
      >
        <ng-template let-response>
          <div *ngIf="response; else noData">
            <app-autocomplete
              label="Select Document Type"
              formControlName="documentTypeId"
              [displayLabel]="'name'"
              [options]="response.data"
            />
          </div>
          <ng-template #noData>No data available</ng-template>
        </ng-template>
      </app-fetcher>

      <input
        type="file"
        accept="application/pdf"
        (change)="onFileSelected($event)"
        class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
                 file:rounded-full file:border-0 file:text-sm file:font-semibold
                 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />

      <div class="flex justify-end">
        <button
          mat-raised-button
          color="primary"
          type="submit"
          [disabled]="documentForm.invalid"
        >
          Upload
        </button>
      </div>
    </form>
  `,
})
export class AssessorDocumentFormComponent implements OnInit {
  documentForm: FormGroup;

  isSubmitting = false;
  @Output() onSubmit = new EventEmitter<string>();

  constructor(
    private fb: FormBuilder,
    public service: AssessorDocumentService,
  ) {

  }

  ngOnInit() {
    this.initForm();
  }

  initForm(): void {
    this.documentForm = this.fb.group({
      title: ['', Validators.required],
      documentTypeId: [null, Validators.required],
      filePath: ['', Validators.required]
    });
  }

  async onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      const base64 = await this.convertToBase64(file);
      this.documentForm.patchValue({
        filePath: base64,
        fileType: 'pdf'
      });
    }
  }

  convertToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = error => reject(error);
    });
  }

  async submitForm() {
    if (this.documentForm.invalid) {
      return;
    }

    this.isSubmitting = true;

    try {
      const formData = this.documentForm.value;
      this.onSubmit.emit(formData);
    } catch (error) {
    } finally {
      this.isSubmitting = false;
    }
  }
}
