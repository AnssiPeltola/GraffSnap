"use client";

import "leaflet/dist/leaflet.css";

import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

const defaultIcon = L.icon({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const mockGraffiti = [
  {
    id: "1",
    latitude: 61.477317,
    longitude: 23.75787,
  },
  {
    id: "2",
    latitude: 61.478798,
    longitude: 23.76155,
  },
];

export default function GraffitiMap() {
  return (
    <MapContainer
      key="graffiti-map"
      center={[61.478, 23.759]}
      zoom={15}
      style={{ height: "500px", width: "100%" }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {mockGraffiti.map((graffiti) => (
        <Marker
          key={graffiti.id}
          position={[graffiti.latitude, graffiti.longitude]}
          icon={defaultIcon}
        >
          <Popup>
            Graffiti #{graffiti.id}
            <br />
            {graffiti.latitude}, {graffiti.longitude}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
