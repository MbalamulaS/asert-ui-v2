import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpService } from 'app/api/api.service';
import { ApiResponse } from 'app/custom-response';
import { Observable } from 'rxjs';
import { FacilityFundSource } from './facility-fund-sources';

@Injectable({
  providedIn: 'root',
})
export class FacilityFundSourcesService {
  private readonly API = 'facility-fund-sources';

  constructor(private readonly httpService: HttpService) {}

  formGroup = new FormGroup({
    id: new FormControl(null),
    uuid: new FormControl(null),
    name: new FormControl('', [Validators.required]),
    code: new FormControl('', [Validators.required]),
  });

  populateForm(data: FacilityFundSource) {
    this.formGroup.patchValue(data);
    if (data) {
      this.formGroup.patchValue(data);
    }
  }

  clearForms() {
    this.clearForm();
  }

  clearForm() {
    this.formGroup.setValue({
      id: null,
      uuid: null,
      name: '',
      code: '',
    });
  }

  get(params?: Record<string, any>): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(this.API, { ...params });
  }

  create(item: FacilityFundSource): Observable<ApiResponse> {
    return this.httpService.post<ApiResponse>(this.API, item);
  }

  update(uuid: string, item: FacilityFundSource): Observable<ApiResponse> {
    return this.httpService.put<ApiResponse>(`${this.API}/${uuid}`, item);
  }

  delete(uuid: string): Observable<ApiResponse> {
    return this.httpService.delete<ApiResponse>(`${this.API}/${uuid}`);
  }
}
