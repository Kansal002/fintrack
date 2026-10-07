import type { ReactNode } from "react";

interface TooltipRow {
  key: string;
  label: string;
  value: string;
  color: string;
}

/** Shared tooltip body for Recharts so every chart's hover state looks the same. */
export function ChartTooltip({
  title,
  rows,
  footer,
}: {
  title?: ReactNode;
  rows: TooltipRow[];
  footer?: ReactNode;
}) {
  return (
    <div className="min-w-40 rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-lg">
      {title && <p className="mb-1.5 font-medium text-foreground">{title}</p>}
      <ul className="space-y-1">
        {rows.map((row) => (
          <li key={row.key} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span
                className="size-2 rounded-[2px]"
                style={{ background: row.color }}
                aria-hidden
              />
              {row.label}
            </span>
            <span className="font-medium text-foreground tabular">{row.value}</span>
          </li>
        ))}
      </ul>
      {footer && (
        <div className="mt-1.5 border-t border-border pt-1.5 text-muted-foreground">{footer}</div>
      )}
    </div>
  );
}
