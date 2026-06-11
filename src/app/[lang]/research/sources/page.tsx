import Link from "next/link";
import type { Metadata } from "next";
import SiteFooter from "@/components/layout/SiteFooter";
import SiteHeader from "@/components/layout/SiteHeader";
import SourceLevelBadge from "@/components/research/SourceLevelBadge";
import { getResearchSources } from "@/lib/research";
import { pageMetadata } from "@/lib/seo";
import type { Lang } from "@/lib/taxonomySlug";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  return pageMetadata({
    lang,
    titleZh: "来源清单 | 研究资料库 | 龟迹 CheloniaTrace",
    titleEn: "Source List | Research Database | CheloniaTrace",
    descZh: "浏览龟迹策略参考的全部资料来源，按等级和类型筛选文献、数据库和指南。",
    descEn: "Browse all sources referenced by CheloniaTrace strategies, filterable by level and type.",
    path: "/research/sources",
    keywords: ["来源清单", "文献", "数据库", "研究来源", "龟迹"],
  });
}

export default async function ResearchSourcesPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams?: Promise<{ q?: string; source_level?: string; access_status?: string; page?: string }>;
}) {
  const { lang: rawLang } = await params;
  const lang = (rawLang === "en" ? "en" : "zh") as Lang;
  const query = searchParams ? await searchParams : {};
  const data = await getResearchSources({ ...query, size: "40" });
  const page = Number(query.page || "1");

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <SiteHeader lang={lang} />
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div>
          <p className="text-sm font-bold uppercase text-sky-700">Sources</p>
          <h1 className="mt-3 text-4xl font-bold text-slate-950">{lang === "zh" ? "原始来源" : "Original sources"}</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
            {lang === "zh" ? "按等级筛选论文、数据库和指南，查看标题、作者、年份、DOI 和公开来源链接。" : "Browse papers, databases, guides, authors, years, DOIs, and public source links."}
          </p>
        </div>
        <SourceFilter lang={lang} q={query.q || ""} level={query.source_level || ""} accessStatus={query.access_status || ""} />
        <div className="mt-6 grid gap-3">
          {(data?.sources ?? []).map((source) => (
            <Link key={source.id} href={`/${lang}/research/sources/${source.id}`} className="rounded-lg border border-slate-200 bg-white p-4 transition-colors hover:border-emerald-300 hover:bg-emerald-50">
              <div className="flex flex-wrap items-center gap-2">
                <SourceLevelBadge level={source.source_level} />
                {source.access_status && <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">{source.access_status}</span>}
                {source.year && <span className="text-xs font-bold text-slate-500">{source.year}</span>}
              </div>
              <h2 className="mt-3 text-lg font-bold text-slate-950">{source.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{source.authors || (lang === "zh" ? "作者未标注" : "Authors not recorded")}</p>
              <p className="mt-2 truncate text-xs text-slate-500">{source.doi || source.url || (lang === "zh" ? "暂无公开 DOI 或链接" : "No public DOI or link")}</p>
            </Link>
          ))}
          {data && data.sources.length === 0 && <p className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-500">{lang === "zh" ? "没有匹配来源。" : "No matching sources."}</p>}
        </div>
        <Pager lang={lang} basePath={`/${lang}/research/sources`} page={page} total={data?.total ?? 0} q={query.q} level={query.source_level} accessStatus={query.access_status} />
      </section>
      <SiteFooter lang={lang} />
    </main>
  );
}

function SourceFilter({ lang, q, level, accessStatus }: { lang: Lang; q: string; level: string; accessStatus: string }) {
  return (
    <form className="mt-6 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-[1fr_180px_180px_auto]">
      <input name="q" defaultValue={q} placeholder={lang === "zh" ? "搜索标题、作者、DOI、支持物种" : "Search title, author, DOI"} className="h-11 rounded-lg border border-slate-300 px-4 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
      <select name="source_level" defaultValue={level} className="h-11 rounded-lg border border-slate-300 px-4 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100">
        <option value="">{lang === "zh" ? "全部等级" : "All levels"}</option>
        <option value="L1">L1</option>
        <option value="L2">L2</option>
        <option value="L3">L3</option>
        <option value="research_extra">research_extra</option>
      </select>
      <input name="access_status" defaultValue={accessStatus} placeholder={lang === "zh" ? "访问状态" : "Access status"} className="h-11 rounded-lg border border-slate-300 px-4 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
      <button className="h-11 rounded-lg bg-sky-700 px-5 font-bold text-white hover:bg-sky-800">{lang === "zh" ? "筛选" : "Filter"}</button>
    </form>
  );
}

function Pager({ lang, basePath, page, total, q, level, accessStatus }: { lang: Lang; basePath: string; page: number; total: number; q?: string; level?: string; accessStatus?: string }) {
  const prev = Math.max(1, page - 1);
  const next = page + 1;
  const hasNext = page * 40 < total;
  const query = (nextPage: number) => {
    const params = new URLSearchParams();
    params.set("page", String(nextPage));
    if (q) params.set("q", q);
    if (level) params.set("source_level", level);
    if (accessStatus) params.set("access_status", accessStatus);
    return `${basePath}?${params.toString()}`;
  };
  return (
    <div className="mt-5 flex items-center justify-between text-sm font-semibold text-slate-600">
      <span>{lang === "zh" ? `共 ${total} 条` : `${total} total`}</span>
      <div className="flex gap-2">
        <Link aria-disabled={page <= 1} href={query(prev)} className={`rounded-lg border px-4 py-2 ${page <= 1 ? "pointer-events-none border-slate-200 text-slate-300" : "border-slate-300 hover:border-sky-300"}`}>{lang === "zh" ? "上一页" : "Prev"}</Link>
        <Link aria-disabled={!hasNext} href={query(next)} className={`rounded-lg border px-4 py-2 ${!hasNext ? "pointer-events-none border-slate-200 text-slate-300" : "border-slate-300 hover:border-sky-300"}`}>{lang === "zh" ? "下一页" : "Next"}</Link>
      </div>
    </div>
  );
}
