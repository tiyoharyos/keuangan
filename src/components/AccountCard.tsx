import { formatRupiah } from "@/lib/utils";
import { Banknote, Wallet, PiggyBank, Landmark, CircleDollarSign } from "lucide-react";
import type { AccountBalance } from "@/lib/types";

const ICONS: Record<string, typeof Banknote> = {
  bank: Landmark,
  cash: Banknote,
  wallet: Wallet,
  piggy: PiggyBank,
  savings: PiggyBank,
};

export function AccountCard({ account }: { account: AccountBalance }) {
  const Icon = ICONS[account.icon] ?? CircleDollarSign;
  const negative = account.balance < 0;

  return (
    <div className="relative shrink-0 overflow-hidden rounded-2xl border border-ink-700 bg-ink-900 p-4">
      <div className="perforated absolute inset-y-0 right-[88px] w-px opacity-30" />
      <div className="flex items-center gap-2 text-paper-400">
        <Icon size={15} />
        <span className="text-xs font-medium uppercase tracking-wide">
          {account.name}
        </span>
      </div>
      <p
        className={`mt-2 font-mono text-xl font-semibold tabular-nums ${
          negative ? "text-rose" : "text-paper-50"
        }`}
      >
        {formatRupiah(account.balance)}
      </p>
    </div>
  );
}
