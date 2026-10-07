"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMoney } from "@/hooks/use-money";
import { formatMonthLong } from "@/lib/format";
import type { MonthlyPoint } from "@/types";
import { CASH_FLOW_SERIES } from "./cash-flow-chart";
import { CashFlowChart } from "./charts";

export function CashFlowCard({ data }: { data: MonthlyPoint[] }) {
  const money = useMoney();
  return (
    <Card className="h-full">
      <CardHeader>
        <div>
          <CardTitle>Cash flow</CardTitle>
          <CardDescription>Income vs expenses, last {data.length} months</CardDescription>
        </div>
        <ul className="flex items-center gap-4 text-xs text-muted-foreground" aria-label="Legend">
          {CASH_FLOW_SERIES.map((s) => (
            <li key={s.key} className="flex items-center gap-1.5">
              <span
                className="size-2.5 rounded-[3px]"
                style={{ background: s.color }}
                aria-hidden
              />
              {s.label}
            </li>
          ))}
        </ul>
      </CardHeader>
      <CardContent>
        <div aria-hidden>
          <CashFlowChart data={data} />
        </div>
        {/* Equivalent data table for screen readers. */}
        <table className="sr-only">
          <caption>Monthly income and expenses</caption>
          <thead>
            <tr>
              <th scope="col">Month</th>
              <th scope="col">Income</th>
              <th scope="col">Expenses</th>
            </tr>
          </thead>
          <tbody>
            {data.map((point) => (
              <tr key={point.month}>
                <th scope="row">{formatMonthLong(point.month)}</th>
                <td>{money(point.income)}</td>
                <td>{money(point.expense)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
