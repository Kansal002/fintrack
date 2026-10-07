import { compareTransactions, matchesQuery } from "@/lib/api/transaction-query";
import type { Paginated, Transaction, TransactionQuery } from "@/types";

/**
 * Pure cache transforms used for optimistic updates. Each one takes a cached
 * page of results plus the query that produced it and returns the page as the
 * server would most likely return it after the mutation.
 */

type Page = Paginated<Transaction>;

function withTotal(page: Page, items: Transaction[], total: number): Page {
  return { ...page, items, total, totalPages: Math.max(1, Math.ceil(total / page.pageSize)) };
}

export function insertTransaction(page: Page, tx: Transaction, query: TransactionQuery): Page {
  if (!matchesQuery(tx, query)) return page;
  // Only the first page can show a new row with confidence; others just refetch.
  if ((query.page ?? 1) !== 1) return withTotal(page, page.items, page.total + 1);
  const items = [tx, ...page.items].sort(compareTransactions(query)).slice(0, page.pageSize);
  return withTotal(page, items, page.total + 1);
}

export function replaceTransaction(page: Page, tx: Transaction, query: TransactionQuery): Page {
  if (!page.items.some((item) => item.id === tx.id)) return page;
  if (!matchesQuery(tx, query)) {
    return withTotal(
      page,
      page.items.filter((item) => item.id !== tx.id),
      page.total - 1,
    );
  }
  const items = page.items
    .map((item) => (item.id === tx.id ? tx : item))
    .sort(compareTransactions(query));
  return { ...page, items };
}

export function removeTransaction(page: Page, id: string): Page {
  if (!page.items.some((item) => item.id === id)) return page;
  return withTotal(
    page,
    page.items.filter((item) => item.id !== id),
    page.total - 1,
  );
}
