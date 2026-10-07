import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/** Decorative loading placeholder. Wrap groups in an element with aria-busy. */
export function Skeleton({ className, ...props }: ComponentProps<"div">) {
  return (
    <div aria-hidden className={cn("animate-pulse rounded-md bg-muted", className)} {...props} />
  );
}
