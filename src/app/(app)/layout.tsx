import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NavBar } from "@/components/NavBar";
import { LogOut } from "lucide-react";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="hidden border-b border-ink-700 sm:block">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <span className="font-display text-lg font-bold tracking-tight text-paper-50">
            Kantong
          </span>
          <form action="/auth/logout" method="post">
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-paper-400 hover:bg-ink-800 hover:text-paper-50"
            >
              <LogOut size={15} />
              Keluar
            </button>
          </form>
        </div>
      </header>

      <NavBar />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-24 pt-5 sm:pb-10">
        {children}
      </main>
    </div>
  );
}
