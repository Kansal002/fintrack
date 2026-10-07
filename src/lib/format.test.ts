import { describe, expect, it } from "vitest";
import { formatCurrency, formatDate, formatPercent, percentChange } from "./format";

describe("formatCurrency", () => {
  it("uses Indian digit grouping by default", () => {
    expect(formatCurrency(123456)).toBe("₹1,23,456");
    expect(formatCurrency(10000000)).toBe("₹1,00,00,000");
  });

  it("supports international grouping", () => {
    expect(formatCurrency(123456, { locale: "en-US" })).toBe("₹123,456");
  });

  it("shows paise only when the amount has a fractional part", () => {
    expect(formatCurrency(1499)).toBe("₹1,499");
    expect(formatCurrency(1499.5)).toBe("₹1,499.50");
    expect(formatCurrency(1499, { decimals: true })).toBe("₹1,499.00");
  });

  it("formats negatives and explicit signs", () => {
    expect(formatCurrency(-2500)).toBe("-₹2,500");
    expect(formatCurrency(2500, { signDisplay: "always" })).toBe("+₹2,500");
    expect(formatCurrency(-0)).toBe("₹0");
  });

  it("can display the ISO code instead of the symbol", () => {
    expect(formatCurrency(5000, { display: "code" })).toBe("INR 5,000");
  });

  it("uses lakh-based compact notation for Indian locale", () => {
    expect(formatCurrency(150000, { compact: true })).toBe("₹1.5L");
    expect(formatCurrency(150000, { compact: true, locale: "en-US" })).toBe("₹150K");
  });
});

describe("percentChange", () => {
  it("returns the relative change as a fraction", () => {
    expect(percentChange(120, 100)).toBeCloseTo(0.2);
    expect(percentChange(80, 100)).toBeCloseTo(-0.2);
  });

  it("measures change against the magnitude of a negative baseline", () => {
    expect(percentChange(-50, -100)).toBeCloseTo(0.5);
  });

  it("returns null when there is no baseline", () => {
    expect(percentChange(100, 0)).toBeNull();
  });
});

describe("formatPercent / formatDate", () => {
  it("formats fractions as percentages", () => {
    expect(formatPercent(0.1234)).toBe("12.3%");
    expect(formatPercent(0.05, { signDisplay: "always", digits: 0 })).toBe("+5%");
    expect(formatPercent(Number.NaN)).toBe("—");
  });

  it("formats ISO calendar dates without timezone drift", () => {
    expect(formatDate("2026-01-01")).toBe("1 Jan 2026");
  });
});
