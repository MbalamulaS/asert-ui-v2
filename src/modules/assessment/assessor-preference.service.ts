import { Injectable } from '@angular/core';
import { HttpService } from 'app/api/api.service';
import { ApiResponse } from 'app/custom-response';
import { Observable } from 'rxjs';
import { AssessorPreference } from 'modules/assessment/assessment';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';

const API = 'assessor-preferences';

@Injectable({
  providedIn: 'root',
})
export class AssessorPreferenceService {
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

  create(item: any): Observable<ApiResponse> {
    return this.httpService.post<ApiResponse>(API, item);
  }

  update(uuid: string, item: AssessorPreference): Observable<ApiResponse> {
    return this.httpService.put<ApiResponse>(`${API}/${uuid}`, item);
  }

  delete(uuid: string): Observable<ApiResponse> {
    return this.httpService.delete<ApiResponse>(`${API}/${uuid}`);
  }

  form = new FormGroup({
    id: new FormControl(null),
    uuid: new FormControl(null),
    preference: new FormControl(null, [Validators.required]),
  });

  populateForm(data: any) {
    this.form.patchValue(data);
  }

  clearForm() {
    this.form.setValue({
      id: null,
      uuid: null,
      preference: '',
    });
  }
}
