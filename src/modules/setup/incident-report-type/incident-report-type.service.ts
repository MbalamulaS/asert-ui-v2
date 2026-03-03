import {Injectable} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {HttpService} from 'app/api/api.service';
import {ApiResponse} from 'app/custom-response';
import {Observable} from 'rxjs';
import { IncidentReportType } from './incident-report-type';

@Injectable({
  providedIn: 'root',
})
export class IncidentReportTypeService {
  private readonly API = 'incident-report-types';
  private items: IncidentReportType[] = [];

  constructor(private readonly httpService: HttpService) {}

  form = new FormGroup({
    id: new FormControl(null),
    uuid: new FormControl(null),
    name: new FormControl('', [Validators.required]),
    severity: new FormControl('', [Validators.required]),
  });

  populateForm(data: IncidentReportType) {
    this.form.patchValue(data);
  }

  clearForms() {
    this.clearForm();
  }

  clearForm() {
    this.form.setValue({
      id: null,
      uuid: null,
      name: '',
      severity: '',
    });
  }

  get(params?: Record<string, any>): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(this.API, { ...params });
  }

  getByUuid(uuid?: string): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(`${this.API}/${uuid}`);
  }

  create(data: IncidentReportType): Observable<ApiResponse> {
    return this.httpService.post<ApiResponse>(this.API, data);
  }

  update(uuid: string, item: IncidentReportType): Observable<ApiResponse> {
    return this.httpService.put<ApiResponse>(`${this.API}/${uuid}`, item);
  }

  delete(uuid: string): Observable<ApiResponse> {
    return this.httpService.delete<ApiResponse>(`${this.API}/${uuid}`);
  }
}
