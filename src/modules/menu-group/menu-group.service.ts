import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpService } from 'app/api/api.service';
import { ApiResponse } from 'app/custom-response';
import { Observable } from 'rxjs';

const API = 'menu-groups';

export interface MenuGroup {
  id?: number;
  uuid: string;
  name: string;
  icon: string;
  state: number;
  sortOrder: number;
  translationLabel: string;
}

@Injectable({
  providedIn: 'root',
})
export class MenuGroupService {
  constructor(private readonly httpService: HttpService) {}

  form = new FormGroup({
    id: new FormControl(null),
    uuid: new FormControl(''),
    name: new FormControl('', [Validators.required]),
    icon: new FormControl(''),
    state: new FormControl(null),
    sortOrder: new FormControl(null),
    translationLabel: new FormControl(''),
  });

  populateForm(data: Partial<MenuGroup>) {
    this.form.patchValue(data);
  }

  clearForms() {
    this.clearForm();
  }

  clearForm() {
    this.form.setValue({
      name: '',
      icon: '',
      state: '',
      sortOrder: '',
      id: '',
      uuid: '',
      translationLabel: '',
    });
  }

  get(params?: Record<string, any>): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(API, { ...params });
  }

  getMenuGroupByUuid(uuid?: string): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(`${API}/${uuid}`);
  }

  create(menu: any): Observable<ApiResponse> {
    return this.httpService.post<ApiResponse>(API, menu);
  }

  update(uuid: string, role: any): Observable<ApiResponse> {
    return this.httpService.put<ApiResponse>(`${API}/${uuid}`, role);
  }

  delete(uuid: string): Observable<ApiResponse> {
    return this.httpService.delete<ApiResponse>(`${API}/${uuid}`);
  }
}
function minArrayLengthValidator(
  arg0: number,
): import('@angular/forms').ValidatorFn {
  throw new Error('Function not implemented.');
}
