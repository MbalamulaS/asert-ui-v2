import {Injectable} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {HttpService} from 'app/api/api.service';
import {ApiResponse} from 'app/custom-response';
import {Observable} from 'rxjs';
import { Visitor } from './visitor';

@Injectable({
  providedIn: 'root',
})
export class VisitorService {
  private readonly API = 'visitors';
  private items: Visitor[] = [];

  constructor(private readonly httpService: HttpService) {}

  form = new FormGroup({
    id: new FormControl(null),
    uuid: new FormControl(null),
    fullName: new FormControl('', [Validators.required]),
    idNumber: new FormControl('', [Validators.required]),
    countryId: new FormControl('', [Validators.required]),
    identificationTypeId: new FormControl('', [Validators.required]),
    gender: new FormControl('', [Validators.required]),
    mobileNumber: new FormControl('', [Validators.required]),
    dateOfBirth: new FormControl('', [Validators.required]),
    placeOfBirth: new FormControl('', [Validators.required]),
    permanentPhysicalAddress: new FormControl('', [Validators.required]),
  });

  populateForm(data: Visitor) {
    this.form.patchValue(data);
  }

  clearForms() {
    this.clearForm();
  }

  clearForm() {
    this.form.setValue({
      id: null,
      uuid: null,
      fullName: '',
      idNumber: '',
      countryId: '',
      identificationTypeId: '',
      gender: '',
      mobileNumber: '',
      dateOfBirth: '',
      placeOfBirth: '',
      permanentPhysicalAddress: '',
    });
  }

  get(params?: Record<string, any>): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(this.API, { ...params });
  }

  getByUuid(uuid?: string): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(`${this.API}/${uuid}`);
  }

  create(data: Visitor): Observable<ApiResponse> {
    return this.httpService.post<ApiResponse>(this.API, data);
  }

  update(uuid: string, item: Visitor): Observable<ApiResponse> {
    return this.httpService.put<ApiResponse>(`${this.API}/${uuid}`, item);
  }

  delete(uuid: string): Observable<ApiResponse> {
    return this.httpService.delete<ApiResponse>(`${this.API}/${uuid}`);
  }
}
