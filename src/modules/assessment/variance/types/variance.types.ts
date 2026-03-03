export interface AssessmentVarianceLog {
  id?: number;
  uuid: string;
  hotel: {
    id: number;
    name: string;
    uuid: string;
  };
  form: {
    id: number;
    name: string;
    uuid: string;
  };
  section?: {
    id: number;
    uuid: string;
    title: string;
    orderIndex: number;
    sectionLevel: number;
    parentSectionUuid?: string;
    maxScore?: number;
    weight?: number;
  };
  sectionUuid?: string;
  assessorScores: {
    id: number;
    score: number;
    title: string;
    firstName: string;
    lastName: string;
    email: string;
  }[];
  scoreDifference: number;
  thresholdAtDetection: number;
  status: 'PENDING' | 'UNDER_REVIEW' | 'RESOLVED' | 'OPEN';
  resolutionNotes?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
  suggestedAssessor?: {
    id: number;
    name: string;
    reason: string;
    deviation: number;
  };
}

export interface AssessorVarianceNotification {
  id?: number;
  uuid: string;
  assessmentVarianceLog: {
    id: number;
    uuid: string;
  };
  assessor: {
    id: number;
    name: string;
  };
  notificationType: string;
  message: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface HotelAssessmentApproval {
  id?: number;
  uuid: string;
  hotel: {
    id: number;
    name: string;
  };
  form: {
    id: number;
    name: string;
  };
  finalTotalScore?: number;
  finalMaxScore?: number;
  finalPercentage?: number;
  finalRating?: string;
  hasUnresolvedVariances: boolean;
  varianceResolutionCount: number;
  allVariancesResolvedAt?: string;
  status: 'PENDING_DT_REVIEW' | 'APPROVED' | 'REJECTED';
  submittedToDtAt?: string;
  dtApprovalDate?: string;
  dtRejectionReason?: string;
  dtComments?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VarianceFilterOptions {
  status?: string;
  hotelId?: number;
  formId?: number;
  page?: number;
  size?: number;
}

export interface SystemConfiguration {
  id?: number;
  uuid: string;
  configKey: string;
  configValue: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}
