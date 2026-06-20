"use client";

import { useState } from "react";

function format(raw: string): string {
  const digits = raw.replace(/[^\d]/g, "");
  if (!digits) return "";
  return new Intl.NumberFormat("id-ID").format(Number(digits));
}

export function AmountField({
  name = "amount",
  id = "amount",
  defaultValue = "",
  autoFocus = false,
}: {
  name?: string;
  id?: string;
  defaultValue?: string;
  autoFocus?: boolean;
}) {
  const [value, setValue] = useState(format(defaultValue));

  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-paper-400">
        Rp
      </span>
      <input
        id={id}
        name={name}
        inputMode="numeric"
        autoFocus={autoFocus}
        value={value}
        onChange={(e) => setValue(format(e.target.value))}
        placeholder="0"
        required
        className="w-full rounded-lg border border-ink-600 bg-ink-800 py-3 pl-10 pr-3.5 font-mono text-xl text-paper-50 outline-none placeholder:text-paper-400/50 focus:border-jade"
      />
    </div>
  );
}
