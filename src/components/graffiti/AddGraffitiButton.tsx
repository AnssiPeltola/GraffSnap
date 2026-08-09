"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";

const AddGraffitiModal = dynamic(() => import("./AddGraffitiModal"), {
  ssr: false,
});

type Props = {
  authenticated?: boolean;
};

export default function AddGraffitiButton({ authenticated = false }: Props) {
  const [open, setOpen] = useState(false);

  if (!authenticated) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Add graffiti"
        className="fixed bottom-6 right-4 z-40 flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-full shadow-lg touch-manipulation"
      >
        <span className="text-xl leading-none">＋</span>
        <span className="hidden sm:inline">Add graffiti</span>
      </button>

      {open && <AddGraffitiModal onClose={() => setOpen(false)} />}
    </>
  );
}
