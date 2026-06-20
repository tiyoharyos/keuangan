import { createClient } from "@/lib/supabase/server";
import { currentMonthRange } from "@/lib/utils";
import type { Account, AccountBalance, Category, LedgerEntry } from "@/lib/types";

export async function getAccountBalances(): Promise<AccountBalance[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("account_balances")
    .select("*")
    .eq("archived", false)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getAccounts(): Promise<Account[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("accounts")
    .select("*")
    .eq("archived", false)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getAllAccounts(): Promise<Account[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("accounts")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getCategories(type?: "income" | "expense"): Promise<Category[]> {
  const supabase = await createClient();
  let query = supabase
    .from("categories")
    .select("*")
    .eq("archived", false)
    .order("sort_order", { ascending: true });

  if (type) query = query.eq("type", type);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getAllCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

/** Ringkasan pengeluaran bulan berjalan, dikelompokkan per kategori, terbesar dulu. */
export async function getMonthlyExpenseByCategory(): Promise<
  { category: string; total: number }[]
> {
  const supabase = await createClient();
  const { start, end } = currentMonthRange();

  const { data, error } = await supabase
    .from("transactions")
    .select("amount, category:categories(name)")
    .eq("type", "expense")
    .gte("transaction_date", start)
    .lte("transaction_date", end);

  if (error) throw error;

  const totals = new Map<string, number>();
  for (const row of data ?? []) {
    const categoryField = row.category as unknown as { name: string } | { name: string }[] | null;
    const name = Array.isArray(categoryField)
      ? categoryField[0]?.name
      : categoryField?.name;
    const label = name ?? "Tanpa kategori";
    totals.set(label, (totals.get(label) ?? 0) + Number(row.amount));
  }

  return Array.from(totals.entries())
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total);
}

export async function getMonthlyIncomeTotal(): Promise<number> {
  const supabase = await createClient();
  const { start, end } = currentMonthRange();

  const { data, error } = await supabase
    .from("transactions")
    .select("amount")
    .eq("type", "income")
    .gte("transaction_date", start)
    .lte("transaction_date", end);

  if (error) throw error;
  return (data ?? []).reduce((sum, r) => sum + Number(r.amount), 0);
}

/** Gabungan transaksi + transfer, satu timeline, terbaru dulu. */
export async function getLedgerHistory(limit = 50): Promise<LedgerEntry[]> {
  const supabase = await createClient();

  const [{ data: txs, error: txErr }, { data: trs, error: trErr }] = await Promise.all([
    supabase
      .from("transactions")
      .select("*, account:accounts(name), category:categories(name)")
      .order("transaction_date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(limit),
    supabase
      .from("transfers")
      .select("*, from_account:accounts!transfers_from_account_id_fkey(name), to_account:accounts!transfers_to_account_id_fkey(name)")
      .order("transaction_date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(limit),
  ]);

  if (txErr) throw txErr;
  if (trErr) throw trErr;

  const txEntries: LedgerEntry[] = (txs ?? []).map((t) => {
    const account = t.account as unknown as { name: string } | { name: string }[] | null;
    const category = t.category as unknown as { name: string } | { name: string }[] | null;
    return {
      ...t,
      kind: "transaction",
      account_name: Array.isArray(account) ? account[0]?.name : account?.name ?? "—",
      category_name: Array.isArray(category) ? category[0]?.name ?? null : category?.name ?? null,
    };
  });

  const trEntries: LedgerEntry[] = (trs ?? []).map((t) => {
    const from = t.from_account as unknown as { name: string } | { name: string }[] | null;
    const to = t.to_account as unknown as { name: string } | { name: string }[] | null;
    return {
      ...t,
      kind: "transfer",
      from_account_name: Array.isArray(from) ? from[0]?.name : from?.name ?? "—",
      to_account_name: Array.isArray(to) ? to[0]?.name : to?.name ?? "—",
    };
  });

  return [...txEntries, ...trEntries]
    .sort((a, b) => {
      const dateDiff = b.transaction_date.localeCompare(a.transaction_date);
      if (dateDiff !== 0) return dateDiff;
      return b.created_at.localeCompare(a.created_at);
    })
    .slice(0, limit);
}
