import {Injectable} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {HttpService} from 'app/api/api.service';
import {ApiResponse} from 'app/custom-response';
import {Observable} from 'rxjs';
import {Infrastructure} from "modules/setup/infrastructure/infrastructure";


@Injectable({
  providedIn: 'root',
})
export class InfrastructureService {
  private readonly API = 'infrastructures'

  constructor(private readonly httpService: HttpService) {
  }

  form = new FormGroup({
    id: new FormControl(null),
    uuid: new FormControl(null),
    name: new FormControl('', [Validators.required]),
    code: new FormControl('', [Validators.required]),
    infrastructureCategoryId: new FormControl(null),
  });

  populateForm(data: Infrastructure) {
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
      infrastructureCategoryId: null,
    });
  }

  get(params?: Record<string, any>): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(this.API, {...params});
  }

  getByUuid(uuid?: string): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(`${this.API}/${uuid}`);
  }

  create(item: Infrastructure): Observable<ApiResponse> {
    return this.httpService.post<ApiResponse>(this.API, item);
  }

  update(uuid: string, item: Infrastructure): Observable<ApiResponse> {
    return this.httpService.put<ApiResponse>(`${this.API}/${uuid}`, item);
  }

  delete(uuid: string): Observable<ApiResponse> {
    return this.httpService.delete<ApiResponse>(`${this.API}/${uuid}`);
  }
}
