import { describe, expect, it } from "vitest";
import { makeTransaction } from "@/test/utils";
import { computeSummary } from "./summary";

describe("computeSummary", () => {
  const now = new Date(2026, 9, 7); // 7 Oct 2026
  const transactions = [
    // September — only the first 7 days count towards the "same period" comparison.
    makeTransaction({ date: "2026-09-01", type: "income", category: "salary", amount: 100000 }),
    makeTransaction({ date: "2026-09-05", category: "rent", amount: 30000 }),
    makeTransaction({ date: "2026-09-20", category: "shopping", amount: 9000 }),
    // October, month to date.
    makeTransaction({ date: "2026-10-01", type: "income", category: "salary", amount: 120000 }),
    makeTransaction({ date: "2026-10-03", category: "rent", amount: 30000 }),
    makeTransaction({ date: "2026-10-05", category: "investments", amount: 20000 }),
    makeTransaction({ date: "2026-10-06", category: "food", amount: 10000 }),
  ];

  const summary = computeSummary(transactions, now);

  it("compares month-to-date against the same period last month", () => {
    expect(summary.income).toEqual({ value: 120000, previous: 100000 });
    expect(summary.expenses).toEqual({ value: 60000, previous: 30000 });
  });

  it("computes savings rate and balance", () => {
    expect(summary.savingsRate.value).toBeCloseTo(0.5);
    expect(summary.savingsRate.previous).toBeCloseTo(0.7);
    expect(summary.balance.value).toBe(220000 - 99000);
    expect(summary.balance.previous).toBe(100000 - 30000);
  });

  it("builds a six-month series ending with the current month", () => {
    expect(summary.monthly).toHaveLength(6);
    expect(summary.monthly.at(-1)).toEqual({ month: "2026-10", income: 120000, expense: 60000 });
    expect(summary.monthly.at(-2)).toEqual({ month: "2026-09", income: 100000, expense: 39000 });
    expect(summary.monthly[0].month).toBe("2026-05");
  });

  it("excludes investments from category spending", () => {
    expect(summary.spendingThisMonth).toEqual([
      { category: "rent", amount: 30000 },
      { category: "food", amount: 10000 },
    ]);
  });
});
