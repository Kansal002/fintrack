import { useSyncExternalStore } from "react";
import {
  getThemePreference,
  resolveTheme,
  setThemePreference,
  subscribeToTheme,
  type ThemePreference,
} from "@/lib/theme";

const getServerPreference = (): ThemePreference => "system";
const getResolvedTheme = () => resolveTheme(getThemePreference());
const getServerResolvedTheme = () => "light" as const;

/** Theme preference plus the concrete theme currently applied. Hydration-safe. */
export function useTheme() {
  const theme = useSyncExternalStore(subscribeToTheme, getThemePreference, getServerPreference);
  const resolvedTheme = useSyncExternalStore(
    subscribeToTheme,
    getResolvedTheme,
    getServerResolvedTheme,
  );
  return { theme, resolvedTheme, setTheme: setThemePreference };
}
