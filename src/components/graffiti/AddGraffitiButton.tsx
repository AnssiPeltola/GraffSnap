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
        className="fixed bottom-6 right-4 z-40 flex touch-manipulation items-center gap-2 rounded-full bg-linear-to-r from-pink-500 to-violet-600 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-fuchsia-900/20 transition hover:from-pink-600 hover:to-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400/60 active:scale-95"
      >
        <span className="text-xl leading-none">＋</span>
        <span>Add graffiti</span>
      </button>

      {open && <AddGraffitiModal onClose={() => setOpen(false)} />}
    </>
  );
}
