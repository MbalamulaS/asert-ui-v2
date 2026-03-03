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

const DOCUMENT_TYPE_API = 'document-types';

@Injectable({
  providedIn: 'root',
})
export class DocumentTypeService {
  constructor(private readonly httpService: HttpService) {
  }

  form = new FormGroup({
    id: new FormControl(''),
    uuid: new FormControl(''),
    name: new FormControl('', [Validators.required]),
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
      name: '',
    });
  }

  get(params?: Record<string, any>): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(DOCUMENT_TYPE_API, {
      ...params,
    });
  }

  create(documentType: any): Observable<ApiResponse> {
    return this.httpService.post<ApiResponse>(
      DOCUMENT_TYPE_API,
      documentType,
    );
  }

  update(uuid: string, documentType: any): Observable<ApiResponse> {
    return this.httpService.put<ApiResponse>(
      `${DOCUMENT_TYPE_API}/${uuid}`,
      documentType,
    );
  }

  delete(uuid: string): Observable<ApiResponse> {
    return this.httpService.delete<ApiResponse>(
      `${DOCUMENT_TYPE_API}/${uuid}`,
    );
  }
}
