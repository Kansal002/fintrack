import type { Metadata } from "next";
import { Suspense } from "react";
import { TransactionsTableSkeleton } from "@/features/transactions/transactions-table";
import { TransactionsView } from "@/features/transactions/transactions-view";

export const metadata: Metadata = { title: "Transactions" };

export default function TransactionsPage() {
  // useSearchParams() needs a Suspense boundary in a static export.
  return (
    <Suspense fallback={<TransactionsTableSkeleton />}>
      <TransactionsView />
    </Suspense>
  );
}
