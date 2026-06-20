import { getAccounts, getCategories } from "@/lib/data";
import { TransactionForm } from "@/components/TransactionForm";

export default async function TambahTransaksiPage() {
  const [accounts, incomeCategories, expenseCategories] = await Promise.all([
    getAccounts(),
    getCategories("income"),
    getCategories("expense"),
  ]);

  const hasSetup = accounts.length > 0;

  return (
    <div>
      <h1 className="mb-1 font-display text-xl font-bold text-paper-50">
        Tambah Transaksi
      </h1>
      <p className="mb-5 text-sm text-paper-400">
        Catat pemasukan, pengeluaran, atau transfer antar kantong.
      </p>

      {hasSetup ? (
        <TransactionForm
          accounts={accounts}
          incomeCategories={incomeCategories}
          expenseCategories={expenseCategories}
        />
      ) : (
        <div className="rounded-xl border border-dashed border-ink-600 p-6 text-center text-sm text-paper-400">
          Kamu belum punya kantong/akun. Buka{" "}
          <a href="/pengaturan" className="text-jade underline">
            Pengaturan
          </a>{" "}
          untuk menambahkan akun seperti Bank atau Cash dulu.
        </div>
      )}
    </div>
  );
}
