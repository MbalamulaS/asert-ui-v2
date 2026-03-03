import {Injectable} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {HttpService} from 'app/api/api.service';
import {ApiResponse} from 'app/custom-response';
import {Observable} from 'rxjs';

export interface EducationInstitution {
  id: string;
  uuid: string;
  name: string;
  countryId: number;
  countryName: string;
}

const EDUCATION_INSTITUTION_API = 'education-institutions';

@Injectable({
  providedIn: 'root',
})
export class EducationInstitutionService {
  constructor(private readonly httpService: HttpService) {
  }

  form = new FormGroup({
    id: new FormControl(''),
    uuid: new FormControl(''),
    name: new FormControl('', [Validators.required]),
    countryId: new FormControl(null, [Validators.required]),
  });

  populateForm(data: EducationInstitution) {
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
      countryId: null,
    });
  }

  get(params?: Record<string, any>): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(EDUCATION_INSTITUTION_API, {
      ...params,
    });
  }

  getEducationInstitutionByUuid(uuid?: string): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(
      `${EDUCATION_INSTITUTION_API}/${uuid}`,
    );
  }

  create(educationInstitution: any): Observable<ApiResponse> {
    return this.httpService.post<ApiResponse>(
      EDUCATION_INSTITUTION_API,
      educationInstitution,
    );
  }

  update(uuid: string, educationInstitution: any): Observable<ApiResponse> {
    return this.httpService.put<ApiResponse>(
      `${EDUCATION_INSTITUTION_API}/${uuid}`,
      educationInstitution,
    );
  }

  delete(uuid: string): Observable<ApiResponse> {
    return this.httpService.delete<ApiResponse>(
      `${EDUCATION_INSTITUTION_API}/${uuid}`,
    );
  }
}
