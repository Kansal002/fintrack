import { getCategory } from "@/lib/categories";
import type { Transaction } from "@/types";

/**
 * Escape a single CSV cell (RFC 4180). Text cells that start with a formula
 * trigger are prefixed with `'` to prevent CSV/formula injection in spreadsheet
 * apps; plain numbers (including negatives) are left as-is.
 */
export function escapeCsvCell(value: string | number): string {
  let text = String(value);
  const isNumeric = /^-?\d+(\.\d+)?$/.test(text);
  if (!isNumeric && /^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function transactionsToCsv(transactions: readonly Transaction[]): string {
  const header = ["Date", "Description", "Category", "Type", "Amount (INR)", "Note"];
  const rows = transactions.map((tx) => [
    tx.date,
    tx.description,
    getCategory(tx.category).label,
    tx.type,
    (tx.type === "expense" ? -tx.amount : tx.amount).toFixed(2),
    tx.note ?? "",
  ]);
  return [header, ...rows].map((row) => row.map(escapeCsvCell).join(",")).join("\r\n");
}

/** Trigger a browser download for a CSV string (BOM added for Excel). */
export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob(["﻿", csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = Object.assign(document.createElement("a"), { href: url, download: filename });
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
