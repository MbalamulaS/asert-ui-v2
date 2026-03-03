import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { HttpService } from 'app/api/api.service';
import { ApiResponse } from 'app/custom-response';
import * as L from 'leaflet';

@Component({
  standalone: true,
  selector: `map-home-component`,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    FormsModule,
  ],
  template: `
    <div class="grid grid-cols-2 gap-3 my-10">
      <div class="bg-gray-50 p-6">
        <!-- Header -->
        <div class="mb-6">
          <h1 class="text-2xl font-bold text-gray-800">
            Hotel & Facility Directory
          </h1>
        </div>

        <!-- Search -->
        <div class="mb-4">
          <input
            type="text"
            [(ngModel)]="searchTerm"
            placeholder="Search by name or location..."
            class="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <!-- List -->
        <div class="space-y-4 max-h-[500px] overflow-y-scroll">
          <!-- Item -->
          <div
            *ngFor="let h of filteredHotels()"
            (click)="followHotel(h)"
            class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all space-y-2 cursor-pointer"
          >
            <!-- Hotel Name -->
            <h2 class="text-xl font-semibold text-gray-800">{{ h.name }}</h2>

            <!-- Company Name -->
            <p class="text-sm text-gray-500 italic">{{ h.companyName }}</p>

            <!-- Info Rows -->
            <div class="text-sm text-gray-700 space-y-1 mt-2">
              <div class="flex items-center gap-2">
                <span class="text-gray-400">🌐</span>
                <a
                  [href]="h.website"
                  target="_blank"
                  rel="noopener"
                  class="text-blue-600 hover:underline break-all"
                >
                  {{ h.website }}
                </a>
              </div>

              <div class="flex items-center gap-2">
                <span class="text-gray-400">📞</span>
                <span>{{ h.phone }}</span>
              </div>

              <div class="flex items-center gap-2">
                <span class="text-gray-400">📍</span>
                <span>{{ h.locationName }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div id="map" style="height: 700px;width: 100%"></div>
    </div>
  `,
})
export class HomeMapComponent implements OnInit {
  private map: L.Map | undefined;
  hotels: any[] = [];
  searchTerm: string = '';

  private initMap(): void {
    this.map = L.map('map').setView([-6.369, 34.8888], 6); // Example: Dar es Salaam

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);
  }
  ngOnInit(): void {
    this.initMap();
    this.loadHotels();
  }
  async loadHotels() {
    this.hotels = await this.httpService
      .getAsync<ApiResponse>(`hotels/listing`)
      .then((res) => res?.data ?? []);
    if (!Array.isArray(this.hotels)) {
      return;
    }
    for (let h of this.hotels) {
      L.marker([h.latitude, h.longitude]).addTo(this.map).bindPopup(h.name);
      //.openPopup();
    }
  }
  followHotel(h: any) {
    const zoomLevel = 14;
    this.map.setView([h.latitude, h.longitude], zoomLevel);
  }
  filteredHotels() {
    if (!this.searchTerm.trim()) {
      return this.hotels;
    }
    const term = this.searchTerm.toLowerCase();
    return this.hotels.filter(
      (h) =>
        (h.name && h.name.toLowerCase().includes(term)) ||
        (h.locationName && h.locationName.toLowerCase().includes(term)),
    );
  }
  constructor(private readonly httpService: HttpService) {}
}
