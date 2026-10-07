import { getCategory } from "@/lib/categories";
import type { CategoryId } from "@/types";

export function CategoryBadge({ category }: { category: CategoryId }) {
  const meta = getCategory(category);
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-border px-2 py-0.5 text-xs font-medium whitespace-nowrap text-muted-foreground">
      <span
        className="size-2 shrink-0 rounded-full"
        style={{ background: meta.color }}
        aria-hidden
      />
      {meta.label}
    </span>
  );
}
