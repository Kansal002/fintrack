"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { DEFAULT_PAGE_SIZE } from "@/lib/api/transaction-query";
import { isCategoryId } from "@/lib/categories";
import { isValidISODate } from "@/lib/dates";
import type { TransactionQuery } from "@/types";

/**
 * Parses list filters from URL search params, ignoring anything malformed so a
 * hand-edited or stale link can never break the page.
 */
export function parseTransactionQuery(params: URLSearchParams): TransactionQuery {
  const query: TransactionQuery = {
    sort: params.get("sort") === "amount" ? "amount" : "date",
    order: params.get("order") === "asc" ? "asc" : "desc",
    page: Math.max(1, Number.parseInt(params.get("page") ?? "1", 10) || 1),
    pageSize: DEFAULT_PAGE_SIZE,
  };
  const search = params.get("q")?.trim();
  if (search) query.search = search;
  const type = params.get("type");
  if (type === "income" || type === "expense") query.type = type;
  const category = params.get("category");
  if (isCategoryId(category)) query.category = category;
  const from = params.get("from");
  if (from && isValidISODate(from)) query.from = from;
  const to = params.get("to");
  if (to && isValidISODate(to)) query.to = to;
  return query;
}

/** Serialises a query back to params, omitting defaults to keep URLs short. */
export function serializeTransactionQuery(query: TransactionQuery): URLSearchParams {
  const params = new URLSearchParams();
  if (query.search) params.set("q", query.search);
  if (query.type) params.set("type", query.type);
  if (query.category) params.set("category", query.category);
  if (query.from) params.set("from", query.from);
  if (query.to) params.set("to", query.to);
  if (query.sort && query.sort !== "date") params.set("sort", query.sort);
  if (query.order && query.order !== "desc") params.set("order", query.order);
  if (query.page && query.page > 1) params.set("page", String(query.page));
  return params;
}

export type FilterPatch = Partial<Omit<TransactionQuery, "pageSize">>;

/** Transaction list filters, synced to the URL so views are shareable. */
export function useTransactionFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const query = useMemo(
    () => parseTransactionQuery(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );

  const setFilters = useCallback(
    (patch: FilterPatch) => {
      // Read the live URL (not a render-time closure) so debounced callers can't
      // overwrite filters that changed in the meantime.
      const current = parseTransactionQuery(new URLSearchParams(window.location.search));
      // Any filter change other than pagination sends the user back to page 1.
      const next = { ...current, ...patch, page: "page" in patch ? patch.page : 1 };
      const qs = serializeTransactionQuery(next).toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname],
  );

  const clearFilters = useCallback(
    () => router.replace(pathname, { scroll: false }),
    [router, pathname],
  );

  const activeFilterCount = [query.search, query.type, query.category, query.from, query.to].filter(
    Boolean,
  ).length;

  return { query, setFilters, clearFilters, activeFilterCount };
}
