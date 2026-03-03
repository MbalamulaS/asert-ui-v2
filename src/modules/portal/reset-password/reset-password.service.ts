import { Injectable } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { HttpService } from "app/api/api.service";
import { ApiResponse } from "app/custom-response";
import { confirmedMatchValidator, strongPasswordValidator } from "modules/user/forms/password-rules";
import { Observable } from "rxjs";

const API = 'users';

@Injectable({
  providedIn: 'root',
})
export class ResetPasswordService {
  constructor(private readonly httpService: HttpService) {}

  form = new FormGroup(
    {
      newPassword: new FormControl('', [
        Validators.required,
        strongPasswordValidator,
      ]),
      passwordConfirm: new FormControl('', [Validators.required]),
    },
    { validators: confirmedMatchValidator('newPassword', 'passwordConfirm') }
  );

  clearForm() {
    this.form.reset();
  }

  resetPassword(payload: any): Observable<ApiResponse> {
    return this.httpService.post<ApiResponse>(`${API}/reset-password`, payload);
  }
}
