import { Injectable } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { HttpService } from 'app/api/api.service';
import { ApiResponse } from 'app/custom-response';
import { Hotel } from '../types';

const API = 'hotels';
const ASSESSMENT_API = 'hotel-assessments';

@Injectable({
  providedIn: 'root',
})
export class HotelService {
  constructor(private readonly httpService: HttpService) {}

  form = new FormGroup({
    id: new FormControl(null),
    uuid: new FormControl(null),
    name: new FormControl('', [Validators.required]),
    website: new FormControl(''),
    email: new FormControl('', [Validators.required, Validators.email]),
    phone: new FormControl('', [Validators.required]),
    description: new FormControl('', [Validators.required]),
    latitude: new FormControl(null),
    longitude: new FormControl(null),
    propertyType: new FormControl(null, [Validators.required]),
    defaultImageId: new FormControl(null),
    status: new FormControl('AWAITING_APPROVAL'),
    isActive: new FormControl(true),
    locationId: new FormControl(null),
    companyId: new FormControl(null),
    roomTypes: new FormArray([]),
    facilities: new FormArray([]),
  });

  // Create a new room type form group
  createRoomTypeFormGroup(): FormGroup {
    return new FormGroup({
      id: new FormControl(''),
      uuid: new FormControl(''),
      quantity: new FormControl(1, [Validators.required, Validators.min(1)]),
      maxOccupancy: new FormControl(null),
      bedRoomTypeId: new FormControl('', [Validators.required]),
      bedTypeId: new FormControl('', [Validators.required]),
      amenities: new FormControl([]),
    });
  }

  // Create a new facility form group
  createFacilityFormGroup(): FormGroup {
    return new FormGroup({
      id: new FormControl(''),
      uuid: new FormControl(''),
      name: new FormControl('', [Validators.required]),
      facilityType: new FormControl('', [Validators.required]),
      description: new FormControl(''),
      capacity: new FormControl(null),
      openingHours: new FormControl(''),
    });
  }

  // Add a new room type to the form
  addRoomType(): void {
    const roomTypes = this.form.get('roomTypes') as FormArray;
    roomTypes.push(this.createRoomTypeFormGroup());
  }

  // Add a new facility to the form
  addFacility(): void {
    const facilities = this.form.get('facilities') as FormArray;
    facilities.push(this.createFacilityFormGroup());
  }

  // Remove a room type from the form
  removeRoomType(index: number): void {
    const roomTypes = this.form.get('roomTypes') as FormArray;
    roomTypes.removeAt(index);
  }

  // Remove a facility from the form
  removeFacility(index: number): void {
    const facilities = this.form.get('facilities') as FormArray;
    facilities.removeAt(index);
  }

  // Get room types form array
  get roomTypesFormArray(): FormArray {
    return this.form.get('roomTypes') as FormArray;
  }

  // Get facilities form array
  get facilitiesFormArray(): FormArray {
    return this.form.get('facilities') as FormArray;
  }

  populateForm(data: Hotel) {
    // Clear existing form arrays
    while (this.roomTypesFormArray.length) {
      this.roomTypesFormArray.removeAt(0);
    }

    while (this.facilitiesFormArray.length) {
      this.facilitiesFormArray.removeAt(0);
    }

    // Patch main form values
    this.form.patchValue({
      id: data.id,
      uuid: data.uuid,
      name: data.name,
      website: data.website,
      email: data.email,
      phone: data.phone,
      description: data.description,
      latitude: data.latitude,
      longitude: data.longitude,
      propertyType: data.propertyType,
      defaultImageId: data.defaultImage?.id,
      status: data.status,
      isActive: data.isActive,
      locationId: data.locationId,
      companyId: data.companyId,
    });

    // Add room types
    if (data.roomTypes && data.roomTypes.length) {
      data.roomTypes.forEach((roomType) => {
        const roomTypeForm = this.createRoomTypeFormGroup();
        roomTypeForm.patchValue(roomType);
        this.roomTypesFormArray.push(roomTypeForm);
      });
    }

    // Add facilities
    if (data.facilities && data.facilities.length) {
      data.facilities.forEach((facility) => {
        const facilityForm = this.createFacilityFormGroup();
        facilityForm.patchValue(facility);
        this.facilitiesFormArray.push(facilityForm);
      });
    }
  }

  clearForms() {
    this.clearForm();
  }

  clearForm() {
    // Clear main form
    this.form.patchValue({
      id: '',
      uuid: '',
      name: '',
      website: '',
      email: '',
      phone: '',
      description: '',
      latitude: null,
      longitude: null,
      propertyType: null,
      defaultImageId: null,
      status: 'AWAITING_APPROVAL',
      isActive: true,
      locationId: null,
      companyId: null,
    });

    // Clear room types and facilities
    while (this.roomTypesFormArray.length) {
      this.roomTypesFormArray.removeAt(0);
    }

    while (this.facilitiesFormArray.length) {
      this.facilitiesFormArray.removeAt(0);
    }
  }

