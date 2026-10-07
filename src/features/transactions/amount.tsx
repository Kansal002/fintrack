"use client";

import { useMoney } from "@/hooks/use-money";
import { cn } from "@/lib/utils";
import type { Transaction } from "@/types";

/** Signed amount: income is green with "+", expenses use the default ink. */
export function Amount({
  transaction,
  className,
}: {
  transaction: Pick<Transaction, "amount" | "type">;
  className?: string;
}) {
  const money = useMoney();
  const isIncome = transaction.type === "income";
  return (
    <span
      className={cn(
        "font-medium whitespace-nowrap tabular",
        isIncome ? "text-success" : "text-foreground",
        className,
      )}
    >
      {money(isIncome ? transaction.amount : -transaction.amount, { signDisplay: "always" })}
    </span>
  );
}
