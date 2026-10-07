"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/ui/state";
import { useUser } from "@/features/auth/auth-provider";
import { TransactionFormDialog } from "@/features/transactions/transaction-form-dialog";
import { api, getErrorMessage } from "@/lib/api";
import { formatMonthLong } from "@/lib/format";
import { CashFlowCard } from "./cash-flow-card";
import { useSummary } from "./hooks";
import { KpiCards } from "./kpi-cards";
import { RecentTransactions } from "./recent-transactions";
import { SpendingCard } from "./spending-card";
import { StatCardSkeleton } from "./stat-card";

function greeting(hour = new Date().getHours()) {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function ChartCardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={className} aria-hidden>
      <CardHeader>
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-44" />
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[280px] w-full rounded-lg" />
      </CardContent>
    </Card>
  );
}

function LoadSampleData() {
  const queryClient = useQueryClient();
  const load = useMutation({
    mutationFn: () => api.auth.resetData("sample"),
    onSuccess: () => {
      toast.success("Sample data loaded");
      return queryClient.invalidateQueries();
    },
    onError: (error) =>
      toast.error("Couldn't load sample data", { description: getErrorMessage(error) }),
  });
  return (
    <Button variant="secondary" onClick={() => load.mutate()} loading={load.isPending}>
      {!load.isPending && <Sparkles aria-hidden />}
      Load sample data
    </Button>
  );
}

export function DashboardView() {
  const user = useUser();
  const summary = useSummary();
  const [adding, setAdding] = useState(false);
  const firstName = user.name.split(" ")[0];

  return (
    <>
      <PageHeader
        title={`${greeting()}, ${firstName}`}
        description={
          summary.data
            ? `Your financial overview for ${formatMonthLong(summary.data.asOf.slice(0, 7))}.`
            : "Your financial overview."
        }
        actions={
          <Button onClick={() => setAdding(true)}>
            <Plus aria-hidden />
            Add transaction
          </Button>
        }
      />

      {summary.isPending ? (
        <div className="grid gap-4" aria-busy="true" aria-label="Loading dashboard">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <ChartCardSkeleton className="lg:col-span-2" />
            <ChartCardSkeleton />
          </div>
        </div>
      ) : summary.isError ? (
        <Card>
          <ErrorState
            error={summary.error}
            onRetry={() => summary.refetch()}
            retrying={summary.isFetching}
            className="py-16"
          />
        </Card>
      ) : summary.data.transactionCount === 0 ? (
        <Card>
          <EmptyState
            icon={<Sparkles />}
            title="Your dashboard is waiting for data"
            description="Add your first transaction, or load six months of realistic sample data to explore every feature."
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <LoadSampleData />
                <Button onClick={() => setAdding(true)}>
                  <Plus aria-hidden />
                  Add transaction
                </Button>
              </div>
            }
            className="py-16"
          />
        </Card>
      ) : (
        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCards summary={summary.data} />
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <CashFlowCard data={summary.data.monthly} />
            </div>
            <SpendingCard summary={summary.data} />
          </div>
          <RecentTransactions />
        </div>
      )}

      <TransactionFormDialog open={adding} onClose={() => setAdding(false)} />
    </>
  );
}
