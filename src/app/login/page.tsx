"use client";

import { useActionState } from "react";
import { login } from "./actions";
import { WalletCards } from "lucide-react";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, null);

  return (
    <div className="flex min-h-full flex-1 items-center justify-center px-5 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-jade-soft text-jade">
            <WalletCards size={24} />
          </div>
          <h1 className="font-display text-2xl font-bold text-paper-50">
            Kantong
          </h1>
          <p className="mt-1 text-sm text-paper-400">
            Masuk untuk mencatat keuanganmu.
          </p>
        </div>

        <form action={formAction} className="space-y-4 rounded-2xl border border-ink-700 bg-ink-900 p-5">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-paper-200">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-lg border border-ink-600 bg-ink-800 px-3.5 py-2.5 text-paper-50 outline-none placeholder:text-paper-400/60 focus:border-jade"
              placeholder="kamu@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-paper-200">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-lg border border-ink-600 bg-ink-800 px-3.5 py-2.5 text-paper-50 outline-none placeholder:text-paper-400/60 focus:border-jade"
              placeholder="••••••••"
            />
          </div>

          {state?.error && (
            <p className="rounded-lg bg-rose/10 px-3 py-2 text-sm text-rose">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="tap-scale w-full rounded-lg bg-jade px-4 py-2.5 font-medium text-ink-950 disabled:opacity-60"
          >
            {pending ? "Masuk..." : "Masuk"}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-paper-400">
          Akun dibuat manual lewat Supabase Dashboard — lihat README.
        </p>
      </div>
    </div>
  );
}
