import { addMonths, daysInMonth, toISODate, toMonthKey } from "@/lib/dates";
import type { CategoryAmount, CategoryId, Summary, Transaction } from "@/types";
import { readUserData } from "./db";
import { request } from "./request";
import { requireUserId } from "./session";

/** Investments are transfers into savings, so they're excluded from "spending". */
const NON_SPENDING: ReadonlySet<CategoryId> = new Set(["investments"]);

function totals(transactions: readonly Transaction[]) {
  let income = 0;
  let expense = 0;
  for (const tx of transactions) {
    if (tx.type === "income") income += tx.amount;
    else expense += tx.amount;
  }
  return { income, expense };
}

function savingsRate(income: number, expense: number) {
  return income > 0 ? (income - expense) / income : 0;
}

function spendingByCategory(transactions: readonly Transaction[]): CategoryAmount[] {
  const map = new Map<CategoryId, number>();
  for (const tx of transactions) {
    if (tx.type !== "expense" || NON_SPENDING.has(tx.category)) continue;
    map.set(tx.category, (map.get(tx.category) ?? 0) + tx.amount);
  }
  return [...map.entries()]
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);
}

/**
 * Pure dashboard aggregation. Month-to-date figures are compared against the
 * *same period* of the previous month (1st → same day), which is a fairer
 * comparison than a partial month against a full one.
 */
export function computeSummary(
  transactions: readonly Transaction[],
  now = new Date(),
  months = 6,
): Summary {
  const today = toISODate(now);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const prevMonthStart = addMonths(monthStart, -1);
  const prevSameDay = new Date(
    prevMonthStart.getFullYear(),
    prevMonthStart.getMonth(),
    Math.min(now.getDate(), daysInMonth(prevMonthStart)),
  );

  const inRange = (from: Date, to: string) => {
    const start = toISODate(from);
    return transactions.filter((tx) => tx.date >= start && tx.date <= to);
  };

  const current = totals(inRange(monthStart, today));
  const previous = totals(inRange(prevMonthStart, toISODate(prevSameDay)));

  const balanceAt = (date: string) => {
    const t = totals(transactions.filter((tx) => tx.date <= date));
    return t.income - t.expense;
  };

  const firstMonth = addMonths(monthStart, -(months - 1));
  const monthly = Array.from({ length: months }, (_, i) => {
    const key = toMonthKey(addMonths(firstMonth, i));
    const t = totals(transactions.filter((tx) => tx.date.startsWith(key) && tx.date <= today));
    return { month: key, income: t.income, expense: t.expense };
  });

  return {
    asOf: today,
    balance: { value: balanceAt(today), previous: balanceAt(toISODate(prevSameDay)) },
    income: { value: current.income, previous: previous.income },
    expenses: { value: current.expense, previous: previous.expense },
    savingsRate: {
      value: savingsRate(current.income, current.expense),
      previous: savingsRate(previous.income, previous.expense),
    },
    monthly,
    spendingThisMonth: spendingByCategory(inRange(monthStart, today)),
    spendingSixMonths: spendingByCategory(inRange(firstMonth, today)),
    transactionCount: transactions.length,
  };
}

/** GET /summary */
export function getSummary(): Promise<Summary> {
  return request(() => computeSummary(readUserData(requireUserId()).transactions));
}
