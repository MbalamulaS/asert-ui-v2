import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpHeaders } from '@angular/common/http';
import { environment } from 'environment/environment';
import { HttpService } from 'app/api/api.service';
import { BehaviorSubject, Subject, lastValueFrom } from 'rxjs';
import { FormBuilder, Validators } from '@angular/forms';
import { UserResponse } from 'modules/user/types';
import { CompanyDialogService } from 'modules/portal/company/services/company-dialog.service';

interface IAuth {
  email: string;
  password: string;
}

const { ASERT_USER, CLIENT_ID, CLIENT_SECRET, GRANT_TYPE } = environment;

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private dialogEvent = new BehaviorSubject<boolean>(false);
  dialogEvent$ = this.dialogEvent.asObservable();

  private currentUserSubject = new BehaviorSubject<any | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  // Add a logout event subject
  private logoutSubject = new Subject<void>();
  public logout$ = this.logoutSubject.asObservable();

  constructor(
    private readonly httpClient: HttpService,
    private router: Router,
    private companyDialogService?: CompanyDialogService,
  ) {
    // Initialize currentUserSubject with stored user
    const user = this.getCurrentUser();
    if (user) {
      this.currentUserSubject.next(user.user);
    }
  }

  private readonly AUTH_API = 'authenticate';

  createLoginForm() {
    const form = new FormBuilder().group({
      email: ['', Validators.required],
      password: ['', Validators.required],
    });
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
      const response: any = await lastValueFrom(
        this.httpClient.postUrlEncoded(`${this.AUTH_API}`, payload, headers),
      );

      // Setup user and handle navigation
      if (this.setupUser(response)) {
        // Update the currentUser subject
        this.currentUserSubject.next(response.user);

        // Navigate based on user type
        this.navigateAfterLogin();
      }

      return response;
    } catch (error) {
      console.error('Login failed', error);
      throw error;
    }
  }

  setupUser(payload: any): boolean {
    // Add created_at timestamp if not present
    if (!payload.created_at) {
      payload.created_at = new Date().toISOString();
    }
    localStorage.setItem(ASERT_USER, JSON.stringify(payload));
    return !!payload.access_token;
  }

  updateCurrentUser(user: any): void {
    // Update the currentUserSubject
    this.currentUserSubject.next(user);

    // Also update the stored user object
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      currentUser.user = user;
      localStorage.setItem(ASERT_USER, JSON.stringify(currentUser));
    }
  }

  navigateAfterLogin(): void {
    const currentUser = this.getCurrentUser();
    const { user } = currentUser || {};

    const { isClient } = user || {};

    if (currentUser) {
      // If user is not a client, redirect to dashboard (backoffice)
      if (!isClient) {
        this.router.navigate(['/dashboard']);
      } else {
        // If user is a client, check if they need to complete company profile
        if (!user.companyId && this.companyDialogService) {
          this.companyDialogService.openDialog('/manage-listings', true);
        }

        // Navigate to client dashboard
        this.router.navigate(['/manage-listings']);
      }
    }
  }

  logout(): void {
    localStorage.removeItem(ASERT_USER);
    this.currentUserSubject.next(null);

    // Emit the logout event
    this.logoutSubject.next();

    // Navigate to home
    this.router.navigate(['/']);
  }

  emitDialogState(isOpen: boolean): void {
    this.dialogEvent.next(isOpen);
  }

  /**
   * Check if a token is expired
   * @param user User data containing token info
   * @returns boolean True if token is expired
   */
  public isTokenExpired(user: any): boolean {
    // Check for both token and access_token fields
    const token = user.token || user.access_token;
    if (!token || !user.expires_in) {
      return true;
    }
    
    // If no created_at, assume token was just created (don't immediately expire)
    const tokenCreatedAt = user.created_at
      ? new Date(user.created_at).getTime()
      : Date.now();
    
    const expirationTime = tokenCreatedAt + user.expires_in * 1000;
    return Date.now() >= expirationTime;
  }

  getCurrentUser() {
    const user = localStorage.getItem(ASERT_USER);
    return user ? JSON.parse(user) : null;
  }

  get isLoggedIn(): boolean {
    const user = this.getCurrentUser();
    return !!user && !this.isTokenExpired(user);
  }

  get isClient(): boolean {
    const user = this.getCurrentUser();
    return this.isLoggedIn && user?.user?.isClient === true;
  }

  get hasCompany(): boolean {
    const user = this.getCurrentUser();
    return this.isLoggedIn && this.isClient && !!user?.user?.companyId;
  }

  get isNonClient(): boolean {
    return this.isLoggedIn && !this.isClient;
  }

  checkLoginStatus() {
    const item = this.getCurrentUser();
    if (item) {
      try {
        const isExpired = this.isTokenExpired(item);
        
        if (!isExpired) {
          this.currentUserSubject.next(item.user);
          
          // Check if client user needs to complete company profile
          if (item.user && item.user.isClient && !item.user.companyId && this.companyDialogService) {
            // Don't auto-navigate, just ensure dialog is ready to be opened
            // The actual opening will be handled by app initializer or route guard
          }
        } else {
          // Token is expired, log the user out
          this.logout();
        }
      } catch (error) {
        console.error('Error checking token status:', error);
        // On error, assume token is invalid and logout
        this.logout();
      }
    }
  }
}
