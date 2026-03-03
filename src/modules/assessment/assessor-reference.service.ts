import {Injectable} from '@angular/core';
import {HttpService} from 'app/api/api.service';
import {ApiResponse} from 'app/custom-response';
import {Observable} from 'rxjs';
import {AssessorReference} from "modules/assessment/assessment";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";

const API = 'assessor-references';

@Injectable({
  providedIn: 'root',
})
export class AssessorReferenceService {
  constructor(private readonly httpService: HttpService, private fb: FormBuilder) {
  }

  get(params?: Record<string, any>): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(API, {...params});
  }

  getByUuid(uuid: string): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(`${API}/${uuid}`);
  }

  create(item: AssessorReference): Observable<ApiResponse> {
    return this.httpService.post<ApiResponse>(API, item);
  }

  update(uuid: string, item: AssessorReference): Observable<ApiResponse> {
    return this.httpService.put<ApiResponse>(`${API}/${uuid}`, item);
  }

  delete(uuid: string): Observable<ApiResponse> {
    return this.httpService.delete<ApiResponse>(`${API}/${uuid}`);
  }

  form = new FormGroup({
    id: new FormControl(null),
    uuid: new FormControl(null),
    name: new FormControl('', [Validators.required]),
    phone: new FormControl('', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    relationship: new FormControl('', [Validators.required]),
  });

  populateForm(data: any) {
    this.form.patchValue(data);
  }

  clearForm() {
    this.form.setValue({
      id: null,
      uuid: null,
      name: '',
      phone: '',
      email: '',
      relationship: ''
    });
  }
}
