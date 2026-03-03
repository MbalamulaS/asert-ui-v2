import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from 'app/api/api.service';
import { ApiResponse } from 'app/custom-response';

export interface FacilityInfo {
  facilityName: string;
  facilityType: string;
  contactPerson: string;
  email: string;
  phoneNumber: string;
  address: string;
  requestedDate: string;
}

export interface EssentialItemData {
  itemNo: number;
  description: string;
  complianceRequirement: string;
  compliance: 'compliant' | 'non-compliant' | '';
  notes: string;
  evidence?: Evidence[];
  evidenceProvided: boolean;
  evidenceType: string;
}

export type Evidence = {
  displayName: string;
  evidenceDescription: string;
  evidenceType: string;
  fileName: string;
  fileSize: number;
  fileSizeFormatted: string;
  fileUploadId: string;
  fileUrl: string;
  id: number;
  isDocument: boolean;
  isImage: boolean;
  isVideo: boolean;
  mimeType: string;
  uuid: string;
};

export interface UploadedDocument {
  attachmentId: number;
  name: string;
  fileSize: number;
  uploadType: string;
  fileType: string;
}

export interface AssessmentRequest {
  uuid?: string;
  hotelUuid?: string;
  facilityInfo: FacilityInfo;
  essentialItems: EssentialItemData[];
  uploadedDocuments?: UploadedDocument[];
  additionalComments: string;
  termsAccepted: boolean;
  submittedAt: string;
  completionPercentage?: number;
  status?: 'pending' | 'under_review' | 'approved' | 'rejected';
  assessorId?: string;
  reviewNotes?: string;
}

const API = 'assessment-requests';

@Injectable({
  providedIn: 'root',
})
export class AssessmentRequestService {
  constructor(private readonly httpService: HttpService) {}

  // Submit a new assessment request
  submit(payload: AssessmentRequest): Observable<ApiResponse> {
    return this.httpService.post<ApiResponse>(API, payload);
  }

