import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TextInputComponent } from 'components/text-field/text-field.component';
import { SelectComponent } from 'components/select/select.component';
import {
  ConditionalLogic,
  ConditionalOperator,
  ActionType,
  FormField,
  FormSection,
} from '../types';

@Component({
  selector: 'app-conditional-logic',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    TextInputComponent,
    SelectComponent,
  ],
  template: `
    <div class="conditional-logic-builder" [formGroup]="formGroup">
      <div class="flex justify-between items-center mb-3">
        <h6 class="text-sm font-medium text-gray-700">Conditional Logic</h6>
        <button
          type="button"
          class="px-2 py-1 text-xs bg-purple-50 text-purple-600 rounded hover:bg-purple-100 flex items-center"
          (click)="addConditionalRule()"
        >
          <mat-icon class="h-3 w-3 mr-1" aria-hidden="true">add</mat-icon>
          Add Rule
        </button>
      </div>

      <div
        formArrayName="conditionalLogic"
        class="space-y-4"
        *ngIf="formGroup.get('conditionalLogic')"
      >
        <div
          *ngFor="let rule of conditionalRules.controls; let ruleIndex = index"
          class="border border-purple-200 rounded-lg p-4 bg-purple-50"
        >
          <div [formGroupName]="ruleIndex">
            <div class="flex justify-between items-center mb-3">
              <span class="text-sm font-medium text-purple-700"
                >Rule {{ ruleIndex + 1 }}</span
              >
              <button
                type="button"
                class="p-1 text-red-500 hover:bg-red-50 rounded"
                (click)="removeConditionalRule(ruleIndex)"
              >
                <mat-icon class="h-4 w-4" aria-hidden="true">delete</mat-icon>
              </button>
            </div>

            <!-- Trigger Configuration -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
              <div>
                <app-select
                  label="When Field"
                  name="triggerFieldUuid"
                  [form]="rule"
                  [options]="availableFieldOptions"
                  class="w-full"
                />
              </div>
              <div>
                <app-select
                  label="Operator"
                  name="operator"
                  [form]="rule"
                  [options]="operatorOptions"
                  class="w-full"
                />
              </div>
              <div>
                <app-text-input
                  label="Value"
                  name="value"
                  [form]="rule"
                  placeholder="Enter comparison value"
                  class="w-full"
                />
              </div>
            </div>

            <!-- Actions -->
            <div class="mt-4">
              <div class="flex justify-between items-center mb-2">
                <span class="text-xs font-medium text-gray-600">Actions</span>
                <button
                  type="button"
                  class="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                  (click)="addAction(ruleIndex)"
                >
                  <mat-icon class="h-3 w-3 mr-1" aria-hidden="true"
                    >add</mat-icon
                  >
                  Add Action
                </button>
              </div>

              <div formArrayName="actions" class="space-y-2">
                <div
                  *ngFor="
                    let action of getActions(ruleIndex).controls;
                    let actionIndex = index
                  "
                  class="flex items-center space-x-2 bg-white p-2 rounded border"
                >
                  <div
                    [formGroupName]="actionIndex"
                    class="flex flex-1 space-x-2"
                  >
                    <app-select
                      label="Action"
                      name="actionType"
                      [form]="action"
                      [options]="actionTypeOptions"
                      class="flex-1"
                    />
                    <app-select
                      label="Target"
                      name="targetFieldUuid"
                      [form]="action"
                      [options]="
                        getTargetOptions(action.get('actionType')?.value)
                      "
                      class="flex-1"
                    />
                  </div>
                  <button
                    type="button"
                    class="p-1 text-red-500 hover:bg-red-50 rounded"
                    (click)="removeAction(ruleIndex, actionIndex)"
                  >
                    <mat-icon class="h-4 w-4" aria-hidden="true"
                      >delete</mat-icon
                    >
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        *ngIf="
          formGroup.get('conditionalLogic') && conditionalRules.length === 0
        "
        class="text-center py-4 text-gray-500 text-sm"
      >
        No conditional rules configured. Click "Add Rule" to create your first
        conditional logic rule.
      </div>
    </div>
  `,
  styles: [
    `
      .conditional-logic-builder {
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid #e5e7eb;
      }
    `,
  ],
})
export class ConditionalLogicComponent implements OnInit {
  @Input() formGroup!: FormGroup;
  @Input() availableFields: FormField[] = [];
  @Input() availableSections: FormSection[] = [];
  @Input() currentFieldUuid?: string;
  @Output() conditionalLogicChange = new EventEmitter<ConditionalLogic[]>();

  operatorOptions = [
    {
      id: ConditionalOperator.EQUALS,
      name: 'Equals',
      label: 'Equals',
      value: ConditionalOperator.EQUALS,
    },
    {
      id: ConditionalOperator.NOT_EQUALS,
      name: 'Not Equals',
      label: 'Not Equals',
      value: ConditionalOperator.NOT_EQUALS,
    },
    {
      id: ConditionalOperator.CONTAINS,
      name: 'Contains',
      label: 'Contains',
      value: ConditionalOperator.CONTAINS,
    },
    {
      id: ConditionalOperator.NOT_CONTAINS,
      name: 'Not Contains',
      label: 'Not Contains',
      value: ConditionalOperator.NOT_CONTAINS,
    },
    {
      id: ConditionalOperator.EMPTY,
      name: 'Is Empty',
      label: 'Is Empty',
      value: ConditionalOperator.EMPTY,
    },
    {
      id: ConditionalOperator.NOT_EMPTY,
      name: 'Is Not Empty',
      label: 'Is Not Empty',
      value: ConditionalOperator.NOT_EMPTY,
    },
    {
      id: ConditionalOperator.GREATER_THAN,
      name: 'Greater Than',
      label: 'Greater Than',
      value: ConditionalOperator.GREATER_THAN,
    },
    {
      id: ConditionalOperator.LESS_THAN,
      name: 'Less Than',
      label: 'Less Than',
      value: ConditionalOperator.LESS_THAN,
    },
    {
      id: ConditionalOperator.GREATER_EQUAL,
      name: 'Greater or Equal',
      label: 'Greater or Equal',
      value: ConditionalOperator.GREATER_EQUAL,
    },
    {
      id: ConditionalOperator.LESS_EQUAL,
      name: 'Less or Equal',
      label: 'Less or Equal',
      value: ConditionalOperator.LESS_EQUAL,
    },
  ];

