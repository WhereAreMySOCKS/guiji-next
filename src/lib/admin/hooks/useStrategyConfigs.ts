"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";

export interface StrategyConfigField {
  key: string;
  group: string;
  field: string;
  type: string;
  current_value: number | string | boolean;
  default_value: number | string | boolean;
  is_overridden: boolean;
}

interface ConfigListResponse {
  fields: StrategyConfigField[];
  total: number;
}

export function useStrategyConfigs() {
  return useQuery<ConfigListResponse>({
    queryKey: ["admin", "strategy-configs"],
    queryFn: () => api.get<ConfigListResponse>("/admin/strategy-configs"),
  });
}

export function useUpdateConfigs() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (overrides: { key: string; value: unknown }[]) =>
      api.put<ConfigListResponse>("/admin/strategy-configs", { overrides }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "strategy-configs"] });
    },
  });
}
