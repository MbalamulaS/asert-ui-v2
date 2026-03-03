import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpService } from 'app/api/api.service';
import { ApiResponse } from 'app/custom-response';
import { Observable } from 'rxjs';

export type ApiKey = {
  id: string;
  uuid: string;
  systemName: string;
  systemIp: string;
  expiryData: string;
  apiKey: string;
  description: string;
  isRetired: boolean;
  isApproved: boolean;
  isPublished: boolean;
};

export type ApiKeyApproveDto = {
  isRetired: boolean;
  isApproved: boolean;
  apiKeyUuid: string;
};

const API = 'api-keys';

@Injectable({
  providedIn: 'root',
})
export class ApiKeyService {
  constructor(private readonly httpService: HttpService) {}

  form = new FormGroup({
    id: new FormControl(''),
    uuid: new FormControl(''),
    isPublished: new FormControl(true),
    systemName: new FormControl('', [Validators.required]),
    description: new FormControl(''),
    systemIp: new FormControl('', [Validators.required]),
    contactEmail: new FormControl('', [Validators.required, Validators.email]),
  });

  populateForm(data: ApiKey) {
    this.form.patchValue(data);
    if (data) {
      this.form.patchValue(data);
    }
  }

  clearForms() {
    this.clearForm();
  }

  clearForm() {
    this.form.setValue({
      id: '',
      uuid: '',
      isPublished: true,
      systemName: '',
      contactEmail: '',
      systemIp: '',
      description: '',
    });
  }

  get(params?: Record<string, any>): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(API, { ...params });
  }

  create(payload: any): Observable<ApiResponse> {
    return this.httpService.post<ApiResponse>(API, payload);
  }

  update(uuid: string, payload: any): Observable<ApiResponse> {
    return this.httpService.put<ApiResponse>(`${API}/${uuid}`, payload);
  }

  delete(uuid: string): Observable<ApiResponse> {
    return this.httpService.delete<ApiResponse>(`${API}/${uuid}`);
  }

  changeStatus(payload: ApiKeyApproveDto): Observable<ApiResponse> {
    return this.httpService.post<ApiResponse>(`${API}/change-status`, payload);
  }

  getFormErrors(): any {
    const errors = {};
    Object.keys(this.form.controls).forEach((key) => {
      const controlErrors = this.form.get(key).errors;
      if (controlErrors != null) {
        errors[key] = controlErrors;
      }
    });
    return errors;
  }

  register(payload: any): Observable<ApiResponse> {
    return this.httpService.post<ApiResponse>(`${API}/register-user`, payload);
  }
}
