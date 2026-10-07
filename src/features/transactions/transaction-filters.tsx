"use client";

import { Search, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import { CATEGORIES, categoriesFor } from "@/lib/categories";
import { isCategoryId } from "@/lib/categories";
import type { TransactionQuery } from "@/types";
import type { FilterPatch } from "./use-transaction-filters";

interface TransactionFiltersProps {
  query: TransactionQuery;
  onChange: (patch: FilterPatch) => void;
  onClear: () => void;
  activeFilterCount: number;
}

export function TransactionFilters({
  query,
  onChange,
  onClear,
  activeFilterCount,
}: TransactionFiltersProps) {
  const [search, setSearch] = useState(query.search ?? "");
  const debouncedSearch = useDebouncedCallback(
    (value: string) => onChange({ search: value.trim() || undefined }),
    300,
  );
  const categories = query.type ? categoriesFor(query.type) : CATEGORIES;

  const clearAll = () => {
    debouncedSearch.cancel();
    setSearch("");
    onClear();
  };

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-[minmax(0,1.6fr)_repeat(4,minmax(0,1fr))_auto] xl:items-end">
      <div className="col-span-2 flex flex-col gap-1.5 md:col-span-3 xl:col-span-1">
        <Label htmlFor="tx-search">Search</Label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            id="tx-search"
            type="search"
            placeholder="Description or note…"
            className="pl-9"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              debouncedSearch.run(event.target.value);
            }}
          />
        </div>
      </div>

      <Button
        variant="ghost"
        onClick={clearAll}
        disabled={activeFilterCount === 0}
        className="order-last col-span-2 self-end md:order-none md:col-span-1 xl:order-last"
      >
        <X aria-hidden />
        Clear
        {activeFilterCount > 0 && <span className="sr-only"> {activeFilterCount} filters</span>}
      </Button>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="tx-type">Type</Label>
        <Select
          id="tx-type"
          value={query.type ?? ""}
          onChange={(event) => {
            const type =
              event.target.value === "income" || event.target.value === "expense"
                ? event.target.value
                : undefined;
            // Drop a category that doesn't belong to the newly selected type.
            const keepCategory =
              type && query.category && categoriesFor(type).some((c) => c.id === query.category);
            onChange({ type, category: keepCategory || !type ? query.category : undefined });
          }}
        >
          <option value="">All types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="tx-category">Category</Label>
        <Select
          id="tx-category"
          value={query.category ?? ""}
          onChange={(event) =>
            onChange({
              category: isCategoryId(event.target.value) ? event.target.value : undefined,
            })
          }
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="tx-from">From</Label>
        <Input
          id="tx-from"
          type="date"
          value={query.from ?? ""}
          max={query.to}
          onChange={(event) => onChange({ from: event.target.value || undefined })}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="tx-to">To</Label>
        <Input
          id="tx-to"
          type="date"
          value={query.to ?? ""}
          min={query.from}
          onChange={(event) => onChange({ to: event.target.value || undefined })}
        />
      </div>
    </div>
  );
}
