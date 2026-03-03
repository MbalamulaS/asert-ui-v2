import { Injectable } from '@angular/core';
import { HttpService } from 'app/api/api.service';
import { ApiResponse } from 'app/custom-response';
import { Observable } from 'rxjs';
import { Assessor } from 'modules/assessment/assessment';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';

const API = 'assessors';

@Injectable({
  providedIn: 'root',
})
export class AssessorService {
  constructor(
    private readonly httpService: HttpService,
    private fb: FormBuilder,
  ) {}

  get(params?: Record<string, any>): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(API, { ...params });
  }

  getByUuid(uuid: string): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(`${API}/${uuid}`);
  }

  getCurrentUserAssessorData(): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(`${API}/current-user`);
  }

  getProfileProgress(id = 0): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(
      `${API}/${id}/profile-completion-percentage`,
    );
  }

  create(item: Assessor): Observable<ApiResponse> {
    return this.httpService.post<ApiResponse>(API, item);
  }

  uploadPhoto(item: any): Observable<ApiResponse> {
    return this.httpService.post<ApiResponse>(`${API}/upload-photo`, item);
  }

  setProfilePhoto(
    assessorId: number,
    fileUploadId: number | null,
  ): Observable<ApiResponse> {
    return this.httpService.post<ApiResponse>(`${API}/set-profile-photo`, {
      assessorId,
      fileUploadId,
    });
  }

  assignHotels(id: number, item: any): Observable<ApiResponse> {
    return this.httpService.post<ApiResponse>(
      `${API}/${id}/assign-hotels`,
      item,
    );
  }

  approve(item: any): Observable<ApiResponse> {
    return this.httpService.post<ApiResponse>(`${API}/approve`, item);
  }

  reject(item: any): Observable<ApiResponse> {
    return this.httpService.post<ApiResponse>(`${API}/reject`, item);
  }

  update(uuid: string, item: Assessor): Observable<ApiResponse> {
    return this.httpService.put<ApiResponse>(`${API}/${uuid}`, item);
  }

  submitApplication(): Observable<ApiResponse> {
    return this.httpService.post<ApiResponse>(`${API}/submit-application`, {});
  }

  newApplications(params?: Record<string, any>): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(`${API}/new-applications`, {
      ...params,
    });
  }

  myNewAssignments(params?: Record<string, any>): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(`${API}/my-new-assignments`, {
      ...params,
    });
  }

  mySubmittedAssignments(
    params?: Record<string, any>,
  ): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(
      `${API}/my-assignments-awaiting-approval`,
      { ...params },
    );
  }

  submittedAssignments(params?: Record<string, any>): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(
      `${API}/assignments-awaiting-approval`,
      { ...params },
    );
  }

  completedAssignments(params?: Record<string, any>): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(`${API}/completed-assignments`, {
      ...params,
    });
  }

  myCompletedAssignments(
    params?: Record<string, any>,
  ): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(
      `${API}/my-completed-assignments`,
      { ...params },
    );
  }

  profile(uuid: string): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(`${API}/${uuid}/profile`);
  }

  rejectedApplications(params?: Record<string, any>): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(`${API}/rejected-applications`, {
      ...params,
    });
  }

  approvedApplications(params?: Record<string, any>): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(`${API}/approved-applications`, {
      ...params,
    });
  }

  portalApprovedApplications(
    params?: Record<string, any>,
  ): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(
      `${API}/portal-approved-applications`,
      { ...params },
    );
  }

  submitAssessment(id: number): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(
      `${API}/${id}/submit-assessment-data`,
    );
  }

  approveAssessment(id: number): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(
      `${API}/${id}/approve-assessment-data`,
    );
  }

  delete(uuid: string): Observable<ApiResponse> {
    return this.httpService.delete<ApiResponse>(`${API}/${uuid}`);
  }

  personalInfoForm = new FormGroup({
    id: new FormControl(null),
    uuid: new FormControl(null),
    title: new FormControl('', [Validators.required]),
    firstName: new FormControl('', [Validators.required]),
    middleName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    dob: new FormControl('', [Validators.required]),
    sex: new FormControl('', [Validators.required]),
    phone: new FormControl('', [
      Validators.required,
      Validators.pattern(/^[0-9]{10}$/),
    ]),
    email: new FormControl('', [Validators.required, Validators.email]),
    locationId: new FormControl(null, [Validators.required]),
  });

  contactForm = new FormGroup({
    id: new FormControl(null),
    uuid: new FormControl(null),
    phone: new FormControl('', [
      Validators.required,
      Validators.pattern(/^[0-9]{10}$/),
    ]),
    email: new FormControl('', [Validators.required, Validators.email]),
    locationId: new FormControl(null, [Validators.required]),
  });

  idForm = new FormGroup({
    id: new FormControl(null),
    uuid: new FormControl(null),
    identificationId: new FormControl(null, [Validators.required]),
    identificationType: new FormControl(null, [Validators.required]),
  });

  clearPersonalInfoForm() {
    this.personalInfoForm.setValue({
      id: null,
      uuid: null,
      title: '',
      firstName: '',
      middleName: '',
      lastName: '',
      dob: '',
      sex: '',
      phone: '',
      email: '',
      locationId: '',
    });
  }

  clearContactForm() {
    this.contactForm.setValue({
      id: null,
      uuid: null,
      phone: '',
      email: '',
      locationId: '',
    });
  }

  clearIdForm() {
    this.idForm.setValue({
      id: null,
      uuid: null,
      identificationId: '',
      identificationType: '',
    });
  }
}
