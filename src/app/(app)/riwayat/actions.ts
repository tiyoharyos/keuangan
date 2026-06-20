"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function deleteTransaction(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("transactions").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/");
  revalidatePath("/riwayat");
}

export async function deleteTransfer(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("transfers").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/");
  revalidatePath("/riwayat");
}
