"use client";

import dynamic from "next/dynamic";

const GraffitiMap = dynamic(() => import("./GraffitiMap"), {
  ssr: false,
  loading: () => <p>Loading map...</p>,
});

export default function GraffitiMapWrapper() {
  return <GraffitiMap />;
}
