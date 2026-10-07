"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  type QueryClient,
  type QueryKey,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { api, getErrorMessage } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import type { Paginated, Transaction, TransactionInput, TransactionQuery } from "@/types";
import { insertTransaction, removeTransaction, replaceTransaction } from "./optimistic";

type Page = Paginated<Transaction>;
type Snapshot = Array<[QueryKey, Page | undefined]>;

export function useTransactions(query: TransactionQuery) {
  return useQuery({
    queryKey: queryKeys.transactions.list(query),
    queryFn: () => api.transactions.list(query),
    // Keep the current page visible while the next filter/page loads.
    placeholderData: keepPreviousData,
  });
}

/** Apply `update` to every cached transaction list, returning a rollback snapshot. */
async function patchLists(
  client: QueryClient,
  update: (page: Page, query: TransactionQuery) => Page,
): Promise<Snapshot> {
  await client.cancelQueries({ queryKey: queryKeys.transactions.all });
  const snapshot = client.getQueriesData<Page>({ queryKey: queryKeys.transactions.lists() });
  for (const [key, page] of snapshot) {
    if (!page) continue;
    const query = (key[2] ?? {}) as TransactionQuery;
    client.setQueryData<Page>(key, update(page, query));
  }
  return snapshot;
}

function rollback(client: QueryClient, snapshot: Snapshot | undefined) {
  snapshot?.forEach(([key, page]) => client.setQueryData(key, page));
}

/** Anything derived from transactions must be refetched once the server settles. */
function invalidateDerived(client: QueryClient) {
  return Promise.all([
    client.invalidateQueries({ queryKey: queryKeys.transactions.all }),
    client.invalidateQueries({ queryKey: queryKeys.summary }),
    client.invalidateQueries({ queryKey: queryKeys.budgets.all }),
  ]);
}

export function useCreateTransaction() {
  return useMutation({
    mutationFn: (input: TransactionInput) => api.transactions.create(input),
    onMutate: (input, { client }) => {
      const now = new Date().toISOString();
      const optimistic: Transaction = {
        ...input,
        id: `optimistic_${now}`,
        createdAt: now,
        updatedAt: now,
      };
      return patchLists(client, (page, query) => insertTransaction(page, optimistic, query));
    },
    onError: (error, _input, snapshot, { client }) => {
      rollback(client, snapshot);
      toast.error("Couldn't add transaction", { description: getErrorMessage(error) });
    },
    onSuccess: (tx) => toast.success("Transaction added", { description: tx.description }),
    onSettled: (_data, _error, _input, _snapshot, { client }) => invalidateDerived(client),
  });
}

export function useUpdateTransaction() {
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: TransactionInput; previous: Transaction }) =>
      api.transactions.update(id, input),
    onMutate: ({ input, previous }, { client }) => {
      const optimistic: Transaction = {
        ...previous,
        ...input,
        updatedAt: new Date().toISOString(),
      };
      return patchLists(client, (page, query) => replaceTransaction(page, optimistic, query));
    },
    onError: (error, _vars, snapshot, { client }) => {
      rollback(client, snapshot);
      toast.error("Couldn't save changes", {
        description: `${getErrorMessage(error)} Your edit was reverted.`,
      });
    },
    onSuccess: () => toast.success("Transaction updated"),
    onSettled: (_data, _error, _vars, _snapshot, { client }) => invalidateDerived(client),
  });
}

export function useDeleteTransaction() {
  return useMutation({
    mutationFn: (tx: Transaction) => api.transactions.remove(tx.id),
    onMutate: (tx, { client }) => patchLists(client, (page) => removeTransaction(page, tx.id)),
    onError: (error, _tx, snapshot, { client }) => {
      rollback(client, snapshot);
      toast.error("Couldn't delete transaction", {
        description: `${getErrorMessage(error)} It has been restored.`,
      });
    },
    onSuccess: (_data, tx) => toast.success("Transaction deleted", { description: tx.description }),
    onSettled: (_data, _error, _tx, _snapshot, { client }) => invalidateDerived(client),
  });
}
