"use client";

import { Landmark, PiggyBank, TrendingDown, TrendingUp } from "lucide-react";
import { useMoney } from "@/hooks/use-money";
import { formatPercent, percentChange } from "@/lib/format";
import type { Metric, Summary } from "@/types";
import { StatCard, type StatDelta } from "./stat-card";

/** Builds a delta badge; `higherIsBetter` decides whether "up" is good news. */
export function relativeDelta(
  { value, previous }: Metric,
  higherIsBetter: boolean,
): StatDelta | null {
  const change = percentChange(value, previous);
  if (change === null) return null;
  const direction = Math.abs(change) < 0.0005 ? "flat" : change > 0 ? "up" : "down";
  const good =
    direction === "flat"
      ? "neutral"
      : (direction === "up") === higherIsBetter
        ? "positive"
        : "negative";
  return { label: formatPercent(Math.abs(change)), direction, sentiment: good };
}

export function pointsDelta({ value, previous }: Metric): StatDelta {
  const diff = (value - previous) * 100;
  const direction = Math.abs(diff) < 0.05 ? "flat" : diff > 0 ? "up" : "down";
  return {
    label: `${Math.abs(diff).toFixed(1)} pts`,
    direction,
    sentiment: direction === "flat" ? "neutral" : direction === "up" ? "positive" : "negative",
  };
}

export function KpiCards({ summary }: { summary: Summary }) {
  const money = useMoney();
  return (
    <>
      <StatCard
        label="Total balance"
        value={money(summary.balance.value)}
        icon={<Landmark />}
        delta={relativeDelta(summary.balance, true)}
        comparison="vs this day last month"
      />
      <StatCard
        label="Income this month"
        value={money(summary.income.value)}
        icon={<TrendingUp />}
        delta={relativeDelta(summary.income, true)}
      />
      <StatCard
        label="Expenses this month"
        value={money(summary.expenses.value)}
        icon={<TrendingDown />}
        delta={relativeDelta(summary.expenses, false)}
      />
      <StatCard
        label="Savings rate"
        value={formatPercent(summary.savingsRate.value)}
        icon={<PiggyBank />}
        delta={pointsDelta(summary.savingsRate)}
      />
    </>
  );
}
