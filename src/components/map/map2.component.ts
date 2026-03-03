import { AfterViewInit, Component } from '@angular/core';
import * as L from 'leaflet';
import { FeatureService } from 'components/map/feature.service';
import { Feature, FeatureCollection } from 'geojson';

@Component({
  selector: 'map2-component',
  standalone: true,
  template: `
    <div class="flex h-screen">
      <div class="w-3/4">
        <div id="map" class="h-full z-0"></div>
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
      }

      .info h4 {
        margin: 0 0 5px;
        color: #777;
      }

      .legend {
        line-height: 18px;
        color: #555;
        font-family: Arial, sans-serif;
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
})
export class MapComponent implements AfterViewInit {
  private map: L.Map;
  private geoJsonLayer: L.GeoJSON;
  private infoControl: L.Control & { update?: (props: any) => void };

  constructor(private service: FeatureService) {}

  ngAfterViewInit(): void {
    this.map = L.map('map').setView([37.8, -96], 4);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(this.map);

    this.addInfoControl();
    this.addLegend();
    this.addGeoJsonFeatures();
  }

  getColor(d: number): string {
    return d > 1000
      ? '#800026'
      : d > 500
      ? '#BD0026'
      : d > 200
      ? '#E31A1C'
      : d > 100
      ? '#FC4E2A'
      : d > 50
      ? '#FD8D3C'
      : d > 20
      ? '#FEB24C'
      : d > 10
      ? '#FED976'
      : '#FFEDA0';
  }

  style(feature: Feature): L.PathOptions {
    return {
      weight: 2,
      opacity: 1,
      color: 'white',
      dashArray: '3',
      fillOpacity: 0.7,
      fillColor: this.getColor(
        feature.properties ? feature.properties['density'] : 0
      ),
    };
  }

  addGeoJsonFeatures(): void {
    const geoJsonFeatures: Feature[] = this.service.getGeoJson();

    const featureCollection: FeatureCollection = {
      type: 'FeatureCollection',
      features: geoJsonFeatures,
    };

    this.geoJsonLayer = L.geoJSON(featureCollection, {
      style: this.style.bind(this),
      onEachFeature: this.onEachFeature.bind(this),
    }).addTo(this.map);
  }

  addInfoControl(): void {
    this.infoControl = new L.Control({ position: 'topright' }) as L.Control & {
      update: (props: any) => void;
    };

    this.infoControl.onAdd = (map) => {
      const div = L.DomUtil.create('div', 'info');
      div.innerHTML = '<h4>US Population Density</h4>Hover over a state';
      return div;
    };

    this.infoControl.update = (props) => {
      const div = document.querySelector('.info') as HTMLElement;
      div.innerHTML = `<h4>US Population Density</h4>${
        props
          ? `<b>${props.name}</b><br />${props.density} people / mi<sup>2</sup>`
          : 'Hover over a state'
      }`;
    };

    this.infoControl.addTo(this.map);
  }

  highlightFeature(e: any): void {
    const layer = e.target;

    layer.setStyle({
      weight: 5,
      color: '#666',
      dashArray: '',
      fillOpacity: 0.7,
    });

    layer.bringToFront();

    this.infoControl.update?.(layer.feature.properties);
  }

  resetHighlight(e: any): void {
    this.geoJsonLayer.resetStyle(e.target);
    this.infoControl.update?.(null); // Reset the info control content
  }

  zoomToFeature(e: any): void {
    this.map.fitBounds(e.target.getBounds());
  }

  onEachFeature(feature: Feature, layer: L.Layer): void {
    layer.on({
      mouseover: this.highlightFeature.bind(this),
      mouseout: this.resetHighlight.bind(this),
      click: this.zoomToFeature.bind(this),
    });
  }

  addLegend(): void {
    const legend = new L.Control({ position: 'bottomright' });

    legend.onAdd = (map) => {
      const div = L.DomUtil.create('div', 'info legend');
      const grades = [0, 10, 20, 50, 100, 200, 500, 1000];
      let labels = '';

      for (let i = 0; i < grades.length; i++) {
        const from = grades[i];
        const to = grades[i + 1];
        labels +=
          '<i style="background:' +
          this.getColor(from + 1) +
          '"></i> ' +
          from +
          (to ? '&ndash;' + to : '+') +
          '<br>';
      }

      div.innerHTML = labels;
      return div;
    };

    legend.addTo(this.map);
  }
}
