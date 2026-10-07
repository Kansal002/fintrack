import { describe, expect, it } from "vitest";
import { makeTransaction } from "@/test/utils";
import type { Paginated, Transaction } from "@/types";
import { insertTransaction, removeTransaction, replaceTransaction } from "./optimistic";

const page = (
  items: Transaction[],
  total = items.length,
  pageSize = 3,
): Paginated<Transaction> => ({
  items,
  total,
  page: 1,
  pageSize,
  totalPages: Math.ceil(total / pageSize),
});

describe("optimistic list transforms", () => {
  const a = makeTransaction({ id: "a", date: "2026-09-20" });
  const b = makeTransaction({ id: "b", date: "2026-09-10" });

  it("inserts a matching transaction in sorted position on page 1", () => {
    const fresh = makeTransaction({ id: "new", date: "2026-09-15" });
    const result = insertTransaction(page([a, b]), fresh, {});
    expect(result.items.map((t) => t.id)).toEqual(["a", "new", "b"]);
    expect(result.total).toBe(3);
  });

  it("skips lists whose filters the new transaction doesn't match", () => {
    const fresh = makeTransaction({ id: "new", type: "income", category: "salary" });
    const original = page([a, b]);
    expect(insertTransaction(original, fresh, { type: "expense" })).toBe(original);
  });

  it("keeps the page size when inserting into a full page", () => {
    const c = makeTransaction({ id: "c", date: "2026-09-01" });
    const result = insertTransaction(
      page([a, b, c], 10),
      makeTransaction({ id: "new", date: "2026-09-30" }),
      {},
    );
    expect(result.items.map((t) => t.id)).toEqual(["new", "a", "b"]);
    expect(result.totalPages).toBe(4);
  });

  it("replaces an edited row, or drops it if it no longer matches the filters", () => {
    const edited = { ...b, category: "rent" as const, description: "Edited" };
    expect(replaceTransaction(page([a, b]), edited, {}).items[1].description).toBe("Edited");
    const filtered = replaceTransaction(page([a, b]), edited, { category: "food" });
    expect(filtered.items.map((t) => t.id)).toEqual(["a"]);
    expect(filtered.total).toBe(1);
  });

  it("removes a deleted row and decrements the total", () => {
    const result = removeTransaction(page([a, b]), "a");
    expect(result.items).toEqual([b]);
    expect(result.total).toBe(1);
  });
});
