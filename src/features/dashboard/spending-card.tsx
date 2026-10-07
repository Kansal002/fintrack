"use client";

import { ShoppingBag } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { EmptyState } from "@/components/ui/state";
import { useMoney } from "@/hooks/use-money";
import { getCategory } from "@/lib/categories";
import { formatPercent } from "@/lib/format";
import type { Summary } from "@/types";
import { SpendingDonut } from "./charts";

type Period = "month" | "six";

export function SpendingCard({ summary }: { summary: Summary }) {
  const money = useMoney();
  const [period, setPeriod] = useState<Period>("month");
  const data = period === "month" ? summary.spendingThisMonth : summary.spendingSixMonths;
  const total = data.reduce((sum, d) => sum + d.amount, 0);

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div>
          <CardTitle>Spending by category</CardTitle>
          <CardDescription>Excludes investments</CardDescription>
        </div>
        <SegmentedControl
          size="sm"
          label="Spending period"
          value={period}
          onChange={setPeriod}
          options={[
            { value: "month", label: "This month" },
            { value: "six", label: "6 months" },
          ]}
        />
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        {data.length === 0 ? (
          <EmptyState
            icon={<ShoppingBag />}
            title="No spending yet"
            description="Expenses for this period will appear here."
            className="py-8"
          />
        ) : (
          <>
            <div aria-hidden>
              <SpendingDonut data={data} total={total} />
            </div>
            <ul
              className="mt-5 space-y-2.5 text-sm"
              aria-label={`Spending breakdown, ${money(total)} total`}
            >
              {data.map((d) => {
                const meta = getCategory(d.category);
                return (
                  <li key={d.category} className="flex items-center gap-2">
                    <span
                      className="size-2.5 shrink-0 rounded-[3px]"
                      style={{ background: meta.color }}
                      aria-hidden
                    />
                    <span className="flex-1 truncate text-muted-foreground">{meta.label}</span>
                    <span className="font-medium tabular">{money(d.amount)}</span>
                    <span className="w-12 text-right text-xs text-muted-foreground tabular">
                      {formatPercent(d.amount / total, { digits: 0 })}
                    </span>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  );
}
