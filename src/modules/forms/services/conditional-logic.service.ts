import { Injectable } from '@angular/core';
import { ConditionalLogic, ConditionalOperator, ActionType } from '../types';

@Injectable({
  providedIn: 'root',
})
export class ConditionalLogicService {
  evaluateCondition(
    condition: ConditionalLogic,
    fieldValues: Record<string, any>,
  ): boolean {
    const fieldValue = fieldValues[condition.triggerFieldUuid];
    const conditionValue = condition.value;
    const operator = condition.operator;

    if (fieldValue === null || fieldValue === undefined) {
      return false;
    }

    const fieldValueStr = String(fieldValue);

    switch (operator) {
      case ConditionalOperator.EQUALS:
        return fieldValueStr === conditionValue;
      case ConditionalOperator.NOT_EQUALS:
        return fieldValueStr !== conditionValue;
      case ConditionalOperator.CONTAINS:
        return fieldValueStr.includes(conditionValue);
      case ConditionalOperator.NOT_CONTAINS:
        return !fieldValueStr.includes(conditionValue);
      case ConditionalOperator.EMPTY:
        return fieldValueStr.trim() === '';
      case ConditionalOperator.NOT_EMPTY:
        return fieldValueStr.trim() !== '';
      case ConditionalOperator.GREATER_THAN:
        return this.compareNumeric(fieldValueStr, conditionValue) > 0;
      case ConditionalOperator.LESS_THAN:
        return this.compareNumeric(fieldValueStr, conditionValue) < 0;
      case ConditionalOperator.GREATER_EQUAL:
        return this.compareNumeric(fieldValueStr, conditionValue) >= 0;
      case ConditionalOperator.LESS_EQUAL:
        return this.compareNumeric(fieldValueStr, conditionValue) <= 0;
      default:
        console.warn('Unknown operator:', operator);
        return false;
    }
  }

  evaluateFieldVisibility(
    conditionalLogic: ConditionalLogic[],
    fieldValues: Record<string, any>,
  ): Record<string, boolean> {
    const visibility: Record<string, boolean> = {};

    conditionalLogic.forEach((condition) => {
      if (this.evaluateCondition(condition, fieldValues)) {
        condition.actions.forEach((action) => {
          if (
            action.actionType === ActionType.HIDE_FIELD &&
            action.targetFieldUuid
          ) {
            visibility[action.targetFieldUuid] = false;
          } else if (
            action.actionType === ActionType.SHOW_FIELD &&
            action.targetFieldUuid
          ) {
            visibility[action.targetFieldUuid] = true;
          }
        });
      }
    });

    return visibility;
  }

  evaluateFieldRequiredStatus(
    conditionalLogic: ConditionalLogic[],
    fieldValues: Record<string, any>,
  ): Record<string, boolean> {
    const requiredStatus: Record<string, boolean> = {};

    conditionalLogic.forEach((condition) => {
      if (this.evaluateCondition(condition, fieldValues)) {
        condition.actions.forEach((action) => {
          if (
            action.actionType === ActionType.MAKE_REQUIRED &&
            action.targetFieldUuid
          ) {
            requiredStatus[action.targetFieldUuid] = true;
          } else if (
            action.actionType === ActionType.MAKE_OPTIONAL &&
            action.targetFieldUuid
          ) {
            requiredStatus[action.targetFieldUuid] = false;
          }
        });
      }
    });

    return requiredStatus;
  }

  evaluateSectionVisibility(
    conditionalLogic: ConditionalLogic[],
    fieldValues: Record<string, any>,
  ): Record<string, boolean> {
    const sectionVisibility: Record<string, boolean> = {};

    conditionalLogic.forEach((condition) => {
      if (this.evaluateCondition(condition, fieldValues)) {
        condition.actions.forEach((action) => {
          // Handle both targetSectionUuid and targetFieldUuid for section actions
          const targetUuid = action.targetSectionUuid || action.targetFieldUuid;

          if (action.actionType === ActionType.HIDE_SECTION && targetUuid) {
            sectionVisibility[targetUuid] = false;
          } else if (
            action.actionType === ActionType.SHOW_SECTION &&
            targetUuid
          ) {
            sectionVisibility[targetUuid] = true;
          }
        });
      }
    });

    return sectionVisibility;
  }

  private compareNumeric(value1: string, value2: string): number {
    try {
      const num1 = parseFloat(value1);
      const num2 = parseFloat(value2);

      if (isNaN(num1) || isNaN(num2)) {
        return value1.localeCompare(value2);
      }

      return num1 - num2;
    } catch (error) {
      return value1.localeCompare(value2);
    }
  }

  /**
   * Combines all conditional logic rules from all fields and evaluates them
   * This can be used in form submission components to determine field/section visibility
   */
  evaluateAllConditionalLogic(
    allFields: any[],
    fieldValues: Record<string, any>,
  ) {
    const allConditionalLogic: ConditionalLogic[] = [];

    // Collect all conditional logic rules from all fields
    allFields.forEach((field) => {
      if (field.conditionalLogic && Array.isArray(field.conditionalLogic)) {
        allConditionalLogic.push(...field.conditionalLogic);
      }
    });

    return {
      fieldVisibility: this.evaluateFieldVisibility(
        allConditionalLogic,
        fieldValues,
      ),
      fieldRequiredStatus: this.evaluateFieldRequiredStatus(
        allConditionalLogic,
        fieldValues,
      ),
      sectionVisibility: this.evaluateSectionVisibility(
        allConditionalLogic,
        fieldValues,
      ),
    };
  }
}
