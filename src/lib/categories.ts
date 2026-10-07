import type { CategoryId, TransactionType } from "@/types";

export interface CategoryMeta {
  id: CategoryId;
  label: string;
  type: TransactionType;
  /** CSS variable holding the category's chart colour (light/dark aware). */
  color: string;
}

/**
 * Expense categories map to fixed categorical colour slots so a category keeps
 * the same colour everywhere (colour follows the entity, never its rank).
 */
export const CATEGORIES: readonly CategoryMeta[] = [
  { id: "salary", label: "Salary", type: "income", color: "var(--chart-1)" },
  { id: "freelance", label: "Freelance", type: "income", color: "var(--chart-3)" },
  { id: "rent", label: "Rent", type: "expense", color: "var(--chart-1)" },
  { id: "groceries", label: "Groceries", type: "expense", color: "var(--chart-2)" },
  { id: "food", label: "Food & Dining", type: "expense", color: "var(--chart-3)" },
  { id: "transport", label: "Transport", type: "expense", color: "var(--chart-4)" },
  { id: "shopping", label: "Shopping", type: "expense", color: "var(--chart-5)" },
  { id: "bills", label: "Bills & Utilities", type: "expense", color: "var(--chart-6)" },
  { id: "entertainment", label: "Entertainment", type: "expense", color: "var(--chart-7)" },
  { id: "health", label: "Health", type: "expense", color: "var(--chart-8)" },
  { id: "investments", label: "Investments", type: "expense", color: "var(--chart-other)" },
] as const;

const BY_ID = new Map(CATEGORIES.map((c) => [c.id, c]));

export const CATEGORY_IDS = CATEGORIES.map((c) => c.id) as CategoryId[];
export const EXPENSE_CATEGORIES = CATEGORIES.filter((c) => c.type === "expense");
export const INCOME_CATEGORIES = CATEGORIES.filter((c) => c.type === "income");

export function getCategory(id: CategoryId): CategoryMeta {
  const meta = BY_ID.get(id);
  if (!meta) throw new Error(`Unknown category: ${id}`);
  return meta;
}

export function isCategoryId(value: unknown): value is CategoryId {
  return typeof value === "string" && BY_ID.has(value as CategoryId);
}

export function categoriesFor(type: TransactionType) {
  return type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
}
