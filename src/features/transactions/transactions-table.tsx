"use client";

import { ArrowDown, ArrowUp, ArrowUpDown, Pencil, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { getCategory } from "@/lib/categories";
import { formatDate, formatShortDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { SortField, Transaction, TransactionQuery } from "@/types";
import { Amount } from "./amount";
import { CategoryBadge } from "./category-badge";

interface TransactionsTableProps {
  transactions: Transaction[];
  query: TransactionQuery;
  onSort: (field: SortField) => void;
  onEdit: (tx: Transaction) => void;
  onDelete: (tx: Transaction) => void;
  /** Dims rows while the next page/filter result is loading. */
  stale?: boolean;
}

function SortHeader({
  field,
  label,
  query,
  onSort,
  className,
}: {
  field: SortField;
  label: string;
  query: TransactionQuery;
  onSort: (field: SortField) => void;
  className?: string;
}) {
  const active = (query.sort ?? "date") === field;
  const order = query.order ?? "desc";
  const Icon = !active ? ArrowUpDown : order === "asc" ? ArrowUp : ArrowDown;
  return (
    <th
      scope="col"
      aria-sort={active ? (order === "asc" ? "ascending" : "descending") : "none"}
      className={cn("px-3 py-3 font-medium sm:px-4", className)}
    >
      <button
        type="button"
        onClick={() => onSort(field)}
        className={cn(
          "-mx-1.5 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 transition-colors hover:text-foreground",
          active && "text-foreground",
        )}
      >
        {label}
        <Icon className="size-3.5" aria-hidden />
        <span className="sr-only">
          , sort {active && order === "desc" ? "ascending" : "descending"}
        </span>
      </button>
    </th>
  );
}

const iconButton =
  "inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground [&_svg]:size-4";

export function TransactionsTable({
  transactions,
  query,
  onSort,
  onEdit,
  onDelete,
  stale,
}: TransactionsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className={cn("w-full text-sm transition-opacity", stale && "opacity-60")}>
        <caption className="sr-only">Transactions</caption>
        <thead className="border-b border-border text-left text-xs text-muted-foreground">
          <tr>
            <SortHeader
              field="date"
              label="Date"
              query={query}
              onSort={onSort}
              className="hidden w-32 sm:table-cell"
            />
            <th scope="col" className="px-3 py-3 font-medium sm:px-4">
              Description
            </th>
            <th scope="col" className="hidden px-4 py-3 font-medium md:table-cell">
              Category
            </th>
            <SortHeader
              field="amount"
              label="Amount"
              query={query}
              onSort={onSort}
              className="text-right"
            />
            <th scope="col" className="w-20 px-1 py-3 sm:w-24 sm:px-4">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {transactions.map((tx) => {
            const pending = tx.id.startsWith("optimistic_");
            return (
              <tr
                key={tx.id}
                className={cn("group transition-colors hover:bg-muted/50", pending && "opacity-60")}
              >
                <td className="hidden px-4 py-3 whitespace-nowrap text-muted-foreground sm:table-cell">
                  <time dateTime={tx.date}>{formatDate(tx.date)}</time>
                </td>
                <td className="max-w-0 py-3 pr-2 pl-3 sm:px-4">
                  <p className="truncate font-medium">{tx.description}</p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    <time dateTime={tx.date} className="sm:hidden">
                      {formatShortDate(tx.date)} ·{" "}
                    </time>
                    <span className="md:hidden">{getCategory(tx.category).label}</span>
                    <span className="hidden md:inline">{tx.note}</span>
                  </p>
                </td>
                <td className="hidden px-4 py-3 md:table-cell">
                  <CategoryBadge category={tx.category} />
                </td>
                <td className="px-2 py-3 text-right sm:px-4">
                  <Amount transaction={tx} />
                </td>
                <td className="py-2 pr-2 pl-0 text-right whitespace-nowrap sm:px-2">
                  <button
                    type="button"
                    className={iconButton}
                    onClick={() => onEdit(tx)}
                    disabled={pending}
                    aria-label={`Edit ${tx.description}`}
                  >
                    <Pencil aria-hidden />
                  </button>
                  <button
                    type="button"
                    className={cn(iconButton, "hover:bg-danger-soft hover:text-danger")}
                    onClick={() => onDelete(tx)}
                    disabled={pending}
                    aria-label={`Delete ${tx.description}`}
                  >
                    <Trash2 aria-hidden />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function TransactionsTableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div aria-hidden className="divide-y divide-border">
      <div className="flex gap-4 px-4 py-3.5">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-24" />
      </div>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3.5">
          <Skeleton className="hidden h-4 w-20 sm:block" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-2/5" />
            <Skeleton className="h-3 w-1/4" />
          </div>
          <Skeleton className="hidden h-5 w-24 md:block" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-6 w-14" />
        </div>
      ))}
    </div>
  );
}
