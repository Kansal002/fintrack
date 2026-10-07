import type { Paginated, Transaction, TransactionQuery } from "@/types";

export const DEFAULT_PAGE_SIZE = 10;

/** True when a transaction satisfies every filter in the query. */
export function matchesQuery(tx: Transaction, query: TransactionQuery): boolean {
  if (query.type && tx.type !== query.type) return false;
  if (query.category && tx.category !== query.category) return false;
  if (query.from && tx.date < query.from) return false;
  if (query.to && tx.date > query.to) return false;
  const term = query.search?.trim().toLowerCase();
  if (term) {
    const haystack = `${tx.description} ${tx.note ?? ""}`.toLowerCase();
    if (!haystack.includes(term)) return false;
  }
  return true;
}

/**
 * Comparator for the supported sort fields. Ties fall back to newest-first by
 * date, then `createdAt`, so ordering is stable and deterministic.
 */
export function compareTransactions(query: Pick<TransactionQuery, "sort" | "order">) {
  const { sort = "date", order = "desc" } = query;
  const direction = order === "asc" ? 1 : -1;
  return (a: Transaction, b: Transaction): number => {
    const primary = sort === "amount" ? a.amount - b.amount : a.date.localeCompare(b.date);
    if (primary !== 0) return primary * direction;
    return b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt);
  };
}

/** Filter, sort and paginate — the "server-side" list endpoint logic. */
export function queryTransactions(
  transactions: readonly Transaction[],
  query: TransactionQuery = {},
): Paginated<Transaction> {
  const pageSize = Math.max(1, query.pageSize ?? DEFAULT_PAGE_SIZE);
  const filtered = transactions
    .filter((tx) => matchesQuery(tx, query))
    .sort(compareTransactions(query));
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const page = Math.min(Math.max(1, query.page ?? 1), totalPages);
  const start = (page - 1) * pageSize;
  return {
    items: filtered.slice(start, start + pageSize),
    total: filtered.length,
    page,
    pageSize,
    totalPages,
  };
}
