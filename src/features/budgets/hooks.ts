"use client";

import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, getErrorMessage } from "@/lib/api";
import { getCategory } from "@/lib/categories";
import { queryKeys } from "@/lib/query-keys";
import type { BudgetsResponse, CategoryId } from "@/types";

export function useBudgets(month: string) {
  return useQuery({
    queryKey: queryKeys.budgets.month(month),
    queryFn: () => api.budgets.list(month),
    placeholderData: keepPreviousData,
  });
}

/** Optimistically updates a category's limit across every cached month. */
export function useUpdateBudget() {
  return useMutation({
    mutationFn: ({ category, limit }: { category: CategoryId; limit: number }) =>
      api.budgets.update(category, limit),
    onMutate: async ({ category, limit }, { client }) => {
      await client.cancelQueries({ queryKey: queryKeys.budgets.all });
      const snapshot = client.getQueriesData<BudgetsResponse>({ queryKey: queryKeys.budgets.all });
      client.setQueriesData<BudgetsResponse>(
        { queryKey: queryKeys.budgets.all },
        (data) =>
          data && {
            ...data,
            budgets: data.budgets.map((b) => (b.category === category ? { ...b, limit } : b)),
          },
      );
      return snapshot;
    },
    onError: (error, { category }, snapshot, { client }) => {
      snapshot?.forEach(([key, data]) => client.setQueryData(key, data));
      toast.error(`Couldn't update ${getCategory(category).label} budget`, {
        description: `${getErrorMessage(error)} The previous limit was restored.`,
      });
    },
    onSuccess: (_budget, { category }) =>
      toast.success(`${getCategory(category).label} budget updated`),
    onSettled: (_data, _error, _vars, _snapshot, { client }) =>
      client.invalidateQueries({ queryKey: queryKeys.budgets.all }),
  });
}
