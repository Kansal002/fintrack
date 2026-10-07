import type { TransactionQuery } from "@/types";

/**
 * Centralised React Query keys. Hierarchical so a mutation can invalidate a
 * whole family (e.g. every transaction list) with one prefix.
 */
export const queryKeys = {
  transactions: {
    all: ["transactions"] as const,
    lists: () => [...queryKeys.transactions.all, "list"] as const,
    list: (query: TransactionQuery) => [...queryKeys.transactions.lists(), query] as const,
  },
  summary: ["summary"] as const,
  budgets: {
    all: ["budgets"] as const,
    month: (month: string) => [...queryKeys.budgets.all, month] as const,
  },
};
