"use client";

import { useId, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Option<T extends string> {
  value: T;
  label: ReactNode;
  icon?: ReactNode;
}

interface SegmentedControlProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: readonly Option<T>[];
  /** Accessible name for the radio group. */
  label: string;
  name?: string;
  className?: string;
  size?: "sm" | "md";
}

/**
 * A radio group styled as a segmented control. Built on native radio inputs,
 * so arrow-key navigation and form semantics come for free.
 */
export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  label,
  name,
  className,
  size = "md",
}: SegmentedControlProps<T>) {
  const autoName = useId();
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn("inline-flex rounded-lg border border-border bg-muted p-0.5", className)}
    >
      {options.map((option) => {
        const checked = option.value === value;
        return (
          <label
            key={option.value}
            className={cn(
              "relative flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-md font-medium whitespace-nowrap transition-colors has-focus-visible:outline-2 has-focus-visible:outline-ring [&_svg]:size-4",
              size === "sm" ? "h-7 px-2.5 text-xs" : "h-8 px-3 text-sm",
              checked
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <input
              type="radio"
              className="sr-only"
              name={name ?? autoName}
              value={option.value}
              checked={checked}
              onChange={() => onChange(option.value)}
            />
            {option.icon}
            {option.label}
          </label>
        );
      })}
    </div>
  );
}
