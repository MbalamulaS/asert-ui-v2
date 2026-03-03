import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpService } from 'app/api/api.service';
import { ApiResponse } from 'app/custom-response';
import { Observable } from 'rxjs';
import { StarRating } from './star-rating';
import {
  PropertyType,
  PROPERTY_TYPE_OPTIONS,
} from 'modules/portal/hotels/types';

const API = 'rating-criteria';

@Injectable({
  providedIn: 'root',
})
export class StarRatingService {
  constructor(private readonly httpService: HttpService) {}

  // Property type options for dropdown
  propertyTypeOptions = PROPERTY_TYPE_OPTIONS;

  // Star level options (1-5 stars)
  starLevelOptions = [
    { id: 1, name: '1 Star' },
    { id: 2, name: '2 Stars' },
    { id: 3, name: '3 Stars' },
    { id: 4, name: '4 Stars' },
    { id: 5, name: '5 Stars' },
  ];

  form = new FormGroup({
    id: new FormControl(''),
    uuid: new FormControl(''),
    propertyType: new FormControl('', [Validators.required]),
    starLevel: new FormControl('', [Validators.required]),
    name: new FormControl('', [Validators.required]),
    minScore: new FormControl('', [Validators.required, Validators.min(0)]),
    maxScore: new FormControl('', [Validators.required, Validators.min(0)]),
    totalPossibleScore: new FormControl('', [
      Validators.required,
      Validators.min(0),
    ]),
    criteriaDescription: new FormControl(''),
    percentageRequired: new FormControl('', [
      Validators.min(0),
      Validators.max(100),
    ]),
  });

  populateForm(data: StarRating) {
    this.form.patchValue({
      id: data.id?.toString() || '',
      uuid: data.uuid || '',
      propertyType: data.propertyType,
      starLevel: data.starLevel,
      name: data.name,
      minScore: data.minScore?.toString() || '',
      maxScore: data.maxScore?.toString() || '',
      totalPossibleScore: data.totalPossibleScore?.toString() || '',
      criteriaDescription: data.criteriaDescription || '',
      percentageRequired: data.percentageRequired?.toString() || '',
    });
  }

  clearForms() {
    this.clearForm();
  }

  clearForm() {
    this.form.setValue({
      id: '',
      uuid: '',
      propertyType: '',
      starLevel: '',
      name: '',
      minScore: '',
      maxScore: '',
      totalPossibleScore: '',
      criteriaDescription: '',
      percentageRequired: '',
    });
  }

  get(params?: Record<string, any>): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(API, { ...params });
  }

  // Get rating criteria for specific property type
  getByPropertyType(propertyType: PropertyType): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(API, { propertyType });
  }

  // Get rating criteria for specific property type and star level
  getByPropertyTypeAndStarLevel(
    propertyType: PropertyType,
    starLevel: number,
  ): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(API, { propertyType, starLevel });
  }

  // Get available star levels for a property type
  getAvailableStarLevels(propertyType: PropertyType): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(`${API}/available-star-levels`, {
      propertyType,
    });
  }

  create(criteria: any): Observable<ApiResponse> {
    return this.httpService.post<ApiResponse>(API, criteria);
  }

  update(uuid: string, criteria: any): Observable<ApiResponse> {
    return this.httpService.put<ApiResponse>(`${API}/${uuid}`, criteria);
  }

  delete(uuid: string): Observable<ApiResponse> {
    return this.httpService.delete<ApiResponse>(`${API}/${uuid}`);
  }

  // Helper method to get maximum star level for property type
  getMaxStarLevel(propertyType: PropertyType): number {
    switch (propertyType) {
      case PropertyType.MOTEL:
        return 3; // Motels only go up to 3 stars
      case PropertyType.RESTAURANT:
        return 5; // Restaurants start at 3 stars but can go to 5
      default:
        return 5; // All other property types can have 1-5 stars
    }
  }

  // Helper method to get minimum star level for property type
  getMinStarLevel(propertyType: PropertyType): number {
    switch (propertyType) {
      case PropertyType.RESTAURANT:
        return 3; // Restaurants start at 3 stars
      default:
        return 1; // All other property types start at 1 star
    }
  }

  // Get star level options filtered by property type
  getStarLevelOptionsForPropertyType(
    propertyType: PropertyType,
  ): { id: number; name: string }[] {
    const minLevel = this.getMinStarLevel(propertyType);
    const maxLevel = this.getMaxStarLevel(propertyType);

    return this.starLevelOptions.filter(
      (option) => option.id >= minLevel && option.id <= maxLevel,
    );
  }
}
