import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpService } from 'app/api/api.service';
import { ApiResponse } from 'app/custom-response';
import { Observable } from 'rxjs';
import { FacilityOwnershipAuthority } from 'modules/setup/facility-ownership-authority/facility-ownership-authority';

@Injectable({
  providedIn: 'root',
})
export class FacilityOwnershipAuthorityService {
  private readonly API = 'facility-ownership-authorities';

  constructor(private readonly httpService: HttpService) {}

  form = new FormGroup({
    id: new FormControl(null),
    uuid: new FormControl(null),
    name: new FormControl('', [Validators.required]),
    code: new FormControl('', [Validators.required]),
    categoryId: new FormControl(null, [Validators.required]),
  });

  populateForm(data: FacilityOwnershipAuthority) {
    this.form.patchValue(data);
  }

  clearForms() {
    this.clearForm();
  }

  clearForm() {
    this.form.setValue({
      id: null,
      uuid: null,
      name: '',
      code: '',
      categoryId: null,
    });
  }

  get(params?: Record<string, any>): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(this.API, { ...params });
  }

  getByUuid(uuid?: string): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(`${this.API}/${uuid}`);
  }

  create(role: FacilityOwnershipAuthority): Observable<ApiResponse> {
    return this.httpService.post<ApiResponse>(this.API, role);
  }

  update(
    uuid: string,
    item: FacilityOwnershipAuthority
  ): Observable<ApiResponse> {
    return this.httpService.put<ApiResponse>(`${this.API}/${uuid}`, item);
  }

  delete(uuid: string): Observable<ApiResponse> {
    return this.httpService.delete<ApiResponse>(`${this.API}/${uuid}`);
  }

  items(): FacilityOwnershipAuthority[] {
    return [
      {
        id: 1,
        name: 'For Profit',
        code: 'PROFIT',
        categoryId: 2,
      },
      {
        id: 2,
        name: 'Faith Based',
        code: 'FBO',
        categoryId: 2,
      },
      {
        id: 3,
        name: 'Non-Governmental',
        code: 'NGO',
        categoryId: 2,
      },
      {
        id: 4,
        name: 'Foreign',
        code: 'FOREIGN',
        categoryId: 2,
      },
      {
        id: 5,
        name: 'Company',
        code: 'COMPANY',
        categoryId: 2,
      },
      {
        id: 6,
        name: 'Public',
        code: 'PUBLIC',
        categoryId: 1,
      },
      {
        id: 7,
        name: 'Parastatal',
        code: 'PARASTATAL',
        categoryId: 1,
      },
    ];
  }
}
