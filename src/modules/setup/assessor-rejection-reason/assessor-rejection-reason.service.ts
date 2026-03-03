import {Injectable} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {HttpService} from 'app/api/api.service';
import {ApiResponse} from 'app/custom-response';
import {Observable} from 'rxjs';

export interface DocumentType {
  id: string;
  uuid: string;
  name: string;
}

const API = 'assessor-rejection-reasons';

@Injectable({
  providedIn: 'root',
})
export class AssessorRejectionReasonService {
  constructor(private readonly httpService: HttpService) {
  }

  form = new FormGroup({
    id: new FormControl(''),
    uuid: new FormControl(''),
    code: new FormControl('', [Validators.required]),
    reason: new FormControl('', [Validators.required]),
  });

  populateForm(data: DocumentType) {
    this.form.patchValue(data);
  }

  clearForms() {
    this.clearForm();
  }

  clearForm() {
    this.form.setValue({
      id: '',
      uuid: '',
      code: '',
      reason: '',
    });
  }

  get(params?: Record<string, any>): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(API, {
      ...params,
    });
  }

  create(documentType: any): Observable<ApiResponse> {
    return this.httpService.post<ApiResponse>(
      API,
      documentType,
    );
  }

  update(uuid: string, documentType: any): Observable<ApiResponse> {
    return this.httpService.put<ApiResponse>(
      `${API}/${uuid}`,
      documentType,
    );
  }

  delete(uuid: string): Observable<ApiResponse> {
    return this.httpService.delete<ApiResponse>(
      `${API}/${uuid}`,
    );
  }
}
