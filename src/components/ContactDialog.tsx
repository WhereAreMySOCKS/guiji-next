"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { submitFeedback } from "@/lib/publicTools";
import type { Lang } from "@/lib/taxonomySlug";

type QrChannel = {
  key: string;
  logoUrl: string;
  label: { zh: string; en: string };
  src: string;
};

const CONTACT_QR_CHANNELS: QrChannel[] = [
  {
    key: "rednote",
    logoUrl: "https://cdn.simpleicons.org/xiaohongshu/red",
    label: { zh: "小红书", en: "Rednote" },
    src: "/images/QR/rednote.jpg",
  },
  {
    key: "douyin",
    logoUrl: "https://cdn.simpleicons.org/tiktok/black",
    label: { zh: "抖音", en: "Douyin" },
    src: "/images/QR/douyin.jpg",
  },
];

export function ContactDialog({ lang, onClose }: { lang: Lang; onClose: () => void }) {
  const [activeQr, setActiveQr] = useState<QrChannel | null>(null);
  const [hoveredQr, setHoveredQr] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState("");

  const labels = copy[lang];

  useEffect(() => {
    setMounted(true);
  }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = message.trim();
    if (trimmed.length < 2) {
      setError(labels.shortError);
      setStatus("error");
      return;
    }
    setStatus("submitting");
    setError("");
    try {
      const formData = new FormData();
      formData.append("message", trimmed);
      formData.append("source_platform", "web");
      formData.append("source_page", window.location.pathname);
      formData.append("locale", lang);
      formData.append("app_version", "guiji-next");
      formData.append("device_summary", navigator.userAgent);
      await submitFeedback(formData);
      setStatus("success");
      setMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : labels.submitError);
      setStatus("error");
    }
  }

  if (!mounted) return null;

  return createPortal(
    <>
      <div className="fixed inset-0 z-50 bg-transparent" onClick={onClose} role="presentation" />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-dialog-title"
        className="fixed right-4 top-16 z-[60] w-[calc(100vw-2rem)] max-w-sm rounded-lg border border-slate-200 bg-white shadow-2xl shadow-slate-900/10"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="border-b border-slate-100 px-4 py-3">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h3 id="contact-dialog-title" className="text-sm font-bold text-slate-950">
                {labels.contactEyebrow}
              </h3>
              <p className="mt-1 text-xs leading-5 text-slate-600">{labels.contactDesc}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={labels.closeContact}
              className="-mr-1 -mt-1 flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            >
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                close
              </span>
            </button>
          </div>
        </div>

        <div className="px-4 py-4">
          <form onSubmit={submit} className="rounded-lg bg-slate-50 p-3 ring-1 ring-inset ring-slate-200">
            <label htmlFor="feedback-message" className="text-[10px] font-bold uppercase text-slate-500">
              {labels.feedbackLabel}
            </label>
            <textarea
              id="feedback-message"
              value={message}
              onChange={(event) => {
                setMessage(event.target.value);
                if (status !== "submitting") setStatus("idle");
              }}
              maxLength={2000}
              rows={4}
              placeholder={labels.placeholder}
              className="mt-2 w-full resize-none rounded-md border border-slate-200 bg-white px-3 py-2 text-sm leading-6 text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
            <div className="mt-2 flex items-center justify-between gap-3">
              <span className={`text-xs font-semibold ${status === "error" ? "text-red-600" : "text-emerald-700"}`}>
                {status === "success" ? labels.submitSuccess : status === "error" ? error : ""}
              </span>
            <button
              type="submit"
              disabled={status === "submitting" || message.trim().length < 2}
              className="flex h-8 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-md bg-emerald-700 px-3 text-xs font-semibold text-white transition-colors hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
                {status === "success" ? "check_circle" : "send"}
              </span>
              {status === "submitting" ? labels.submitting : labels.submit}
            </button>
            </div>
          </form>

          <div className="mt-4 grid grid-cols-2 gap-3">
            {CONTACT_QR_CHANNELS.map((channel) => (
              <div
                key={channel.key}
                className="relative flex"
                onMouseEnter={() => channel.src && setHoveredQr(channel.key)}
                onMouseLeave={() => setHoveredQr(null)}
              >
                <button
                  type="button"
                  onClick={() => channel.src && setActiveQr(channel)}
                  disabled={!channel.src}
                  className="flex w-full items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-left transition-colors hover:border-emerald-300 hover:bg-emerald-50/50 focus:outline-none focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-slate-200 disabled:hover:bg-white"
                >
                  <img
                    src={channel.logoUrl}
                    alt=""
                    className="h-6 w-6 shrink-0 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                  <span className="text-sm font-semibold text-slate-800">
                    {channel.label[lang]}
                  </span>
                  {!channel.src && (
                    <span className="ml-auto text-[10px] font-semibold text-slate-400">
                      {labels.qrPending}
                    </span>
                  )}
                </button>

                {hoveredQr === channel.key && (
                  <div className="absolute left-1/2 top-full z-[70] mt-2 w-36 -translate-x-1/2 animate-in fade-in zoom-in-95 duration-200">
                    <div className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-l border-t border-slate-200 bg-white shadow-[0px_0px_2px_rgba(0,0,0,0.1)]" />
                    <div className="relative overflow-hidden rounded-xl bg-white p-2 shadow-xl ring-1 ring-slate-200">
                      <div className="overflow-hidden rounded-lg bg-slate-50 ring-1 ring-inset ring-slate-100">
                        <img
                          src={channel.src}
                          alt={`${channel.label[lang]} QR Code`}
                          className="aspect-square w-full object-contain"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {activeQr && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-6 backdrop-blur-sm"
            onClick={() => setActiveQr(null)}
            role="dialog"
            aria-modal="true"
          >
            <div
              className="relative max-w-sm rounded-2xl bg-white p-3 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setActiveQr(null)}
                className="absolute -right-3 -top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-500 shadow-lg ring-1 ring-slate-200 transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>

              <div className="flex aspect-square min-w-[280px] items-center justify-center overflow-hidden rounded-xl bg-slate-50 ring-1 ring-inset ring-slate-100">
                <img
                  src={activeQr.src}
                  alt={`${activeQr.label[lang]} QR Code`}
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              <p className="mt-3 text-center text-sm font-semibold text-slate-800">
                {lang === "zh"
                  ? `扫描二维码关注${activeQr.label.zh}`
                  : `Scan to follow ${activeQr.label.en}`}
              </p>
            </div>
          </div>
      )}
    </>,
    document.body
  );
}

const copy = {
  zh: {
    contactEyebrow: "反馈给开发者",
    contactDesc: "遇到问题、想提建议，直接写在这里就行。",
    feedbackLabel: "反馈内容",
    placeholder: "请描述你遇到的问题或建议...",
    submit: "提交",
    submitting: "提交中...",
    submitSuccess: "已收到，感谢你帮龟迹变好。",
    submitError: "提交失败，请稍后再试。",
    shortError: "请至少输入 2 个字。",
    qrPending: "待上传",
    closeContact: "关闭反馈面板",
  },
  en: {
    contactEyebrow: "Send feedback",
    contactDesc: "Found an issue or have an idea? Send it straight to the project inbox.",
    feedbackLabel: "Feedback",
    placeholder: "Describe the issue or suggestion...",
    submit: "Submit",
    submitting: "Submitting...",
    submitSuccess: "Received. Thanks for helping improve CheloniaTrace.",
    submitError: "Submission failed. Please try again.",
    shortError: "Please enter at least 2 characters.",
    qrPending: "Pending",
    closeContact: "Close feedback panel",
  },
};
