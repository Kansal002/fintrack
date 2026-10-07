import { cn } from "@/lib/utils";

interface ProgressProps {
  /** 0–1+; values above 1 render as a full bar. */
  value: number;
  label: string;
  valueText?: string;
  className?: string;
  indicatorClassName?: string;
}

export function Progress({
  value,
  label,
  valueText,
  className,
  indicatorClassName,
}: ProgressProps) {
  const pct = Math.round(Math.min(Math.max(value, 0), 1) * 100);
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      aria-valuetext={valueText}
      className={cn("h-2 w-full overflow-hidden rounded-full bg-muted", className)}
    >
      <div
        className={cn(
          "h-full rounded-full transition-[width] duration-500 ease-out",
          indicatorClassName,
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
