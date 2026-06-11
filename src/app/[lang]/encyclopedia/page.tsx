import Link from "next/link";
import type { Metadata } from "next";
import SiteFooter from "@/components/layout/SiteFooter";
import SiteHeader from "@/components/layout/SiteHeader";
import { pageMetadata } from "@/lib/seo";
import type { Lang } from "@/lib/taxonomySlug";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  return pageMetadata({
    lang,
    titleZh: "龟鳖百科 | 龟鳖目物种树与特征数据 | 龟迹 CheloniaTrace",
    titleEn: "Turtle Encyclopedia | Testudines Species Tree | CheloniaTrace",
    descZh: "浏览完整龟鳖目物种树，查看分类、特征参数与影像资料。",
    descEn: "Browse the complete Testudines taxonomy tree with species traits, images, and classification data.",
    path: "/encyclopedia",
    keywords: ["龟鳖百科", "龟鳖目", "物种树", "乌龟分类", "龟类特征", "龟迹"],
  });
}

export default async function EncyclopediaLandingPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params;
  const lang = (rawLang === "en" ? "en" : "zh") as Lang;
  const labels = copy[lang];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <SiteHeader lang={lang} active="taxonomy" />

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
          <p className="text-sm font-bold uppercase text-emerald-700">{labels.eyebrow}</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold leading-tight text-slate-950 sm:text-5xl">
            {labels.h1}
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">{labels.lead}</p>
          <Link
            href={`/${lang}/taxonomy`}
            className="mt-8 inline-flex h-12 items-center rounded-lg bg-emerald-700 px-6 text-base font-bold text-white transition-colors hover:bg-emerald-800"
          >
            {labels.cta}
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-3">
          {labels.cards.map((card) => (
            <article key={card.title} className="rounded-lg border border-slate-200 bg-white p-6">
              <span className="material-symbols-outlined text-3xl text-emerald-700">{card.icon}</span>
              <h2 className="mt-4 text-lg font-bold text-slate-950">{card.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{card.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <SiteFooter lang={lang} />
    </main>
  );
}

const copy = {
  zh: {
    eyebrow: "龟鳖百科",
    h1: "想了解更多龟鳖目知识？",
    lead: "基于IUCN 2025的最新物种分类建立物种树，附带高清物种详情页与AI导读～",
    cta: "查看物种百科",
    cards: [
      {
        icon: "account_tree",
        title: "完整物种树",
        desc: "从目到科的层级分类，一目了然浏览龟鳖目全部分类。",
      },
      {
        icon: "description",
        title: "物种特征数据",
        desc: "每物种收录温度、食性、体型等关键特征参数。",
      },
      {
        icon: "image",
        title: "影像资料",
        desc: "配合物种图片，直观了解不同龟类的外观特征。",
      },
    ],
  },
  en: {
    eyebrow: "Encyclopedia",
    h1: "Explore Testudines beyond feeding.",
    lead: "A structured turtle taxonomy tree with species pages, Latin names, synonyms, and trait data.",
    cta: "Open encyclopedia",
    cards: [
      {
        icon: "account_tree",
        title: "Complete species tree",
        desc: "Browse the full Testudines taxonomy from order to family with clear hierarchy.",
      },
      {
        icon: "description",
        title: "Species trait data",
        desc: "Key parameters including temperature, diet, and size for each species.",
      },
      {
        icon: "image",
        title: "Image gallery",
        desc: "Visual references to help identify different turtle species.",
      },
    ],
  },
};
