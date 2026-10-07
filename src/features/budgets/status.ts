export type BudgetStatus = "unset" | "on-track" | "near-limit" | "over";

/** Share of the budget at which a category is flagged as "near limit". */
export const WARNING_THRESHOLD = 0.75;

export function getBudgetStatus(spent: number, limit: number): BudgetStatus {
  if (limit <= 0) return "unset";
  const ratio = spent / limit;
  if (ratio > 1) return "over";
  if (ratio >= WARNING_THRESHOLD) return "near-limit";
  return "on-track";
}

export const STATUS_META: Record<
  BudgetStatus,
  { label: string; bar: string; tone: "success" | "warning" | "danger" | "neutral" }
> = {
  unset: { label: "No budget", bar: "bg-[var(--chart-other)]", tone: "neutral" },
  "on-track": { label: "On track", bar: "bg-[var(--status-good)]", tone: "success" },
  "near-limit": { label: "Near limit", bar: "bg-[var(--status-warning)]", tone: "warning" },
  over: { label: "Over budget", bar: "bg-[var(--status-critical)]", tone: "danger" },
};
