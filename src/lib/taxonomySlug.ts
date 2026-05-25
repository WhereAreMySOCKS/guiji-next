import type { TaxonomyNode } from "@/app/types";

export type Lang = "zh" | "en";

export interface ExtendedTaxonomyNode extends TaxonomyNode {
  english_name?: string;
  has_guide?: boolean;
  children?: ExtendedTaxonomyNode[];
}

const rankLabels: Record<Lang, Record<string, string>> = {
  zh: {
    order: "目",
    suborder: "亚目",
    superfamily: "总科",
    family: "科",
    subfamily: "亚科",
    genus: "属",
    species: "物种",
    subspecies: "亚种",
  },
  en: {
    order: "Order",
    suborder: "Suborder",
    superfamily: "Superfamily",
    family: "Family",
    subfamily: "Subfamily",
    genus: "Genus",
    species: "Species",
    subspecies: "Subspecies",
  },
};

export function rankLabel(rank: string, lang: Lang) {
  return rankLabels[lang][rank.toLowerCase()] || rank;
}

export function nodeDisplayName(node: ExtendedTaxonomyNode, lang: Lang) {
  if (lang === "en") {
    return node.english_name || node.latin_name || node.name;
  }
  return node.name || node.latin_name || node.english_name || "Unknown";
}

export function taxonSlugBase(node: ExtendedTaxonomyNode) {
  const source = node.latin_name || node.english_name || node.name || String(node.id);
  const normalized = source
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/×/g, "x")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || String(node.id).toLowerCase();
}

export function createTaxonSlug(node: ExtendedTaxonomyNode, occurrence = 1) {
  const base = taxonSlugBase(node);
  return occurrence > 1 ? `${base}-${occurrence}` : base;
}
