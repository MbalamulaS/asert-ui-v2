import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpService } from 'app/api/api.service';
import { ApiResponse } from 'app/custom-response';
import { Observable, of } from 'rxjs';

interface Item {
  id: number;
  name: string;
  code: string;
  isMedicalStaff: boolean;
}

export interface StaffTitle {
  id: number;
  uuid: string;
  name: string;
  code: string;
  isMedicalStaff: boolean;
}

const STAFF_TITLE_API = 'staff-titles';

@Injectable({
  providedIn: 'root',
})
export class StaffTitleService {
  private items: Item[] = [];

  constructor(private readonly httpService: HttpService) {}

  form = new FormGroup({
    id: new FormControl(null),
    uuid: new FormControl(''),
    name: new FormControl('', [Validators.required]),
    code: new FormControl('', [Validators.required]),
    isMedicalStaff: new FormControl(null, [Validators.required]),
  });

  populateForm(data: StaffTitle) {
    this.form.patchValue(data);
  }

  clearForms() {
    this.clearForm();
  }

  clearForm() {
    this.form.setValue({
      id: null,
      uuid: '',
      name: '',
      code: '',
      isMedicalStaff: null,
    });
  }

  get(params?: Record<string, any>): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(STAFF_TITLE_API, { ...params });
  }

  getStaffTtileByUuid(uuid?: string): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(`${STAFF_TITLE_API}/${uuid}`);
  }

  create(staffTitle: any): Observable<ApiResponse> {
    return this.httpService.post<ApiResponse>(STAFF_TITLE_API, staffTitle);
  }

  update(uuid: string, staffTitle: any): Observable<ApiResponse> {
    return this.httpService.put<ApiResponse>(
      `${STAFF_TITLE_API}/${uuid}`,
      staffTitle
    );
  }

  delete(uuid: string): Observable<ApiResponse> {
    return this.httpService.delete<ApiResponse>(`${STAFF_TITLE_API}/${uuid}`);
  }

  search(searchText: any): Observable<{ data: Item[] }> {
    if (searchText['name.contains']) {
      const filteredItems = this.items.filter((item) =>
        item.name
          .toLowerCase()
          .includes(searchText['name.contains'].toLowerCase())
      );
      return of({ data: filteredItems });
    }
    return of({ data: this.items });
  }
}
