import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpService } from 'app/api/api.service';
import { ApiResponse } from 'app/custom-response';
import { Observable } from 'rxjs';

export interface EquipmentCategory {
  id: string;
  uuid: string;
  name: string;
  code: string;
  icon: string;
}

const EQUIPMENT_CATEGORY_API = 'equipment-categories';

@Injectable({
  providedIn: 'root',
})
export class EquipmentCategoryService {
  constructor(private readonly httpService: HttpService) {}

  form = new FormGroup({
    id: new FormControl(''),
    uuid: new FormControl(''),
    name: new FormControl('', [Validators.required]),
    code: new FormControl('', [Validators.required]),
    icon: new FormControl(''),
  });

  populateForm(data: EquipmentCategory) {
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
      icon: '',
    });
  }

  get(params?: Record<string, any>): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(EQUIPMENT_CATEGORY_API, {
      ...params,
    });
  }

  getEquipmentCategoryByUuid(uuid?: string): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(
      `${EQUIPMENT_CATEGORY_API}/${uuid}`,
    );
  }

  create(equipmentCategory: any): Observable<ApiResponse> {
    return this.httpService.post<ApiResponse>(
      EQUIPMENT_CATEGORY_API,
      equipmentCategory,
    );
  }

  update(uuid: string, equipmentCategory: any): Observable<ApiResponse> {
    return this.httpService.put<ApiResponse>(
      `${EQUIPMENT_CATEGORY_API}/${uuid}`,
      equipmentCategory,
    );
  }

  delete(uuid: string): Observable<ApiResponse> {
    return this.httpService.delete<ApiResponse>(
      `${EQUIPMENT_CATEGORY_API}/${uuid}`,
    );
  }
}
