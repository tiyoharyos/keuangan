"use client";

import { useActionState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { Archive, RotateCcw, Plus } from "lucide-react";
import { createCategory, setCategoryArchived, type FormState } from "@/app/(app)/pengaturan/actions";
import type { Category } from "@/lib/types";

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

function CategoryRow({ category }: { category: Category }) {
  const [isPending, startTransition] = useTransition();
  return (
    <li className="flex items-center gap-3 py-2.5">
      <span className={`flex-1 text-sm ${category.archived ? "text-paper-400 line-through" : "text-paper-50"}`}>
        {category.name}
      </span>
      <button
        onClick={() =>
          startTransition(() => setCategoryArchived(category.id, !category.archived))
        }
        disabled={isPending}
        className="rounded-md p-1.5 text-paper-400 hover:bg-ink-800 hover:text-paper-50 disabled:opacity-50"
        aria-label={category.archived ? "Pulihkan" : "Arsipkan"}
      >
        {category.archived ? <RotateCcw size={15} /> : <Archive size={15} />}
      </button>
    </li>
  );
}

export function CategoryManager({ categories }: { categories: Category[] }) {
  const [state, action] = useActionState<FormState, FormData>(createCategory, null);

  const expense = categories.filter((c) => c.type === "expense" && !c.archived);
  const income = categories.filter((c) => c.type === "income" && !c.archived);
  const archived = categories.filter((c) => c.archived);

  return (
    <div>
      <form action={action} className="mb-4 flex flex-wrap items-center gap-2">
        <input
          name="name"
          placeholder="Nama kategori, mis. Transport"
          required
          className="min-w-[180px] flex-1 rounded-lg border border-ink-600 bg-ink-800 px-3.5 py-2 text-sm text-paper-50 outline-none placeholder:text-paper-400/60 focus:border-jade"
        />
        <select
          name="type"
          defaultValue="expense"
          className="rounded-lg border border-ink-600 bg-ink-800 px-2.5 py-2 text-sm text-paper-50 outline-none focus:border-jade"
        >
          <option value="expense">Pengeluaran</option>
          <option value="income">Pemasukan</option>
        </select>
        <AddButton />
      </form>
      {state?.error && <p className="mb-3 text-sm text-rose">{state.error}</p>}

      <div className="space-y-4">
        <div>
          <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-amber">
            Pengeluaran
          </p>
          {expense.length === 0 ? (
            <p className="text-sm text-paper-400">Belum ada kategori.</p>
          ) : (
            <ul className="divide-y divide-ink-800 rounded-xl border border-ink-800 bg-ink-900 px-3.5">
              {expense.map((c) => (
                <CategoryRow key={c.id} category={c} />
              ))}
            </ul>
          )}
        </div>

        <div>
          <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-jade">
            Pemasukan
          </p>
          {income.length === 0 ? (
            <p className="text-sm text-paper-400">Belum ada kategori.</p>
          ) : (
            <ul className="divide-y divide-ink-800 rounded-xl border border-ink-800 bg-ink-900 px-3.5">
              {income.map((c) => (
                <CategoryRow key={c.id} category={c} />
              ))}
            </ul>
          )}
        </div>
      </div>

      {archived.length > 0 && (
        <details className="mt-3">
          <summary className="cursor-pointer text-xs text-paper-400">
            Arsip ({archived.length})
          </summary>
          <ul className="mt-2 divide-y divide-ink-800 rounded-xl border border-ink-800 bg-ink-900 px-3.5">
            {archived.map((c) => (
              <CategoryRow key={c.id} category={c} />
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
