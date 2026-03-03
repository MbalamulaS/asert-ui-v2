import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpService } from 'app/api/api.service';
import { ApiResponse } from 'app/custom-response';
import { Observable } from 'rxjs';
import { FacilityLevel } from 'modules/setup/facility-level/facility-level';
import { minArrayLengthValidator } from 'utils/validators';

@Injectable({
  providedIn: 'root',
})
export class FacilityLevelService {
  private readonly API = 'facility-levels';
  private readonly FACILITY_LEVEL_GROUP_API = 'facility-level-groups';

  constructor(private readonly httpService: HttpService) {}

  formGroup = new FormGroup({
    id: new FormControl(null),
    uuid: new FormControl(null),
    name: new FormControl('', [Validators.required]),
    code: new FormControl('', [Validators.required]),
    facilityLevelGroupId: new FormControl<number | null>(null, [
      Validators.required,
    ]),
    price: new FormControl<number | null>(null, [Validators.required]),
    levelRank: new FormControl<number | null>(null, [Validators.required]),
    services: new FormControl([], [minArrayLengthValidator(1)]),
    equipments: new FormControl([], [minArrayLengthValidator(1)]),
    premises: new FormControl([], [minArrayLengthValidator(1)]),
    infrastructures: new FormControl([], [minArrayLengthValidator(1)]),
    staffTitles: new FormControl([], [minArrayLengthValidator(1)]),
  });

  populateForm(data: FacilityLevel) {
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
      facilityLevelGroupId: null,
      price: null,
      levelRank: null,
      services: [],
      equipments: [],
      premises: [],
      infrastructures: [],
      staffTitles: [],
    });
  }

  get(params?: Record<string, any>): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(this.API, { ...params });
  }

  getById(id: number): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(`${this.API}/get-by-id/${id}`);
  }

  getPortalMapLevels(params?: Record<string, any>): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(`${this.API}/portal-map-levels`, {
      ...params,
    });
  }

  getFacilityLevelGroups(
    params?: Record<string, any>
  ): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(this.FACILITY_LEVEL_GROUP_API, {
      ...params,
    });
  }

  // Send facility levels bila zile services
  create(facilityLevel: FacilityLevel): Observable<ApiResponse> {
    const { services, ...facilityLevelWithoutServices } = facilityLevel;
    return this.httpService.post<ApiResponse>(
      this.API,
      facilityLevelWithoutServices
    );
  }

  update(uuid: string, item: FacilityLevel): Observable<ApiResponse> {
    return this.httpService.put<ApiResponse>(`${this.API}/${uuid}`, item);
  }

  delete(uuid: string): Observable<ApiResponse> {
    return this.httpService.delete<ApiResponse>(`${this.API}/${uuid}`);
  }

  // Now assign the services having received ile facility ID, bad approach, fanyia hii backend
  assignServicesToFacilityLevel(
    uuid: string,
    services: string[]
  ): Observable<ApiResponse> {
    return this.httpService.post<ApiResponse>(
      `${this.API}/${uuid}/assign-services`,
      { serviceIds: services }
    );
  }
}
