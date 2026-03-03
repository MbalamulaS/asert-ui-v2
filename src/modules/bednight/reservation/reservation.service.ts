import {Injectable} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {HttpService} from 'app/api/api.service';
import {ApiResponse} from 'app/custom-response';
import {Observable} from 'rxjs';
import { IncidentReport, Reservation } from './reservation';

@Injectable({
  providedIn: 'root',
})
export class ReservationService {
  private readonly API = 'reservations';
  private items: Reservation[] = [];

  constructor(private readonly httpService: HttpService) {}

  form = new FormGroup({
    id: new FormControl(null),
    uuid: new FormControl(null),
    hotelId: new FormControl('', [Validators.required]),
    visitorIds: new FormControl('', [Validators.required]),
    roomTypeId: new FormControl('', [Validators.required]),
    roomNumber: new FormControl('', [Validators.required]),
    checkInDate: new FormControl('', [Validators.required]),
    checkOutDate: new FormControl('', [Validators.required]),
  });

  reportIncidentForm = new FormGroup({
    id: new FormControl(null),
    uuid: new FormControl(null),
    incidentTypeId: new FormControl('', [Validators.required]),
    hotelId: new FormControl('', [Validators.required]),
    visitorId: new FormControl('', [Validators.required]),
    reservationId: new FormControl('', [Validators.required]),
    incidentDate: new FormControl('', [Validators.required]),
    comment: new FormControl('', [Validators.required]),
  });

  populateForm(data: IncidentReport) {
    this.reportIncidentForm.patchValue(data);
  }

  clearForms() {
    this.clearForm();
  }

  clearForm() {
    this.form.setValue({
      id: null,
      uuid: null,
      hotelId: '',
      visitorIds: '',
      roomTypeId: '',
      roomNumber: '',
      checkInDate: '',
      checkOutDate: '',
    });
  }
  clearIncidentForm() {
    this.reportIncidentForm.setValue({
      id: null,
      uuid: null,
      hotelId: '',
      comment: '',
      incidentTypeId: '',
      visitorId: '',
      reservationId: '',
      incidentDate: '',
    });
  }

  get(params?: Record<string, any>): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(this.API, { ...params });
  }

  getByUuid(uuid?: string): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(`${this.API}/${uuid}`);
  }

  create(data: Reservation): Observable<ApiResponse> {
    return this.httpService.post<ApiResponse>(this.API, data);
  }

  update(uuid: string, item: Reservation): Observable<ApiResponse> {
    return this.httpService.put<ApiResponse>(`${this.API}/${uuid}`, item);
  }

  delete(uuid: string): Observable<ApiResponse> {
    return this.httpService.delete<ApiResponse>(`${this.API}/${uuid}`);
  }
  guestCheckout(uuid: string): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(`${this.API}/checkout/${uuid}`);
  }
}
