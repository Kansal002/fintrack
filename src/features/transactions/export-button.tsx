"use client";

import { useMutation } from "@tanstack/react-query";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { api, getErrorMessage } from "@/lib/api";
import { downloadCsv, transactionsToCsv } from "@/lib/csv";
import { todayISO } from "@/lib/dates";
import type { TransactionQuery } from "@/types";

/** Exports every transaction matching the current filters (not just this page). */
export function ExportButton({ query }: { query: TransactionQuery }) {
  const exportCsv = useMutation({
    mutationFn: () => api.transactions.export({ ...query, page: undefined, pageSize: undefined }),
    onSuccess: (transactions) => {
      if (transactions.length === 0) {
        toast.info("Nothing to export", {
          description: "No transactions match the current filters.",
        });
        return;
      }
      downloadCsv(`fintrack-transactions-${todayISO()}.csv`, transactionsToCsv(transactions));
      toast.success(`Exported ${transactions.length} transactions`);
    },
    onError: (error) => toast.error("Export failed", { description: getErrorMessage(error) }),
  });

  return (
    <Button variant="secondary" onClick={() => exportCsv.mutate()} loading={exportCsv.isPending}>
      {!exportCsv.isPending && <Download aria-hidden />}
      Export CSV
    </Button>
  );
}
