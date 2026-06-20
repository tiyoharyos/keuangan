export type CategoryType = "income" | "expense";
export type TransactionType = "income" | "expense";

export interface Account {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  sort_order: number;
  archived: boolean;
  created_at: string;
}

export interface AccountBalance {
  account_id: string;
  user_id: string;
  name: string;
  icon: string;
  sort_order: number;
  archived: boolean;
  balance: number;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  type: CategoryType;
  icon: string;
  sort_order: number;
  archived: boolean;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  account_id: string;
  category_id: string | null;
  note: string | null;
  transaction_date: string;
  created_at: string;
}

export interface Transfer {
  id: string;
  user_id: string;
  from_account_id: string;
  to_account_id: string;
  amount: number;
  note: string | null;
  transaction_date: string;
  created_at: string;
}

/** Baris gabungan transaksi + transfer untuk tampilan Riwayat, diurutkan satu timeline. */
export type LedgerEntry =
  | (Transaction & {
      kind: "transaction";
      account_name: string;
      category_name: string | null;
    })
  | (Transfer & {
      kind: "transfer";
      from_account_name: string;
      to_account_name: string;
    });
