"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";

export interface TaxonomyNodeItem {
  id: string;
  name: string;
  english_name: string | null;
  latin_name: string | null;
  rank: string;
  page: number | null;
  parent_id: string | null;
  has_trait: boolean;
}

export interface TaxonomyNodeDetail extends TaxonomyNodeItem {
  trait: TaxonTraitData | null;
}

export interface TaxonTraitData {
  id: string;
  taxonomy_id: string;
  temp_min: number | null;
  temp_max: number | null;
  diet_type: string | null;
  base_feed_interval_hours: number | null;
  mature_age_months: number | null;
  accepts_color_enhance: boolean | null;
  allow_rapid_growth: boolean | null;
  can_hibernate: boolean | null;
  hibernation_temp_min: number | null;
  hibernation_temp_max: number | null;
  hibernation_duration_weeks: number | null;
  prep_fasting_weeks: number | null;
  basking_need: string | null;
  basking_hours_per_day: number | null;
  basking_uvb_min: string | null;
}

interface TaxonomyListResponse {
  nodes: TaxonomyNodeItem[];
  total: number;
}

export function useTaxonomyNodes(params: {
  rank?: string;
  search?: string;
  has_trait?: boolean;
  page?: number;
  size?: number;
}) {
  const searchParams = new URLSearchParams();
  if (params.rank) searchParams.set("rank", params.rank);
  if (params.search) searchParams.set("search", params.search);
  if (params.has_trait !== undefined) searchParams.set("has_trait", String(params.has_trait));
  searchParams.set("page", String(params.page || 1));
  searchParams.set("size", String(params.size || 20));

  return useQuery<TaxonomyListResponse>({
    queryKey: ["admin", "taxonomy-nodes", params],
    queryFn: () =>
      api.get<TaxonomyListResponse>(
        `/admin/taxonomy/nodes?${searchParams.toString()}`
      ),
  });
}

export function useTaxonomyNode(id: string | null) {
  return useQuery<TaxonomyNodeDetail>({
    queryKey: ["admin", "taxonomy-node", id],
    queryFn: () => api.get<TaxonomyNodeDetail>(`/admin/taxonomy/nodes/${id}`),
    enabled: !!id,
  });
}

export function useCreateNode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      name: string;
      english_name?: string;
      latin_name?: string;
      rank: string;
      page?: number;
      parent_id?: string;
    }) => api.post<TaxonomyNodeItem>("/admin/taxonomy/nodes", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "taxonomy-nodes"] });
    },
  });
}

export function useUpdateNode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...data
    }: {
      id: string;
      name?: string;
      english_name?: string;
      latin_name?: string;
      rank?: string;
      page?: number;
      parent_id?: string;
    }) => api.put<TaxonomyNodeItem>(`/admin/taxonomy/nodes/${id}`, data),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "taxonomy-nodes"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "taxonomy-node", vars.id] });
    },
  });
}

export function useDeleteNode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.delete<{ ok: boolean }>(`/admin/taxonomy/nodes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "taxonomy-nodes"] });
    },
  });
}

export function useSaveTrait() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      nodeId,
      ...data
    }: {
      nodeId: string;
      temp_min?: number | null;
      temp_max?: number | null;
      diet_type?: string | null;
      base_feed_interval_hours?: number | null;
      mature_age_months?: number | null;
      accepts_color_enhance?: boolean | null;
      allow_rapid_growth?: boolean | null;
      can_hibernate?: boolean | null;
      hibernation_temp_min?: number | null;
      hibernation_temp_max?: number | null;
      hibernation_duration_weeks?: number | null;
      prep_fasting_weeks?: number | null;
      basking_need?: string | null;
      basking_hours_per_day?: number | null;
      basking_uvb_min?: string | null;
    }) => {
      return api.put<TaxonTraitData>(
        `/admin/taxonomy/nodes/${nodeId}/trait`,
        data
      );
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "taxonomy-node", vars.nodeId],
      });
    },
  });
}
