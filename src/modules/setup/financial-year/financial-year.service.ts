import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpService } from 'app/api/api.service';
import { ApiResponse } from 'app/custom-response';
import { Observable, of } from 'rxjs';
import { FinancialYear } from './financial-year';

export interface Role {
  id: string;
  uuid: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: string;
}

const API = 'financial-years';

@Injectable({
  providedIn: 'root',
})
export class FinancialYearService {
  constructor(private readonly httpService: HttpService) {}

  form = new FormGroup({
    id: new FormControl(''),
    uuid: new FormControl(''),
    name: new FormControl('', [Validators.required]),
    startDate: new FormControl('', [Validators.required]),
    endDate: new FormControl('', [Validators.required]),
    isCurrent: new FormControl(false, [Validators.required]),
  });

  populateForm(data: FinancialYear) {
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
      startDate: '',
      endDate: '',
      isCurrent: false,
    });
  }

  get(params?: Record<string, any>): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(API, { ...params });
  }

  create(role: any): Observable<ApiResponse> {
    return this.httpService.post<ApiResponse>(API, role);
  }

  update(uuid: string, role: any): Observable<ApiResponse> {
    return this.httpService.put<ApiResponse>(`${API}/${uuid}`, role);
  }

  delete(uuid: string): Observable<ApiResponse> {
    return this.httpService.delete<ApiResponse>(`${API}/${uuid}`);
  }
}