  // API methods
  get(params?: Record<string, any>): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(API, { ...params });
  }

  importQuery(params?: Record<string, any>): Promise<ApiResponse> {
    return this.httpService.getAsync<ApiResponse>(`${API}/import-query`, {
      ...params,
    });
  }

  getBedRoomTypes(params?: Record<string, any>): Promise<ApiResponse> {
    return this.httpService.getAsync<ApiResponse>('bed-room-types', {
      ...params,
    });
  }

  getAssessmentResults(hoteUuid: string): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(`${ASSESSMENT_API}/${hoteUuid}`);
  }

  generateHotelRatingCertificate(hotelUuid: string): Observable<ApiResponse> {
    return this.httpService.post<ApiResponse>(
      'asert-reports/generate-hotel-rating-report',
      { hotelUuid },
    );
  }

  getHotelByUuid(uuid?: string): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(`${API}/${uuid}`);
  }

  findByUuid(uuid: string): Observable<Hotel> {
    return new Observable((observer) => {
      console.log('Finding hotel by UUID:', uuid);
      this.getHotelByUuid(uuid).subscribe({
        next: (response: ApiResponse) => {
          console.log('Hotel API response:', response);
          if (response && response.data) {
            observer.next(response.data);
            observer.complete();
          } else {
            console.error('Hotel not found or invalid response:', response);
            observer.error(new Error(`Hotel with UUID ${uuid} not found`));
          }
        },
        error: (error) => {
          console.error('Hotel API error:', error);
          observer.error(error);
        },
      });
    });
  }

  requestAssessment(uuid?: string): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(
      `${API}/${uuid}/request-assessment`,
    );
  }

  create(hotel: any): Observable<ApiResponse> {
    return this.httpService.post<ApiResponse>(API, hotel);
  }

  update(uuid: string, hotel: any): Observable<ApiResponse> {
    return this.httpService.put<ApiResponse>(`${API}/${uuid}`, hotel);
  }

  delete(uuid: string): Observable<ApiResponse> {
    return this.httpService.delete<ApiResponse>(`${API}/${uuid}`);
  }

  // Room Type API methods
  getRoomTypes(
    hotelUuid: string,
    params?: Record<string, any>,
  ): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(`${API}/${hotelUuid}/room-types`, {
      ...params,
    });
  }

  createRoomType(hotelUuid: string, roomType: any): Observable<ApiResponse> {
    return this.httpService.post<ApiResponse>(
      `${API}/${hotelUuid}/room-types`,
      roomType,
    );
  }

  updateRoomType(
    hotelUuid: string,
    roomTypeUuid: string,
    roomType: any,
  ): Observable<ApiResponse> {
    return this.httpService.put<ApiResponse>(
      `${API}/${hotelUuid}/room-types/${roomTypeUuid}`,
      roomType,
    );
  }

  deleteRoomType(
    hotelUuid: string,
    roomTypeUuid: string,
  ): Observable<ApiResponse> {
    return this.httpService.delete<ApiResponse>(
      `${API}/${hotelUuid}/room-types/${roomTypeUuid}`,
    );
  }

  // Facility API methods
  getFacilities(
    hotelUuid: string,
    params?: Record<string, any>,
  ): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(`${API}/${hotelUuid}/facilities`, {
      ...params,
    });
  }

  createFacility(hotelUuid: string, facility: any): Observable<ApiResponse> {
    return this.httpService.post<ApiResponse>(
      `${API}/${hotelUuid}/facilities`,
      facility,
    );
  }

  updateFacility(
    hotelUuid: string,
    facilityUuid: string,
    facility: any,
  ): Observable<ApiResponse> {
    return this.httpService.put<ApiResponse>(
      `${API}/${hotelUuid}/facilities/${facilityUuid}`,
      facility,
    );
  }

  deleteFacility(
    hotelUuid: string,
    facilityUuid: string,
  ): Observable<ApiResponse> {
    return this.httpService.delete<ApiResponse>(
      `${API}/${hotelUuid}/facilities/${facilityUuid}`,
    );
  }

  // Media API methods
  getMedia(
    hotelUuid: string,
    params?: Record<string, any>,
  ): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(`${API}/${hotelUuid}/media`, {
      ...params,
    });
  }

  uploadMedia(hotelUuid: string, media: any): Observable<ApiResponse> {
    return this.httpService.post<ApiResponse>(
      `${API}/${hotelUuid}/media`,
      media,
    );
  }

  setDefaultImage(
    hotelUuid: string,
    mediaUuid: string,
  ): Observable<ApiResponse> {
    return this.httpService.put<ApiResponse>(
      `${API}/${hotelUuid}/media/${mediaUuid}/set-default`,
      {},
    );
  }

  deleteMedia(hotelUuid: string, mediaUuid: string): Observable<ApiResponse> {
    return this.httpService.delete<ApiResponse>(
      `${API}/${hotelUuid}/media/${mediaUuid}`,
    );
  }

  getEstablishmentTypes(params?: Record<string, any>): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(`${API}/get-portal-types`, {
      ...params,
    });
  }

  getPropertyTypes(params?: Record<string, any>): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(`${API}/get-types`, {
      ...params,
    });
  }
}
