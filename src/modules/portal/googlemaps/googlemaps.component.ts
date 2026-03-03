import { Component, Input, OnInit } from '@angular/core';
import { GoogleMapsModule } from '@angular/google-maps';
import { HttpClient } from '@angular/common/http';
import { BarChartComponent } from 'components/chart/bar-chart/barchart.component';
import { Facility } from 'modules/facility/facility/facility';

@Component({
  standalone: true,
  imports: [GoogleMapsModule, BarChartComponent],
  selector: 'portal-googlemaps-component',
  template: `
    <div class="flex h-[700px] gap-4 p-2 md:p-0">
      <!-- Left side map component -->
      <div
        class="w-full md:w-1/2 h-full border-4 border-gray-300 ring-primary-500 overflow-hidden"
      >
        <google-map
          height="100%"
          width="100%"
          [center]="center"
          [zoom]="zoom"
          (mapInitialized)="onMapLoad($event)"
        ></google-map>
      </div>

      <!-- Right side bar charts -->
      <div class="flex flex-col gap-4 w-full md:w-1/2 h-full">
        <div class="border border-gray-300 rounded-md p-4 h-1/2 w-full">
          <bar-chart-component
            [chartId]="'type'"
            [indicator]="'facilityCount'"
            [api]="'dashboard/public/proportion-health-facility-type'"
            [chartTitle]="'Proportion of Health Facilities by Type'"
          ></bar-chart-component>
        </div>
        <div class="border border-gray-300 rounded-md p-4 h-1/2 w-full">
          <bar-chart-component
            [chartId]="'ownership'"
            [indicator]="'facilityOwnerships'"
            [api]="
              'dashboard/public/proportion-public-health-facility-ownership'
            "
            [chartTitle]="'Proportion of Health Facilities by Ownership'"
          ></bar-chart-component>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .map-container {
        height: 100%;
        width: 100%;
      }
    `,
  ],
})
export class PortalGooglemapsComponent implements OnInit {
  @Input() facility: Facility;
  title = 'GoogleMaps';

  center: google.maps.LatLngLiteral = { lat: -6.1659, lng: 39.2026 }; // Set the center to Zanzibar
  zoom = 10; // Initial zoom level

  constructor(private http: HttpClient) {}

  ngOnInit() {}

  onMapLoad(map: google.maps.Map) {
    // Load the GeoJSON file
    this.http
      .get('assets/geojson/zanzibar-ward-level.geojson')
      .subscribe((geoJsonData: any) => {
        // Add the GeoJSON data to the map
        map.data.addGeoJson(geoJsonData);

        // Optional: Set style for GeoJSON features
        map.data.setStyle({
          fillColor: 'blue',
          strokeColor: 'gray',
          strokeWeight: 0.5,
        });

        // Optional: Add click event to GeoJSON features
        map.data.addListener('click', (event) => {
          const featureName = event.feature.getProperty('name');
          const infoWindow = new google.maps.InfoWindow({
            content: `<div><strong>Ward:</strong> ${featureName}</div>`,
            position: event.latLng,
          });
          infoWindow.open(map);
        });
      });
  }
}
