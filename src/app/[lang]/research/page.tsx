import Link from "next/link";
import type { Metadata } from "next";
import MetricCard from "@/components/research/MetricCard";
import SiteFooter from "@/components/layout/SiteFooter";
import SiteHeader from "@/components/layout/SiteHeader";
import SourceLevelBadge from "@/components/research/SourceLevelBadge";
import { getResearchSummary } from "@/lib/research";
import { pageMetadata } from "@/lib/seo";
import type { Lang } from "@/lib/taxonomySlug";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  return pageMetadata({
    lang,
    titleZh: "研究资料库 | 来源与证据 | 龟迹 CheloniaTrace",
    titleEn: "Research Database | Sources & Evidence | CheloniaTrace",
    descZh: "查看龟迹策略背后的资料来源与结构化证据，了解每条饲养建议的科学依据。",
    descEn: "Explore the sources and structured evidence behind CheloniaTrace feeding strategies.",
    path: "/research",
    keywords: ["研究资料库", "来源", "证据", "龟类研究", "文献", "龟迹"],
  });
}

export default async function ResearchHomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params;
  const lang = (rawLang === "en" ? "en" : "zh") as Lang;
  const summary = await getResearchSummary();

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <SiteHeader lang={lang} />
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <p className="text-sm font-bold uppercase text-sky-700">{lang === "zh" ? "资料来源" : "Research database"}</p>
          <h1 className="mt-3 max-w-4xl text-4xl font-bold leading-tight">
            {lang === "zh" ? "每条饲养建议，都有确切依据" : "Public entry for CheloniaTrace sources, evidence, and strategy provenance."}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
            {lang === "zh"
              ? "龟迹的资料来源可分为：L1级-公开权威数据库、L2级-核心期刊会议论文研究、L3级-养殖专家指南三层；层层交叉验证，确保可靠无误。"
              : "This page exposes source collection, species evidence, source levels, import runs, and coverage scores."}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={`/${lang}/research/species`} className="rounded-lg bg-emerald-700 px-5 py-3 font-bold text-white hover:bg-emerald-800">
              {lang === "zh" ? "支持的物种" : "Species evidence"}
            </Link>
            <Link href={`/${lang}/research/sources`} className="rounded-lg border border-slate-300 bg-white px-5 py-3 font-bold text-slate-700 hover:border-sky-300 hover:text-sky-800">
              {lang === "zh" ? "查看来源清单" : "Source list"}
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label={lang === "zh" ? "来源总数" : "Sources"} value={summary?.total_sources ?? "-"} />
          <MetricCard label={lang === "zh" ? "证据条目" : "Evidence"} value={summary?.total_evidence_claims ?? "-"} />
          <MetricCard label={lang === "zh" ? "物种评分" : "Species scores"} value={summary?.total_taxon_scores ?? "-"} />
          <MetricCard label={lang === "zh" ? "平均评分" : "Average score"} value={summary?.average_score ?? "-"} />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <LevelPanel title={lang === "zh" ? "来源等级分布" : "Source levels"} items={summary?.sources_by_level ?? []} />
          <LevelPanel title={lang === "zh" ? "证据等级分布" : "Evidence levels"} items={summary?.evidence_by_level ?? []} />
        </div>

        <div className="mt-8 rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-bold text-slate-950">{lang === "zh" ? "最近导入" : "Latest import"}</h2>
          {summary?.latest_import ? (
            <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-4">
              <Info label="status" value={summary.latest_import.status} />
              <Info label="source" value={summary.latest_import.source} />
              <Info label="started" value={formatDate(summary.latest_import.started_at)} />
              <Info label="finished" value={summary.latest_import.finished_at ? formatDate(summary.latest_import.finished_at) : "-"} />
            </dl>
          ) : (
            <p className="mt-3 text-sm text-slate-500">{lang === "zh" ? "暂无导入记录。" : "No import run found."}</p>
          )}
        </div>

        <section className="mt-8 rounded-lg border border-slate-200 bg-white p-6">
          <p className="text-sm font-bold uppercase text-emerald-700">
            {lang === "zh" ? "我们如何搜集数据" : "How data is collected"}
          </p>
          <h2 className="mt-2 text-2xl font-bold text-slate-950">
            {lang === "zh" ? "先分清资料靠不靠谱，再把有用信息落到具体物种和参数。" : "Sources are ranked, then evidence is linked to taxa, parameters, and originals."}
          </h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {(lang === "zh" ? zhMethod : enMethod).map((item) => (
              <article key={item.title} className="rounded-lg bg-slate-50 p-4">
                <h3 className="font-bold text-slate-950">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.desc}</p>
              </article>
            ))}
          </div>
        </section>
      </section>
      <SiteFooter lang={lang} />
    </main>
  );
}

function LevelPanel({ title, items }: { title: string; items: Array<{ level: string; count: number }> }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5">
      <h2 className="text-lg font-bold text-slate-950">{title}</h2>
      <div className="mt-4 grid gap-3">
        {items.map((item) => (
          <div key={item.level} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 p-3">
            <SourceLevelBadge level={item.level} />
            <span className="text-sm font-bold text-slate-700">{item.count}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase text-slate-400">{label}</dt>
      <dd className="mt-1 font-semibold text-slate-800">{value}</dd>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

const zhMethod = [
  {
    title: "来源分层",
    desc: "L1 放权威物种数据库，L2 放论文、论文集和数据集，L3 用专业饲养指南补足实际饲养里的安全边界。",
  },
  {
    title: "证据结构化",
    desc: "能保留的都尽量保留：物种、参数、数值、单位、页码或表格、作者、年份和访问状态。",
  },
  {
    title: "只用能解释的参数",
    desc: "进入策略计算前，资料会被整理成温度、食性、喂食间隔、冬眠和晒背等可以说明白的参数。",
  },
];

const enMethod = [
  {
    title: "Source levels",
    desc: "L1 covers authority databases, L2 covers papers and datasets, and L3 calibrates safety margins with expert care guides.",
  },
  {
    title: "Structured evidence",
    desc: "Evidence keeps taxon, parameter, value, unit, page/table, author, year, and access status where available.",
  },
  {
    title: "Explainable strategy inputs",
    desc: "The strategy layer uses interpretable parameters such as temperature, diet, interval, brumation, and basking traits.",
  },
];
