import type { Metadata } from "next";
import CalculatorPanel from "@/components/calculator/CalculatorPanel";
import SiteFooter from "@/components/layout/SiteFooter";
import SiteHeader from "@/components/layout/SiteHeader";
import { pageMetadata } from "@/lib/seo";
import type { Lang } from "@/lib/taxonomySlug";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  return pageMetadata({
    lang,
    titleZh: "智能喂食策略 | 龟类喂食在线计算 | 龟迹 CheloniaTrace",
    titleEn: "Smart Feeding Strategy | Turtle Feeding Calculator | CheloniaTrace",
    descZh: "根据物种、水温、年龄和体重，一键计算基于研究数据的科学喂食建议。",
    descEn: "Calculate research-backed turtle feeding advice based on species, temperature, age, and weight.",
    path: "/tools/feeding-strategy",
    keywords: ["智能喂食", "龟类喂食策略", "乌龟喂食计算器", "在线计算", "龟迹"],
  });
}

export default async function FeedingStrategyToolPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams?: Promise<{
    species?: string;
    temp?: string;
    age?: string;
    weight?: string;
    goal?: string;
    city?: string;
    calculate?: string;
  }>;
}) {
  const { lang: rawLang } = await params;
  const lang = (rawLang === "en" ? "en" : "zh") as Lang;
  const query = searchParams ? await searchParams : {};
  const labels = copy[lang];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <SiteHeader lang={lang} active="tool" />
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="mb-6">
          <p className="text-sm font-bold uppercase text-emerald-700">{labels.eyebrow}</p>
          <h1 className="mt-3 max-w-3xl whitespace-pre-line text-4xl font-bold leading-tight text-slate-950 sm:text-5xl">
            {labels.h1}
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">{labels.lead}</p>
        </div>

        <CalculatorPanel
          lang={lang}
          initialSpecies={query.species || ""}
          initialWaterTemp={query.temp || "26"}
          initialAgeMonths={query.age || "18"}
          initialWeight={query.weight || "300"}
          initialGoal={isGoal(query.goal) ? query.goal : "健康日常"}
          initialCity={query.city || "shanghai"}
          autoSubmit={query.calculate === "1"}
        />
      </section>
      <SiteFooter lang={lang} />
    </main>
  );
}

function isGoal(value: string | undefined): value is "健康日常" | "发色需求" | "快速生长" {
  return value === "健康日常" || value === "发色需求" || value === "快速生长";
}

const copy = {
  zh: {
    eyebrow: "智能喂食策略",
    h1: "新手不知道喂什么、喂多少？\n帮你制定喂食策略",
    lead: "数据来源于权威物种库、相关学术论文以及经过验证的权威养殖经验。",
  },
  en: {
    eyebrow: "Feeding strategy",
    h1: "Calculate turtle feeding advice with species data.",
    lead: "The estimate is based on taxonomy databases, academic sources, and curated husbandry references.",
  },
};
