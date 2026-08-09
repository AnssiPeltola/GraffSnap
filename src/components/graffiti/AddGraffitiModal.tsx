"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import type { GraffitiFormData } from "@/src/lib/validation/graffiti";
import graffitiSchema from "@/src/lib/validation/graffiti";

type Props = {
  onClose: () => void;
};

const DEFAULT_CENTER: [number, number] = [61.4981, 23.7608];

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

function MapSelector({
  position,
  onClick,
  onDragEnd,
}: {
  position: [number, number] | null;
  onClick: (lat: number, lng: number) => void;
  onDragEnd: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });

  return position ? (
    <Marker
      position={position}
      icon={defaultIcon}
      draggable
      eventHandlers={{
        dragend: (e) => {
          const marker = e.target as L.Marker;
          const latlng = marker.getLatLng();
          onDragEnd(latlng.lat, latlng.lng);
        },
      }}
    />
  ) : null;
}

export default function AddGraffitiModal({ onClose }: Props) {
  const [latitude, setLatitude] = useState<string>("");
  const [longitude, setLongitude] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  //   const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [notes, setNotes] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [validResult, setValidResult] = useState<GraffitiFormData | null>(null);
  const [validating, setValidating] = useState(false);

  // Derive the preview URL from the selected file.
  const previewUrl = useMemo(() => {
    if (!file) return null;
    return URL.createObjectURL(file);
  }, [file]);

  // Revoke the object URL whenever it changes or on unmount.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const position = useMemo(() => {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return [lat, lng] as [number, number];
  }, [latitude, longitude]);

  function handleMapClick(lat: number, lng: number) {
    setLatitude(String(lat));
    setLongitude(String(lng));
  }

  function handleMarkerDrag(lat: number, lng: number) {
    setLatitude(String(lat));
    setLongitude(String(lng));
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files && e.target.files[0];
    if (f) setFile(f);
  }

  function clearFile() {
    setFile(null);
  }

  async function handleSave() {
    setValidating(true);
    setErrors({});

    const parse = graffitiSchema.safeParse({
      latitude,
      longitude,
      photo: file,
      notes,
    });

    if (!parse.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parse.error.issues) {
        const path = issue.path[0] ?? "form";
        fieldErrors[String(path)] = issue.message;
      }
      setErrors(fieldErrors);
      setValidResult(null);
      setValidating(false);
      return;
    }

    // Validation succeeded — expose the data for development
    console.log("Validated graffiti form:", parse.data);
    setValidResult(parse.data);
    setValidating(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative w-full sm:w-[600px] max-h-[90vh] bg-white rounded-t-lg sm:rounded-lg shadow-lg overflow-hidden">
        <header className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="text-lg font-semibold">Add Graffiti</h2>
          <button
            aria-label="Close"
            onClick={onClose}
            className="p-2 rounded focus:outline-none"
          >
            ✕
          </button>
        </header>

        <div className="p-4 overflow-auto" style={{ maxHeight: "65vh" }}>
          <section className="mb-4">
            <label className="block text-sm font-medium mb-2">Location</label>
            <div className="h-48 mb-2">
              <MapContainer
                center={DEFAULT_CENTER}
                zoom={15}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  attribution="&copy; OpenStreetMap contributors"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapSelector
                  position={position}
                  onClick={handleMapClick}
                  onDragEnd={handleMarkerDrag}
                />
              </MapContainer>
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-xs">Latitude</label>
                <input
                  className="mt-1 block w-full rounded border px-2 py-2 text-sm"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  inputMode="decimal"
                  placeholder="61.4981"
                />
                {errors.latitude && (
                  <p className="text-xs text-red-600">{errors.latitude}</p>
                )}
              </div>

              <div className="flex-1">
                <label className="text-xs">Longitude</label>
                <input
                  className="mt-1 block w-full rounded border px-2 py-2 text-sm"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  inputMode="decimal"
                  placeholder="23.7608"
                />
                {errors.longitude && (
                  <p className="text-xs text-red-600">{errors.longitude}</p>
                )}
              </div>
            </div>
          </section>

          <section className="mb-4">
            <label className="block text-sm font-medium mb-2">Photo</label>

            <div className="flex items-center gap-3">
              <label className="inline-flex items-center px-3 py-2 bg-gray-100 rounded text-sm cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={onFileChange}
                  className="sr-only"
                />
                <span className="text-sm">Choose photo</span>
              </label>

              {file && (
                <div className="flex items-center gap-2">
                  <img
                    src={previewUrl ?? undefined}
                    alt="preview"
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="text-xs">
                    <div className="truncate w-28">{file.name}</div>
                    <button
                      onClick={clearFile}
                      className="text-xs text-blue-600"
                    >
                      Replace
                    </button>
                  </div>
                </div>
              )}
            </div>

            {errors.photo && (
              <p className="text-xs text-red-600 mt-2">{errors.photo}</p>
            )}
          </section>

          <section className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded border px-2 py-2 text-sm"
              rows={4}
              maxLength={500}
              placeholder="Any helpful notes about the location"
            />
            {errors.notes && (
              <p className="text-xs text-red-600">{errors.notes}</p>
            )}
          </section>

          {validResult && (
            <section className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Validated payload (dev)
              </label>
              <pre className="bg-gray-50 p-2 rounded text-xs overflow-auto">
                {JSON.stringify(validResult, null, 2)}
              </pre>
            </section>
          )}
        </div>

        <footer className="flex items-center justify-between gap-2 px-4 py-3 border-t">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded bg-gray-100 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={validating}
            className="flex-1 py-2 rounded bg-blue-600 text-white text-sm disabled:opacity-60"
          >
            {validating ? "Validating..." : "Save"}
          </button>
        </footer>
      </div>
    </div>
  );
}
