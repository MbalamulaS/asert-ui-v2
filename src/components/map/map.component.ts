import { AfterViewInit, Component } from '@angular/core';
import * as L from 'leaflet';
import * as geojson from 'geojson';
import { FeatureService } from 'components/map/feature.service';
import { NgForOf } from '@angular/common';
import { FacilityService } from 'modules/facility/facility/facility.service';

import chroma from 'chroma-js';
import { lastValueFrom } from 'rxjs';

interface MapDto {
  facility: string;
  latitude: number;
  longitude: number;
  category: string;
  uuid: string;
}

const iconRetinaPublicUrl = 'assets/icons/marker-icon-2x.png';
const iconRetinaPrivateUrl = 'assets/icons/marker-private-lg.png';
const iconPublicUrl = 'assets/icons/marker-icon.png';
const iconPrivateUrl = 'assets/icons/marker-private-sm.png';
const shadowUrl = 'assets/icons/marker-shadow.png';
const iconDefault = L.icon({
  iconRetinaUrl: iconRetinaPublicUrl,
  iconUrl: iconPublicUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = iconDefault;

@Component({
  selector: 'map-component',
  standalone: true,
  template: `
    <div class="flex h-screen">
      <div class="w-full relative">
        <div id="map" class="h-full z-0"></div>
        <div id="info" class="info"></div>
      </div>
    </div>
  `,
  styles: [
    `
      .info {
        padding: 6px 8px;
        background: white;
        background: rgba(255, 255, 255, 0.8);
        box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
        border-radius: 5px;
        font-family: Arial, sans-serif;
        position: absolute;
        top: 10px;
        right: 10px;
        z-index: 1000;
      }

      .info h4 {
        margin: 0 0 5px;
        color: #777;
      }

      .legend {
        line-height: 18px;
        color: #555;
        font-family: Arial, sans-serif;
        background: white;
        background: rgba(255, 255, 255, 0.8);
        padding: 10px;
        margin-bottom: 40px;
        box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
        border-radius: 5px;
      }

      .legend i {
        width: 18px;
        height: 18px;
        float: left;
        margin-right: 8px;
        opacity: 0.7;
      }
    `,
  ],
  imports: [NgForOf],
})
export class MapComponent implements AfterViewInit {
  private map: L.Map;
  private geoJsonLayer: L.GeoJSON;
  private markers: L.LayerGroup;
  private labels: L.LayerGroup = L.layerGroup();
  private facilities: MapDto[] = [];

  levels = [
    { id: 1, name: 'National Referral', code: '1000' },
    { id: 2, name: 'Regional', code: '1001' },
    { id: 3, name: 'District', code: '1002' },
    { id: 4, name: 'Health Centre', code: '1003' },
    { id: 5, name: 'Dispensary', code: '1004' },
  ];

  constructor(
    private service: FeatureService,
    private facilityService: FacilityService
  ) {}

  ngAfterViewInit(): void {
    this.map = L.map('map', {
      center: L.latLng(-6.16394, 39.43793),
      zoom: 9.4,
    });

    this.addLegend();
    this.fetchFacilities(null);
  }

  async fetchFacilities(id: any) {
    try {
      let query;
      if (id == null) {
        query = {
          sort: 'id,asc',
        };
      } else {
        query = {
          sort: 'id,asc',
          facilityLevelId: id,
        };
      }
      const response = await lastValueFrom(
        this.facilityService.portalMapFacilities(query)
      );

      this.facilities = response.data;

      this.markers = L.layerGroup().addTo(this.map);
      this.labels.addTo(this.map);
      this.addGeoJsonFeatures();
      this.addHealthFacilityMarkers();

      this.map.on('zoomend', () => {
        this.toggleMarkers();
      });
    } catch (error) {
      console.error('Error fetching facilities data:', error);
    }
  }

  addLegend(): void {
    const legend = new L.Control({ position: 'bottomright' });

    legend.onAdd = (map) => {
      const div = L.DomUtil.create('div', 'info legend');

      // Define the ranges for number of facilities and corresponding colors
      const grades = [0, 1, 3, 5, 7, 9, 11, 13, 15];
      const colors = [
        '#ffffff',
        '#f3f9fe',
        '#e6f3fd',
        '#daedfc',
        '#cee7fb',
        '#c2e2fa',
        '#b5dcf8',
        '#a9d6f7',
        '#9dd0f6',
      ];
      for (let i = 0; i < grades.length; i++) {
        div.innerHTML +=
          '<i style="background:' +
          colors[i] +
          '"></i> ' +
          grades[i] +
          (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
      }

      return div;
    };

    legend.addTo(this.map);
  }

  addGeoJsonFeatures(): void {
    const geoJsonFeatures: geojson.FeatureCollection = {
      type: 'FeatureCollection',
      features: this.service.getGeoJson(),
    };

    this.geoJsonLayer = L.geoJSON(geoJsonFeatures, {
      style: (feature) => this.styleFeature(feature),
      onEachFeature: (feature, layer) => {
        if (feature.properties && feature.properties['Ward_Name']) {
          layer.bindPopup(`<p>${feature.properties['Ward_Name']}</p>`);
        }
        layer.on({
          mouseover: this.highlightFeature.bind(this),
          mouseout: this.resetHighlight.bind(this),
          click: (e) => this.showFacilityCount(e, feature),
        });
      },
    }).addTo(this.map);
  }

  styleFeature(feature: geojson.Feature): L.PathOptions {
    const count = feature.properties['facility_count'] || 0;

    const colorScale = chroma
      .scale([
        '#4eabee', // 0-1 (light blue)
        '#469ad6', // 1-3
        '#3e89be', // 3-5
        '#3778a7', // 6-7
        '#275677', // 8-9
        '#1f445f', // 10-11
        '#173347', // 11-12
        '#102230', // 12-13
        '#081118', // 14-15 (ocean blue)
      ])
      .domain([0, 1, 3, 5, 7, 9, 11, 13, 15]);

    const fillColor = colorScale(count).toString();

    return {
      fillColor: fillColor,
      weight: 0,
      opacity: 1,
      color: 'none',
      fillOpacity: 0.7,
    };
  }

  addHealthFacilityMarkers(facilityLevelId?: number): void {
    this.markers.clearLayers();
    this.facilities.forEach((facility: MapDto) => {
      const isPublic = facility.category === 'PUBLIC';
      const icon = L.icon({
        iconRetinaUrl: isPublic ? iconRetinaPublicUrl : iconRetinaPrivateUrl,
        iconUrl: isPublic ? iconPublicUrl : iconPrivateUrl,
        shadowUrl,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        tooltipAnchor: [16, -28],
        shadowSize: [41, 41],
      });

      const marker = L.marker([facility.latitude, facility.longitude], {
        icon,
      }).bindPopup(`<p>${facility.facility}</p>`);
      this.markers.addLayer(marker);
    });

    this.geoJsonLayer.eachLayer((layer: any) => {
      const feature = layer.feature as geojson.Feature;
      feature.properties['facility_count'] = this.calculateFacilityCount(
        feature,
        this.facilities
      );
      layer.setStyle(this.styleFeature(feature));
    });

    this.toggleMarkers();
  }

  onLevelChange(event: any): void {
    const facilityLevelId = event.target.value;
    this.fetchFacilities(facilityLevelId);
    this.addHealthFacilityMarkers(facilityLevelId);
  }

  calculateFacilityCount(
    feature: geojson.Feature,
    facilities: MapDto[]
  ): number {
    const bounds = L.geoJSON(feature).getBounds();
    const count = facilities.filter((facility) =>
      bounds.contains([facility.latitude, facility.longitude])
    ).length;
    return count;
  }

  toggleMarkers(): void {
    const zoomLevel = this.map.getZoom();
    if (zoomLevel >= 12) {
      this.map.addLayer(this.markers);
    } else {
      this.map.removeLayer(this.markers);
    }
  }

  highlightFeature(e: any): void {
    const layer = e.target;
    layer.setStyle({
      weight: 2,
      color: '#666',
      fillOpacity: 0.7,
    });

    this.showFacilityCount(e, layer.feature);
  }

  resetHighlight(e: any): void {
    this.geoJsonLayer.resetStyle(e.target);
    this.labels.clearLayers();
  }

  showFacilityCount(e: any, feature: geojson.Feature): void {
    const layer = e.target;
    const count = feature.properties['facility_count'] || 0;
    const centroid = layer.getBounds().getCenter();

    const label = L.marker(centroid, {
      icon: L.divIcon({
        className: 'label',
        html: count.toString(),
      }),
    });

    this.labels.clearLayers();
    this.labels.addLayer(label);

    // Update the info box with the facility count
    const infoDiv = document.getElementById('info');
    if (infoDiv) {
      infoDiv.innerHTML = `<h4>${feature.properties['Ward_Name']}</h4><b>Facilities:</b> ${count}`;
    }
  }
}
