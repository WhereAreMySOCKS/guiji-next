import type { ExtendedTaxonomyNode, Lang } from "./taxonomySlug";
import { createTaxonSlug, nodeDisplayName, rankLabel, taxonSlugBase } from "./taxonomySlug";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE || "https://api.guiji.online";
export const SITE_URL = "https://www.guiji.online";

export interface TaxonEntry {
  node: ExtendedTaxonomyNode;
  slug: string;
  path: ExtendedTaxonomyNode[];
  children: ExtendedTaxonomyNode[];
}

export async function getTaxonomyTree(): Promise<ExtendedTaxonomyNode | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/taxonomy/tree`, {
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

export function localizedTaxonUrl(lang: Lang, slug: string) {
  return `${SITE_URL}/${lang}/taxa/${slug}`;
}

export function taxonTitle(entry: TaxonEntry, lang: Lang) {
  const name = nodeDisplayName(entry.node, lang);
  const latin = entry.node.latin_name && entry.node.latin_name !== name ? ` ${entry.node.latin_name}` : "";

  if (lang === "zh") {
    const suffix = entry.node.rank === "species" || entry.node.rank === "subspecies"
      ? "乌龟品种大全"
      : "乌龟分类大全";
    return `${name}${latin} | ${suffix} | 龟迹`;
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

  if (lang === "zh") {
    return `${name}${latin}是龟鳖目分类体系中的${rank}节点。查看其分类位置、上下级关系、相关图鉴与龟迹乌龟大全中的系统分类信息：${path}。`;
  }

  return `${name}${latin} is a ${rank.toLowerCase()} in the Testudines taxonomy. Explore its lineage, related taxa, plate references, and CheloniaTrace turtle database context: ${path}.`;
}
