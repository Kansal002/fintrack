"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/state";
import { useMoney } from "@/hooks/use-money";
import { addMonths, parseMonthKey, toMonthKey } from "@/lib/dates";
import { formatMonthLong, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";
import { BudgetRow } from "./budget-row";
import { useBudgets, useUpdateBudget } from "./hooks";
import { getBudgetStatus, STATUS_META } from "./status";

function BudgetsSkeleton() {
  return (
    <ul aria-hidden className="divide-y divide-border">
      {Array.from({ length: 6 }, (_, i) => (
        <li key={i} className="space-y-3 px-5 py-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="ml-auto h-4 w-32" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
          <Skeleton className="h-3 w-40" />
        </li>
      ))}
    </ul>
  );
}

export function BudgetsView() {
  const money = useMoney();
  const currentMonth = toMonthKey(new Date());
  const [month, setMonth] = useState(currentMonth);
  const budgets = useBudgets(month);
  const update = useUpdateBudget();

  const shift = (delta: number) => setMonth(toMonthKey(addMonths(parseMonthKey(month), delta)));

  const tracked = budgets.data?.budgets.filter((b) => b.limit > 0) ?? [];
  const totalLimit = tracked.reduce((sum, b) => sum + b.limit, 0);
  const totalSpent = tracked.reduce((sum, b) => sum + b.spent, 0);
  const overall = getBudgetStatus(totalSpent, totalLimit);
  const overCount = tracked.filter((b) => getBudgetStatus(b.spent, b.limit) === "over").length;

  return (
    <>
      <PageHeader
        title="Budgets"
        description="Set monthly limits per category and see how you're tracking."
        actions={
          <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-0.5">
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() => shift(-1)}
              aria-label="Previous month"
            >
              <ChevronLeft aria-hidden />
            </Button>
            <p className="min-w-32 text-center text-sm font-medium" aria-live="polite">
              {formatMonthLong(month)}
            </p>
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() => shift(1)}
              disabled={month >= currentMonth}
              aria-label="Next month"
            >
              <ChevronRight aria-hidden />
            </Button>
          </div>
        }
      />

      <div className="grid gap-4">
        {/* Totals are hidden on error rather than showing a misleading ₹0. */}
        {(budgets.isPending || budgets.data) && (
          <Card>
            <CardContent className="grid gap-6 sm:grid-cols-3">
              {budgets.isPending ? (
                Array.from({ length: 3 }, (_, i) => (
                  <div key={i} className="space-y-2" aria-hidden>
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-7 w-32" />
                  </div>
                ))
              ) : (
                <>
                  <div>
                    <p className="text-sm text-muted-foreground">Total budgeted</p>
                    <p className="mt-1 text-2xl font-semibold tracking-tight">
                      {money(totalLimit)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Spent so far</p>
                    <p className="mt-1 text-2xl font-semibold tracking-tight">
                      {money(totalSpent)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {totalLimit - totalSpent >= 0 ? "Remaining" : "Over budget"}
                    </p>
                    <p
                      className={cn(
                        "mt-1 text-2xl font-semibold tracking-tight",
                        totalLimit - totalSpent < 0 && "text-danger",
                      )}
                    >
                      {money(Math.abs(totalLimit - totalSpent))}
                    </p>
                  </div>
                  <div className="sm:col-span-3">
                    <Progress
                      value={totalLimit > 0 ? totalSpent / totalLimit : 0}
                      label="Overall budget used"
                      valueText={
                        totalLimit > 0
                          ? `${formatPercent(totalSpent / totalLimit, { digits: 0 })} used`
                          : "No budgets set"
                      }
                      indicatorClassName={STATUS_META[overall].bar}
                      className="h-2.5"
                    />
                    <p className="mt-2 text-xs text-muted-foreground">
                      {totalLimit > 0
                        ? `${formatPercent(totalSpent / totalLimit, { digits: 0 })} of your monthly budget used`
                        : "No budgets set yet"}
                      {overCount > 0 &&
                        ` · ${overCount} ${overCount === 1 ? "category" : "categories"} over budget`}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        <Card aria-busy={budgets.isFetching}>
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold">Categories</h2>
            <p className="text-xs text-muted-foreground">Click the pencil to edit a limit</p>
          </div>
          {budgets.isPending ? (
            <BudgetsSkeleton />
          ) : budgets.isError && !budgets.data ? (
            <ErrorState
              error={budgets.error}
              onRetry={() => budgets.refetch()}
              retrying={budgets.isFetching}
            />
          ) : (
            <ul
              className={cn(
                "divide-y divide-border transition-opacity",
                budgets.isPlaceholderData && "opacity-60",
              )}
            >
              {budgets.data?.budgets.map((budget) => (
                <BudgetRow
                  key={budget.category}
                  budget={budget}
                  onSave={(category, limit) => update.mutate({ category, limit })}
                />
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
