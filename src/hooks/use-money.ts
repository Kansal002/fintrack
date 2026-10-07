import { useCallback } from "react";
import { useAuth } from "@/features/auth/auth-provider";
import { formatCurrency, type MoneyFormatOptions } from "@/lib/format";

/** Currency formatter bound to the signed-in user's display preferences. */
export function useMoney() {
  const { user } = useAuth();
  const locale = user?.preferences.numberFormat ?? "en-IN";
  const display = user?.preferences.currencyDisplay ?? "symbol";
  return useCallback(
    (amount: number, options: Omit<MoneyFormatOptions, "locale" | "display"> = {}) =>
      formatCurrency(amount, { locale, display, ...options }),
    [locale, display],
  );
}
