"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function login(_prevState: { error: string } | null, formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { error: "Email dan password wajib diisi." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (error.code === "email_not_confirmed") {
      return {
        error:
          "Email belum dikonfirmasi. Konfirmasi user-nya di Supabase Dashboard (Authentication → Users), atau buat ulang dengan 'Auto Confirm User' aktif.",
      };
    }
    if (error.code === "invalid_credentials") {
      return { error: "Email atau password salah." };
    }
    return { error: `Gagal masuk: ${error.message}` };
  }

  redirect("/");
}