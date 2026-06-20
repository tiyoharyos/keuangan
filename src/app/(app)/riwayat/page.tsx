import { getLedgerHistory } from "@/lib/data";
import { LedgerRow } from "@/components/LedgerRow";
import { formatDateID } from "@/lib/utils";
import type { LedgerEntry } from "@/lib/types";

function groupByDate(entries: LedgerEntry[]) {
  const groups = new Map<string, LedgerEntry[]>();
  for (const e of entries) {
    const key = e.transaction_date;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(e);
  }
  return Array.from(groups.entries());
}

export default async function RiwayatPage() {
  const entries = await getLedgerHistory(100);
  const groups = groupByDate(entries);

  return (
    <div>
      <h1 className="mb-1 font-display text-xl font-bold text-paper-50">Riwayat</h1>
      <p className="mb-5 text-sm text-paper-400">
        100 catatan terakhir — pemasukan, pengeluaran, dan transfer.
      </p>

      {groups.length === 0 ? (
        <p className="rounded-xl border border-dashed border-ink-700 p-6 text-center text-sm text-paper-400">
          Belum ada catatan. Mulai dari halaman Tambah Transaksi.
        </p>
      ) : (
        <div className="space-y-5">
          {groups.map(([date, items]) => (
            <div key={date}>
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-paper-400">
                {formatDateID(date)}
              </p>
              <ul className="divide-y divide-ink-800 rounded-xl border border-ink-800 bg-ink-900 px-3.5">
                {items.map((entry) => (
                  <LedgerRow key={`${entry.kind}-${entry.id}`} entry={entry} />
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
