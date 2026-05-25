import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  findTaxonEntry,
  getTaxonEntries,
  getTaxonGuide,
  lineageText,
  localizedTaxonUrl,
  SITE_URL,
  taxonDescription,
  taxonLead,
  taxonTitle,
} from "@/lib/taxonomy";
import { apiUrl } from "@/lib/api";
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
  const entries = await getTaxonEntries();
  const entry = entries.find((item) => item.slug === slug) || null;

  if (!entry) notFound();

  const currentName = nodeDisplayName(entry.node, lang);
  const parentPath = entry.path.slice(0, -1);
  const parent = parentPath.at(-1);
  const guide = entry.node.has_guide ? await getTaxonGuide(entry.node.id, lang) : null;
  const entryById = new Map(entries.map((item) => [String(item.node.id), item]));
  const childEntries = entry.children
    .map((child) => entryById.get(String(child.id)))
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .slice(0, 24);
  const siblingEntries = parent
    ? entries
        .filter((item) => String(item.node.id) !== String(entry.node.id) && String(item.path.at(-2)?.id) === String(parent.id))
        .slice(0, 8)
    : [];
  const primaryImageUrl = entry.node.page ? apiUrl(`/taxonomy/nodes/${entry.node.id}/image`) : null;

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

      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:py-14">
        <article className="space-y-6">
          <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
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
                {rankLabel(entry.node.rank, lang)} / {lang === "zh" ? "龟鳖目分类条目" : "Testudines taxon"}
              </p>
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-950 sm:text-5xl">
                {currentName}
              </h1>
              {entry.node.latin_name && (
                <p className="mt-3 text-xl italic text-gray-500">{entry.node.latin_name}</p>
              )}
            </div>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px]">
              <div>
                <p className="max-w-3xl text-lg leading-8 text-gray-700 sm:text-xl">
                  {guide?.summary || taxonLead(entry, lang)}
                </p>
                <p className="mt-5 max-w-3xl text-base leading-8 text-gray-600">
                  {lineageText(entry, lang)}
                </p>
              </div>

              {primaryImageUrl && (
                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={primaryImageUrl}
                    alt={lang === "zh" ? `${currentName}图鉴页` : `${currentName} plate reference`}
                    className="h-52 w-full object-cover object-top"
                  />
                  <div className="p-3 text-xs font-semibold text-gray-500">
                    {lang === "zh" ? `图鉴第 ${entry.node.page} 页` : `Plate page ${entry.node.page}`}
                  </div>
                </div>
              )}
            </div>

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
          </section>

          {guide && (
            <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="max-w-3xl">
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-700">
                  {lang === "zh" ? "图鉴导读" : "Plate notes"}
                </p>
                <h2 className="mt-3 text-2xl font-bold tracking-tight text-gray-950">
                  {guide.title || (lang === "zh" ? "AI 导读摘录" : "AI guide excerpt")}
                </h2>
              </div>
              <div className="mt-6 grid gap-4">
                {guide.sections.map((section) => (
                  <section key={section.label} className="rounded-2xl bg-gray-50 p-4">
                    <h3 className="text-sm font-bold text-gray-950">{section.label}</h3>
                    <p className="mt-2 text-sm leading-7 text-gray-600">{section.value}</p>
                  </section>
                ))}
              </div>
            </section>
          )}

          {entry.node.page && (
            <section className="rounded-3xl border border-emerald-100 bg-emerald-50/70 p-6 shadow-sm sm:p-8">
              <h2 className="text-xl font-bold tracking-tight text-emerald-950">
                {lang === "zh" ? "查看原始图鉴" : "Open the source plate"}
              </h2>
              <p className="mt-3 text-sm leading-7 font-medium text-emerald-900">
                {lang === "zh"
                  ? `这个条目关联到图鉴第 ${entry.node.page} 页。你可以回到互动分类树中查看高清图片、缩放细节，并打开完整 AI 导读。`
                  : `This entry is linked to plate page ${entry.node.page}. Return to the interactive tree to inspect the high-resolution plate and full AI guide.`}
              </p>
              <Link
                href={`/${lang}?focus=${encodeURIComponent(entry.slug)}`}
                className="mt-4 inline-flex rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
              >
                {lang === "zh" ? "返回图鉴树" : "Open Taxonomy Tree"}
              </Link>
            </section>
          )}

          {childEntries.length > 0 && (
            <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-2xl font-bold tracking-tight text-gray-950">
                {lang === "zh" ? "下级分类与收录条目" : "Child taxa"}
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-600">
                {lang === "zh"
                  ? `${currentName} 下目前收录了 ${entry.children.length} 个直接下级分类。点击条目可以继续查看对应的分类路径、学名和图鉴资料。`
                  : `${currentName} currently includes ${entry.children.length} direct child taxa. Open any entry to continue through its lineage and reference material.`}
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {childEntries.map((childEntry) => (
                  <Link
                    key={String(childEntry.node.id)}
                    href={`/${lang}/taxa/${childEntry.slug}`}
                    className="rounded-2xl border border-gray-200 p-4 transition-colors hover:border-emerald-200 hover:bg-emerald-50"
                  >
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">
                      {rankLabel(childEntry.node.rank, lang)}
                    </p>
                    <h3 className="mt-2 font-bold text-gray-900">{nodeDisplayName(childEntry.node, lang)}</h3>
                    {childEntry.node.latin_name && <p className="mt-1 text-sm italic text-gray-500">{childEntry.node.latin_name}</p>}
                  </Link>
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
                  {item.latin_name && <p className="mt-0.5 text-xs italic text-gray-500">{item.latin_name}</p>}
                </li>
              ))}
            </ol>
          </section>

          {siblingEntries.length > 0 && (
            <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-400">
                {lang === "zh" ? "相近条目" : "Nearby taxa"}
              </h2>
              <div className="mt-4 space-y-2">
                {siblingEntries.map((item) => (
                  <Link
                    key={String(item.node.id)}
                    href={`/${lang}/taxa/${item.slug}`}
                    className="block rounded-2xl bg-gray-50 p-3 transition-colors hover:bg-emerald-50"
                  >
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-gray-400">
                      {rankLabel(item.node.rank, lang)}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-gray-900">{nodeDisplayName(item.node, lang)}</p>
                    {item.node.latin_name && <p className="mt-0.5 text-xs italic text-gray-500">{item.node.latin_name}</p>}
                  </Link>
                ))}
              </div>
            </section>
          )}
        </aside>
      </section>
    </main>
  );
}
