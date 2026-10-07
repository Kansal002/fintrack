import { describe, expect, it } from "vitest";
import { parseBudgetLimit } from "./budget-row";
import { getBudgetStatus } from "./status";

describe("getBudgetStatus", () => {
  it.each([
    [0, 0, "unset"],
    [500, 0, "unset"],
    [7499, 10000, "on-track"],
    [7500, 10000, "near-limit"],
    [10000, 10000, "near-limit"],
    [10001, 10000, "over"],
  ] as const)("spent %i of %i → %s", (spent, limit, expected) => {
    expect(getBudgetStatus(spent, limit)).toBe(expected);
  });
});

describe("parseBudgetLimit", () => {
  it("accepts whole rupees with grouping and symbols", () => {
    expect(parseBudgetLimit("₹12,000")).toEqual({ value: 12000 });
    expect(parseBudgetLimit("0")).toEqual({ value: 0 });
  });

  it("rejects empty, fractional and oversized values", () => {
    expect(parseBudgetLimit("  ")).toHaveProperty("error");
    expect(parseBudgetLimit("99.5")).toEqual({ error: "Use whole rupees only" });
    expect(parseBudgetLimit("-5")).toEqual({ error: "Use whole rupees only" });
    expect(parseBudgetLimit("200000000")).toHaveProperty("error");
  });
});
