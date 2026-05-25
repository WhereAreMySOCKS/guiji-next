import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  findTaxonEntry,
  getTaxonEntries,
  localizedTaxonUrl,
  SITE_URL,
  taxonDescription,
  taxonTitle,
} from "@/lib/taxonomy";
import { nodeDisplayName, rankLabel, type Lang } from "@/lib/taxonomySlug";

type PageProps = {
  params: Promise<{ lang: string; slug: string }>;
};

export const dynamicParams = true;
export const revalidate = 3600;

function resolveLang(lang: string): Lang {
  return lang === "en" ? "en" : "zh";
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang: rawLang, slug } = await params;
  const lang = resolveLang(rawLang);
  const entry = await findTaxonEntry(slug);

  if (!entry) {
    return {
      title: lang === "zh" ? "分类节点未找到 | 龟迹" : "Taxon Not Found | CheloniaTrace",
      robots: { index: false, follow: false },
    };
  }

  const title = taxonTitle(entry, lang);
  const description = taxonDescription(entry, lang);
  const url = localizedTaxonUrl(lang, entry.slug);

  return {
    title,
    description,
    keywords: [
      nodeDisplayName(entry.node, lang),
      entry.node.name,
      entry.node.english_name,
      entry.node.latin_name,
      entry.node.rank,
      lang === "zh" ? "乌龟分类" : "turtle taxonomy",
      lang === "zh" ? "乌龟大全" : "turtle species database",
      lang === "zh" ? "龟鳖目图鉴" : "Testudines database",
    ].filter(Boolean) as string[],
    alternates: {
      canonical: url,
      languages: {
        "zh-CN": localizedTaxonUrl("zh", entry.slug),
        "en-US": localizedTaxonUrl("en", entry.slug),
      },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "CheloniaTrace",
      locale: lang === "zh" ? "zh_CN" : "en_US",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export async function generateStaticParams() {
  const entries = await getTaxonEntries();
  return entries.flatMap((entry) => [
    { lang: "zh", slug: entry.slug },
    { lang: "en", slug: entry.slug },
  ]);
}

export default async function TaxonDetailPage({ params }: PageProps) {
  const { lang: rawLang, slug } = await params;
  const lang = resolveLang(rawLang);
  const entry = await findTaxonEntry(slug);

  if (!entry) notFound();

  const currentName = nodeDisplayName(entry.node, lang);
  const childEntries = entry.children.slice(0, 24);
  const parentPath = entry.path.slice(0, -1);
  const sameLevelKeywords = lang === "zh"
    ? ["乌龟分类", "乌龟大全", "龟鳖目图鉴", "乌龟品种", `${currentName}资料`, `${currentName}分类`]
    : ["turtle taxonomy", "turtle database", "Testudines", "turtle species", `${currentName} taxonomy`];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Taxon",
    name: currentName,
    alternateName: [entry.node.name, entry.node.english_name, entry.node.latin_name].filter(Boolean),
    taxonRank: entry.node.rank,
    url: localizedTaxonUrl(lang, entry.slug),
    isPartOf: {
      "@type": "Dataset",
      name: lang === "zh" ? "龟迹龟鳖目分类数据库" : "CheloniaTrace Testudines Taxonomy Database",
      url: `${SITE_URL}/${lang}`,
    },
  };

  return (
    <main className="min-h-screen bg-[#f8f9fa] text-[#191c1d]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="border-b border-gray-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href={`/${lang}`} className="text-lg font-bold tracking-tight text-emerald-700">
            {lang === "zh" ? "龟迹" : "CheloniaTrace"}
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <Link href={`/${lang}`} className="text-gray-500 transition-colors hover:text-emerald-700">
              {lang === "zh" ? "分类树" : "Tree"}
            </Link>
            <Link
              href={`/${lang === "zh" ? "en" : "zh"}/taxa/${entry.slug}`}
              className="rounded-full border border-gray-200 px-3 py-1.5 text-gray-600 transition-colors hover:border-emerald-300 hover:text-emerald-700"
            >
              {lang === "zh" ? "EN" : "中文"}
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_320px] lg:py-14">
        <article className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <nav aria-label={lang === "zh" ? "分类路径" : "Taxonomy path"} className="mb-6 flex flex-wrap gap-2 text-sm text-gray-500">
            <Link href={`/${lang}`} className="hover:text-emerald-700">
              {lang === "zh" ? "首页" : "Home"}
            </Link>
            {parentPath.map((item) => (
              <span key={String(item.id)} className="flex items-center gap-2">
                <span>/</span>
                <span>{nodeDisplayName(item, lang)}</span>
              </span>
            ))}
          </nav>

          <div className="mb-8">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-emerald-700">
              {rankLabel(entry.node.rank, lang)}
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-950 sm:text-5xl">
              {currentName}
            </h1>
            {entry.node.latin_name && (
              <p className="mt-3 text-xl italic text-gray-500">{entry.node.latin_name}</p>
            )}
          </div>

          <p className="max-w-3xl text-base leading-8 text-gray-600 sm:text-lg">
            {taxonDescription(entry, lang)}
          </p>

          <dl className="mt-8 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-gray-50 p-4">
              <dt className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">
                {lang === "zh" ? "中文名" : "Chinese Name"}
              </dt>
              <dd className="mt-2 font-semibold text-gray-900">{entry.node.name || "-"}</dd>
            </div>
            <div className="rounded-2xl bg-gray-50 p-4">
              <dt className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">
                {lang === "zh" ? "英文名" : "English Name"}
              </dt>
              <dd className="mt-2 font-semibold text-gray-900">{entry.node.english_name || "-"}</dd>
            </div>
            <div className="rounded-2xl bg-gray-50 p-4">
              <dt className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">
                {lang === "zh" ? "拉丁学名" : "Scientific Name"}
              </dt>
              <dd className="mt-2 font-semibold italic text-gray-900">{entry.node.latin_name || "-"}</dd>
            </div>
            <div className="rounded-2xl bg-gray-50 p-4">
              <dt className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">
                {lang === "zh" ? "分类等级" : "Rank"}
              </dt>
              <dd className="mt-2 font-semibold text-gray-900">{rankLabel(entry.node.rank, lang)}</dd>
            </div>
          </dl>

          {entry.node.page && (
            <div className="mt-8 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-5">
              <p className="text-sm font-semibold text-emerald-900">
                {lang === "zh"
                  ? `该分类节点关联图鉴第 ${entry.node.page} 页，可在首页分类树中打开高清图鉴和 AI 导读。`
                  : `This taxon is linked to plate page ${entry.node.page}. Open the interactive tree to view the high-resolution plate and AI guide.`}
              </p>
              <Link
                href={`/${lang}`}
                className="mt-4 inline-flex rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
              >
                {lang === "zh" ? "返回图鉴树" : "Open Taxonomy Tree"}
              </Link>
            </div>
          )}

          {childEntries.length > 0 && (
            <section className="mt-10">
              <h2 className="text-2xl font-bold tracking-tight text-gray-950">
                {lang === "zh" ? "下级分类" : "Child taxa"}
              </h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {childEntries.map((child) => (
                  <div key={String(child.id)} className="rounded-2xl border border-gray-200 p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">
                      {rankLabel(child.rank, lang)}
                    </p>
                    <h3 className="mt-2 font-bold text-gray-900">{nodeDisplayName(child, lang)}</h3>
                    {child.latin_name && <p className="mt-1 text-sm italic text-gray-500">{child.latin_name}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}
        </article>

        <aside className="space-y-4">
          <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-400">
              {lang === "zh" ? "分类路径" : "Lineage"}
            </h2>
            <ol className="mt-4 space-y-3">
              {entry.path.map((item) => (
                <li key={String(item.id)} className="rounded-2xl bg-gray-50 p-3">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
                    {rankLabel(item.rank, lang)}
                  </p>
                  <p className="mt-1 font-semibold text-gray-900">{nodeDisplayName(item, lang)}</p>
                </li>
              ))}
            </ol>
          </section>

          <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-400">
              {lang === "zh" ? "相关搜索" : "Related searches"}
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {sameLevelKeywords.map((keyword) => (
                <span key={keyword} className="rounded-full bg-gray-100 px-3 py-1.5 text-sm text-gray-600">
                  {keyword}
                </span>
              ))}
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
}
