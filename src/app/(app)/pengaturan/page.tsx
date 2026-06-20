import { getAllAccounts, getAllCategories } from "@/lib/data";
import { AccountManager } from "@/components/AccountManager";
import { CategoryManager } from "@/components/CategoryManager";

export default async function PengaturanPage() {
  const [accounts, categories] = await Promise.all([
    getAllAccounts(),
    getAllCategories(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-1 font-display text-xl font-bold text-paper-50">Pengaturan</h1>
        <p className="text-sm text-paper-400">Kelola kantong dan kategori transaksi.</p>
      </div>

      <section>
        <h2 className="mb-2 font-display text-sm font-semibold text-paper-200">
          Kantong / Akun
        </h2>
        <AccountManager accounts={accounts} />
      </section>

      <section>
        <h2 className="mb-2 font-display text-sm font-semibold text-paper-200">
          Kategori
        </h2>
        <CategoryManager categories={categories} />
      </section>
    </div>
  );
}