  actionTypeOptions = [
    {
      id: ActionType.HIDE_FIELD,
      name: 'Hide Field',
      label: 'Hide Field',
      value: ActionType.HIDE_FIELD,
    },
    {
      id: ActionType.SHOW_FIELD,
      name: 'Show Field',
      label: 'Show Field',
      value: ActionType.SHOW_FIELD,
    },
    {
      id: ActionType.MAKE_REQUIRED,
      name: 'Make Required',
      label: 'Make Required',
      value: ActionType.MAKE_REQUIRED,
    },
    {
      id: ActionType.MAKE_OPTIONAL,
      name: 'Make Optional',
      label: 'Make Optional',
      value: ActionType.MAKE_OPTIONAL,
    },
    {
      id: ActionType.HIDE_SECTION,
      name: 'Hide Section',
      label: 'Hide Section',
      value: ActionType.HIDE_SECTION,
    },
    {
      id: ActionType.SHOW_SECTION,
      name: 'Show Section',
      label: 'Show Section',
      value: ActionType.SHOW_SECTION,
    },
  ];

  availableFieldOptions: any[] = [];
  availableSectionOptions: any[] = [];

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.updateAvailableOptions();
    this.initializeConditionalLogic();
  }

  get conditionalRules(): FormArray {
    if (!this.formGroup || !this.formGroup.get('conditionalLogic')) {
      return this.fb.array([]);
    }
    return this.formGroup.get('conditionalLogic') as FormArray;
  }

  updateAvailableOptions() {
    // Include all fields as potential trigger fields (including current field for self-references)
    this.availableFieldOptions = this.availableFields.map((field) => ({
      id: field.uuid,
      name: field.label,
      label: field.label,
      value: field.uuid,
    }));

    this.availableSectionOptions = this.availableSections.map((section) => ({
      id: section.uuid,
      name: section.title,
      label: section.title,
      value: section.uuid,
    }));
  }

  initializeConditionalLogic() {
    if (!this.formGroup.get('conditionalLogic')) {
      this.formGroup.addControl('conditionalLogic', this.fb.array([]));
    }
    // Conditional logic data loading is handled by the form builder
    // No need to log as this method is called for every field component
  }

  addConditionalRule() {
    if (!this.formGroup || !this.formGroup.get('conditionalLogic')) {
      this.initializeConditionalLogic();
    }

    const ruleGroup = this.fb.group({
      triggerFieldUuid: ['', Validators.required],
      operator: [ConditionalOperator.EQUALS, Validators.required],
      value: ['', Validators.required],
      actions: this.fb.array([]),
    });

    this.conditionalRules.push(ruleGroup);
    this.emitChange();
  }

  removeConditionalRule(index: number) {
    this.conditionalRules.removeAt(index);
    this.emitChange();
  }

  getActions(ruleIndex: number): FormArray {
    return this.conditionalRules.at(ruleIndex).get('actions') as FormArray;
  }

  addAction(ruleIndex: number) {
    const actionGroup = this.fb.group({
      actionType: [ActionType.HIDE_FIELD, Validators.required],
      targetFieldUuid: [''],
      targetSectionUuid: [''],
      actionValue: [''],
    });

    this.getActions(ruleIndex).push(actionGroup);
    this.emitChange();
  }

  removeAction(ruleIndex: number, actionIndex: number) {
    this.getActions(ruleIndex).removeAt(actionIndex);
    this.emitChange();
  }

  getTargetOptions(actionType: ActionType) {
    switch (actionType) {
      case ActionType.HIDE_SECTION:
      case ActionType.SHOW_SECTION:
        return this.availableSectionOptions;
      case ActionType.HIDE_FIELD:
      case ActionType.SHOW_FIELD:
      case ActionType.MAKE_REQUIRED:
      case ActionType.MAKE_OPTIONAL:
      default:
        return this.availableFieldOptions;
    }
  }

  emitChange() {
    const conditionalLogic = this.conditionalRules.value as ConditionalLogic[];
    this.conditionalLogicChange.emit(conditionalLogic);
  }

  loadConditionalLogic(conditionalLogic: ConditionalLogic[]) {
    // Clear existing rules
    while (this.conditionalRules.length !== 0) {
      this.conditionalRules.removeAt(0);
    }

    // Add loaded rules
    conditionalLogic.forEach((rule) => {
      const ruleGroup = this.fb.group({
        triggerFieldUuid: [rule.triggerFieldUuid, Validators.required],
        operator: [rule.operator, Validators.required],
        value: [rule.value, Validators.required],
        actions: this.fb.array([]),
      });

      // Add actions
      const actionsArray = ruleGroup.get('actions') as FormArray;
      rule.actions.forEach((action) => {
        const actionGroup = this.fb.group({
          actionType: [action.actionType, Validators.required],
          targetFieldUuid: [action.targetFieldUuid || ''],
          targetSectionUuid: [action.targetSectionUuid || ''],
          actionValue: [action.actionValue || ''],
        });
        actionsArray.push(actionGroup);
      });

      this.conditionalRules.push(ruleGroup);
    });
  }
}
