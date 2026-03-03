import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpService } from 'app/api/api.service';
import { ApiResponse } from 'app/custom-response';
import { Observable } from 'rxjs';

interface Item {
  id: number;
  name: string;
}

export interface AdminHierarchyLevel {
  id: string;
  uuid: string;
  name: string;
  code: string;
  position: number;
}

const ROLE_API = 'admin-hierarchy-levels';

@Injectable({
  providedIn: 'root',
})
export class AdminHierarchyLevelService {
  private items: Item[] = [];

  constructor(private readonly httpService: HttpService) {}

  form = new FormGroup({
    id: new FormControl(''),
    uuid: new FormControl(''),
    name: new FormControl('', [Validators.required]),
    code: new FormControl('', [Validators.required]),
    position: new FormControl(null, [Validators.required]),
  });

  populateForm(data: AdminHierarchyLevel) {
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
      position: null,
    });
  }

  get(params?: Record<string, any>): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(ROLE_API, { ...params });
  }

  create(role: any): Observable<ApiResponse> {
    return this.httpService.post<ApiResponse>(ROLE_API, role);
  }

  update(uuid: string, role: any): Observable<ApiResponse> {
    return this.httpService.put<ApiResponse>(`${ROLE_API}/${uuid}`, role);
  }

  delete(uuid: string): Observable<ApiResponse> {
    return this.httpService.delete<ApiResponse>(`${ROLE_API}/${uuid}`);
  }
}
