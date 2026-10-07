import { describe, expect, it } from "vitest";
import { makeTransaction } from "@/test/utils";
import { escapeCsvCell, transactionsToCsv } from "./csv";

describe("escapeCsvCell", () => {
  it("leaves plain values untouched", () => {
    expect(escapeCsvCell("Groceries")).toBe("Groceries");
    expect(escapeCsvCell(-42.5)).toBe("-42.5");
  });

  it("quotes cells containing commas, quotes or newlines", () => {
    expect(escapeCsvCell("Food, drinks")).toBe('"Food, drinks"');
    expect(escapeCsvCell('The "best" cafe')).toBe('"The ""best"" cafe"');
    expect(escapeCsvCell("line 1\nline 2")).toBe('"line 1\nline 2"');
  });

  it("neutralises spreadsheet formula injection in text cells", () => {
    expect(escapeCsvCell('=HYPERLINK("x")')).toBe('"\'=HYPERLINK(""x"")"');
    expect(escapeCsvCell("+911234")).toBe("'+911234");
    expect(escapeCsvCell("-1+1")).toBe("'-1+1");
  });

  it("does not mangle negative numbers", () => {
    expect(escapeCsvCell("-32000.00")).toBe("-32000.00");
  });
});

describe("transactionsToCsv", () => {
  it("writes a header and signs expenses negative", () => {
    const csv = transactionsToCsv([
      makeTransaction({
        date: "2026-09-01",
        description: "Salary",
        type: "income",
        category: "salary",
        amount: 145000,
      }),
      makeTransaction({
        date: "2026-09-03",
        description: "Rent",
        category: "rent",
        amount: 32000,
        note: "Sept",
      }),
    ]);
    expect(csv.split("\r\n")).toEqual([
      "Date,Description,Category,Type,Amount (INR),Note",
      "2026-09-01,Salary,Salary,income,145000.00,",
      "2026-09-03,Rent,Rent,expense,-32000.00,Sept",
    ]);
  });
});
