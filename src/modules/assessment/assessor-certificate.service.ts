import { Injectable } from '@angular/core';
import { HttpService } from 'app/api/api.service';
import { ApiResponse } from 'app/custom-response';
import { Observable } from 'rxjs';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

const API = 'assessors';

export interface AssessorCertificate {
  id?: number;
  uuid?: string;
  certificateName: string;
  issuingAuthority: string;
  certificateNumber?: string;
  issueDate: string;
  expiryDate?: string;
  description?: string;
  certificateType: string;
  verificationStatus?: string;
  verificationNotes?: string;
  isActive?: boolean;
  assessorId?: number;
  assessorUuid?: string;
  // File upload fields
  fileUploadId?: number;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  // Computed fields
  isExpired?: boolean;
  isExpiringSoon?: boolean;
  hasFile?: boolean;
  statusDisplayName?: string;
}

// Simplified - no separate evidence interface needed

@Injectable({
  providedIn: 'root',
})
export class AssessorCertificateService {
  constructor(
    private readonly httpService: HttpService,
    private fb: FormBuilder,
  ) {}

  create(certificate: AssessorCertificate): Observable<ApiResponse> {
    return this.httpService.post<ApiResponse>(`${API}/certificates`, certificate);
  }

  // Note: Certificates are retrieved as part of /assessors/current-user response
  // File uploads/deletions handled by FileUploadService

  certificateForm = new FormGroup({
    id: new FormControl(null),
    uuid: new FormControl(null),
    certificateName: new FormControl('', [Validators.required]),
    issuingAuthority: new FormControl('', [Validators.required]),
    certificateNumber: new FormControl(''),
    issueDate: new FormControl('', [Validators.required]),
    expiryDate: new FormControl(''),
    description: new FormControl(''),
    certificateType: new FormControl('', [Validators.required]),
    verificationStatus: new FormControl('PENDING'),
    verificationNotes: new FormControl(''),
    isActive: new FormControl(true),
    assessorId: new FormControl(null),
    fileUploadId: new FormControl(null), // Direct file upload field
  });

  populateCertificateForm(data: AssessorCertificate) {
    this.certificateForm.patchValue(data);
  }

  clearCertificateForm() {
    this.certificateForm.reset({
      verificationStatus: 'PENDING',
      isActive: true,
    });
  }

  getCertificateTypes() {
    return [
      { value: 'ACADEMIC', label: 'Academic Certificate' },
      { value: 'PROFESSIONAL', label: 'Professional Certificate' },
      { value: 'TRAINING', label: 'Training Certificate' },
      { value: 'LICENSE', label: 'License/Permit' },
    ];
  }


  getVerificationStatuses() {
    return [
      { value: 'PENDING', label: 'Pending Verification' },
      { value: 'VERIFIED', label: 'Verified' },
      { value: 'REJECTED', label: 'Rejected' },
    ];
  }
}