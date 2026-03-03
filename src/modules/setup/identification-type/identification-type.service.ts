import {Injectable} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {HttpService} from 'app/api/api.service';
import {ApiResponse} from 'app/custom-response';
import {Observable} from 'rxjs';
import { IdentificationType } from './identification-type';

@Injectable({
  providedIn: 'root',
})
export class IdentificationTypeService {
  private readonly API = 'identification-types';
  private items: IdentificationType[] = [];

  constructor(private readonly httpService: HttpService) {}

  form = new FormGroup({
    id: new FormControl(null),
    uuid: new FormControl(null),
    name: new FormControl('', [Validators.required]),
    code: new FormControl('', [Validators.required]),
    issuer: new FormControl('', [Validators.required]),
  });

  populateForm(data: IdentificationType) {
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
      code: '',
      issuer:'',
    });
  }

  get(params?: Record<string, any>): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(this.API, { ...params });
  }

  getByUuid(uuid?: string): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(`${this.API}/${uuid}`);
  }

  create(data: IdentificationType): Observable<ApiResponse> {
    return this.httpService.post<ApiResponse>(this.API, data);
  }

  update(uuid: string, item: IdentificationType): Observable<ApiResponse> {
    return this.httpService.put<ApiResponse>(`${this.API}/${uuid}`, item);
  }

  delete(uuid: string): Observable<ApiResponse> {
    return this.httpService.delete<ApiResponse>(`${this.API}/${uuid}`);
  }
}
