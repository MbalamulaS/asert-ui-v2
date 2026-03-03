export interface AssessmentRequest {
  id: number;
  uuid: string;
  hotelUuid: string;
  facilityName: string;
  facilityType: string;
  contactPerson: string;
  email: string;
  phoneNumber: string;
  address: string;
  requestedDate: string;
  additionalComments: string;
  termsAccepted: boolean;
  status: string;
  statusDisplayName: string;
  submittedAt: string;
  processedAt?: string;
  processedBy?: string;
  processingNotes?: string;
  submittedByUserName: string;
  submittedByUserId: number;
  essentialItems: EssentialItem[];
  uploadedDocuments: any[];
  compliantItemsCount: number;
  nonCompliantItemsCount: number;
  pendingItemsCount: number;
  completionPercentage: number;
  totalItemsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface EssentialItem {
  id: number;
  uuid: string;
  itemNo: number;
  description: string;
  complianceRequirement: string;
  compliance: string;
  notes: string;
  evidenceProvided: boolean;
  evidenceType: string;
  statusDisplayName: string;
  evidence: any[];
}

export interface EssentialItemEvidence {
  id: number;
  uuid: string;
  evidenceDescription: string;
  evidenceType: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileSizeFormatted: string;
  mimeType: string;
  displayName: string;
  isImage: boolean;
  isDocument: boolean;
  isVideo: boolean;
  fileUploadId: string;
}

export enum AssessmentRequestStatus {
  PENDING = 'PENDING',
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface AssessmentRequestUpdateDto {
  status?: AssessmentRequestStatus;
  processingNotes?: string;
}

export interface AssessmentRequestFilters {
  hotelName?: string;
  propertyType?: string;
  status?: AssessmentRequestStatus;
  email?: string;
  contactPerson?: string;
  submittedBy?: string;
  submittedFrom?: string;
  submittedTo?: string;
}

export interface AssessmentRequestStatistics {
  [key: string]: number;
}
