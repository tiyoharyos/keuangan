"use client";

import { useActionState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { Archive, RotateCcw, Banknote, Wallet, PiggyBank, Landmark, Plus } from "lucide-react";
import { createAccount, setAccountArchived, type FormState } from "@/app/(app)/pengaturan/actions";
import type { Account } from "@/lib/types";

const ICON_OPTIONS = [
  { value: "bank", label: "Bank", icon: Landmark },
  { value: "cash", label: "Tunai", icon: Banknote },
  { value: "wallet", label: "Dompet", icon: Wallet },
  { value: "piggy", label: "Tabungan", icon: PiggyBank },
];

function AddButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="tap-scale flex items-center gap-1.5 rounded-lg bg-jade px-3.5 py-2 text-sm font-medium text-ink-950 disabled:opacity-60"
    >
      <Plus size={15} />
      {pending ? "Menambah..." : "Tambah"}
    </button>
  );
}

function AccountRow({ account }: { account: Account }) {
  const [isPending, startTransition] = useTransition();
  const Icon = ICON_OPTIONS.find((o) => o.value === account.icon)?.icon ?? Wallet;

  return (
    <li className="flex items-center gap-3 py-2.5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink-800 text-paper-200">
        <Icon size={15} />
      </div>
      <span className={`flex-1 text-sm ${account.archived ? "text-paper-400 line-through" : "text-paper-50"}`}>
        {account.name}
      </span>
      <button
        onClick={() =>
          startTransition(() => setAccountArchived(account.id, !account.archived))
        }
        disabled={isPending}
        className="rounded-md p-1.5 text-paper-400 hover:bg-ink-800 hover:text-paper-50 disabled:opacity-50"
        aria-label={account.archived ? "Pulihkan" : "Arsipkan"}
      >
        {account.archived ? <RotateCcw size={15} /> : <Archive size={15} />}
      </button>
    </li>
  );
}

export function AccountManager({ accounts }: { accounts: Account[] }) {
  const [state, action] = useActionState<FormState, FormData>(createAccount, null);
  const active = accounts.filter((a) => !a.archived);
  const archived = accounts.filter((a) => a.archived);

  return (
    <div>
      <form action={action} className="mb-4 flex flex-wrap items-center gap-2">
        <input
          name="name"
          placeholder="Nama kantong, mis. Bank Jago"
          required
          className="min-w-[180px] flex-1 rounded-lg border border-ink-600 bg-ink-800 px-3.5 py-2 text-sm text-paper-50 outline-none placeholder:text-paper-400/60 focus:border-jade"
        />
        <select
          name="icon"
          defaultValue="wallet"
          className="rounded-lg border border-ink-600 bg-ink-800 px-2.5 py-2 text-sm text-paper-50 outline-none focus:border-jade"
        >
          {ICON_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <AddButton />
      </form>
      {state?.error && <p className="mb-3 text-sm text-rose">{state.error}</p>}

      {active.length === 0 ? (
        <p className="text-sm text-paper-400">Belum ada kantong aktif.</p>
      ) : (
        <ul className="divide-y divide-ink-800 rounded-xl border border-ink-800 bg-ink-900 px-3.5">
          {active.map((a) => (
            <AccountRow key={a.id} account={a} />
          ))}
        </ul>
      )}

      {archived.length > 0 && (
        <details className="mt-3">
          <summary className="cursor-pointer text-xs text-paper-400">
            Arsip ({archived.length})
          </summary>
          <ul className="mt-2 divide-y divide-ink-800 rounded-xl border border-ink-800 bg-ink-900 px-3.5">
            {archived.map((a) => (
              <AccountRow key={a.id} account={a} />
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
