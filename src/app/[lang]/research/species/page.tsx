import Link from "next/link";
import type { Metadata } from "next";
import SiteFooter from "@/components/layout/SiteFooter";
import SiteHeader from "@/components/layout/SiteHeader";
import { getResearchSpecies } from "@/lib/research";
import { pageMetadata } from "@/lib/seo";
import type { Lang } from "@/lib/taxonomySlug";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  return pageMetadata({
    lang,
    titleZh: "物种证据 | 研究资料库 | 龟迹 CheloniaTrace",
    titleEn: "Species Evidence | Research Database | CheloniaTrace",
    descZh: "查看各龟类物种的结构化策略证据，包括温度、食性、喂食间隔等参数来源。",
    descEn: "Explore structured strategy evidence for turtle species including temperature, diet, and feeding intervals.",
    path: "/research/species",
    keywords: ["物种证据", "龟类参数", "策略来源", "龟迹"],
  });
}

export default async function ResearchSpeciesPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams?: Promise<{ q?: string; min_score?: string; page?: string }>;
}) {
  const { lang: rawLang } = await params;
  const lang = (rawLang === "en" ? "en" : "zh") as Lang;
  const query = searchParams ? await searchParams : {};
  const data = await getResearchSpecies({ ...query, size: "40" });
  const page = Number(query.page || "1");

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <SiteHeader lang={lang} />
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <Header title={lang === "zh" ? "物种证据与评分" : "Species evidence and scores"} desc={lang === "zh" ? "按物种查看资料覆盖评分、整理状态和对应的分类节点。" : "Inspect species coverage scores, curation status, and taxonomy links."} />
        <SpeciesFilter lang={lang} q={query.q || ""} minScore={query.min_score || ""} />
        <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="grid grid-cols-[minmax(0,1.25fr)_80px_minmax(120px,0.85fr)] gap-3 border-b border-slate-200 bg-slate-100 px-4 py-3 text-xs font-bold uppercase text-slate-500 sm:grid-cols-[minmax(0,1.45fr)_120px_minmax(220px,1fr)]">
            <span>{lang === "zh" ? "物种" : "Species"}</span>
            <span>{lang === "zh" ? "评分" : "Score"}</span>
            <span>{lang === "zh" ? "状态" : "Status"}</span>
          </div>
          {(data?.species ?? []).map((item) => (
            <article key={item.id} className="grid grid-cols-[minmax(0,1.25fr)_80px_minmax(120px,0.85fr)] gap-3 border-b border-slate-100 px-4 py-4 last:border-0 sm:grid-cols-[minmax(0,1.45fr)_120px_minmax(220px,1fr)]">
              <div className="min-w-0">
                <p className="truncate font-bold text-slate-950">{standardName(item, lang)}</p>
                <p className="truncate text-sm italic text-slate-500">{item.taxonomy?.latin_name || item.accepted_latin_name}</p>
                {item.common_name_zh && item.common_name_zh !== item.taxonomy?.name_zh && (
                  <p className="truncate text-xs text-slate-400">
                    {lang === "zh" ? "采集别名：" : "Collected alias: "}
                    {item.common_name_zh}
                  </p>
                )}
              </div>
              <span className="font-bold text-sky-700">{item.score ?? "-"}</span>
              <span className="min-w-0 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold leading-6 text-slate-600">{formatStatus(item.status, lang)}</span>
            </article>
          ))}
          {data && data.species.length === 0 && <p className="p-6 text-sm text-slate-500">{lang === "zh" ? "没有匹配物种。" : "No matching species."}</p>}
        </div>
        <Pager lang={lang} basePath={`/${lang}/research/species`} page={page} total={data?.total ?? 0} q={query.q} minScore={query.min_score} />
      </section>
      <SiteFooter lang={lang} />
    </main>
  );
}

type SpeciesItem = NonNullable<Awaited<ReturnType<typeof getResearchSpecies>>>["species"][number];

function standardName(item: SpeciesItem, lang: Lang) {
  if (lang === "zh") {
    return item.taxonomy?.name_zh || item.accepted_latin_name;
  }
  return item.taxonomy?.name_en || item.taxonomy?.latin_name || item.accepted_latin_name;
}

function formatStatus(status: string | null | undefined, lang: Lang) {
  if (!status) return "-";
  if (lang === "en") return status.replaceAll("_", " ");
  const labels: Record<string, string> = {
    complete: "资料较完整",
    partial: "资料待补充",
    sparse: "资料较少",
    pending: "待整理",
    needs_review: "需要复核",
  };
  return labels[status] || status.replaceAll("_", " ");
}

function Header({ title, desc }: { title: string; desc: string }) {
  return (
    <div>
      <p className="text-sm font-bold uppercase text-sky-700">Research</p>
      <h1 className="mt-3 text-4xl font-bold text-slate-950">{title}</h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">{desc}</p>
    </div>
  );
}

function SpeciesFilter({ lang, q, minScore }: { lang: Lang; q: string; minScore: string }) {
  return (
    <form className="mt-6 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-[1fr_180px_auto]">
      <input name="q" defaultValue={q} placeholder={lang === "zh" ? "搜索中文名、拉丁名或状态" : "Search name or status"} className="h-11 rounded-lg border border-slate-300 px-4 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
      <input name="min_score" defaultValue={minScore} placeholder={lang === "zh" ? "最低评分" : "Min score"} type="number" min="0" max="10" className="h-11 rounded-lg border border-slate-300 px-4 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
      <button className="h-11 rounded-lg bg-sky-700 px-5 font-bold text-white hover:bg-sky-800">{lang === "zh" ? "筛选" : "Filter"}</button>
    </form>
  );
}

function Pager({ lang, basePath, page, total, q, minScore }: { lang: Lang; basePath: string; page: number; total: number; q?: string; minScore?: string }) {
  const prev = Math.max(1, page - 1);
  const next = page + 1;
  const hasNext = page * 40 < total;
  const query = (nextPage: number) => {
    const params = new URLSearchParams();
    params.set("page", String(nextPage));
    if (q) params.set("q", q);
    if (minScore) params.set("min_score", minScore);
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
