import { apiUrl } from "./api";
import type { ExtendedTaxonomyNode, Lang } from "./taxonomySlug";
import { createTaxonSlug, nodeDisplayName, rankLabel, taxonSlugBase } from "./taxonomySlug";

export const SITE_URL = "https://www.guiji.online";

export interface TaxonEntry {
  node: ExtendedTaxonomyNode;
  slug: string;
  path: ExtendedTaxonomyNode[];
  children: ExtendedTaxonomyNode[];
}

export interface TaxonGuide {
  title?: string;
  summary?: string;
  sections: Array<{
    label: string;
    value: string;
  }>;
}

export async function getTaxonomyTree(): Promise<ExtendedTaxonomyNode | null> {
  try {
    const res = await fetch(apiUrl("/taxonomy/tree"), {
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error("Failed to fetch taxonomy tree");
    return res.json();
  } catch (error) {
    console.error("Taxonomy tree fetch failed:", error);
    return null;
  }
}

export function flattenTaxonomyTree(root: ExtendedTaxonomyNode | null): TaxonEntry[] {
  if (!root) return [];

  const entries: TaxonEntry[] = [];
  const slugCounts = new Map<string, number>();

  const walk = (node: ExtendedTaxonomyNode, path: ExtendedTaxonomyNode[]) => {
    const base = taxonSlugBase(node);
    const count = (slugCounts.get(base) || 0) + 1;
    slugCounts.set(base, count);

    entries.push({
      node,
      slug: createTaxonSlug(node, count),
      path: [...path, node],
      children: node.children || [],
    });

    for (const child of node.children || []) {
      walk(child, [...path, node]);
    }
  };

  walk(root, []);
  return entries;
}

export async function getTaxonEntries() {
  return flattenTaxonomyTree(await getTaxonomyTree());
}

export async function findTaxonEntry(slug: string) {
  const entries = await getTaxonEntries();
  return entries.find((entry) => entry.slug === slug) || null;
}

export async function getTaxonGuide(nodeId: string | number, lang: Lang): Promise<TaxonGuide | null> {
  try {
    const res = await fetch(apiUrl(`/taxonomy/nodes/${nodeId}/guide`), {
      next: { revalidate: 3600 },
    });

    if (!res.ok) return null;

    const data = await res.json();
    return normalizeGuide(data, lang);
  } catch (error) {
    console.error("Taxon guide fetch failed:", error);
    return null;
  }
}

export function localizedTaxonUrl(lang: Lang, slug: string) {
  return `${SITE_URL}/${lang}/taxa/${slug}`;
}

export function taxonTitle(entry: TaxonEntry, lang: Lang) {
  const name = nodeDisplayName(entry.node, lang);
  const latin = entry.node.latin_name && entry.node.latin_name !== name ? ` ${entry.node.latin_name}` : "";

  if (lang === "zh") {
    const suffix = entry.node.rank === "species" || entry.node.rank === "subspecies"
      ? "龟类物种资料"
      : "龟鳖目分类";
    return `${name}${latin} | ${suffix} | 龟迹 CheloniaTrace`;
  }

  const suffix = entry.node.rank === "species" || entry.node.rank === "subspecies"
    ? "Turtle Species Database"
    : "Turtle Taxonomy Database";
  return `${name}${latin} | ${suffix} | CheloniaTrace`;
}

export function taxonDescription(entry: TaxonEntry, lang: Lang) {
  const name = nodeDisplayName(entry.node, lang);
  const latin = entry.node.latin_name ? `（${entry.node.latin_name}）` : "";
  const rank = rankLabel(entry.node.rank, lang);
  const path = entry.path.map((item) => nodeDisplayName(item, lang)).join(lang === "zh" ? " > " : " > ");
  if (entry.node.seo_summary) return entry.node.seo_summary;

  if (lang === "zh") {
    return `${name}${latin}是龟鳖目下的${rank}级分类。在龟迹查看它的上下级关系、图鉴资料和分类路径：${path}。`;
  }

  return `${name}${latin} is a ${rank.toLowerCase()} in the Testudines taxonomy. Explore its lineage, related taxa, plate references, and CheloniaTrace turtle database context: ${path}.`;
}

export function taxonLead(entry: TaxonEntry, lang: Lang) {
  const name = nodeDisplayName(entry.node, lang);
  const latin = entry.node.latin_name;
  const rank = rankLabel(entry.node.rank, lang);
  const parent = entry.path.at(-2);
  const parentName = parent ? nodeDisplayName(parent, lang) : "";
  const childCount = entry.children.length;

  if (lang === "zh") {
    if (entry.node.rank === "species" || entry.node.rank === "subspecies") {
      return `${name}${latin ? `（${latin}）` : ""}是龟迹收录的${rank}，${parentName ? `归在${parentName}下，` : ""}本页整理了它的分类位置、学名和相关图鉴。`;
    }

    return `${name}${latin ? `（${latin}）` : ""}是龟鳖目下的${rank}，${parentName ? `上一级是${parentName}，` : ""}${childCount > 0 ? `下面有 ${childCount} 个直接下级。` : "暂无直接下级。"}点击展开可以顺着分类树往下翻。`;
  }

  if (entry.node.rank === "species" || entry.node.rank === "subspecies") {
    return `${name}${latin ? ` (${latin})` : ""} is a ${rank.toLowerCase()} entry in CheloniaTrace. ${parentName ? `It sits under ${parentName}, ` : ""}with its scientific name, lineage, and plate references organized for quick lookup.`;
  }

  return `${name}${latin ? ` (${latin})` : ""} is a ${rank.toLowerCase()} in the Testudines taxonomy. ${parentName ? `Its parent taxon is ${parentName}, ` : ""}${childCount > 0 ? `and ${childCount} direct child taxa are currently listed here.` : "with no direct child taxa currently listed."}`;
}

export function lineageText(entry: TaxonEntry, lang: Lang) {
  const path = entry.path.map((item) => `${nodeDisplayName(item, lang)}${item.latin_name ? ` (${item.latin_name})` : ""}`);

  if (lang === "zh") {
    return `分类路径：${path.join(" > ")}。顺这个路径能知道它在龟鳖目里属于哪个科、哪个属，方便和相近物种做对比。`;
  }

  return `Lineage: ${path.join(" > ")}. This path helps place the taxon within its family, genus, or species-level context.`;
}

function normalizeGuide(data: unknown, lang: Lang): TaxonGuide | null {
  if (!data || typeof data !== "object") return null;

  const record = data as Record<string, unknown>;
  const preferredTitleKeys = lang === "zh"
    ? ["中文名", "名称", "物种", "学名", "Scientific Name"]
    : ["English Name", "Common Name", "Scientific Name", "学名", "中文名"];
  const skipKeys = new Set(["id", "page", "page_num"]);
  const sections: TaxonGuide["sections"] = [];

  for (const [key, rawValue] of Object.entries(record)) {
    if (skipKeys.has(key) || rawValue == null) continue;
    const value = stringifyGuideValue(rawValue);
    if (!value) continue;
    sections.push({ label: key, value });
  }

  const titleKey = preferredTitleKeys.find((key) => typeof record[key] === "string");
  const title = titleKey ? String(record[titleKey]) : undefined;
  const summary = sections.find((item) =>
    /summary|overview|description|简介|概述|说明|识别|特征/i.test(item.label)
  )?.value;

  return sections.length > 0 ? { title, summary, sections: sections.slice(0, 8) } : null;
}

function stringifyGuideValue(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) {
    return value.map(stringifyGuideValue).filter(Boolean).join("；");
  }
  if (value && typeof value === "object") {
    return Object.entries(value as Record<string, unknown>)
      .map(([key, item]) => {
        const text = stringifyGuideValue(item);
        return text ? `${key}: ${text}` : "";
      })
      .filter(Boolean)
      .join("；");
  }
  return "";
}
