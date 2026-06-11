"use client";

import { useState } from "react";
import type { Lang } from "@/lib/taxonomySlug";
import { submitWaitlist } from "@/lib/publicTools";

export default function EmailWaitlist({ lang, sourcePage }: { lang: Lang; sourcePage: string }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setError("");
    try {
      await submitWaitlist({
        contact: email,
        contact_type: "email",
        platform_preference: "ios",
        source_page: sourcePage,
        locale: lang,
      });
      setStatus("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : copy[lang].error);
      setStatus("error");
    }
  }

  const labels = copy[lang];

  return (
    <div className="flex flex-col gap-4">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="inline-flex h-12 items-center self-start rounded-lg bg-emerald-700 px-6 text-base font-bold text-white transition-colors hover:bg-emerald-800"
        >
          {labels.cta}
        </button>
      ) : status === "success" ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-6 py-4 text-sm font-semibold text-emerald-700">
          {labels.success}
        </p>
      ) : (
        <form onSubmit={onSubmit} className="flex w-full max-w-md flex-col gap-3">
          <div className="flex gap-3">
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              className="h-12 flex-1 rounded-lg border border-slate-300 px-4 text-base outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              placeholder={labels.placeholder}
            />
            <button
              type="submit"
              disabled={status === "submitting"}
              className="h-12 rounded-lg bg-emerald-700 px-5 text-base font-bold text-white transition-colors hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {status === "submitting" ? labels.submitting : labels.submit}
            </button>
          </div>
          {status === "error" && <p className="text-sm font-semibold text-red-600">{error}</p>}
        </form>
      )}
    </div>
  );
}

const copy = {
  zh: {
    cta: "我要试用",
    placeholder: "you@example.com",
    submit: "提交",
    submitting: "提交中...",
    success: "已收到，内测开放时会优先联系你。",
    error: "提交失败，请稍后再试。",
  },
  en: {
    cta: "Join waitlist",
    placeholder: "you@example.com",
    submit: "Submit",
    submitting: "Submitting...",
    success: "You are on the waitlist. We will contact you when testing opens.",
    error: "Submission failed. Please try again.",
  },
};
