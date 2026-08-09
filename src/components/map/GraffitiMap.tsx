"use client";

import "leaflet/dist/leaflet.css";
import { useState } from "react";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import type { GraffitiSighting } from "@/src/db/schema";
import { buildCloudinaryTransformedUrl } from "@/src/lib/cloudinary-url";
import { formatDateTime } from "@/src/lib/formatDateTime";

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

const THUMBNAIL_TRANSFORMATION = "f_auto,q_auto,c_fill,g_auto,w_320,h_240";
const VIEWER_TRANSFORMATION = "f_auto,q_auto,c_limit,w_1400,h_1400";

export default function GraffitiMap({ graffitiSightings }: Props) {
  const [activeGraffiti, setActiveGraffiti] = useState<GraffitiSighting | null>(
    null,
  );

  return (
    <>
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

        {graffitiSightings.map((graffiti) => {
          const thumbnailUrl = buildCloudinaryTransformedUrl(
            graffiti.imageUrl,
            { transformation: THUMBNAIL_TRANSFORMATION },
          );
          const createdAtLabel = formatDateTime(graffiti.createdAt);
          const hasNotes = Boolean(graffiti.notes?.trim());

          return (
            <Marker
              key={graffiti.id}
              position={[Number(graffiti.latitude), Number(graffiti.longitude)]}
              icon={defaultIcon}
            >
              <Popup maxWidth={280} className="graffiti-popup">
                <div className="w-[220px] overflow-hidden rounded-2xl bg-white">
                  <button
                    type="button"
                    onClick={() => setActiveGraffiti(graffiti)}
                    className="block w-full overflow-hidden bg-slate-100 text-left"
                    aria-label="View larger graffiti image"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={thumbnailUrl}
                      alt="Graffiti thumbnail"
                      className="h-40 w-full object-cover"
                      loading="lazy"
                    />

                    <span className="block border-t border-slate-100 bg-slate-50 px-3 py-2 text-center text-xs font-medium text-slate-600">
                      View larger image
                    </span>
                  </button>
                  <div className="space-y-3 px-3 py-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Found
                      </p>
                      <p className="mt-0.5 text-xs font-medium text-slate-700">
                        {createdAtLabel}
                      </p>
                    </div>

                    {hasNotes && (
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                          Notes
                        </p>
                        <p className="mt-0.5 whitespace-pre-wrap text-sm leading-5 text-slate-900">
                          {graffiti.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {activeGraffiti && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/80 p-3 sm:p-5">
          <div
            className="absolute inset-0"
            aria-hidden="true"
            onClick={() => setActiveGraffiti(null)}
          />

          <div className="relative z-10 flex max-h-[90vh] w-full max-w-5xl items-center justify-center overflow-hidden rounded-3xl bg-black shadow-2xl">
            <button
              type="button"
              onClick={() => setActiveGraffiti(null)}
              className="absolute right-3 top-3 z-20 rounded-full bg-black/70 px-3 py-2 text-sm font-medium text-white shadow-lg backdrop-blur-sm transition hover:bg-black"
              aria-label="Close image viewer"
            >
              Close
            </button>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={buildCloudinaryTransformedUrl(activeGraffiti.imageUrl, {
                transformation: VIEWER_TRANSFORMATION,
              })}
              alt="Graffiti"
              className="max-h-[88vh] max-w-full object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
}
