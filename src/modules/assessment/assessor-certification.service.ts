import {Injectable} from '@angular/core';
import {HttpService} from 'app/api/api.service';
import {ApiResponse} from 'app/custom-response';
import {Observable} from 'rxjs';
import {AssessorCertification} from "modules/assessment/assessment";
import {FormControl, FormGroup, Validators} from "@angular/forms";

const API = 'assessor-certifications';

@Injectable({
  providedIn: 'root',
})
export class AssessorCertificationService {
  constructor(private readonly httpService: HttpService) {
  }

  get(params?: Record<string, any>): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(API, {...params});
  }

  getByUuid(uuid: string): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(`${API}/${uuid}`);
  }

  create(item: AssessorCertification): Observable<ApiResponse> {
    return this.httpService.post<ApiResponse>(API, item);
  }

  update(uuid: string, item: AssessorCertification): Observable<ApiResponse> {
    return this.httpService.put<ApiResponse>(`${API}/${uuid}`, item);
  }

  delete(uuid: string): Observable<ApiResponse> {
    return this.httpService.delete<ApiResponse>(`${API}/${uuid}`);
  }

  form = new FormGroup({
    id: new FormControl(null),
    uuid: new FormControl(null),
    title: new FormControl('', [Validators.required]),
    issuer: new FormControl('', [Validators.required]),
    issueDate: new FormControl('', [Validators.required]),
    expiryDate: new FormControl(''),
    description: new FormControl('', [Validators.required]),
  });

  populateForm(data: any) {
    this.form.patchValue(data);
  }

  clearForm() {
    this.form.setValue({
      id: null,
      uuid: null,
      title: '',
      issuer: '',
      issueDate: '',
      expiryDate: '',
      description: ''
    });
  }
}
