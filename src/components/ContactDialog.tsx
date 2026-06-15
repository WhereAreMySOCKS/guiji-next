"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import type { Lang } from "@/lib/taxonomySlug";

const CONTACT_EMAIL = "paulmac1204@gmail.com";

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
  const [copied, setCopied] = useState(false);
  const [activeQr, setActiveQr] = useState<QrChannel | null>(null);
  const [hoveredQr, setHoveredQr] = useState<string | null>(null); // 新增：用于追踪当前悬浮的按钮
  const [mounted, setMounted] = useState(false);

  const labels = copy[lang];
  const mailHref = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(labels.emailSubject)}`;

  // 确保 Portal 只在客户端渲染，避免 Next.js 水合报错
  useEffect(() => {
    setMounted(true);
  }, []);

  async function copyEmail() {
    await navigator.clipboard.writeText(CONTACT_EMAIL);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
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
          <div className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 p-2.5 ring-1 ring-inset ring-slate-200">
            <div className="flex min-w-0 items-center gap-3">
              <span className="material-symbols-outlined shrink-0 text-[20px] text-emerald-700" aria-hidden="true">
                alternate_email
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase text-slate-500">{labels.emailLabel}</p>
                <a href={mailHref} className="block truncate text-sm font-bold text-slate-950 transition-colors hover:text-emerald-700">
                  {CONTACT_EMAIL}
                </a>
              </div>
            </div>
            <button
              type="button"
              onClick={copyEmail}
              className="flex h-7 shrink-0 cursor-pointer items-center justify-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 transition-colors hover:border-emerald-300 hover:text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            >
              <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
                {copied ? "check_circle" : "content_copy"}
              </span>
              {copied ? labels.emailCopied : labels.copyEmail}
            </button>
          </div>

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
    contactEyebrow: "联系开发者",
    contactDesc: "开发者是一个刚毕业的臭研究生，啥都可以聊",
    emailLabel: "邮箱",
    emailSubject: "龟迹项目交流",
    copyEmail: "复制",
    emailCopied: "已复制",
    qrPending: "待上传",
    closeContact: "关闭联系面板",
  },
  en: {
    contactEyebrow: "Contact",
    contactDesc: "Just a recent grad building this. Feel free to reach out and chat about anything!",
    emailLabel: "Email",
    emailSubject: "CheloniaTrace Inquiry",
    copyEmail: "Copy",
    emailCopied: "Copied",
    qrPending: "Pending",
    closeContact: "Close contact panel",
  },
};
