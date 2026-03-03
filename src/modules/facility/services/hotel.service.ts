import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from 'app/api/api.service';
import { ApiResponse } from 'app/custom-response';
import { FormControl, FormGroup } from '@angular/forms';
import { minArrayLengthValidator } from 'utils/validators';

const API = 'hotels';
const ASSESSMENT_API = 'hotel-assessments';

@Injectable({
  providedIn: 'root',
})
export class HotelService {
  constructor(private readonly httpService: HttpService) {}

  userForm = new FormGroup({
    assessors: new FormControl([], [minArrayLengthValidator(1)]),
  });

  async populateUserForm(data: any) {
    if (data) {
      this.userForm.patchValue({
        assessors: data || [],
      });
    }
  }

  clearUserForm() {
    this.userForm.setValue({
      assessors: [],
    });
  }

  get(
    assessorUuid: string,
    params?: Record<string, any>,
  ): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(`${API}`, {
      ...params,
    });
  }

  getHotelByUuid(uuid?: string): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(`${API}/${uuid}`);
  }

  assignAssessors(uuid: string, payload: any): Observable<ApiResponse> {
    return this.httpService.post<ApiResponse>(
      `${API}/${uuid}/assessors`,
      payload,
    );
  }

  requestAssessment(uuid?: string): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(
      `${API}/${uuid}/request-assessment`,
    );
  }

  getHotelAssessmentResults(hotelUuid: string): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(
      `${ASSESSMENT_API}/${hotelUuid}`,
      {},
    );
  }

  // Room Type API methods

  // Room Type API methods
  getRoomTypes(
    hotelUuid: string,
    params?: Record<string, any>,
  ): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(`${API}/${hotelUuid}/room-types`, {
      ...params,
    });
  }

  setDefaultImage(
    hotelUuid: string,
    mediaUuid: string,
  ): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(
      `${API}/${hotelUuid}/${mediaUuid}room-types`,
      {},
    );
  }
}
