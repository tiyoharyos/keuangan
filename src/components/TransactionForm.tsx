"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { ArrowDownCircle, ArrowUpCircle, ArrowLeftRight } from "lucide-react";
import { createTransaction, createTransfer, type FormState } from "@/app/(app)/transaksi/actions";
import { AmountField } from "@/components/AmountField";
import { cn, todayISO } from "@/lib/utils";
import type { Account, Category } from "@/lib/types";

type Tab = "expense" | "income" | "transfer";

const TABS: { id: Tab; label: string; icon: typeof ArrowDownCircle; color: string }[] = [
  { id: "expense", label: "Pengeluaran", icon: ArrowUpCircle, color: "amber" },
  { id: "income", label: "Pemasukan", icon: ArrowDownCircle, color: "jade" },
  { id: "transfer", label: "Transfer", icon: ArrowLeftRight, color: "denim" },
];

function SubmitButton({ label, colorClass }: { label: string; colorClass: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "tap-scale w-full rounded-lg px-4 py-3 font-medium text-ink-950 disabled:opacity-60",
        colorClass
      )}
    >
      {pending ? "Menyimpan..." : label}
    </button>
  );
}

function FieldError({ state }: { state: FormState }) {
  if (!state?.error) return null;
  return (
    <p className="rounded-lg bg-rose/10 px-3 py-2 text-sm text-rose">{state.error}</p>
  );
}

function FormShell({ children }: { children: React.ReactNode }) {
  return <div className="space-y-4">{children}</div>;
}

function Select({
  id,
  name,
  options,
  placeholder,
}: {
  id: string;
  name: string;
  options: { value: string; label: string }[];
  placeholder: string;
}) {
  return (
    <select
      id={id}
      name={name}
      required
      defaultValue=""
      className="w-full appearance-none rounded-lg border border-ink-600 bg-ink-800 px-3.5 py-2.5 text-paper-50 outline-none focus:border-jade"
    >
      <option value="" disabled>
        {placeholder}
      </option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function TransactionForm({
  accounts,
  incomeCategories,
  expenseCategories,
}: {
  accounts: Account[];
  incomeCategories: Category[];
  expenseCategories: Category[];
}) {
  const [tab, setTab] = useState<Tab>("expense");
  const today = todayISO();

  const [expenseState, expenseAction] = useActionState(createTransaction, null);
  const [incomeState, incomeAction] = useActionState(createTransaction, null);
  const [transferState, transferAction] = useActionState(createTransfer, null);

  const accountOptions = accounts.map((a) => ({ value: a.id, label: a.name }));

  return (
    <div>
      <div className="mb-5 grid grid-cols-3 gap-1.5 rounded-xl border border-ink-700 bg-ink-900 p-1.5">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              "tap-scale flex flex-col items-center gap-1 rounded-lg py-2.5 text-xs font-medium sm:flex-row sm:justify-center sm:gap-1.5 sm:text-sm",
              tab === id
                ? id === "expense"
                  ? "bg-amber-soft text-amber"
                  : id === "income"
                  ? "bg-jade-soft text-jade"
                  : "bg-denim-soft text-denim"
                : "text-paper-400"
            )}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {tab === "expense" && (
        <form action={expenseAction}>
          <input type="hidden" name="type" value="expense" />
          <FormShell>
            <AmountField autoFocus />
            <Select
              id="account_id"
              name="account_id"
              placeholder="Bayar pakai kantong mana?"
              options={accountOptions}
            />
            <Select
              id="category_id"
              name="category_id"
              placeholder="Kategori pengeluaran"
              options={expenseCategories.map((c) => ({ value: c.id, label: c.name }))}
            />
            <input
              type="date"
              name="transaction_date"
              defaultValue={today}
              required
              className="w-full rounded-lg border border-ink-600 bg-ink-800 px-3.5 py-2.5 text-paper-50 outline-none focus:border-jade"
            />
            <input
              type="text"
              name="note"
              placeholder="Catatan (opsional)"
              className="w-full rounded-lg border border-ink-600 bg-ink-800 px-3.5 py-2.5 text-paper-50 outline-none placeholder:text-paper-400/60 focus:border-jade"
            />
            <FieldError state={expenseState} />
            <SubmitButton label="Catat Pengeluaran" colorClass="bg-amber" />
          </FormShell>
        </form>
      )}

      {tab === "income" && (
        <form action={incomeAction}>
          <input type="hidden" name="type" value="income" />
          <FormShell>
            <AmountField autoFocus />
            <Select
              id="account_id"
              name="account_id"
              placeholder="Masuk ke kantong mana?"
              options={accountOptions}
            />
            <Select
              id="category_id"
              name="category_id"
              placeholder="Kategori pemasukan"
              options={incomeCategories.map((c) => ({ value: c.id, label: c.name }))}
            />
            <input
              type="date"
              name="transaction_date"
              defaultValue={today}
              required
              className="w-full rounded-lg border border-ink-600 bg-ink-800 px-3.5 py-2.5 text-paper-50 outline-none focus:border-jade"
            />
            <input
              type="text"
              name="note"
              placeholder="Catatan (opsional)"
              className="w-full rounded-lg border border-ink-600 bg-ink-800 px-3.5 py-2.5 text-paper-50 outline-none placeholder:text-paper-400/60 focus:border-jade"
            />
            <FieldError state={incomeState} />
            <SubmitButton label="Catat Pemasukan" colorClass="bg-jade" />
          </FormShell>
        </form>
      )}

      {tab === "transfer" && (
        <form action={transferAction}>
          <FormShell>
            <AmountField autoFocus />
            <Select
              id="from_account_id"
              name="from_account_id"
              placeholder="Dari kantong"
              options={accountOptions}
            />
            <Select
              id="to_account_id"
              name="to_account_id"
              placeholder="Ke kantong"
              options={accountOptions}
            />
            <input
              type="date"
              name="transaction_date"
              defaultValue={today}
              required
              className="w-full rounded-lg border border-ink-600 bg-ink-800 px-3.5 py-2.5 text-paper-50 outline-none focus:border-jade"
            />
            <input
              type="text"
              name="note"
              placeholder="Catatan (opsional)"
              className="w-full rounded-lg border border-ink-600 bg-ink-800 px-3.5 py-2.5 text-paper-50 outline-none placeholder:text-paper-400/60 focus:border-jade"
            />
            <FieldError state={transferState} />
            <SubmitButton label="Catat Transfer" colorClass="bg-denim" />
          </FormShell>
        </form>
      )}
    </div>
  );
}
