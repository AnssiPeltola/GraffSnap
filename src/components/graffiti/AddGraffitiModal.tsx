"use client";

import React, { useEffect, useMemo, useState } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import graffitiSchema from "@/src/lib/validation/graffiti";
import { useRouter } from "next/navigation";
import LocateMeButton from "./LocateMeButton";

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
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

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

  function setCoords(lat: number, lng: number) {
    setLatitude(String(lat));
    setLongitude(String(lng));
  }

  function handleMapClick(lat: number, lng: number) {
    setCoords(lat, lng);
  }

  function handleMarkerDrag(lat: number, lng: number) {
    setCoords(lat, lng);
  }

  function handleLocate(lat: number, lng: number) {
    setCoords(lat, lng);
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files && e.target.files[0];
    if (f) setFile(f);
  }

  function clearFile() {
    setFile(null);
  }

  async function handleSave() {
    setGeneralError(null);
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
      return;
    }

    // Submit to server
    const formData = new FormData();
    formData.set("latitude", String(parse.data.latitude));
    formData.set("longitude", String(parse.data.longitude));
    if (file) formData.set("photo", file);
    if (parse.data.notes) formData.set("notes", parse.data.notes);

    setSubmitting(true);
    try {
      const resp = await fetch("/api/graffiti", {
        method: "POST",
        body: formData,
      });
      const json = await resp.json();

      if (!resp.ok) {
        if (json?.fieldErrors) {
          setErrors(json.fieldErrors as Record<string, string>);
        } else {
          setGeneralError(
            json?.message ?? "Could not save graffiti. Please try again.",
          );
        }
        setSubmitting(false);
        return;
      }

      // success
      router.refresh();
      onClose();
    } catch (err) {
      console.error(err);
      setGeneralError("Could not save graffiti. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-99999 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/70"
        onClick={() => {
          if (!submitting) onClose();
        }}
      />

      <div className="relative w-full sm:w-150 max-h-[90vh] bg-slate-900 text-slate-100 border border-slate-800 rounded-t-xl sm:rounded-xl shadow-2xl shadow-black/40 overflow-hidden">
        <header className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
          <h2 className="text-lg font-semibold">Add Graffiti</h2>
          <button
            aria-label="Close"
            onClick={() => {
              if (!submitting) onClose();
            }}
            className="p-2 rounded text-slate-300 hover:bg-slate-800 hover:text-white transition focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/60"
            aria-disabled={submitting}
          >
            ✕
          </button>
        </header>

        <div className="p-4 overflow-auto" style={{ maxHeight: "65vh" }}>
          <section className="mb-4">
            <label className="block text-sm font-medium mb-2 text-slate-300">
              Location
            </label>
            <div className="h-48 mb-2 overflow-hidden rounded-lg border border-slate-800">
              <MapContainer
                center={DEFAULT_CENTER}
                zoom={15}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  attribution="&copy; OpenStreetMap contributors"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocateMeButton onLocate={handleLocate} />
                <MapSelector
                  position={position}
                  onClick={handleMapClick}
                  onDragEnd={handleMarkerDrag}
                />
              </MapContainer>
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-xs text-slate-400">Latitude</label>
                <input
                  className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-800 px-2 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-fuchsia-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/30"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  inputMode="decimal"
                  placeholder="61.4981"
                />
                {errors.latitude && (
                  <p className="mt-1 text-xs text-rose-400">
                    {errors.latitude}
                  </p>
                )}
              </div>

              <div className="flex-1">
                <label className="text-xs text-slate-400">Longitude</label>
                <input
                  className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-800 px-2 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-fuchsia-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/30"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  inputMode="decimal"
                  placeholder="23.7608"
                />
                {errors.longitude && (
                  <p className="mt-1 text-xs text-rose-400">
                    {errors.longitude}
                  </p>
                )}
              </div>
            </div>
          </section>

          <section className="mb-4">
            <label className="block text-sm font-medium mb-2 text-slate-300">
              Photo
            </label>

            <div className="flex items-center gap-3">
              <label className="inline-flex items-center rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 cursor-pointer transition hover:bg-slate-700 focus-within:ring-2 focus-within:ring-fuchsia-500/30">
                <input
                  type="file"
                  accept="image/*"
                  onChange={onFileChange}
                  className="sr-only"
                />
                <span className="text-sm">Choose photo</span>
              </label>

              {file && (
                <div className="flex items-center gap-2">
                  {/* Using native <img> for local object URL preview */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl ?? undefined}
                    alt="preview"
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="text-xs">
                    <div className="truncate w-28 text-slate-300">
                      {file.name}
                    </div>
                    <button
                      onClick={clearFile}
                      className="text-xs text-fuchsia-400 hover:text-fuchsia-300"
                    >
                      Replace
                    </button>
                  </div>
                </div>
              )}
            </div>

            {errors.photo && (
              <p className="mt-2 text-xs text-rose-400">{errors.photo}</p>
            )}
          </section>

          <section className="mb-4">
            <label className="block text-sm font-medium mb-2 text-slate-300">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-2 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-fuchsia-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/30"
              rows={4}
              maxLength={500}
              placeholder="Any helpful notes about the location"
            />
            {errors.notes && (
              <p className="mt-1 text-xs text-rose-400">{errors.notes}</p>
            )}
          </section>

          {generalError && (
            <section className="mb-4">
              <p className="text-sm text-rose-400">{generalError}</p>
            </section>
          )}
        </div>

        <footer className="flex items-center justify-between gap-2 border-t border-slate-800 px-4 py-3">
          <button
            onClick={() => {
              if (!submitting) onClose();
            }}
            className="flex-1 rounded-lg border border-slate-700 bg-slate-800 py-2 text-sm text-slate-100 transition hover:bg-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/60 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={submitting}
            className="flex-1 rounded-lg bg-linear-to-r from-pink-500 to-violet-600 py-2 text-sm font-medium text-white shadow-lg shadow-fuchsia-900/20 transition hover:from-pink-600 hover:to-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400/60 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Saving..." : "Save"}
          </button>
        </footer>
      </div>
    </div>
  );
}
