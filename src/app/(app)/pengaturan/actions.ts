"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type FormState = { error: string } | null;

const ACCOUNT_ICONS = ["bank", "cash", "wallet", "piggy", "savings"];

export async function createAccount(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const name = String(formData.get("name") || "").trim();
  const icon = String(formData.get("icon") || "wallet");

  if (!name) return { error: "Nama kantong wajib diisi." };
  if (!ACCOUNT_ICONS.includes(icon)) return { error: "Icon tidak valid." };

  const { error } = await supabase.from("accounts").insert({
    user_id: user!.id,
    name,
    icon,
  });

  if (error) return { error: "Gagal menyimpan: " + error.message };

  revalidatePath("/pengaturan");
  revalidatePath("/");
  return null;
}

export async function setAccountArchived(id: string, archived: boolean) {
  const supabase = await createClient();
  const { error } = await supabase.from("accounts").update({ archived }).eq("id", id);
  if (error) throw error;
  revalidatePath("/pengaturan");
  revalidatePath("/");
}

export async function createCategory(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const name = String(formData.get("name") || "").trim();
  const type = String(formData.get("type") || "");

  if (!name) return { error: "Nama kategori wajib diisi." };
  if (type !== "income" && type !== "expense") {
    return { error: "Pilih jenis kategori." };
  }

  const { error } = await supabase.from("categories").insert({
    user_id: user!.id,
    name,
    type,
  });

  if (error) return { error: "Gagal menyimpan: " + error.message };

  revalidatePath("/pengaturan");
  revalidatePath("/transaksi/baru");
  return null;
}

export async function setCategoryArchived(id: string, archived: boolean) {
  const supabase = await createClient();
  const { error } = await supabase.from("categories").update({ archived }).eq("id", id);
  if (error) throw error;
  revalidatePath("/pengaturan");
  revalidatePath("/transaksi/baru");
}
