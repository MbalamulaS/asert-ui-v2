import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpService } from 'app/api/api.service';
import { ApiResponse } from 'app/custom-response';
import { Observable } from 'rxjs';
import {
  minArrayLengthValidator,
  unmaskedPatternValidator,
} from 'utils/validators';
import {
  confirmedMatchValidator,
  passwordMatchValidator,
  strongPasswordValidator,
} from 'modules/user/forms/password-rules';

export interface User {
  id: string;
  uuid: string;
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  adminHierarchyId: string;
  adminHierarchyName: string;
  fullName: string;
  roleName: string;
  roles: any[];
  status: string;
  isActive: boolean;
  isApproved: boolean;
  phoneNumber: string;
}

const API = 'users';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private readonly httpService: HttpService) {}

  userForm = new FormGroup({
    id: new FormControl(''),
    uuid: new FormControl(''),
    firstName: new FormControl('', [Validators.required]),
    middleName: new FormControl(''),
    lastName: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    adminHierarchyId: new FormControl('', [Validators.required]),
    adminHierarchyName: new FormControl(''),
    phoneNumber: new FormControl('', [Validators.required]),
    roles: new FormControl([], [minArrayLengthValidator(1)]),
  });

  registrationForm = new FormGroup(
    {
      firstName: new FormControl('', [Validators.required]),
      middleName: new FormControl(''),
      lastName: new FormControl('', [Validators.required]),
      password: new FormControl('', [
        Validators.required,
        strongPasswordValidator,
      ]),
      passwordConfirm: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      registrationType: new FormControl('ASSESSOR', [Validators.required]),
      phoneNumber: new FormControl('', [
        Validators.required,
        unmaskedPatternValidator('(9999) 999-999'),
      ]),
    },
    { validators: passwordMatchValidator }
  );

  registrationFormNew = new FormGroup({
    firstName: new FormControl('', [Validators.required]),
    middleName: new FormControl(''),
    lastName: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    registrationType: new FormControl('ASSESSOR', [Validators.required]),
    phoneNumber: new FormControl('', [
      Validators.required,
      unmaskedPatternValidator('(9999) 999-999'),
    ]),
    adminHierarchyId: new FormControl('', [Validators.required]),
    adminHierarchyName: new FormControl(''),
  });

  changePasswordForm = new FormGroup({
    newPassword: new FormControl('', [
      Validators.required,
      strongPasswordValidator,
    ]),
    passwordConfirm: new FormControl('', [Validators.required]),
  },{ validators: confirmedMatchValidator('newPassword', 'passwordConfirm') });

  clearChangePasswordForm() {
    this.changePasswordForm.reset();
  }

  forgotPasswordForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  clearForgotPasswordForm() {
    this.forgotPasswordForm.reset();
  }

  populateForm(data: User) {
    this.userForm.patchValue(data);
    if (data) {
      this.userForm.patchValue(data);
    }
  }

  populateRegistrationForm(data: User) {
    this.registrationForm.patchValue(data);
    if (data) {
      this.registrationForm.patchValue(data);
    }
  }

  clearForms() {
    this.clearForm();
  }

  clearForm() {
    this.userForm.setValue({
      id: '',
      uuid: '',
      firstName: '',
      middleName: '',
      lastName: '',
      email: '',
      adminHierarchyId: '',
      adminHierarchyName: '',
      phoneNumber: '',
      roles: [],
    });
  }

  clearRegistrationForm() {
    this.registrationForm.setValue({
      firstName: '',
      middleName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      password: '',
      passwordConfirm: '',
      registrationType: '',
    });
  }

  clearRegistrationFormNew() {
    this.registrationFormNew.setValue({
      firstName: '',
      middleName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      registrationType: '',
      adminHierarchyId: '',
      adminHierarchyName: '',
    });
  }

  get(params?: Record<string, any>): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(API, { ...params });
  }

  getOne(uuid: string): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(`${API}/${uuid}`);
  }

  getOneById(id: number): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(`${API}/${id}/user`);
  }

  create(payload: any): Observable<ApiResponse> {
    return this.httpService.post<ApiResponse>(API, payload);
  }

  update(uuid: string, payload: any): Observable<ApiResponse> {
    return this.httpService.put<ApiResponse>(`${API}/${uuid}`, payload);
  }

  approve(uuid: string, payload: any): Observable<ApiResponse> {
    return this.httpService.put<ApiResponse>(`${API}/${uuid}/approve`, payload);
  }

  delete(uuid: string): Observable<ApiResponse> {
    return this.httpService.delete<ApiResponse>(`${API}/${uuid}`);
  }

  getFormErrors(): any {
    const errors = {};
    Object.keys(this.userForm.controls).forEach((key) => {
      const controlErrors = this.userForm.get(key).errors;
      if (controlErrors != null) {
        errors[key] = controlErrors;
      }
    });
    return errors;
  }

  getRegistrationFormErrors(): any {
    const errors = {};
    Object.keys(this.registrationForm.controls).forEach((key) => {
      const controlErrors = this.registrationForm.get(key).errors;
      if (controlErrors != null) {
        errors[key] = controlErrors;
      }
    });
    return errors;
  }

  register(payload: any): Observable<ApiResponse> {
    return this.httpService.post<ApiResponse>(`${API}/register-user`, payload);
  }

  changePassword(payload: any): Observable<ApiResponse> {
    return this.httpService.post<ApiResponse>(
      `${API}/change-password`,
      payload
    );
  }

  forgotPassword(payload: any): Observable<ApiResponse> {
    return this.httpService.post<ApiResponse>(
      `${API}/forgot-password`,
      payload
    );
  }
}
