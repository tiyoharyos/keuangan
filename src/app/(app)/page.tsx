import Link from "next/link";
import { getAccountBalances, getMonthlyExpenseByCategory, getMonthlyIncomeTotal } from "@/lib/data";
import { AccountCard } from "@/components/AccountCard";
import { formatRupiah } from "@/lib/utils";
import { PlusCircle } from "lucide-react";

export default async function DashboardPage() {
  const [accounts, expenseByCategory, monthlyIncome] = await Promise.all([
    getAccountBalances(),
    getMonthlyExpenseByCategory(),
    getMonthlyIncomeTotal(),
  ]);

  const totalAssets = accounts.reduce((sum, a) => sum + a.balance, 0);
  const monthlyExpense = expenseByCategory.reduce((sum, c) => sum + c.total, 0);
  const maxCategory = Math.max(1, ...expenseByCategory.map((c) => c.total));

  const now = new Date();
  const monthLabel = now.toLocaleDateString("id-ID", { month: "long", year: "numeric" });

  return (
    <div className="space-y-7">
      <section>
        <p className="text-sm text-paper-400">Total Aset</p>
        <p className="font-mono text-3xl font-bold tabular-nums text-paper-50">
          {formatRupiah(totalAssets)}
        </p>
      </section>

      {accounts.length === 0 ? (
        <EmptyState />
      ) : (
        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-display text-sm font-semibold text-paper-200">
              Kantong
            </h2>
            <Link href="/pengaturan" className="text-xs text-paper-400 hover:text-jade">
              Kelola
            </Link>
          </div>
          <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-2 sm:px-0">
            {accounts.map((a) => (
              <div key={a.account_id} className="w-[170px] sm:w-auto">
                <AccountCard account={a} />
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="font-display text-sm font-semibold text-paper-200">
            Pengeluaran {monthLabel}
          </h2>
          <span className="font-mono text-sm text-amber">{formatRupiah(monthlyExpense)}</span>
        </div>

        {expenseByCategory.length === 0 ? (
          <p className="rounded-xl border border-dashed border-ink-700 p-5 text-center text-sm text-paper-400">
            Belum ada pengeluaran bulan ini.
          </p>
        ) : (
          <ul className="space-y-2.5">
            {expenseByCategory.map((c) => (
              <li key={c.category}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-paper-200">{c.category}</span>
                  <span className="font-mono tabular-nums text-paper-50">
                    {formatRupiah(c.total)}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-ink-800">
                  <div
                    className="h-full rounded-full bg-amber"
                    style={{ width: `${(c.total / maxCategory) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-3 text-xs text-paper-400">
          Pemasukan bulan ini:{" "}
          <span className="font-mono text-jade">{formatRupiah(monthlyIncome)}</span>
        </p>
      </section>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-ink-700 p-6 text-center">
      <p className="mb-3 text-sm text-paper-400">
        Belum ada kantong. Mulai dengan menambahkan akun seperti Bank atau Cash di Pengaturan,
        lalu catat transaksi pertamamu.
      </p>
      <Link
        href="/pengaturan"
        className="tap-scale inline-flex items-center gap-1.5 rounded-lg bg-jade px-4 py-2 text-sm font-medium text-ink-950"
      >
        <PlusCircle size={16} />
        Atur Kantong
      </Link>
    </div>
  );
}
