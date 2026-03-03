import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from 'app/api/api.service';
import { Form, FormSubmission } from '../types';
import { ApiResponse } from 'app/custom-response';

const FORM_API = 'forms';

@Injectable({
  providedIn: 'root',
})
export class FormService {
  constructor(private readonly httpService: HttpService) {}

  // Form CRUD operations
  getAllForms(params?: Record<string, any>): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(`${FORM_API}`, params);
  }

  getFormById(uuid: string): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(`${FORM_API}/${uuid}`);
  }

  createForm(form: Form): Observable<Form> {
    return this.httpService.post<Form>(`${FORM_API}`, form);
  }

  updateForm(uuid: string, form: Form): Observable<Form> {
    return this.httpService.put<Form>(`${FORM_API}/${uuid}`, form);
  }

  deleteForm(uuid: string): Observable<void> {
    return this.httpService.delete<void>(`${FORM_API}/${uuid}`);
  }

  // Form Submission operations
  getAllSubmissions(): Observable<FormSubmission[]> {
    return this.httpService.get<FormSubmission[]>(`${FORM_API}/submissions`);
  }

  getSubmissionById(id: number): Observable<FormSubmission> {
    return this.httpService.get<FormSubmission>(
      `${FORM_API}/submissions/${id}`,
    );
  }

  getSubmissionsByFormId(formId: number): Observable<FormSubmission[]> {
    return this.httpService.get<FormSubmission[]>(
      `${FORM_API}/submissions/form/${formId}`,
    );
  }

  submitForm(submission: FormSubmission): Observable<FormSubmission> {
    return this.httpService.post<FormSubmission>(
      `${FORM_API}/submissions`,
      submission,
    );
  }
}
