import { describe, expect, it } from "vitest";
import { parseTransactionQuery, serializeTransactionQuery } from "./use-transaction-filters";

describe("transaction filters ⇄ URL", () => {
  it("round-trips a full set of filters", () => {
    const params = new URLSearchParams(
      "q=swiggy&type=expense&category=food&from=2026-09-01&to=2026-09-30&sort=amount&order=asc&page=3",
    );
    const query = parseTransactionQuery(params);
    expect(query).toEqual({
      search: "swiggy",
      type: "expense",
      category: "food",
      from: "2026-09-01",
      to: "2026-09-30",
      sort: "amount",
      order: "asc",
      page: 3,
      pageSize: 10,
    });
    expect(serializeTransactionQuery(query).toString()).toBe(params.toString());
  });

  it("ignores malformed or unknown values", () => {
    const query = parseTransactionQuery(
      new URLSearchParams(
        "type=refund&category=crypto&from=2026-02-31&to=yesterday&sort=name&page=-4",
      ),
    );
    expect(query).toEqual({ sort: "date", order: "desc", page: 1, pageSize: 10 });
  });

  it("omits defaults to keep shareable URLs short", () => {
    expect(serializeTransactionQuery({ sort: "date", order: "desc", page: 1 }).toString()).toBe("");
  });
});
