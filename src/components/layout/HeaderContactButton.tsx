"use client";

import { useState } from "react";
import { ContactDialog } from "@/components/ContactDialog";
import type { Lang } from "@/lib/taxonomySlug";

export default function HeaderContactButton({ lang }: { lang: Lang }) {
  const [open, setOpen] = useState(false);
  const label = lang === "zh" ? "联系我" : "Contact";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={label}
        aria-expanded={open}
        className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-800 transition-colors hover:border-emerald-300 hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-100 sm:w-auto sm:gap-1.5 sm:px-3"
      >
        <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
          mail
        </span>
        <span className="hidden text-sm font-semibold sm:inline">{label}</span>
      </button>

      {open && <ContactDialog lang={lang} onClose={() => setOpen(false)} />}
    </div>
  );
}
