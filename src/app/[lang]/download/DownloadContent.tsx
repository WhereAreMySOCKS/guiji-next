"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import EmailWaitlist from "@/components/EmailWaitlist";
import ScreenshotCarousel from "@/components/ScreenshotCarousel";
import SiteFooter from "@/components/layout/SiteFooter";
import SiteHeader from "@/components/layout/SiteHeader";
import type { Lang } from "@/lib/taxonomySlug";

const layoutTransition = { type: "spring", bounce: 0.15, duration: 0.6 } as const;

export default function DownloadContent({ lang }: { lang: Lang }) {
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsExpanded(false);
    };
    window.addEventListener("keydown", onKey);
    
    if (isExpanded) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isExpanded]);

  const labels = copy[lang];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <SiteHeader lang={lang} active="download" />

      <section className="relative border-b border-slate-200 bg-white overflow-hidden">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            
            <div 
              className={`transition-all duration-500 ease-out z-10 ${
                isExpanded ? "opacity-20 blur-sm -translate-x-8" : "opacity-100 translate-x-0"
              }`}
            >
              <p className="text-sm font-bold uppercase text-emerald-700">{labels.eyebrow}</p>
              <h1 className="mt-3 text-4xl font-bold leading-tight text-slate-950 sm:text-5xl">
                {labels.h1}
              </h1>
              {labels.lead && (
                <p className="mt-5 text-lg leading-8 text-slate-600">{labels.lead}</p>
              )}
              <div className="mt-8">
                <EmailWaitlist lang={lang} sourcePage={`/${lang}/download`} />
              </div>
            </div>

            <div className="hidden lg:block relative w-[300px]">
              <div className="w-full aspect-[9/19.5] pointer-events-none opacity-0" />

              <AnimatePresence>
                {!isExpanded && (
                  <motion.div
                    layoutId="phone-mockup"
                    className="absolute inset-0 cursor-pointer z-20"
                    onClick={() => setIsExpanded(true)}
                    whileHover={{ scale: 1.02, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    transition={layoutTransition}
                    title="点击放大查看截图"
                  >
                    <div className="w-full h-full pointer-events-none">
                      {/* 【修改点】：在缩略图模式下传入 hideDots */}
                      <ScreenshotCarousel paused hideDots />
                    </div>
                    {/* 调整了一下“点击放大”的文字位置，因为去掉了点点，间距可以更紧凑 */}
                    <p className="absolute -bottom-6 left-0 w-full text-center text-xs text-slate-400 select-none flex items-center justify-center gap-1">
                      <span className="material-symbols-outlined text-sm">touch_app</span>
                      点击放大
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      <section 
        className={`mx-auto max-w-5xl px-4 py-12 sm:px-6 transition-opacity duration-500 ${
          isExpanded ? "opacity-10" : "opacity-100"
        }`}
      >
        <div className="mt-8 grid gap-6 sm:grid-cols-4">
          {labels.features.map((f) => (
            <article key={f.title} className="rounded-lg border border-slate-200 bg-white p-5">
              <span className="material-symbols-outlined text-2xl text-emerald-700">{f.icon}</span>
              <h2 className="mt-3 text-base font-bold text-slate-950">{f.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{f.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <SiteFooter lang={lang} />

      <AnimatePresence>
        {isExpanded && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-md cursor-pointer"
              onClick={() => setIsExpanded(false)}
            />

            <motion.div
              layoutId="phone-mockup"
              className="relative z-50"
              style={{
                height: "85vh",
                maxHeight: "900px",
                aspectRatio: "9 / 19.5"
              }}
              transition={layoutTransition}
            >
              <div className="w-full h-full shadow-2xl rounded-[2.5rem]">
                <ScreenshotCarousel paused={false} />
              </div>

              {/* 【修改点】：全新的关闭按钮样式与动画 */}
              <motion.button
                initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.5, rotate: 90 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                onClick={() => setIsExpanded(false)}
                className="absolute -top-4 -right-4 flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-600 shadow-xl ring-1 ring-black/5 hover:scale-110 hover:text-slate-900 transition-all cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-500"
                aria-label="关闭"
              >
                <span className="material-symbols-outlined text-xl font-bold">close</span>
              </motion.button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}

const copy: Record<Lang, {
  eyebrow: string;
  h1: string;
  lead: string;
  features: { icon: string; title: string; desc: string }[];
}> = {
  zh: {
    eyebrow: "下载",
    h1: "APP正在抓紧开发中...",
    lead: "不做简单的记录工具，而是你专属的智能养龟助手！",
    features: [
      { icon: "history", title: "长期饲养记录", desc: "体重、水温、喂食历史留存，复盘有据可依。" },
      { icon: "notifications", title: "定期喂食提醒", desc: "根据策略追踪下次喂食时间，到了再提醒。" },
      { icon: "sync", title: "动态策略更新", desc: "季节变化、体重波动后自动重新计算喂食策略。" },
      { icon: "devices", title: "米家设备联动", desc: "接入米家智能设备，按策略自动化控制环境。" },
    ],
  },
  en: {
    eyebrow: "Download",
    h1: "Download Gui Ji for more care features",
    lead: "Use the web for one-off estimates and research lookup; use the app for long-term care, reminders, and strategy refreshes.",
    features: [
      { icon: "history", title: "Long-term records", desc: "Keep weight, temperature, and feeding history for review." },
      { icon: "notifications", title: "Feeding reminders", desc: "Track next feeding time from your active strategy." },
      { icon: "sync", title: "Dynamic strategies", desc: "Auto-refresh after seasonal changes or weight shifts." },
      { icon: "devices", title: "Mijia automation", desc: "Connect Xiaomi smart home devices for automated control." },
    ],
  },
};