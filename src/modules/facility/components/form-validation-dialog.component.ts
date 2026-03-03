import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { DialogComponent } from 'components/dialog/dialog.component';

export interface UnansweredField {
  fieldId: string;
  fieldLabel: string;
  sectionTitle: string;
  sectionIndex: number;
  required: boolean;
}

export interface ValidationDialogData {
  unansweredFields: UnansweredField[];
  totalFields: number;
  answeredFields: number;
}

export interface ValidationDialogResult {
  action: 'navigate' | 'cancel' | 'submit';
  sectionIndex?: number;
  fieldId?: string;
}

@Component({
  selector: 'app-form-validation-dialog',
  standalone: true,
  imports: [CommonModule, MatIconModule, DialogComponent],
  template: `
    <app-dialog
      [open]="open"
      [title]="'Form Validation Errors'"
      [width]="'800px'"
      [disableClose]="true"
      [headerTextColor]="'black'"
      (onClose)="onDialogClose($event)"
    >
      <ng-template>
        <div class="p-0">
          <div class="flex items-center mb-4">
            <mat-icon class="h-6 w-6 text-yellow-500 mr-3">warning</mat-icon>
            <h2 class="text-lg font-semibold text-gray-900">Form Incomplete</h2>
          </div>

          <div class="mb-4">
            <p class="text-sm text-gray-600 mb-2">
              Please complete the following required fields before submitting:
            </p>

            <div class="bg-gray-50 rounded-lg p-3 mb-4">
              <div class="text-sm">
                <span class="font-medium text-green-600">{{
                  data.answeredFields
                }}</span>
                <span class="text-gray-500"> of </span>
                <span class="font-medium text-gray-900">{{
                  data.totalFields
                }}</span>
                <span class="text-gray-500"> fields completed</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  class="bg-green-500 h-2 rounded-full transition-all duration-300"
                  [style.width.%]="
                    (data.answeredFields / data.totalFields) * 100
                  "
                ></div>
              </div>
            </div>
          </div>

          <div class="max-h-64 overflow-y-auto mb-6">
            <div class="space-y-3">
              <div
                *ngFor="
                  let field of data.unansweredFields;
                  trackBy: trackByFieldId
                "
                class="border-l-4 border-red-400 bg-red-50 p-3 rounded-r-lg cursor-pointer hover:bg-red-100 transition-colors"
                (click)="navigateToField(field)"
              >
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <p class="text-sm font-medium text-red-800">
                      {{ field.fieldLabel }}
                    </p>
                    <p class="text-xs text-red-600 mt-1">
                      Section: {{ field.sectionTitle }}
                    </p>
                  </div>
                  <mat-icon class="h-4 w-4 text-red-400 ml-2"
                    >chevron_right</mat-icon
                  >
                </div>
              </div>
            </div>
          </div>

          <div class="flex justify-end space-x-3">
            <button
              type="button"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
              (click)="closeDialog()"
            >
              Continue Assessment
            </button>
            <button
              type="button"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              [disabled]="data.unansweredFields.length > 0"
              (click)="forceSubmit()"
            >
              {{
                data.unansweredFields.length > 0
                  ? 'Complete Required Fields'
                  : 'Submit Form'
              }}
            </button>
          </div>
        </div>
      </ng-template>
    </app-dialog>
  `,
})
export class FormValidationDialogComponent {
  @Input() open: boolean = false;
  @Input() data!: ValidationDialogData;
  @Output() onResult = new EventEmitter<ValidationDialogResult>();

  trackByFieldId(index: number, field: UnansweredField): string {
    return field.fieldId;
  }

  navigateToField(field: UnansweredField): void {
    this.onResult.emit({
      action: 'navigate',
      sectionIndex: field.sectionIndex,
      fieldId: field.fieldId,
    });
  }

  closeDialog(): void {
    this.onResult.emit({ action: 'cancel' });
  }

  forceSubmit(): void {
    if (this.data.unansweredFields.length === 0) {
      this.onResult.emit({ action: 'submit' });
    }
  }

  onDialogClose(result: any): void {
    // Handle dialog close from the dialog component itself
    this.onResult.emit({ action: 'cancel' });
  }
}
