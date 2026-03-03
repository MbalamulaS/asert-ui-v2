import {Injectable} from '@angular/core';
import {HttpService} from 'app/api/api.service';
import {ApiResponse} from 'app/custom-response';
import {Observable} from 'rxjs';
import {EducationBackground} from "modules/assessment/assessment";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";

const API = 'assessor-education-background';

@Injectable({
  providedIn: 'root',
})
export class AssessorEducationBackgroundService {
  constructor(private readonly httpService: HttpService, private fb: FormBuilder) {
  }

  get(params?: Record<string, any>): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(API, {...params});
  }

  getByUuid(uuid: string): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(`${API}/${uuid}`);
  }

  create(item: EducationBackground): Observable<ApiResponse> {
    return this.httpService.post<ApiResponse>(API, item);
  }

  update(uuid: string, item: EducationBackground): Observable<ApiResponse> {
    return this.httpService.put<ApiResponse>(`${API}/${uuid}`, item);
  }

  delete(uuid: string): Observable<ApiResponse> {
    return this.httpService.delete<ApiResponse>(`${API}/${uuid}`);
  }

  form = new FormGroup({
    id: new FormControl(null),
    uuid: new FormControl(null),
    fromDate: new FormControl('', [Validators.required]),
    toDate: new FormControl(''),
    institution: new FormControl(null, [Validators.required]),
    course: new FormControl(null, [Validators.required]),
    educationLevelId: new FormControl(null, [Validators.required]),
    graduated: new FormControl(true, [Validators.required]),
  });

  populateForm(data: any) {
    this.form.patchValue(data);
  }

  clearForm() {
    this.form.setValue({
      id: null,
      uuid: null,
      fromDate: '',
      toDate: '',
      institution: '',
      course: '',
      educationLevelId: '',
      graduated: true,
    });
  }
}
