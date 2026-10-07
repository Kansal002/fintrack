import { z } from "zod";
import { categoriesFor, isCategoryId } from "@/lib/categories";
import { isValidISODate, todayISO } from "@/lib/dates";
import type { Transaction, TransactionInput } from "@/types";

export const MAX_AMOUNT = 10_000_000;

/**
 * Form values are kept as strings (what inputs actually produce) and
 * converted to a typed `TransactionInput` only after validation.
 */
export const transactionFormSchema = z
  .object({
    type: z.enum(["income", "expense"]),
    amount: z
      .string()
      .trim()
      .transform((value) => value.replace(/,/g, ""))
      .pipe(
        z
          .string()
          .min(1, "Enter an amount")
          .regex(/^\d+(\.\d{1,2})?$/, "Enter a valid amount (up to 2 decimal places)")
          .refine((value) => Number(value) > 0, "Amount must be greater than zero")
          .refine((value) => Number(value) <= MAX_AMOUNT, "Amount must be ₹1,00,00,000 or less"),
      ),
    description: z
      .string()
      .trim()
      .min(2, "Description must be at least 2 characters")
      .max(80, "Description must be 80 characters or fewer"),
    category: z.string(),
    date: z
      .string()
      .min(1, "Pick a date")
      .refine(isValidISODate, "Enter a valid date")
      .refine((value) => value <= todayISO(), "Date can't be in the future"),
    note: z.string().trim().max(200, "Note must be 200 characters or fewer"),
  })
  .superRefine((values, ctx) => {
    if (!categoriesFor(values.type).some((c) => c.id === values.category)) {
      ctx.addIssue({ code: "custom", path: ["category"], message: "Choose a category" });
    }
  });

export type TransactionFormInput = z.input<typeof transactionFormSchema>;
export type TransactionFormValues = z.output<typeof transactionFormSchema>;

export function toTransactionInput(values: TransactionFormValues): TransactionInput {
  if (!isCategoryId(values.category)) throw new Error(`Invalid category: ${values.category}`);
  return {
    type: values.type,
    amount: Number(values.amount),
    description: values.description,
    category: values.category,
    date: values.date,
    ...(values.note ? { note: values.note } : {}),
  };
}

export function toFormValues(tx?: Transaction): TransactionFormInput {
  return {
    type: tx?.type ?? "expense",
    amount: tx ? String(tx.amount) : "",
    description: tx?.description ?? "",
    category: tx?.category ?? "",
    date: tx?.date ?? todayISO(),
    note: tx?.note ?? "",
  };
}