  // Get all assessment requests (with optional filters)
  getAll(params?: Record<string, any>): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(API, { ...params });
  }

  // Get a specific assessment request by UUID
  getOne(uuid: string): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(`${API}/${uuid}`);
  }

  approve(uuid: string): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(`${API}/${uuid}/approve`);
  }

  // Update assessment request (for admin/assessor updates)
  update(
    uuid: string,
    payload: Partial<AssessmentRequest>,
  ): Observable<ApiResponse> {
    return this.httpService.put<ApiResponse>(`${API}/${uuid}`, payload);
  }

  // Delete assessment request
  delete(uuid: string): Observable<ApiResponse> {
    return this.httpService.delete<ApiResponse>(`${API}/${uuid}`);
  }

  // Assign assessor to request
  assignAssessor(uuid: string, assessorId: string): Observable<ApiResponse> {
    return this.httpService.put<ApiResponse>(`${API}/${uuid}/assign`, {
      assessorId,
    });
  }

  // Update status of assessment request
  updateStatus(
    uuid: string,
    status: string,
    reviewNotes?: string,
  ): Observable<ApiResponse> {
    return this.httpService.put<ApiResponse>(`${API}/${uuid}/status`, {
      status,
      reviewNotes,
    });
  }

  // Get assessment requests by status
  getByStatus(
    status: string,
    params?: Record<string, any>,
  ): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(`${API}/status/${status}`, {
      ...params,
    });
  }

  // Get assessment requests by facility
  getByFacility(
    facilityId: string,
    params?: Record<string, any>,
  ): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(`${API}/facility/${facilityId}`, {
      ...params,
    });
  }

  // Get assessment requests assigned to specific assessor
  getByAssessor(
    assessorId: string,
    params?: Record<string, any>,
  ): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(`${API}/assessor/${assessorId}`, {
      ...params,
    });
  }

  // Export assessment request data
  export(params?: Record<string, any>): Observable<Blob> {
    return this.httpService.getBlob(`${API}/export`, { ...params });
  }

  // Generate assessment report
  generateReport(uuid: string): Observable<Blob> {
    return this.httpService.getBlob(`${API}/${uuid}/report`);
  }

  // Validate compliance data
  validateCompliance(essentialItems: EssentialItemData[]): {
    isValid: boolean;
    errors: string[];
    complianceRate: number;
  } {
    const errors: string[] = [];
    let compliantCount = 0;
    let totalItems = essentialItems.length;

    essentialItems.forEach((item) => {
      if (!item.compliance) {
        errors.push(`Item ${item.itemNo}: Compliance status is required`);
      } else if (item.compliance === 'compliant') {
        compliantCount++;
      }

      if (item.evidenceProvided && !item.evidenceType) {
        errors.push(
          `Item ${item.itemNo}: Evidence type is required when evidence is provided`,
        );
      }
    });

    const complianceRate =
      totalItems > 0 ? (compliantCount / totalItems) * 100 : 0;

    return {
      isValid: errors.length === 0,
      errors,
      complianceRate,
    };
  }

  // Get compliance statistics
  getComplianceStats(essentialItems: EssentialItemData[]): {
    compliant: number;
    nonCompliant: number;
    pending: number;
    total: number;
    compliancePercentage: number;
  } {
    const stats = {
      compliant: 0,
      nonCompliant: 0,
      pending: 0,
      total: essentialItems.length,
      compliancePercentage: 0,
    };

    essentialItems.forEach((item) => {
      switch (item.compliance) {
        case 'compliant':
          stats.compliant++;
          break;
        case 'non-compliant':
          stats.nonCompliant++;
          break;
        default:
          stats.pending++;
      }
    });

    stats.compliancePercentage =
      stats.total > 0 ? Math.round((stats.compliant / stats.total) * 100) : 0;

    return stats;
  }

  // Get essential items template with all 22 items
  getEssentialItemsTemplate(): EssentialItemData[] {
    return [
      {
        itemNo: 1,
        description: 'Approved Building Plan',
        complianceRequirement: 'Compliant with the building law',
        compliance: '',
        notes: '',
        evidenceProvided: false,
        evidenceType: '',
      },
      {
        itemNo: 2,
        description: 'Valid Occupational Certificate',
        complianceRequirement: 'Compliant with the building law',
        compliance: '',
        notes: '',
        evidenceProvided: false,
        evidenceType: '',
      },
      {
        itemNo: 3,
        description: 'Valid Operating Licenses',
        complianceRequirement: 'Compliant with the regulatory law',
        compliance: '',
        notes: '',
        evidenceProvided: false,
        evidenceType: '',
      },
      {
        itemNo: 4,
        description: 'Valid EIA Reports/Audits',
        complianceRequirement: 'Compliant with the regulatory law',
        compliance: '',
        notes: '',
        evidenceProvided: false,
        evidenceType: '',
      },
      {
        itemNo: 5,
        description: 'Drainage System',
        complianceRequirement:
          'Compliant with the public health Act & the building code',
        compliance: '',
        notes: '',
        evidenceProvided: false,
        evidenceType: '',
      },
      {
        itemNo: 6,
        description: 'Room Designation',
        complianceRequirement: 'Good state of Repair /Maintenance',
        compliance: '',
        notes: '',
        evidenceProvided: false,
        evidenceType: '',
      },
      {
        itemNo: 7,
        description: 'Safe Deposit',
        complianceRequirement: 'Good state of Repair /Maintenance',
        compliance: '',
        notes: '',
        evidenceProvided: false,
        evidenceType: '',
      },
      {
        itemNo: 8,
        description: 'Hand Wash Basin',
        complianceRequirement: 'Good state of Repair /Maintenance',
        compliance: '',
        notes: '',
        evidenceProvided: false,
        evidenceType: '',
      },
      {
        itemNo: 9,
        description: 'Wash Rooms',
        complianceRequirement: 'Good state of Repair /Maintenance',
        compliance: '',
        notes: '',
        evidenceProvided: false,
        evidenceType: '',
      },
      {
        itemNo: 10,
        description: 'Waste / Refuse Disposal',
        complianceRequirement: 'Good state of Repair /Maintenance',
        compliance: '',
        notes: '',
        evidenceProvided: false,
        evidenceType: '',
      },
      {
        itemNo: 11,
        description: 'Sewage Disposal and Treatment',
        complianceRequirement: 'Availability / Functionality',
        compliance: '',
        notes: '',
        evidenceProvided: false,
        evidenceType: '',
      },
      {
        itemNo: 12,
        description: 'Vermin Proofing',
        complianceRequirement: 'Approved & Certified by relevant authority',
        compliance: '',
        notes: '',
        evidenceProvided: false,
        evidenceType: '',
      },
      {
        itemNo: 13,
        description: 'Water Supply',
        complianceRequirement: 'Availability',
        compliance: '',
        notes: '',
        evidenceProvided: false,
        evidenceType: '',
      },
      {
        itemNo: 14,
        description: 'Communication Systems',
        complianceRequirement: 'Availability / Functionality',
        compliance: '',
        notes: '',
        evidenceProvided: false,
        evidenceType: '',
      },
      {
        itemNo: 15,
        description: 'Fire Safety',
        complianceRequirement: 'Fire safety measures / Equipment functionality',
        compliance: '',
        notes: '',
        evidenceProvided: false,
        evidenceType: '',
      },
      {
        itemNo: 16,
        description: 'First Aid',
        complianceRequirement: 'First aid kit & staff capability',
        compliance: '',
        notes: '',
        evidenceProvided: false,
        evidenceType: '',
      },
      {
        itemNo: 17,
        description: 'Electrical Safety',
        complianceRequirement: 'TANESCO certificate / Availability',
        compliance: '',
        notes: '',
        evidenceProvided: false,
        evidenceType: '',
      },
      {
        itemNo: 18,
        description: 'Security Systems',
        complianceRequirement: 'Security measures / Equipment functionality',
        compliance: '',
        notes: '',
        evidenceProvided: false,
        evidenceType: '',
      },
      {
        itemNo: 19,
        description: 'Qualified Management Staff',
        complianceRequirement: 'Certified by relevant Authority',
        compliance: '',
        notes: '',
        evidenceProvided: false,
        evidenceType: '',
      },
      {
        itemNo: 20,
        description: 'Qualified Departmental Heads',
        complianceRequirement: 'Certified by relevant authority',
        compliance: '',
        notes: '',
        evidenceProvided: false,
        evidenceType: '',
      },
      {
        itemNo: 21,
        description: 'Health Medical Examination',
        complianceRequirement: 'Medical certificates available',
        compliance: '',
        notes: '',
        evidenceProvided: false,
        evidenceType: '',
      },
      {
        itemNo: 22,
        description: 'Emergency Evacuation',
        complianceRequirement:
          'Information on emergency procedures given to guests',
        compliance: '',
        notes: '',
        evidenceProvided: false,
        evidenceType: '',
      },
      {
        itemNo: 23,
        description: 'Insurance',
        complianceRequirement: 'Copy of insurance contract available',
        compliance: '',
        notes: '',
        evidenceProvided: false,
        evidenceType: '',
      },
    ];
  }
}
