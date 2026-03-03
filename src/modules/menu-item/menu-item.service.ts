import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpService } from 'app/api/api.service';
import { ApiResponse } from 'app/custom-response';
import { Observable, of } from 'rxjs';
import { minArrayLengthValidator } from 'utils/validators';

export type Permission = {
  id: number;
  name: string;
};

export type Authority = {
  id: number;
  name: string;
};

export interface MenuItem {
  id: string;
  uuid: string;
  name: string;
  icon: string;
  state: string;
  sortOrder: number;
  menuGroupId: number;
  menuGroupName: string;
  translationLabel: string;
  authorities: Permission[];
  permissions?: Permission[];
  children?: MenuItem[];
}

export type MenuPermission = {
  menuItemUuid: string;
  permissionId: string;
  permissions: Authority[];
};

const API = 'menu-items';

@Injectable({
  providedIn: 'root',
})
export class MenuItemService {
  constructor(private readonly httpService: HttpService) {}

  form = new FormGroup({
    permission: new FormControl(''),
    menuItemUuid: new FormControl(''),
    permissions: new FormControl([], [minArrayLengthValidator(1)]),
  });

  populateForm(data: Partial<MenuPermission>) {
    this.form.patchValue(data);
  }

  clearForms() {
    this.clearForm();
  }

  clearForm() {
    this.form.setValue({
      permission: '',
      menuItemUuid: '',
      permissions: [],
    });
  }

  get(params?: Record<string, any>): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(API, { ...params });
  }

  getMenuItemByUuid(uuid?: string): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(`${API}/${uuid}`);
  }

  create(role: any): Observable<ApiResponse> {
    return this.httpService.post<ApiResponse>(API, role);
  }

  assignPermissions(payload: Record<string, any>): Observable<ApiResponse> {
    return this.httpService.post<ApiResponse>(`${API}/authorities`, payload);
  }

  update(uuid: string, role: any): Observable<ApiResponse> {
    return this.httpService.put<ApiResponse>(`${API}/${uuid}`, role);
  }

  delete(uuid: string): Observable<ApiResponse> {
    return this.httpService.delete<ApiResponse>(`${API}/${uuid}`);
  }
}
