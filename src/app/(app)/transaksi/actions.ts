"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type FormState = { error: string } | null;

function parseAmount(raw: FormDataEntryValue | null): number | null {
  if (!raw) return null;
  // Terima "150.000" / "150000" / "150,000" dari input angka.
  const cleaned = String(raw).replace(/[^\d]/g, "");
  if (!cleaned) return null;
  const value = Number(cleaned);
  return value > 0 ? value : null;
}

export async function createTransaction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const type = String(formData.get("type"));
  const amount = parseAmount(formData.get("amount"));
  const accountId = String(formData.get("account_id") || "");
  const categoryId = String(formData.get("category_id") || "") || null;
  const note = String(formData.get("note") || "").trim() || null;
  const date = String(formData.get("transaction_date") || "");

  if (type !== "income" && type !== "expense") {
    return { error: "Tipe transaksi tidak valid." };
  }
  if (!amount) {
    return { error: "Jumlah harus lebih dari 0." };
  }
  if (!accountId) {
    return { error: "Pilih kantong/akun." };
  }

  const { error } = await supabase.from("transactions").insert({
    user_id: user!.id,
    type,
    amount,
    account_id: accountId,
    category_id: categoryId,
    note,
    transaction_date: date || undefined,
  });

  if (error) {
    return { error: "Gagal menyimpan: " + error.message };
  }

  revalidatePath("/");
  revalidatePath("/riwayat");
  redirect("/?saved=1");
}

export async function createTransfer(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const amount = parseAmount(formData.get("amount"));
  const fromAccountId = String(formData.get("from_account_id") || "");
  const toAccountId = String(formData.get("to_account_id") || "");
  const note = String(formData.get("note") || "").trim() || null;
  const date = String(formData.get("transaction_date") || "");

  if (!amount) {
    return { error: "Jumlah harus lebih dari 0." };
  }
  if (!fromAccountId || !toAccountId) {
    return { error: "Pilih kantong asal dan tujuan." };
  }
  if (fromAccountId === toAccountId) {
    return { error: "Kantong asal dan tujuan tidak boleh sama." };
  }

  const { error } = await supabase.from("transfers").insert({
    user_id: user!.id,
    from_account_id: fromAccountId,
    to_account_id: toAccountId,
    amount,
    note,
    transaction_date: date || undefined,
  });

  if (error) {
    return { error: "Gagal menyimpan: " + error.message };
  }

  revalidatePath("/");
  revalidatePath("/riwayat");
  redirect("/?saved=1");
}
