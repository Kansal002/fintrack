import { describe, expect, it } from "vitest";
import { makeTransaction } from "@/test/utils";
import { queryTransactions } from "./transaction-query";

const data = [
  makeTransaction({
    id: "a",
    date: "2026-09-01",
    description: "Salary — Acme",
    type: "income",
    category: "salary",
    amount: 145000,
  }),
  makeTransaction({
    id: "b",
    date: "2026-09-03",
    description: "House rent",
    category: "rent",
    amount: 32000,
  }),
  makeTransaction({
    id: "c",
    date: "2026-09-10",
    description: "Swiggy",
    category: "food",
    amount: 450,
    note: "Biryani night",
    createdAt: "2026-09-10T09:00:00Z",
  }),
  makeTransaction({
    id: "d",
    date: "2026-08-20",
    description: "Zomato",
    category: "food",
    amount: 820,
  }),
  makeTransaction({
    id: "e",
    date: "2026-09-10",
    description: "Uber",
    category: "transport",
    amount: 230,
    createdAt: "2026-09-10T18:00:00Z",
  }),
];

const ids = (query: Parameters<typeof queryTransactions>[1]) =>
  queryTransactions(data, query).items.map((t) => t.id);

describe("queryTransactions", () => {
  it("sorts newest first by default, breaking date ties by creation time", () => {
    expect(ids({})).toEqual(["e", "c", "b", "a", "d"]);
  });

  it("sorts by amount in both directions", () => {
    expect(ids({ sort: "amount", order: "asc" })).toEqual(["e", "c", "d", "b", "a"]);
    expect(ids({ sort: "amount", order: "desc" })).toEqual(["a", "b", "d", "c", "e"]);
  });

  it("searches description and note case-insensitively", () => {
    expect(ids({ search: "swig" })).toEqual(["c"]);
    expect(ids({ search: "BIRYANI" })).toEqual(["c"]);
    expect(ids({ search: "   " })).toHaveLength(5);
  });

  it("combines type, category and inclusive date-range filters", () => {
    expect(ids({ type: "income" })).toEqual(["a"]);
    expect(ids({ category: "food" })).toEqual(["c", "d"]);
    expect(ids({ from: "2026-09-03", to: "2026-09-10" })).toEqual(["e", "c", "b"]);
    expect(ids({ category: "food", from: "2026-09-01" })).toEqual(["c"]);
  });

  it("paginates and reports totals", () => {
    const page = queryTransactions(data, { page: 2, pageSize: 2 });
    expect(page.items.map((t) => t.id)).toEqual(["b", "a"]);
    expect(page).toMatchObject({ total: 5, page: 2, pageSize: 2, totalPages: 3 });
  });

  it("clamps out-of-range pages instead of returning an empty page", () => {
    const page = queryTransactions(data, { page: 99, pageSize: 2 });
    expect(page.page).toBe(3);
    expect(page.items.map((t) => t.id)).toEqual(["d"]);
  });

  it("does not mutate the input array", () => {
    const before = data.map((t) => t.id);
    queryTransactions(data, { sort: "amount", order: "asc" });
    expect(data.map((t) => t.id)).toEqual(before);
  });
});
