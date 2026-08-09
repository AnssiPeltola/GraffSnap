"use client";

import "leaflet/dist/leaflet.css";

import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import type { GraffitiSighting } from "@/src/db/schema";

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

type Props = {
  graffitiSightings: GraffitiSighting[];
};

export default function GraffitiMap({ graffitiSightings }: Props) {
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

      {graffitiSightings.map((graffiti) => (
        <Marker
          key={graffiti.id}
          position={[Number(graffiti.latitude), Number(graffiti.longitude)]}
          icon={defaultIcon}
        >
          <Popup>
            <strong>Graffiti</strong>
            <br />
            {graffiti.latitude}, {graffiti.longitude}
            {graffiti.notes && (
              <>
                <br />
                {graffiti.notes}
              </>
            )}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
