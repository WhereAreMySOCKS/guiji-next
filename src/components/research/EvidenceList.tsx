import Link from "next/link";
import type { Lang } from "@/lib/taxonomySlug";
import type { ResearchEvidenceClaim } from "@/lib/research";
import { publicEvidenceSummary, publicResearchDomains } from "@/lib/researchDisplay";
import SourceLevelBadge from "./SourceLevelBadge";

export default function EvidenceList({
  evidence,
  lang,
  limit,
}: {
  evidence: ResearchEvidenceClaim[];
  lang: Lang;
  limit?: number;
}) {
  const items = typeof limit === "number" ? evidence.slice(0, limit) : evidence;

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-500">
        {lang === "zh" ? "暂无可展示的证据条目。" : "No evidence items available."}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <EvidenceCard key={item.id} item={item} lang={lang} />
      ))}
    </div>
  );
}

function EvidenceCard({ item, lang }: { item: ResearchEvidenceClaim; lang: Lang }) {
  const domainValues = [
    item.parameter,
    item.environment_context,
    item.claim_type,
    item.source?.supports_parameters,
    item.source?.notes,
  ];
  const domains = publicResearchDomains(domainValues, lang);

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-center gap-2">
        <SourceLevelBadge level={item.source_level} />
        <span className="text-xs font-semibold text-slate-500">{item.confidence}</span>
        {domains.slice(0, 2).map((domain) => (
          <span key={domain.key} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
            {domain.label}
          </span>
        ))}
      </div>
      <h3 className="mt-3 text-base font-bold text-slate-950">
        {lang === "zh" ? "公开证据摘要" : "Public evidence summary"}
      </h3>
      <p className="mt-2 text-sm leading-6 text-slate-700">{publicEvidenceSummary(domainValues, lang)}</p>
      <div className="mt-3 text-xs leading-5 text-slate-500">
        <p>{item.accepted_latin_name || item.taxon_name || "-"}</p>
        <p>
          {item.source_title || item.source?.title || (lang === "zh" ? "未命名来源" : "Untitled source")}
          {item.year ? ` · ${item.year}` : ""}
        </p>
      </div>
      {item.source?.id && (
        <Link
          href={`/${lang}/research/sources/${item.source.id}`}
          className="mt-3 inline-flex text-sm font-semibold text-sky-700 hover:text-sky-900"
        >
          {lang === "zh" ? "查看原始来源" : "Open source"}
        </Link>
      )}
    </article>
  );
}
