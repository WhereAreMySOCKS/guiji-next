import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import CalculatorPanel from "@/components/calculator/CalculatorPanel";
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
    titleZh: "智能喂食策略 | 龟类喂食在线计算 | 龟迹 CheloniaTrace",
    titleEn: "Smart Feeding Strategy | Turtle Feeding Calculator | CheloniaTrace",
    descZh: "输入物种、水温、年龄和体重，基于研究数据一键计算科学的龟类喂食建议。",
    descEn: "Enter species, water temperature, age, and weight for research-backed turtle feeding advice.",
    path: "",
    keywords: ["智能喂食", "龟类喂食策略", "乌龟喂食计算器", "在线计算", "龟迹"],
  });
}

export default async function Home({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams?: Promise<{ focus?: string }>;
}) {
  const { lang: rawLang } = await params;
  const lang = resolveLang(rawLang);
  const query = searchParams ? await searchParams : {};
  if (query.focus) {
    redirect(`/${lang}/taxonomy?focus=${encodeURIComponent(query.focus)}`);
  }

  const summary = await getResearchSummary();
  const labels = copy[lang];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <SiteHeader lang={lang} active="tool" />

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_520px] lg:py-14">
          <div className="flex flex-col justify-center lg:pt-10">
            <p className="text-sm font-bold uppercase text-emerald-700">{labels.eyebrow}</p>
            <h1 className="mt-3 max-w-3xl whitespace-pre-line text-4xl font-bold leading-tight text-slate-950 sm:text-5xl">
              {labels.h1}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">{labels.lead}</p>
          </div>
          <CalculatorPanel lang={lang} compact redirectOnSubmit />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-bold uppercase text-sky-700">{labels.dataEyebrow}</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-950">{labels.dataTitle}</h2>
          </div>
          <Link href={`/${lang}/research`} className="text-sm font-bold text-sky-700 hover:text-sky-900">
            {labels.openResearch}
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label={labels.sources} value={summary?.total_sources ?? "-"} detail={labels.sourcesDetail} />
          <MetricCard label={labels.evidence} value={summary?.total_evidence_claims ?? "-"} detail={labels.evidenceDetail} />
          <MetricCard label={labels.speciesScores} value={summary?.total_taxon_scores ?? "-"} detail={labels.speciesScoresDetail} />
          <MetricCard label={labels.avgScore} value={summary?.average_score ?? "-"} detail={labels.avgScoreDetail} />
        </div>
        {summary && (
          <div className="mt-5 flex flex-wrap gap-2">
            {summary.sources_by_level.map((item) => (
              <span key={item.level} className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-semibold text-slate-600 ring-1 ring-slate-200">
                <SourceLevelBadge level={item.level} />
                {item.count}
              </span>
            ))}
          </div>
        )}
      </section>

      <SiteFooter lang={lang} />
    </main>
  );
}

function resolveLang(lang: string): Lang {
  return lang === "en" ? "en" : "zh";
}

const copy = {
  zh: {
    eyebrow: "智能喂食策略",
    h1: "新手不知道喂什么、喂多少？\n帮你制定喂食策略",
    lead: "数据来源于专业物种库、相关学术论文以及经过验证的权威养殖经验。",
    dataEyebrow: "所有策略均参考权威资料",
    dataTitle: "来源、证据和物种覆盖",
    openResearch: "查看资料库",
    sources: "资料来源",
    sourcesDetail: "物种库、论文、指南和补充材料",
    evidence: "证据条目",
    evidenceDetail: "整理成温度、食性、间隔等参数",
    speciesScores: "物种覆盖",
    speciesScoresDetail: "按资料完整度统计的条目",
    avgScore: "覆盖均分",
    avgScoreDetail: "用于判断资料是否足够扎实",
  },
  en: {
    eyebrow: "Turtle care decision entry",
    h1: "Calculate turtle feeding advice with species data and research provenance.",
    lead: "CheloniaTrace provides one-off feeding estimates, research provenance, and turtle taxonomy pages. Long-term tracking lives in the app.",
    dataEyebrow: "Traceable data foundation",
    dataTitle: "Sources, evidence, and species coverage",
    openResearch: "Open database",
    sources: "Sources",
    sourcesDetail: "Databases, papers, guides, and extra sources",
    evidence: "Evidence",
    evidenceDetail: "Structured species parameter evidence",
    speciesScores: "Species scores",
    speciesScoresDetail: "Coverage quality by taxon",
    avgScore: "Average score",
    avgScoreDetail: "Overall coverage reference",
  },
};
