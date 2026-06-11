import { apiUrl } from "./api";
import type { ResearchSpeciesDetail } from "./research";

export interface TaxonomySpeciesSuggestion {
  id: string;
  name: string;
  name_zh?: string | null;
  name_en?: string | null;
  english_name?: string | null;
  latin_name?: string | null;
  slug?: string | null;
  image_url?: string | null;
}

export interface PublicFeedingPreviewRequest {
  species_name: string;
  current_water_temp: number;
  age_months: number;
  weight_g: number;
  target_goal: "健康日常" | "发色需求" | "快速生长";
  preferred_feeding_hour?: number;
  timezone_offset?: number;
  lat?: number;
  lon?: number;
  pet_name?: string;
  last_feeding_at?: string;
  arrived_at?: string;
}

export interface PublicFeedingPreviewResponse {
  status: string;
  action?: string | null;
  frequency?: string | null;
  diet_ratio?: string | null;
  warning?: string | null;
  interval_hours?: number | null;
  portion_grams?: number | null;
  next_feeding_at?: string | null;
  hours_until_next?: number | null;
  temperature_source?: string | null;
  raw_current_water_temp?: number | null;
  effective_current_water_temp?: number | null;
  risk_notes: string[];
  result_snapshot: Record<string, unknown>;
}

export interface PublicWaitlistRequest {
  contact: string;
  contact_type: "phone" | "email" | "wechat" | "other";
  platform_preference: "ios" | "android" | "both" | "unknown";
  source_page?: string;
  locale: string;
  note?: string;
}

export async function submitPublicFeedingPreview(req: PublicFeedingPreviewRequest) {
  return postJson<PublicFeedingPreviewResponse>("/public/feeding-preview", req);
}

export async function submitWaitlist(req: PublicWaitlistRequest) {
  return postJson<{ id: string }>("/public/waitlist", req);
}

export async function fetchResearchForSpecies(speciesName: string): Promise<ResearchSpeciesDetail | null> {
  const res = await fetch(apiUrl(`/research/species/${encodeURIComponent(speciesName)}`));
  if (!res.ok) return null;
  return res.json();
}

export async function searchTaxonomySpecies(q: string): Promise<TaxonomySpeciesSuggestion[]> {
  const res = await fetch(apiUrl(`/taxonomy/species/search?q=${encodeURIComponent(q)}&limit=8`));
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data.species) ? data.species : [];
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(apiUrl(path), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    let message = "请求失败，请稍后再试。";
    try {
      const data = await res.json();
      if (typeof data.detail === "string") message = data.detail;
    } catch {
      // ignore malformed error payloads
    }
    throw new Error(message);
  }

  return res.json();
}
