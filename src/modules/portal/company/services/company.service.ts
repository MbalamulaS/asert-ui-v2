import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpService } from 'app/api/api.service';
import { ApiResponse } from 'app/custom-response';
import { BehaviorSubject, Observable, lastValueFrom } from 'rxjs';
import { Company } from '../types';
import { AuthService } from 'services/auth.service';
import { environment } from 'environment/environment';

const API = 'companies';

@Injectable({
  providedIn: 'root',
})
export class CompanyService {
  private companyProfileSubject = new BehaviorSubject<Company | null>(null);
  public companyProfile$ = this.companyProfileSubject.asObservable();

  form = new FormGroup({
    id: new FormControl(''),
    uuid: new FormControl(''),
    companyTypeId: new FormControl('', [Validators.required]),
    certificateRegistrationNumber: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    name: new FormControl('', [Validators.required]),
    registrationStatus: new FormControl('PENDING'),
    createdAt: new FormControl(''),
    createdBy: new FormControl(''),
    updatedAt: new FormControl(''),
    updatedBy: new FormControl(''),
    isDeleted: new FormControl(false),
    isActive: new FormControl(true),
    website: new FormControl(''),
    tradingName: new FormControl(''),
    tin: new FormControl(''),
    registrationType: new FormControl(''),
    registrationDate: new FormControl(''),
  });

  constructor(
    private readonly httpService: HttpService,
    private authService: AuthService,
  ) {
    // Load company if user is logged in and has companyId
    this.loadCurrentUserCompany();
  }

  private async loadCurrentUserCompany(): Promise<void> {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser?.user?.companyId) {
      try {
        const response = await lastValueFrom(
          this.getById(currentUser.user.companyId),
        );

        if (response && response.data) {
          this.companyProfileSubject.next(response.data);
        }
      } catch (error) {
        console.error('Error loading company profile:', error);
      }
    }
  }

  populateForm(data: Company) {
    this.form.patchValue(data);
  }

  clearForms() {
    this.clearForm();
  }

  clearForm() {
    this.form.setValue({
      id: '',
      uuid: '',
      companyTypeId: '',
      certificateRegistrationNumber: '',
      email: '',
      name: '',
      registrationStatus: 'PENDING',
      createdAt: '',
      createdBy: '',
      updatedAt: '',
      updatedBy: '',
      isDeleted: false,
      isActive: false,
      website: '',
      tradingName: '',
      tin: '',
      registrationType: '',
      registrationDate: '',
    });
  }

  /**
   * Check if the current user has a company
   */
  hasCompany(): boolean {
    const currentUser = this.authService.getCurrentUser();
    return !!currentUser?.user?.companyId;
  }

  /**
   * Get the current company profile
   */
  getCompanyProfile(): Observable<Company | null> {
    return this.companyProfile$;
  }

  /**
   * Clear the current company profile
   */
  clearCompanyProfile(): void {
    this.companyProfileSubject.next(null);
  }

  /**
   * Create a company and update the user's companyId
   */
  async createCompanyProfile(company: Company): Promise<ApiResponse> {
    try {
      const response = await lastValueFrom(this.create(company));

      if (response && response.data) {
        // Update the subject
        this.companyProfileSubject.next(response.data);

        // Update the user's companyId in localStorage
        const currentUser = this.authService.getCurrentUser();
        if (currentUser && currentUser.user) {
          currentUser.user.companyId = response.data.uuid;
          localStorage.setItem(
            environment.ASERT_USER,
            JSON.stringify(currentUser),
          );

          // Update the user subject in AuthService
          this.authService.updateCurrentUser(currentUser.user);
        }
      }

      return response;
    } catch (error) {
      console.error('Error creating company profile:', error);
      throw error;
    }
  }

  /**
   * Update a company profile
   */
  async updateCompanyProfile(
    uuid: string,
    company: Company,
  ): Promise<ApiResponse> {
    try {
      const response = await lastValueFrom(this.update(uuid, company));

      if (response && response.data) {
        // Update the subject
        this.companyProfileSubject.next(response.data);
      }

      return response;
    } catch (error) {
      console.error('Error updating company profile:', error);
      throw error;
    }
  }

  get(params?: Record<string, any>): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(API, { ...params });
  }

  getByUuid(uuid: string): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(`${API}/${uuid}`);
  }

  getById(id: string): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(`${API}/${id}/get-by-id`);
  }

  create(company: Company): Observable<ApiResponse> {
    return this.httpService.post<ApiResponse>(API, company);
  }

  update(uuid: string, company: Company): Observable<ApiResponse> {
    return this.httpService.put<ApiResponse>(`${API}/${uuid}`, company);
  }

  delete(uuid: string): Observable<ApiResponse> {
    return this.httpService.delete<ApiResponse>(`${API}/${uuid}`);
  }
}
