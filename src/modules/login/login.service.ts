import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { environment } from 'environment/environment';
import { HttpService } from 'app/api/api.service';
import { BehaviorSubject, lastValueFrom } from 'rxjs';
import { FormBuilder, Validators } from '@angular/forms';
import { UserResponse } from 'modules/user/types';

interface IAuth {
  email: string;
  password: string;
}

const { ASERT_USER, CLIENT_ID, CLIENT_SECRET, GRANT_TYPE } = environment;

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private dialogEvent = new BehaviorSubject<boolean>(false); // Use BehaviorSubject
  dialogEvent$ = this.dialogEvent.asObservable();

  constructor(private readonly httpClient: HttpService) {}
  private readonly AUTH_API = 'authenticate';

  // In LoginService
  createLoginForm() {
    const form = new FormBuilder().group({
      email: ['', Validators.required],
      password: ['', Validators.required],
    });
    console.log('Login form created:', form);
    return form;
  }

  async login<T extends IAuth>(login: any): Promise<any> {
    const basicAuth = 'Basic ' + btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);
    const payload = `username=${encodeURIComponent(
      login.email,
    )}&password=${encodeURIComponent(login.password)}&grant_type=${GRANT_TYPE}`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
      Authorization: basicAuth,
    });

    try {
      const response = await lastValueFrom(
        this.httpClient.postUrlEncoded(`${this.AUTH_API}`, payload, headers),
      );
      return response;
    } catch (error) {
      console.error('Login failed', error);
      throw error;
    }
  }

  setupUser(payload: UserResponse): boolean {
    localStorage.setItem(ASERT_USER, JSON.stringify(payload));
    return !!payload.token;
  }

  emitDialogState(isOpen: boolean): void {
    this.dialogEvent.next(isOpen);
  }

  /**
   * Check if a token is expired
   * @param user User data containing token info
   * @returns boolean True if token is expired
   */
  private isTokenExpired(user: UserResponse): boolean {
    if (!user.token || !user.expires_in) {
      return true;
    }

    const tokenCreatedAt = user.created_at
      ? new Date(user.created_at).getTime()
      : Date.now() - 60000;

    const expirationTime = tokenCreatedAt + user.expires_in * 1000;
    return Date.now() >= expirationTime;
  }

  getCurrentUser() {
    const user = localStorage.getItem(ASERT_USER);
    return user ? JSON.parse(user) : null;
  }

  checkLoginStatus() {
    const item = this.getCurrentUser();
    const { user } = item?.user || {};
  }
}
