"use client";

import { useTransition } from "react";
import { Trash2, ArrowDownCircle, ArrowUpCircle, ArrowLeftRight } from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import { deleteTransaction, deleteTransfer } from "@/app/(app)/riwayat/actions";
import type { LedgerEntry } from "@/lib/types";

export function LedgerRow({ entry }: { entry: LedgerEntry }) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("Hapus catatan ini?")) return;
    startTransition(async () => {
      if (entry.kind === "transaction") {
        await deleteTransaction(entry.id);
      } else {
        await deleteTransfer(entry.id);
      }
    });
  }

  if (entry.kind === "transfer") {
    return (
      <li className="flex items-center gap-3 py-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-denim-soft text-denim">
          <ArrowLeftRight size={16} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm text-paper-50">
            {entry.from_account_name} → {entry.to_account_name}
          </p>
          {entry.note && <p className="truncate text-xs text-paper-400">{entry.note}</p>}
        </div>
        <span className="shrink-0 font-mono text-sm tabular-nums text-denim">
          {formatRupiah(entry.amount)}
        </span>
        <button
          onClick={handleDelete}
          disabled={isPending}
          aria-label="Hapus"
          className="shrink-0 rounded-md p-1.5 text-paper-400 hover:bg-ink-800 hover:text-rose disabled:opacity-50"
        >
          <Trash2 size={15} />
        </button>
      </li>
    );
  }

  const isIncome = entry.type === "income";

  return (
    <li className="flex items-center gap-3 py-3">
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
          isIncome ? "bg-jade-soft text-jade" : "bg-amber-soft text-amber"
        }`}
      >
        {isIncome ? <ArrowDownCircle size={16} /> : <ArrowUpCircle size={16} />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-paper-50">
          {entry.category_name ?? "Tanpa kategori"}
        </p>
        <p className="truncate text-xs text-paper-400">
          {entry.account_name}
          {entry.note ? ` · ${entry.note}` : ""}
        </p>
      </div>
      <span
        className={`shrink-0 font-mono text-sm tabular-nums ${
          isIncome ? "text-jade" : "text-amber"
        }`}
      >
        {isIncome ? "+" : "-"}
        {formatRupiah(entry.amount)}
      </span>
      <button
        onClick={handleDelete}
        disabled={isPending}
        aria-label="Hapus"
        className="shrink-0 rounded-md p-1.5 text-paper-400 hover:bg-ink-800 hover:text-rose disabled:opacity-50"
      >
        <Trash2 size={15} />
      </button>
    </li>
  );
}
