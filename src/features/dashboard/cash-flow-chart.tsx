"use client";

import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";
import { useMoney } from "@/hooks/use-money";
import { formatMonthLong, formatMonthShort } from "@/lib/format";
import type { MonthlyPoint } from "@/types";
import { ChartTooltip } from "./chart-tooltip";

export const CASH_FLOW_SERIES = [
  { key: "income", label: "Income", color: "var(--chart-1)" },
  { key: "expense", label: "Expenses", color: "var(--chart-2)" },
] as const;

const axisTick = { fill: "var(--chart-axis)", fontSize: 12 };

/** Grouped monthly bars. Loaded lazily (see ./charts.tsx) to keep Recharts out of the main bundle. */
export default function CashFlowChart({ data }: { data: MonthlyPoint[] }) {
  const money = useMoney();
  return (
    <BarChart
      data={data}
      responsive
      style={{ width: "100%", height: 280 }}
      margin={{ top: 8, right: 4, bottom: 0, left: 4 }}
      barGap={2}
      barCategoryGap="28%"
      accessibilityLayer
    >
      <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
      <XAxis
        dataKey="month"
        tickFormatter={formatMonthShort}
        tickLine={false}
        axisLine={false}
        tick={axisTick}
        tickMargin={8}
      />
      <YAxis
        tickFormatter={(value: number) => money(value, { compact: true })}
        tickLine={false}
        axisLine={false}
        tick={axisTick}
        width={56}
      />
      <Tooltip
        cursor={{ fill: "var(--muted)", opacity: 0.6 }}
        content={({ active, payload, label }) =>
          active && payload?.length ? (
            <ChartTooltip
              title={formatMonthLong(String(label))}
              rows={CASH_FLOW_SERIES.map((s) => ({
                key: s.key,
                label: s.label,
                color: s.color,
                value: money(Number(payload.find((p) => p.dataKey === s.key)?.value ?? 0)),
              }))}
              footer={(() => {
                const point = payload[0]?.payload as MonthlyPoint | undefined;
                return point
                  ? `Net ${money(point.income - point.expense, { signDisplay: "always" })}`
                  : null;
              })()}
            />
          ) : null
        }
      />
      {CASH_FLOW_SERIES.map((s) => (
        <Bar
          key={s.key}
          dataKey={s.key}
          name={s.label}
          fill={s.color}
          radius={[4, 4, 0, 0]}
          maxBarSize={24}
        />
      ))}
    </BarChart>
  );
}
