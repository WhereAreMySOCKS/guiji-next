export interface TaxonomyNode {
  id: string | number;
  name: string;
  latin_name?: string;
  rank: string;
  page?: number;
  children?: TaxonomyNode[];
}