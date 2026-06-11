import { apiUrl } from "./api";

export type SourceLevel = "L1" | "L2" | "L3" | "research_extra" | "unknown";

export interface ResearchLevelCount {
  level: SourceLevel | string;
  count: number;
}

export interface ResearchImportRun {
  id: string;
  source: string;
  status: string;
  replace_existing: boolean;
  summary_json?: Record<string, unknown> | null;
  started_at: string;
  finished_at?: string | null;
}

export interface ResearchSummary {
  latest_import?: ResearchImportRun | null;
  total_sources: number;
  total_evidence_claims: number;
  total_taxon_scores: number;
  evidence_with_taxonomy: number;
  evidence_with_source: number;
  sources_by_level: ResearchLevelCount[];
  evidence_by_level: ResearchLevelCount[];
  average_score?: number | null;
}

export interface ResearchTaxonomyRef {
  id: string;
  slug?: string | null;
  name_zh: string;
  name_en?: string | null;
  latin_name?: string | null;
  rank: string;
  image_url?: string | null;
}

export interface ResearchSource {
  id: string;
  source_key: string;
  title: string;
  authors?: string | null;
  year?: number | null;
  source_level: SourceLevel | string;
  source_type?: string | null;
  doi?: string | null;
  url?: string | null;
  access_status?: string | null;
  admission_decision: string;
  supports_taxa?: string | null;
  supports_parameters?: string | null;
  notes?: string | null;
  local_file_path?: string | null;
  source_file_path?: string | null;
  last_verified_at?: string | null;
}

export interface ResearchEvidenceClaim {
  id: string;
  taxonomy?: ResearchTaxonomyRef | null;
  source?: ResearchSource | null;
  taxon_name?: string | null;
  accepted_latin_name?: string | null;
  rank?: string | null;
  parameter: string;
  value_text?: string | null;
  value_min?: number | null;
  value_max?: number | null;
  unit?: string | null;
  life_stage?: string | null;
  sex?: string | null;
  environment_context?: string | null;
  source_level: SourceLevel | string;
  source_type?: string | null;
  source_title?: string | null;
  authors?: string | null;
  year?: number | null;
  page_or_table?: string | null;
  source_file_or_url?: string | null;
  access_status?: string | null;
  admission_decision?: string | null;
  claim_type: string;
  confidence: string;
  seedable: boolean;
  extraction_note?: string | null;
  required_followup?: string | null;
  last_verified_at?: string | null;
}

export interface ResearchTaxonScore {
  id: string;
  taxonomy?: ResearchTaxonomyRef | null;
  accepted_latin_name: string;
  common_name_zh?: string | null;
  score?: number | null;
  status?: string | null;
  species_file_path?: string | null;
  score_file_path?: string | null;
  source_stats_json?: unknown;
  coverage_json?: unknown;
  gaps_json?: unknown;
  scored_at?: string | null;
}

export interface ResearchSpeciesList {
  species: ResearchTaxonScore[];
  total: number;
  page: number;
  size: number;
}

export interface ResearchSourceList {
  sources: ResearchSource[];
  total: number;
  page: number;
  size: number;
}

export interface ResearchSpeciesDetail {
  score: ResearchTaxonScore;
  evidence: ResearchEvidenceClaim[];
  sources: ResearchSource[];
}

export interface ResearchSourceDetail {
  source: ResearchSource;
  evidence: ResearchEvidenceClaim[];
}

export async function getResearchSummary(): Promise<ResearchSummary | null> {
  return fetchResearch<ResearchSummary>("/research/summary");
}

export async function getResearchSpecies(params: {
  q?: string;
  min_score?: string;
  page?: string;
  size?: string;
} = {}): Promise<ResearchSpeciesList | null> {
  return fetchResearch<ResearchSpeciesList>(`/research/species${toQuery(params)}`);
}

export async function getResearchSources(params: {
  q?: string;
  source_level?: string;
  access_status?: string;
  page?: string;
  size?: string;
} = {}): Promise<ResearchSourceList | null> {
  return fetchResearch<ResearchSourceList>(`/research/sources${toQuery(params)}`);
}

export async function getResearchSpeciesDetail(slugOrLatin: string): Promise<ResearchSpeciesDetail | null> {
  return fetchResearch<ResearchSpeciesDetail>(`/research/species/${encodeURIComponent(slugOrLatin)}`);
}

export async function getResearchSourceDetail(sourceId: string): Promise<ResearchSourceDetail | null> {
  return fetchResearch<ResearchSourceDetail>(`/research/sources/${encodeURIComponent(sourceId)}`);
}

async function fetchResearch<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(apiUrl(path), { next: { revalidate: 1800 } });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error("Research API fetch failed:", error);
    return null;
  }
}

function toQuery(params: Record<string, string | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}
