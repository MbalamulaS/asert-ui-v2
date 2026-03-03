export enum SelfAssessmentStatus {
  DRAFT = 'DRAFT',
  COMPLETED = 'COMPLETED'
}

export interface FieldResponse {
  fieldUuid: string;
  value: string;
}

export interface SelfAssessmentRequest {
  hotelUuid: string;
  formUuid: string;
  responses?: FieldResponse[];
}

export interface SelfAssessmentResponse {
  id: number;
  uuid: string;
  hotelUuid: string;
  hotelName: string;
  formUuid: string;
  formName: string;
  submittedBy: string;
  submittedAt?: string;
  totalScore?: number;
  maxPossibleScore?: number;
  percentage?: number;
  estimatedRating?: string;
  status: SelfAssessmentStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface SelfAssessmentSummary {
  uuid: string;
  hotelName: string;
  formName: string;
  submittedAt?: string;
  percentage?: number;
  estimatedRating?: string;
  status: SelfAssessmentStatus;
  createdAt: string;
}

export interface SectionScore {
  sectionId: number;
  sectionUuid: string;
  sectionTitle: string;
  score: number;
  maxPossible: number;
  percentage: number;
  subsectionScores?: SectionScore[];
}

export interface SelfAssessmentResult {
  uuid: string;
  hotelName: string;
  formName: string;
  submittedBy: string;
  submittedAt?: string;
  totalScore?: number;
  maxPossibleScore?: number;
  percentage?: number;
  estimatedRating?: string;
  sectionScores: SectionScore[];
  createdAt: string;
}

export interface OfficialAssessment {
  totalScore?: number;
  percentage?: number;
  starRating?: string;
}

export interface SectionComparison {
  sectionTitle: string;
  selfAssessmentScore?: number;
  officialScore?: number;
  variance?: number;
}

export interface SelfAssessmentComparison {
  hotelName: string;
  latestSelfAssessment?: SelfAssessmentResult;
  officialAssessment?: OfficialAssessment;
  variance?: number;
  sectionComparisons?: SectionComparison[];
}
