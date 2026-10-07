"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

export function useSummary() {
  return useQuery({ queryKey: queryKeys.summary, queryFn: api.summary.get });
}
