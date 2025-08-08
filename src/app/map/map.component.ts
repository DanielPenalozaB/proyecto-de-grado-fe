import { Component } from '@angular/core';
import { LeafletModule } from '@bluehalo/ngx-leaflet';
import * as L from 'leaflet';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [LeafletModule],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent {
  private map!: L.Map;

  // Map configuration
  options = {
    layers: [
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      })
    ],
    zoom: 13,
    center: L.latLng(3.4516, -76.5320) // Cali coordinates
  };

  // Layers control configuration
  layersControl = {
    baseLayers: {
      'OpenStreetMap': L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'),
      'Satellite': L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}')
    },
    overlays: {
      'Water Points': L.layerGroup([])
    }
  };

  onMapReady(map: L.Map) {
    this.map = map;
    this.addSampleMarkers();
  }

  private getMarkerIcon() {
    return L.icon({
      iconUrl: 'assets/marker-icon.png',
      iconRetinaUrl: 'assets/marker-icon-2x.png',
      shadowUrl: 'assets/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
  }

  private addSampleMarkers() {
    const markers = [
      { lat: 3.4516, lng: -76.5320, title: "Centro de Cali", desc: "Main square", riseOnHover: true },
      { lat: 3.4402, lng: -76.5078, title: "Parque del Perro", desc: "Popular park", riseOnHover: true },
      { lat: 3.4704886, lng: -76.5282832, title: "Universidad", desc: "Valle University", riseOnHover: true },
    ];

    markers.forEach(marker => {
      L.marker([marker.lat, marker.lng], {
        icon: this.getMarkerIcon()
      })
        .addTo(this.map)
        .bindPopup(`<b>${marker.title}</b><br>${marker.desc}`);
    });
  }
}