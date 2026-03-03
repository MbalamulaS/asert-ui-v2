import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpService } from 'app/api/api.service';
import { ApiResponse } from 'app/custom-response';
import { Observable, of } from 'rxjs';

interface Item {
  id: number;
  name: string;
  code: string;
}

export interface FacilityType {
  id: string;
  uuid: string;
  name: string;
  code: string;
}

const FACILITY_TYPE_API = 'facility-types';

@Injectable({
  providedIn: 'root',
})
export class FacilityTypeService {
  private items: Item[] = [];

  constructor(private readonly httpService: HttpService) {}

  form = new FormGroup({
    id: new FormControl(''),
    uuid: new FormControl(''),
    name: new FormControl('', [Validators.required]),
    code: new FormControl('', [Validators.required])
  });

  populateForm(data: FacilityType) {
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
    });
  }

  get(params?: Record<string, any>): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(FACILITY_TYPE_API, { ...params });
  }

  getFacilityTypeByUuid(uuid?: string): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(`${FACILITY_TYPE_API}/${uuid}`);
  }

  create(facilityType: any): Observable<ApiResponse> {
    return this.httpService.post<ApiResponse>(FACILITY_TYPE_API, facilityType);
  }

  update(uuid: string, facilityType: any): Observable<ApiResponse> {
    return this.httpService.put<ApiResponse>(`${FACILITY_TYPE_API}/${uuid}`, facilityType);
  }

  delete(uuid: string): Observable<ApiResponse> {
    return this.httpService.delete<ApiResponse>(`${FACILITY_TYPE_API}/${uuid}`);
  }

  search(searchText: any): Observable<{ data: Item[] }> {
    if (searchText['name.contains']) {
      const filteredItems = this.items.filter((item) =>
        item.name
          .toLowerCase()
          .includes(searchText['name.contains'].toLowerCase()),
      );
      return of({ data: filteredItems });
    }
    return of({ data: this.items });
  }
}
