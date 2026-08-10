"use client";

import "leaflet/dist/leaflet.css";
import { useState } from "react";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import type { GraffitiSighting } from "@/src/db/schema";
import { buildCloudinaryTransformedUrl } from "@/src/lib/cloudinary-url";
import { formatDateTime } from "@/src/lib/formatDateTime";
import CalendarIcon from "../icons/CalendarIcon";
import ExternalLinkIcon from "../icons/ExternalLinkIcon";
import NotesIcon from "../icons/NotesIcon";
import "../../styles/leaflet-popup.css";

const defaultIcon = L.divIcon({
  className: "graffiti-marker",
  html: `
    <div class="graffiti-marker-pin">
      <div class="graffiti-marker-dot"></div>
    </div>
  `,
  iconSize: [34, 44],
  iconAnchor: [17, 44],
  popupAnchor: [0, -42],
});

type Props = {
  graffitiSightings: GraffitiSighting[];
};

const THUMBNAIL_TRANSFORMATION = "f_auto,q_auto,c_fill,g_auto,w_640,h_480";

const VIEWER_TRANSFORMATION = "f_auto,q_auto,c_limit,w_1400,h_1400";

export default function GraffitiMap({ graffitiSightings }: Props) {
  const [activeGraffiti, setActiveGraffiti] = useState<GraffitiSighting | null>(
    null,
  );

  return (
    <>
      <MapContainer
        key="graffiti-map"
        center={[61.481, 23.76]}
        zoom={15}
        style={{ height: "80%", width: "100%" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {graffitiSightings.map((graffiti) => {
          const thumbnailUrl = buildCloudinaryTransformedUrl(
            graffiti.imageUrl,
            {
              transformation: THUMBNAIL_TRANSFORMATION,
            },
          );

          const createdAtLabel = formatDateTime(graffiti.createdAt);
          const hasNotes = Boolean(graffiti.notes?.trim());

          return (
            <Marker
              key={graffiti.id}
              position={[Number(graffiti.latitude), Number(graffiti.longitude)]}
              icon={defaultIcon}
            >
              <Popup maxWidth={320} minWidth={280} className="graffiti-popup">
                <div className="overflow-hidden">
                  {/* Image card */}
                  <div className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-900">
                    <button
                      type="button"
                      onClick={() => setActiveGraffiti(graffiti)}
                      className="block w-full text-left"
                      aria-label="View larger graffiti image"
                    >
                      <div className="aspect-[4/3] w-full overflow-hidden bg-slate-950">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={thumbnailUrl}
                          alt="Graffiti thumbnail"
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      </div>

                      <div className="flex items-center justify-center gap-3 border-t border-slate-700 bg-slate-900 px-4 py-4 text-sm font-semibold text-purple-400 transition hover:bg-slate-800">
                        <ExternalLinkIcon />
                        <span>View larger image</span>
                      </div>
                    </button>
                  </div>

                  {/* Found */}
                  <section className="mt-5 border-t border-slate-700 pt-5">
                    <div className="flex items-center gap-3 text-purple-400">
                      <CalendarIcon />

                      <h3 className="text-sm font-bold uppercase tracking-[0.08em]">
                        Found
                      </h3>
                    </div>

                    <p className="mt-3 text-base leading-relaxed text-slate-100">
                      {createdAtLabel}
                    </p>
                  </section>

                  {/* Notes */}
                  {hasNotes && (
                    <section className="mt-5 border-t border-slate-700 pt-5">
                      <div className="flex items-center gap-3 text-purple-400">
                        <NotesIcon />

                        <h3 className="text-sm font-bold uppercase tracking-[0.08em]">
                          Notes
                        </h3>
                      </div>

                      <p className="mt-3 whitespace-pre-wrap text-base leading-relaxed text-slate-100">
                        {graffiti.notes}
                      </p>
                    </section>
                  )}
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
