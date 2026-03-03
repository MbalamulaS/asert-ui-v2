import {Injectable} from '@angular/core';
import {HttpService} from 'app/api/api.service';
import {ApiResponse} from 'app/custom-response';
import {Observable} from 'rxjs';
import {EmploymentHistory} from "modules/assessment/assessment";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";

const API = 'assessor-employment-history';

@Injectable({
  providedIn: 'root',
})
export class AssessorEmploymentHistoryService {
  constructor(private readonly httpService: HttpService, private fb: FormBuilder) {
  }

  get(params?: Record<string, any>): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(API, {...params});
  }

  getByUuid(uuid: string): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(`${API}/${uuid}`);
  }

  create(item: EmploymentHistory): Observable<ApiResponse> {
    return this.httpService.post<ApiResponse>(API, item);
  }

  update(uuid: string, item: EmploymentHistory): Observable<ApiResponse> {
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
    positionHeld: new FormControl(null, [Validators.required]),
    company: new FormControl(null, [Validators.required]),
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
      positionHeld: '',
      company: ''
    });
  }
}
