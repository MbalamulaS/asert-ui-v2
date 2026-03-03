import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpService } from 'app/api/api.service';
import { ApiResponse } from 'app/custom-response';
import { Observable } from 'rxjs';
import { BedType } from './bed-type';

const API = 'bed-types';

@Injectable({
  providedIn: 'root',
})
export class BedTypeService {
  constructor(private readonly httpService: HttpService) {}

  form = new FormGroup({
    id: new FormControl(''),
    uuid: new FormControl(''),
    name: new FormControl('', [Validators.required]),
    description: new FormControl('', [Validators.required]),
  });

  populateForm(data: BedType) {
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
      description: '',
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
