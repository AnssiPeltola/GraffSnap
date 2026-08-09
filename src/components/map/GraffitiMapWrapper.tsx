"use client";

import dynamic from "next/dynamic";
import type { GraffitiSighting } from "@/src/db/schema";

const GraffitiMap = dynamic(() => import("./GraffitiMap"), {
  ssr: false,
  loading: () => <p>Loading map...</p>,
});

type Props = {
  graffitiSightings: GraffitiSighting[];
};

export default function GraffitiMapWrapper({ graffitiSightings }: Props) {
  return <GraffitiMap graffitiSightings={graffitiSightings} />;
}
