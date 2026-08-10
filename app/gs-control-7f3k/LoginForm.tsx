"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "../../src/lib/auth/client";

export default function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    const result = await authClient.signIn.email({
      email,
      password,
    });

    if (result.error) {
      setError(result.error.message ?? "Invalid email or password");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-2xl shadow-black/40 sm:p-8"
      >
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-slate-100">GraffSnap</h1>
          <p className="mt-1 text-sm text-slate-400">Sign in to continue</p>
        </div>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="block w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-fuchsia-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/30"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="block w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-fuchsia-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/30"
            />
          </div>

          {error && (
            <p className="rounded-lg border border-rose-900/50 bg-rose-950/40 px-3 py-2 text-sm text-rose-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-lg bg-gradient-to-r from-pink-500 to-violet-600 py-2.5 text-sm font-medium text-white shadow-lg shadow-fuchsia-900/20 transition hover:from-pink-600 hover:to-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400/60 active:scale-[0.99]"
          >
            Login
          </button>
        </div>
      </form>
    </div>
  );
}
