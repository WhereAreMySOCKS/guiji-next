import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import EvidenceList from "@/components/research/EvidenceList";
import SiteFooter from "@/components/layout/SiteFooter";
import SiteHeader from "@/components/layout/SiteHeader";
import SourceLevelBadge from "@/components/research/SourceLevelBadge";
import { getResearchSourceDetail } from "@/lib/research";
import { publicResearchDomains } from "@/lib/researchDisplay";
import { pageMetadata } from "@/lib/seo";
import type { Lang } from "@/lib/taxonomySlug";
import { safeExternalUrl } from "@/lib/security";

export async function generateMetadata({ params }: { params: Promise<{ lang: string; sourceId: string }> }): Promise<Metadata> {
  const { lang, sourceId } = await params;
  return pageMetadata({
    lang,
    titleZh: "来源详情 | 研究资料库 | 龟迹 CheloniaTrace",
    titleEn: "Source Detail | Research Database | CheloniaTrace",
    descZh: "查看研究来源的详细信息和关联证据。",
    descEn: "View detailed information and associated evidence for this research source.",
    path: `/research/sources/${sourceId}`,
    keywords: ["来源详情", "证据", "研究", "龟迹"],
  });
}

export default async function ResearchSourceDetailPage({
  params,
}: {
  params: Promise<{ lang: string; sourceId: string }>;
}) {
  const { lang: rawLang, sourceId } = await params;
  const lang = (rawLang === "en" ? "en" : "zh") as Lang;
  const detail = await getResearchSourceDetail(sourceId);
  if (!detail) notFound();

  const { source, evidence } = detail;
  const publicDomains = publicResearchDomains([source.supports_parameters, source.notes, source.source_type], lang);
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <SiteHeader lang={lang} />
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <Link href={`/${lang}/research/sources`} className="text-sm font-bold text-sky-700 hover:text-sky-900">
          {lang === "zh" ? "返回来源列表" : "Back to sources"}
        </Link>
        <article className="mt-5 rounded-lg border border-slate-200 bg-white p-6">
          <div className="flex flex-wrap items-center gap-2">
            <SourceLevelBadge level={source.source_level} />
            {source.access_status && <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">{source.access_status}</span>}
            {source.year && <span className="text-xs font-bold text-slate-500">{source.year}</span>}
          </div>
          <h1 className="mt-4 text-3xl font-bold leading-tight text-slate-950">{source.title}</h1>
          <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
            <Info label={lang === "zh" ? "作者" : "Authors"} value={source.authors} />
            <Info label="DOI" value={source.doi} />
            <Info label="URL" value={source.url} href={source.url} />
            <Info label={lang === "zh" ? "覆盖物种" : "Covered taxa"} value={source.supports_taxa} />
            <Info label={lang === "zh" ? "资料主题" : "Research domains"} value={publicDomains.map((domain) => domain.label).join(lang === "zh" ? "、" : ", ")} />
          </dl>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {publicDomains.map((domain) => (
              <div key={domain.key} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-bold text-slate-950">{domain.label}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{domain.desc}</p>
              </div>
            ))}
          </div>
          {source.notes && <p className="mt-5 rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-600">{source.notes}</p>}
        </article>

        <section className="mt-8">
          <h2 className="mb-4 text-2xl font-bold text-slate-950">
            {lang === "zh" ? `关联证据 (${evidence.length})` : `Linked evidence (${evidence.length})`}
          </h2>
          <EvidenceList evidence={evidence} lang={lang} />
        </section>
      </section>
      <SiteFooter lang={lang} />
    </main>
  );
}

function Info({ label, value, href }: { label: string; value?: string | null; href?: string | null }) {
  const safeHref = safeExternalUrl(href);
  return (
    <div className="min-w-0 rounded-lg bg-slate-50 p-3">
      <dt className="text-xs font-bold uppercase text-slate-400">{label}</dt>
      <dd className="mt-1 break-words font-semibold text-slate-800">
        {safeHref && value ? (
          <a href={safeHref} target="_blank" rel="noopener noreferrer" className="text-sky-700 hover:text-sky-900">
            {value}
          </a>
        ) : (
          value || "-"
        )}
      </dd>
    </div>
  );
}
