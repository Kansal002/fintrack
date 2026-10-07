import type { CurrencyDisplay, NumberFormat } from "@/types";

export interface MoneyFormatOptions {
  locale?: NumberFormat;
  display?: CurrencyDisplay;
  /** Show paise. Defaults to `true` only when the amount has a fractional part. */
  decimals?: boolean;
  /** Use compact notation (₹1.2L / ₹1.2M). */
  compact?: boolean;
  /** Prefix a + for positive values (useful for deltas and income rows). */
  signDisplay?: "auto" | "always" | "exceptZero";
}

const cache = new Map<string, Intl.NumberFormat>();

function getFormatter(key: string, locale: string, options: Intl.NumberFormatOptions) {
  let formatter = cache.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, options);
    cache.set(key, formatter);
  }
  return formatter;
}

/**
 * Format a rupee amount. Defaults to Indian digit grouping (₹1,23,456).
 *
 * @example formatCurrency(123456) // "₹1,23,456"
 * @example formatCurrency(123456, { locale: "en-US" }) // "₹123,456"
 */
export function formatCurrency(amount: number, options: MoneyFormatOptions = {}): string {
  const { locale = "en-IN", display = "symbol", compact = false, signDisplay = "auto" } = options;
  const value = Object.is(amount, -0) ? 0 : amount;
  const decimals =
    options.decimals ?? (!compact && !Number.isInteger(Math.round(value * 100) / 100));
  const key = `${locale}|${display}|${compact}|${decimals}|${signDisplay}`;
  const formatter = getFormatter(key, locale, {
    style: "currency",
    currency: "INR",
    currencyDisplay: display,
    notation: compact ? "compact" : "standard",
    minimumFractionDigits: compact ? 0 : decimals ? 2 : 0,
    maximumFractionDigits: compact ? 1 : decimals ? 2 : 0,
    signDisplay,
  });
  // Intl inserts a non-breaking space after "INR"; normalise for consistent output.
  return formatter.format(value).replace(/ /g, " ");
}

/** Format a fraction as a percentage: 0.1234 -> "12.3%". */
export function formatPercent(
  fraction: number,
  {
    digits = 1,
    signDisplay = "auto",
  }: { digits?: number; signDisplay?: "auto" | "always" | "exceptZero" } = {},
): string {
  if (!Number.isFinite(fraction)) return "—";
  return getFormatter(`pct|${digits}|${signDisplay}`, "en-US", {
    style: "percent",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
    signDisplay,
  }).format(fraction);
}

/**
 * Relative change between two values as a fraction, or `null` when the
 * previous value is zero (a percentage change is undefined there).
 */
export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return (current - previous) / Math.abs(previous);
}

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
});
const shortDateFormatter = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" });
const monthFormatter = new Intl.DateTimeFormat("en-IN", { month: "short" });
const longMonthFormatter = new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" });

function fromISO(value: string) {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

/** "2026-10-07" -> "7 Oct 2026" */
export const formatDate = (iso: string) => dateFormatter.format(fromISO(iso));
/** "2026-10-07" -> "7 Oct" */
export const formatShortDate = (iso: string) => shortDateFormatter.format(fromISO(iso));
/** "2026-10" -> "Oct" */
export const formatMonthShort = (monthKey: string) =>
  monthFormatter.format(fromISO(`${monthKey}-01`));
/** "2026-10" -> "October 2026" */
export const formatMonthLong = (monthKey: string) =>
  longMonthFormatter.format(fromISO(`${monthKey}-01`));
