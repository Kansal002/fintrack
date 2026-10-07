"use client";

import { Inbox, Plus, SearchX } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/dialog";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState, ErrorState } from "@/components/ui/state";
import type { SortField, Transaction } from "@/types";
import { ExportButton } from "./export-button";
import { useDeleteTransaction, useTransactions } from "./hooks";
import { TransactionFilters } from "./transaction-filters";
import { TransactionFormDialog } from "./transaction-form-dialog";
import { TransactionsTable, TransactionsTableSkeleton } from "./transactions-table";
import { useTransactionFilters } from "./use-transaction-filters";

type DialogState =
  | { kind: "closed" }
  | { kind: "form"; transaction?: Transaction }
  | { kind: "delete"; transaction: Transaction };

export function TransactionsView() {
  const { query, setFilters, clearFilters, activeFilterCount } = useTransactionFilters();
  const transactions = useTransactions(query);
  const remove = useDeleteTransaction();
  const [dialog, setDialog] = useState<DialogState>({ kind: "closed" });
  const close = () => setDialog({ kind: "closed" });

  const handleSort = (field: SortField) => {
    const sameField = (query.sort ?? "date") === field;
    setFilters({ sort: field, order: sameField && query.order !== "asc" ? "asc" : "desc" });
  };

  const data = transactions.data;

  return (
    <>
      <PageHeader
        title="Transactions"
        description="Search, filter and manage every rupee in and out."
        actions={
          <>
            <ExportButton query={query} />
            <Button onClick={() => setDialog({ kind: "form" })}>
              <Plus aria-hidden />
              Add transaction
            </Button>
          </>
        }
      />

      <Card>
        <div className="border-b border-border p-4">
          <TransactionFilters
            query={query}
            onChange={setFilters}
            onClear={clearFilters}
            activeFilterCount={activeFilterCount}
          />
        </div>

        <div aria-busy={transactions.isFetching}>
          {transactions.isPending ? (
            <TransactionsTableSkeleton />
          ) : transactions.isError && !data ? (
            <ErrorState
              error={transactions.error}
              onRetry={() => transactions.refetch()}
              retrying={transactions.isFetching}
            />
          ) : data && data.items.length > 0 ? (
            <TransactionsTable
              transactions={data.items}
              query={query}
              onSort={handleSort}
              stale={transactions.isPlaceholderData}
              onEdit={(transaction) => setDialog({ kind: "form", transaction })}
              onDelete={(transaction) => setDialog({ kind: "delete", transaction })}
            />
          ) : activeFilterCount > 0 ? (
            <EmptyState
              icon={<SearchX />}
              title="No matching transactions"
              description="Try a different search term or widen your filters."
              action={
                <Button variant="secondary" onClick={clearFilters}>
                  Clear filters
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={<Inbox />}
              title="No transactions yet"
              description="Add your first income or expense to start tracking."
              action={
                <Button onClick={() => setDialog({ kind: "form" })}>
                  <Plus aria-hidden />
                  Add transaction
                </Button>
              }
            />
          )}
        </div>

        {data && data.total > 0 && (
          <div className="border-t border-border px-4 py-3">
            <Pagination
              page={data.page}
              totalPages={data.totalPages}
              total={data.total}
              pageSize={data.pageSize}
              itemLabel="transactions"
              onPageChange={(page) => setFilters({ page })}
            />
          </div>
        )}
      </Card>

      <TransactionFormDialog
        open={dialog.kind === "form"}
        transaction={dialog.kind === "form" ? dialog.transaction : undefined}
        onClose={close}
      />

      <ConfirmDialog
        open={dialog.kind === "delete"}
        onClose={close}
        title="Delete transaction?"
        description={
          dialog.kind === "delete" ? (
            <>
              <span className="font-medium text-foreground">{dialog.transaction.description}</span>{" "}
              will be permanently removed. This can&apos;t be undone.
            </>
          ) : null
        }
        onConfirm={() => {
          if (dialog.kind === "delete") remove.mutate(dialog.transaction);
          close();
        }}
      />
    </>
  );
}
