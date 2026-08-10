"use client";

import { useRouter } from "next/navigation";
import { authClient } from "../lib/auth/client";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await authClient.signOut();

    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      aria-label="Log out"
      className="fixed bottom-6 left-4 z-40 flex touch-manipulation items-center gap-2 rounded-full border border-slate-700 bg-[#0f141c] px-5 py-3 text-sm font-medium text-slate-300 shadow-lg shadow-black/20 transition hover:border-violet-500 hover:bg-[#1b232d] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60 active:scale-95"
    >
      Log out
    </button>
  );
}
