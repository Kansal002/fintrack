"use client";

import { ArrowRight, Inbox } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/ui/state";
import { Amount } from "@/features/transactions/amount";
import { useTransactions } from "@/features/transactions/hooks";
import { getCategory } from "@/lib/categories";
import { formatShortDate } from "@/lib/format";

const RECENT_QUERY = { sort: "date", order: "desc", page: 1, pageSize: 6 } as const;

export function RecentTransactions() {
  const recent = useTransactions(RECENT_QUERY);

  return (
    <Card>
      <CardHeader className="items-center">
        <CardTitle>Recent transactions</CardTitle>
        <Link
          href="/transactions/"
          className="inline-flex items-center gap-1 rounded-md text-sm font-medium text-accent-text underline-offset-4 hover:underline"
        >
          View all
          <ArrowRight className="size-3.5" aria-hidden />
        </Link>
      </CardHeader>
      <CardContent className="pt-3">
        {recent.isPending ? (
          <ul aria-hidden className="divide-y divide-border">
            {Array.from({ length: 6 }, (_, i) => (
              <li key={i} className="flex items-center gap-3 py-3">
                <Skeleton className="size-9 rounded-lg" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
                <Skeleton className="h-4 w-16" />
              </li>
            ))}
          </ul>
        ) : recent.isError ? (
          <ErrorState
            error={recent.error}
            onRetry={() => recent.refetch()}
            retrying={recent.isFetching}
          />
        ) : recent.data.items.length === 0 ? (
          <EmptyState icon={<Inbox />} title="No transactions yet" className="py-8" />
        ) : (
          <ul className="divide-y divide-border">
            {recent.data.items.map((tx) => {
              const meta = getCategory(tx.category);
              return (
                <li key={tx.id} className="flex items-center gap-3 py-3">
                  <span
                    aria-hidden
                    className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-xs font-semibold text-muted-foreground"
                  >
                    <span className="size-2.5 rounded-full" style={{ background: meta.color }} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{tx.description}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {meta.label} · <time dateTime={tx.date}>{formatShortDate(tx.date)}</time>
                    </p>
                  </div>
                  <Amount transaction={tx} className="text-sm" />
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
