export interface TaxonomyNode {
  id: string | number;
  name: string;
  name_zh?: string;
  name_en?: string;
  slug?: string;
  latin_name?: string;
  english_name?: string;
  rank: string;
  page?: number;
  image_url?: string;
  seo_summary?: string;
  children?: TaxonomyNode[];
}
