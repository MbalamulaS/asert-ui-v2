import {Injectable} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {HttpService} from 'app/api/api.service';
import {ApiResponse} from 'app/custom-response';
import {Observable} from 'rxjs';

export interface EducationLevel {
  id: string;
  uuid: string;
  name: string;
}

const EDUCATION_LEVEL_API = 'education-levels';

@Injectable({
  providedIn: 'root',
})
export class EducationLevelService {
  constructor(private readonly httpService: HttpService) {
  }

  form = new FormGroup({
    id: new FormControl(''),
    uuid: new FormControl(''),
    name: new FormControl('', [Validators.required]),
  });

  populateForm(data: EducationLevel) {
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
    });
  }

  get(params?: Record<string, any>): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(EDUCATION_LEVEL_API, {
      ...params,
    });
  }

  getEducationInstitutionByUuid(uuid?: string): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(
      `${EDUCATION_LEVEL_API}/${uuid}`,
    );
  }

  create(educationInstitution: any): Observable<ApiResponse> {
    return this.httpService.post<ApiResponse>(
      EDUCATION_LEVEL_API,
      educationInstitution,
    );
  }

  update(uuid: string, educationInstitution: any): Observable<ApiResponse> {
    return this.httpService.put<ApiResponse>(
      `${EDUCATION_LEVEL_API}/${uuid}`,
      educationInstitution,
    );
  }

  delete(uuid: string): Observable<ApiResponse> {
    return this.httpService.delete<ApiResponse>(
      `${EDUCATION_LEVEL_API}/${uuid}`,
    );
  }
}
