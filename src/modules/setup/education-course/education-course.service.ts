import {Injectable} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {HttpService} from 'app/api/api.service';
import {ApiResponse} from 'app/custom-response';
import {Observable} from 'rxjs';

export interface EducationCourse {
  id: string;
  uuid: string;
  name: string;
  educationLevelId: number;
  educationLevelName: string;
}

const EDUCATION_COURSE_API = 'education-courses';

@Injectable({
  providedIn: 'root',
})
export class EducationCourseService {
  constructor(private readonly httpService: HttpService) {
  }

  form = new FormGroup({
    id: new FormControl(''),
    uuid: new FormControl(''),
    name: new FormControl('', [Validators.required]),
    educationLevelId: new FormControl(null, [Validators.required]),
  });

  populateForm(data: EducationCourse) {
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
      educationLevelId: null,
    });
  }

  get(params?: Record<string, any>): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(EDUCATION_COURSE_API, {
      ...params,
    });
  }

  create(educationCourse: any): Observable<ApiResponse> {
    return this.httpService.post<ApiResponse>(
      EDUCATION_COURSE_API,
      educationCourse,
    );
  }

  update(uuid: string, educationCourse: any): Observable<ApiResponse> {
    return this.httpService.put<ApiResponse>(
      `${EDUCATION_COURSE_API}/${uuid}`,
      educationCourse,
    );
  }

  delete(uuid: string): Observable<ApiResponse> {
    return this.httpService.delete<ApiResponse>(
      `${EDUCATION_COURSE_API}/${uuid}`,
    );
  }
}
