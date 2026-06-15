import Link from "next/link";
import type { Lang } from "@/lib/taxonomySlug";
import HeaderContactButton from "./HeaderContactButton";

type Active = "home" | "tool" | "taxonomy" | "download";

export default function SiteHeader({ lang, active = "home" }: { lang: Lang; active?: Active }) {
  const labels = copy[lang];
  const items: Array<{ key: Active; href: string; label: string }> = [
    { key: "tool", href: `/${lang}`, label: labels.tool },
    { key: "taxonomy", href: `/${lang}/encyclopedia`, label: labels.taxonomy },
    { key: "download", href: `/${lang}/download`, label: labels.download },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href={`/${lang}`} className="flex items-center gap-3">
          <span className="text-xl font-bold text-emerald-700">龟迹</span>
          <span className="hidden border-l border-slate-200 pl-3 text-sm font-semibold text-slate-500 sm:inline">
            CheloniaTrace
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label={labels.nav}>
          {items.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                active === item.key ? "bg-emerald-50 text-emerald-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <HeaderContactButton lang={lang} />
          <Link
            href={`/${lang === "zh" ? "en" : "zh"}`}
            className="inline-flex h-10 items-center rounded-full border border-slate-200 px-3 text-sm font-semibold text-slate-600 transition-colors hover:border-emerald-300 hover:text-emerald-700"
          >
            {lang === "zh" ? "EN" : "中文"}
          </Link>
        </div>
      </div>
    </header>
  );
}

const copy = {
  zh: {
    nav: "主导航",
    tool: "智能喂食",
    research: "资料来源",
    taxonomy: "百科",
    download: "下载",
  },
  en: {
    nav: "Primary navigation",
    tool: "Calculator",
    research: "Research",
    taxonomy: "Encyclopedia",
    download: "Download",
  },
};
