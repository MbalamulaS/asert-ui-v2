import { Injectable } from '@angular/core';
import { environment } from 'environment/environment';

@Injectable({
  providedIn: 'root',
})
export class GoogleMapsService {
  public apiKey = environment.GOOGLE_MAPS_KEY;
}
