import { EXPENSE_CATEGORIES } from "@/lib/categories";
import { toMonthKey } from "@/lib/dates";
import type { Budget, BudgetsResponse, CategoryId } from "@/types";
import { readUserData, updateUserData } from "./db";
import { ApiError } from "./errors";
import { request } from "./request";
import { requireUserId } from "./session";

/** GET /budgets?month=YYYY-MM — limits joined with that month's actual spend. */
export function getBudgets(month = toMonthKey(new Date())): Promise<BudgetsResponse> {
  return request(() => {
    const { budgets, transactions } = readUserData(requireUserId());
    const spent = new Map<CategoryId, number>();
    for (const tx of transactions) {
      if (tx.type === "expense" && tx.date.startsWith(month)) {
        spent.set(tx.category, (spent.get(tx.category) ?? 0) + tx.amount);
      }
    }
    return {
      month,
      budgets: EXPENSE_CATEGORIES.map(({ id }) => ({
        category: id,
        limit: budgets.find((b) => b.category === id)?.limit ?? 0,
        spent: spent.get(id) ?? 0,
      })),
    };
  });
}

/** PUT /budgets/:category */
export function updateBudget(category: CategoryId, limit: number): Promise<Budget> {
  return request(() => {
    if (!Number.isFinite(limit) || limit < 0) {
      throw new ApiError("Budget must be a positive amount.", 422, "VALIDATION_ERROR");
    }
    return updateUserData(requireUserId(), (data) => {
      const budget: Budget = { category, limit: Math.round(limit) };
      data.budgets = [...data.budgets.filter((b) => b.category !== category), budget];
      return budget;
    });
  });
}
