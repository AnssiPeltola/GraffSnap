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
    <button type="button" onClick={handleLogout}>
      Logout
    </button>
  );
}
