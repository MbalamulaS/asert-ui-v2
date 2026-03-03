export interface FormSubmissionScoreSummaryDto {
  submissionUuid: string;
  formUuid: string;
  formName: string;
  submittedBy: string;
  totalScore: number;
  maxPossibleScore: number;
  percentage: number;
  categoryScores: CategoryScoreDto[];
}

export interface CategoryScoreDto {
  categoryId: number;
  categoryUuid: string;
  categoryName: string;
  score: number;
  maxPossible: number;
  percentage: number;
}

export interface SectionScoreDto {
  sectionId: number;
  sectionUuid: string;
  sectionTitle: string;
  score: number;
  maxPossible: number;
  percentage: number;
  subsectionScores?: SectionScoreDto[];
}

export interface FormWithScoringDto extends Form {
  scoringSections: SectionWithScoringDto[];
}

export interface SectionWithScoringDto {
  uuid: string;
  title: string;
  weight: number;
  maxScore: number | null;
  level: number;
  parentSectionUuid?: string;
  subsections?: SectionWithScoringDto[];
}

export interface SectionScoringDto {
  sectionUuid: string;
  sectionTitle: string;
  maxScore: number | null;
  calculatedMaxScore: number | null;
  effectiveMaxScore: number | null;
  hasScoringOptions: boolean;
  hasDefinedMaxScore: boolean;
  hasMismatch: boolean;
  sectionLevel: number;
  parentSectionUuid?: string;
  fieldCount: number;
  subsectionCount: number;
}

export interface Form {
  uuid?: string;
  id?: number;
  name: string;
  description: string;
  sections: FormSection[];
  sectionScores?: SectionScoringDto[];
  totalMaxScore?: number;
  totalDefinedMaxScore?: number;
  totalCalculatedMaxScore?: number;
  hasCalculatedSections?: boolean;
  hasSectionMismatches?: boolean;
}

export interface FormField {
  id?: number;
  uuid?: string;
  label: string;
  fieldType: FieldType;
  required: boolean;
  placeholder?: string;
  helpText?: string;
  orderIndex: number;
  validationRules?: string; // JSON string
  options?: FormFieldOption[];
  conditionalLogic?: ConditionalLogic[];
}

export interface ConditionalLogic {
  triggerFieldUuid: string;
  operator: ConditionalOperator;
  value: string;
  actions: ConditionalAction[];
}

export interface ConditionalAction {
  actionType: ActionType;
  targetFieldUuid?: string;
  targetSectionUuid?: string;
  actionValue?: string;
}

export enum ConditionalOperator {
  EQUALS = 'equals',
  NOT_EQUALS = 'not_equals',
  CONTAINS = 'contains',
  NOT_CONTAINS = 'not_contains',
  EMPTY = 'empty',
  NOT_EMPTY = 'not_empty',
  GREATER_THAN = 'greater_than',
  LESS_THAN = 'less_than',
  GREATER_EQUAL = 'greater_equal',
  LESS_EQUAL = 'less_equal',
}

export enum ActionType {
  HIDE_FIELD = 'hide_field',
  SHOW_FIELD = 'show_field',
  MAKE_REQUIRED = 'make_required',
  MAKE_OPTIONAL = 'make_optional',
  HIDE_SECTION = 'hide_section',
  SHOW_SECTION = 'show_section',
}

export interface FormFieldOption {
  id?: string;
  uuid?: string;
  label: string;
  value: string;
  score: number;
  orderIndex: number;
}

export enum SubmissionStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface FormSubmission {
  id?: number;
  uuid?: string;
  form: Form;
  submittedBy?: string;
  submittedAt?: Date;
  formUuid?: string;
  totalScore?: number;
  maxPossibleScore?: number;
  percentage?: number;
  responses: FormFieldResponse[];
  sectionScores?: SectionScoreDto[];
  status?: SubmissionStatus | string;
  submittedForApprovalAt?: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
  rejectionReason?: string;
  totalRequiredAssessors?: number;
  submittedAssessorCount?: number;
}

export interface FormFieldResponse {
  id?: number;
  uuid?: string;
  field: FormField;
  value: string;
}

export enum FieldType {
  TEXT = 'text',
  TEXTAREA = 'textarea',
  NUMBER = 'number',
  EMAIL = 'email',
  SELECT = 'select',
  RADIO = 'radio',
  CHECKBOX = 'checkbox',
  DATE = 'date',
  TIME = 'time',
  RATING = 'rating',
}

export interface FormDraftData {
  formValues: Record<string, any>;
  sectionScores?: {
    sectionUuid: string;
    score: number;
    maxPossible: number;
    percentage: number;
  }[];
  currentSectionIndex?: number;
}

export interface Draft {
  uuid?: string;
  formUuid?: string;
  hotelUuid?: string;
  submittedBy?: string;
  currentSectionIndex?: number;
  formData?: string;
}

export interface FormSubmissionDto {
  formUuid?: string;
  hotelUuid?: string;
  submittedBy?: string;
  responses: { fieldUuid: string; value: string; comments?: string }[];
  sectionScores?: SectionScoreDto[];
  totalScore?: number;
  maxPossibleScore?: number;
  percentage?: number;
}

export interface FormSection {
  id?: string;
  uuid?: string;
  title: string;
  weight: number;
  maxScore: number | null;
  sectionLevel: number;
  orderIndex: number;
  parentSectionUuid?: string;
  parentSection?: FormSection;
  parentTitle?: string;
  displayLevel?: number;
  displayTitle?: string;
  fields: FormField[];
  subsections?: FormSection[];
}
