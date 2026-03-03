import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpService } from 'app/api/api.service';
import { ApiResponse } from 'app/custom-response';
import { Observable } from 'rxjs';
import { BillType } from 'modules/setup/bill-type/bill-type';
import { DatePipe } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class BillTypeService {
  private readonly API = 'bill-types';

  constructor(
    private readonly httpService: HttpService,
    private readonly datePipe: DatePipe,
  ) {}

  form = new FormGroup({
    id: new FormControl(null),
    uuid: new FormControl(null),
    name: new FormControl('', [Validators.required]),
    code: new FormControl('', [Validators.required]),
    rate: new FormControl(0, [Validators.required]),
    description: new FormControl('', [Validators.required]),
    expirationDate: new FormControl(
      this.datePipe.transform(Date.now(), 'yyyy-MM-dd'),
      [Validators.required],
    ),
    effectiveDate: new FormControl(
      this.datePipe.transform(Date.now(), 'yyyy-MM-dd'),
      [Validators.required],
    ),
    isPartial: new FormControl(false, [Validators.required]),
    status: new FormControl(null, [Validators.required]),
  });

  populateForm(data: BillType) {
    this.form.patchValue(data);
  }

  clearForms() {
    this.clearForm();
  }

  clearForm() {
    this.form.reset();
  }

  get(params?: Record<string, any>): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(this.API, { ...params });
  }

  getByUuid(uuid?: string): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(`${this.API}/${uuid}`);
  }

  create(item: BillType): Observable<ApiResponse> {
    return this.httpService.post<ApiResponse>(this.API, item);
  }

  update(uuid: string, item: BillType): Observable<ApiResponse> {
    return this.httpService.put<ApiResponse>(`${this.API}/${uuid}`, item);
  }

  delete(uuid: string): Observable<ApiResponse> {
    return this.httpService.delete<ApiResponse>(`${this.API}/${uuid}`);
  }
}
