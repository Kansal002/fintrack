import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface StatDelta {
  /** Display text, e.g. "+12.4%" or "+3.1 pts". */
  label: string;
  direction: "up" | "down" | "flat";
  /** Whether this direction is good news for the user (colours the badge). */
  sentiment: "positive" | "negative" | "neutral";
}

interface StatCardProps {
  label: string;
  value: string;
  icon: ReactNode;
  delta?: StatDelta | null;
  comparison?: string;
}

const sentimentClasses = {
  positive: "bg-success-soft text-success",
  negative: "bg-danger-soft text-danger",
  neutral: "bg-muted text-muted-foreground",
} as const;

export function StatCard({
  label,
  value,
  icon,
  delta,
  comparison = "vs same period last month",
}: StatCardProps) {
  const DeltaIcon =
    delta?.direction === "up" ? ArrowUpRight : delta?.direction === "down" ? ArrowDownRight : Minus;
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-medium text-muted-foreground">{label}</h2>
        <span className="text-muted-foreground [&_svg]:size-4" aria-hidden>
          {icon}
        </span>
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight">{value}</p>
      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
        {delta ? (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-medium",
              sentimentClasses[delta.sentiment],
            )}
          >
            <DeltaIcon className="size-3.5" aria-hidden />
            <span className="sr-only">
              {delta.direction === "up" ? "Up" : delta.direction === "down" ? "Down" : "No change"}
            </span>
            {delta.label}
          </span>
        ) : (
          <span className="rounded-md bg-muted px-1.5 py-0.5 font-medium text-muted-foreground">
            New
          </span>
        )}
        <span className="text-muted-foreground">{comparison}</span>
      </div>
    </Card>
  );
}

export function StatCardSkeleton() {
  return (
    <Card className="p-5" aria-hidden>
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="size-4" />
      </div>
      <Skeleton className="mt-4 h-7 w-32" />
      <Skeleton className="mt-3 h-4 w-40" />
    </Card>
  );
}
