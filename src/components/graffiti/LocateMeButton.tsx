"use client";

import { useState } from "react";
import { useMap } from "react-leaflet";
import LocateIcon from "../icons/LocateIcon";

type Props = {
  onLocate: (lat: number, lng: number) => void;
};

function getErrorMessage(error: GeolocationPositionError) {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return "Location access was denied. Allow location permissions and try again.";
    case error.POSITION_UNAVAILABLE:
      return "Your current location could not be determined right now.";
    case error.TIMEOUT:
      return "Location request timed out. Please try again.";
    default:
      return "Could not get your location. Please try again.";
  }
}

export default function LocateMeButton({ onLocate }: Props) {
  const map = useMap();
  const [locating, setLocating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleLocate() {
    setErrorMessage(null);

    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setErrorMessage("Geolocation is not supported by this browser.");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        map.flyTo([latitude, longitude], map.getZoom(), { animate: true });
        onLocate(latitude, longitude);
        setLocating(false);
      },
      (error) => {
        setErrorMessage(getErrorMessage(error));
        setLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  }

  return (
    <div className="leaflet-top leaflet-right z-1000 mr-3 mt-3 flex max-w-60 flex-col items-end gap-2">
      <button
        type="button"
        onClick={handleLocate}
        aria-label="Use my current location"
        aria-busy={locating}
        disabled={locating}
        className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/95 px-3 py-2 text-sm font-medium text-slate-100 shadow-lg shadow-black/30 backdrop-blur transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
      >
        <span className="inline-flex h-5 w-5 items-center justify-center text-fuchsia-400">
          {locating ? (
            <span
              className="h-4 w-4 animate-spin rounded-full border-2 border-fuchsia-400 border-t-transparent"
              aria-hidden="true"
            />
          ) : (
            <LocateIcon />
          )}
        </span>
        <span>{locating ? "Locating..." : "Use my location"}</span>
      </button>

      {errorMessage && (
        <p className="max-w-60 rounded-xl border border-rose-900/60 bg-rose-950/95 px-3 py-2 text-xs leading-relaxed text-rose-100 shadow-lg shadow-black/25">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
