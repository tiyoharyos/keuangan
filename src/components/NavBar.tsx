"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, PlusCircle, History, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutGrid },
  { href: "/transaksi/baru", label: "Tambah", icon: PlusCircle },
  { href: "/riwayat", label: "Riwayat", icon: History },
  { href: "/pengaturan", label: "Atur", icon: Settings },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-ink-700 bg-ink-900/95 backdrop-blur
                 sm:sticky sm:top-0 sm:bottom-auto sm:border-t-0 sm:border-b"
      aria-label="Navigasi utama"
    >
      <ul className="mx-auto flex max-w-xl items-stretch justify-between sm:max-w-3xl sm:justify-start sm:gap-1 sm:px-4">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href} className="flex-1 sm:flex-none">
              <Link
                href={href}
                className={cn(
                  "tap-scale flex flex-col items-center gap-1 py-2.5 text-xs font-medium sm:flex-row sm:gap-2 sm:px-4 sm:py-3.5 sm:text-sm",
                  active
                    ? "text-jade"
                    : "text-paper-400 hover:text-paper-50"
                )}
              >
                <Icon size={20} strokeWidth={active ? 2.4 : 1.8} />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
