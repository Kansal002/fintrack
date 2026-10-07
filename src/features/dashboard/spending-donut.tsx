"use client";

import { Pie, PieChart, Tooltip } from "recharts";
import { useMoney } from "@/hooks/use-money";
import { getCategory } from "@/lib/categories";
import { formatPercent } from "@/lib/format";
import type { CategoryAmount } from "@/types";
import { ChartTooltip } from "./chart-tooltip";

/** Donut of spending by category. Lazily loaded with Recharts. */
export default function SpendingDonut({ data, total }: { data: CategoryAmount[]; total: number }) {
  const money = useMoney();
  const slices = data.map((d) => ({
    ...d,
    name: getCategory(d.category).label,
    fill: getCategory(d.category).color,
  }));

  return (
    <div className="relative mx-auto size-[200px]">
      <PieChart responsive style={{ width: 200, height: 200 }}>
        <Pie
          data={slices}
          dataKey="amount"
          nameKey="name"
          innerRadius={66}
          outerRadius={96}
          stroke="var(--card)"
          strokeWidth={2}
          startAngle={90}
          endAngle={-270}
          isAnimationActive
        />
        <Tooltip
          content={({ active, payload }) => {
            const item = payload?.[0]?.payload as (typeof slices)[number] | undefined;
            return active && item ? (
              <ChartTooltip
                rows={[
                  {
                    key: item.category,
                    label: item.name,
                    color: item.fill,
                    value: money(item.amount),
                  },
                ]}
                footer={`${formatPercent(item.amount / total)} of spending`}
              />
            ) : null;
          }}
        />
      </PieChart>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xs text-muted-foreground">Total spent</span>
        <span className="text-lg font-semibold tracking-tight">
          {money(total, { compact: total >= 100000 })}
        </span>
      </div>
    </div>
  );
}
