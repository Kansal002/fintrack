"use client";

import {
  AlertTriangle,
  Check,
  CircleCheck,
  CircleSlash,
  OctagonAlert,
  Pencil,
  X,
} from "lucide-react";
import { useId, useRef, useState, type FormEvent } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useMoney } from "@/hooks/use-money";
import { getCategory } from "@/lib/categories";
import { formatPercent } from "@/lib/format";
import type { BudgetWithSpend, CategoryId } from "@/types";
import { getBudgetStatus, STATUS_META } from "./status";

const STATUS_ICON = {
  unset: CircleSlash,
  "on-track": CircleCheck,
  "near-limit": AlertTriangle,
  over: OctagonAlert,
} as const;

export function parseBudgetLimit(raw: string): { value: number } | { error: string } {
  const cleaned = raw.replace(/[,\s₹]/g, "");
  if (cleaned === "") return { error: "Enter an amount (0 to remove the budget)" };
  if (!/^\d+$/.test(cleaned)) return { error: "Use whole rupees only" };
  const value = Number(cleaned);
  if (value > 10_000_000) return { error: "Budget must be ₹1,00,00,000 or less" };
  return { value };
}

interface BudgetRowProps {
  budget: BudgetWithSpend;
  onSave: (category: CategoryId, limit: number) => void;
}

export function BudgetRow({ budget, onSave }: BudgetRowProps) {
  const money = useMoney();
  const meta = getCategory(budget.category);
  const status = getBudgetStatus(budget.spent, budget.limit);
  const statusMeta = STATUS_META[status];
  const StatusIcon = STATUS_ICON[status];
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const editButtonRef = useRef<HTMLButtonElement>(null);
  const inputId = useId();
  const errorId = `${inputId}-error`;

  const remaining = budget.limit - budget.spent;
  const ratio = budget.limit > 0 ? budget.spent / budget.limit : 0;

  const startEditing = () => {
    setDraft(budget.limit > 0 ? String(budget.limit) : "");
    setError(null);
    setEditing(true);
  };

  /** Leave edit mode and return focus to the edit button for keyboard users. */
  const stopEditing = () => {
    setEditing(false);
    requestAnimationFrame(() => editButtonRef.current?.focus());
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const result = parseBudgetLimit(draft);
    if ("error" in result) {
      setError(result.error);
      return;
    }
    if (result.value !== budget.limit) onSave(budget.category, result.value);
    stopEditing();
  };

  return (
    <li className="px-5 py-4">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span
          className="size-2.5 shrink-0 rounded-full"
          style={{ background: meta.color }}
          aria-hidden
        />
        <h3 className="text-sm font-medium">{meta.label}</h3>
        <Badge tone={statusMeta.tone}>
          <StatusIcon className="size-3" aria-hidden />
          {statusMeta.label}
        </Badge>

        <div className="ml-auto flex items-center gap-2">
          {editing ? (
            <form onSubmit={submit} className="flex items-start gap-1.5" noValidate>
              <div>
                <label htmlFor={inputId} className="sr-only">
                  Monthly budget for {meta.label} in rupees
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-sm text-muted-foreground">
                    ₹
                  </span>
                  <Input
                    id={inputId}
                    autoFocus
                    inputMode="numeric"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => e.key === "Escape" && stopEditing()}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? errorId : undefined}
                    className="h-8 w-32 pl-6 text-right tabular"
                  />
                </div>
              </div>
              <Button
                type="submit"
                size="icon"
                className="size-8"
                aria-label={`Save ${meta.label} budget`}
              >
                <Check aria-hidden />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={stopEditing}
                aria-label="Cancel editing"
              >
                <X aria-hidden />
              </Button>
            </form>
          ) : (
            <>
              <p className="text-sm tabular">
                <span className="font-semibold">{money(budget.spent)}</span>
                <span className="text-muted-foreground">
                  {" "}
                  / {budget.limit > 0 ? money(budget.limit) : "—"}
                </span>
              </p>
              <Button
                ref={editButtonRef}
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={startEditing}
                aria-label={`Edit ${meta.label} budget`}
              >
                <Pencil aria-hidden />
              </Button>
            </>
          )}
        </div>
      </div>

      {editing && error && (
        <p id={errorId} role="alert" className="mt-2 text-right text-xs font-medium text-danger">
          {error}
        </p>
      )}

      <Progress
        className="mt-3"
        value={ratio}
        label={`${meta.label} budget used`}
        valueText={
          budget.limit > 0
            ? `${formatPercent(ratio, { digits: 0 })} used, ${statusMeta.label}`
            : "No budget set"
        }
        indicatorClassName={statusMeta.bar}
      />
      <p className="mt-2 text-xs text-muted-foreground">
        {budget.limit <= 0
          ? "Set a monthly limit to track this category."
          : remaining >= 0
            ? `${money(remaining)} left · ${formatPercent(ratio, { digits: 0 })} used`
            : `${money(-remaining)} over budget`}
      </p>
    </li>
  );
}
