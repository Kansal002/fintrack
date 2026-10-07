/**
 * Domain types shared by the API layer and the UI.
 * Amounts are stored in rupees as positive numbers; `type` carries the sign.
 */

export type TransactionType = "income" | "expense";

export type CategoryId =
  | "salary"
  | "freelance"
  | "rent"
  | "groceries"
  | "food"
  | "transport"
  | "shopping"
  | "bills"
  | "entertainment"
  | "health"
  | "investments";

export interface Transaction {
  id: string;
  /** Calendar date in `YYYY-MM-DD` (local time). */
  date: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: CategoryId;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export type TransactionInput = Pick<
  Transaction,
  "date" | "description" | "amount" | "type" | "category" | "note"
>;

export type SortField = "date" | "amount";
export type SortOrder = "asc" | "desc";

export interface TransactionQuery {
  search?: string;
  category?: CategoryId;
  type?: TransactionType;
  /** Inclusive lower bound, `YYYY-MM-DD`. */
  from?: string;
  /** Inclusive upper bound, `YYYY-MM-DD`. */
  to?: string;
  sort?: SortField;
  order?: SortOrder;
  page?: number;
  pageSize?: number;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface Budget {
  category: CategoryId;
  /** Monthly limit in rupees. 0 means "no budget set". */
  limit: number;
}

export interface BudgetWithSpend extends Budget {
  spent: number;
}

export interface BudgetsResponse {
  /** `YYYY-MM` */
  month: string;
  budgets: BudgetWithSpend[];
}

export interface MonthlyPoint {
  /** `YYYY-MM` */
  month: string;
  income: number;
  expense: number;
}

export interface CategoryAmount {
  category: CategoryId;
  amount: number;
}

export interface Metric {
  value: number;
  previous: number;
}

export interface Summary {
  /** ISO date the summary was computed for (today). */
  asOf: string;
  balance: Metric;
  income: Metric;
  expenses: Metric;
  /** Savings rate as a fraction (0.25 = 25%). */
  savingsRate: Metric;
  monthly: MonthlyPoint[];
  spendingThisMonth: CategoryAmount[];
  spendingSixMonths: CategoryAmount[];
  transactionCount: number;
}

export type NumberFormat = "en-IN" | "en-US";
export type CurrencyDisplay = "symbol" | "code";

export interface UserPreferences {
  numberFormat: NumberFormat;
  currencyDisplay: CurrencyDisplay;
}

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  isDemo: boolean;
  preferences: UserPreferences;
}
