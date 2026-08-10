"use client";

import dynamic from "next/dynamic";
import type { GraffitiSighting } from "@/src/db/schema";

const GraffitiMap = dynamic(() => import("./GraffitiMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-slate-400">
      Loading map...
    </div>
  ),
});

type Props = {
  graffitiSightings: GraffitiSighting[];
};

export default function GraffitiMapWrapper({ graffitiSightings }: Props) {
  return (
    <div className="min-h-0 flex-1 overflow-hidden rounded-xl">
      <GraffitiMap graffitiSightings={graffitiSightings} />
    </div>
  );
}
