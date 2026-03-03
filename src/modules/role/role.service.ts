import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpService } from 'app/api/api.service';
import { ApiResponse } from 'app/custom-response';
import { Observable } from 'rxjs';

export interface Role {
  id: string;
  uuid: string;
  name: string;
  code: string;
  levelId: string;
  levelName: string;
  hasApprovalStages: boolean;
  isClient: boolean;
}

const API = 'roles';

@Injectable({
  providedIn: 'root',
})
export class RoleService {
  constructor(private readonly httpService: HttpService) {}

  form = new FormGroup({
    id: new FormControl(''),
    uuid: new FormControl(''),
    name: new FormControl('', [Validators.required]),
    code: new FormControl(''),
    levelId: new FormControl(''),
    hasApprovalStages: new FormControl(false),
    isClient: new FormControl(false),
    states: new FormControl([], []),
  });

  populateForm(data: Role) {
    this.form.patchValue(data);
  }

  clearForms() {
    this.clearForm();
  }

  clearForm() {
    this.form.setValue({
      id: '',
      uuid: '',
      name: '',
      code: '',
      levelId: '',
      hasApprovalStages: false,
      isClient: false,
      states: [],
    });
  }

  get(params?: Record<string, any>): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(API, { ...params });
  }

  getRoleByUuid(uuid?: string): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(`${API}/${uuid}`);
  }

  create(role: any): Observable<ApiResponse> {
    return this.httpService.post<ApiResponse>(API, role);
  }

  assignPermissions(uuid: string, role: any): Observable<ApiResponse> {
    return this.httpService.post<ApiResponse>(
      `${API}/${uuid}/assign-authorities`,
      role,
    );
  }

  update(uuid: string, role: any): Observable<ApiResponse> {
    return this.httpService.put<ApiResponse>(`${API}/${uuid}`, role);
  }

  delete(uuid: string): Observable<ApiResponse> {
    return this.httpService.delete<ApiResponse>(`${API}/${uuid}`);
  }
}
