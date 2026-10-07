"use client";

import { useMutation } from "@tanstack/react-query";
import { Monitor, Moon, Sun } from "lucide-react";
import { toast } from "sonner";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Select } from "@/components/ui/select";
import { useUser } from "@/features/auth/auth-provider";
import { useMoney } from "@/hooks/use-money";
import { useTheme } from "@/hooks/use-theme";
import { api, getErrorMessage } from "@/lib/api";
import type { ThemePreference } from "@/lib/theme";
import type { CurrencyDisplay, NumberFormat, UserPreferences } from "@/types";
import { SettingRow, SettingsSection } from "./settings-section";

export function PreferencesSection() {
  const user = useUser();
  const money = useMoney();
  const { theme, setTheme } = useTheme();

  const save = useMutation({
    mutationFn: (preferences: Partial<UserPreferences>) => api.auth.updateProfile({ preferences }),
    onSuccess: () => toast.success("Preferences saved"),
    onError: (error) =>
      toast.error("Couldn't save preferences", { description: getErrorMessage(error) }),
  });

  return (
    <SettingsSection title="Preferences" description="Appearance and how amounts are displayed.">
      <SettingRow
        label="Theme"
        description="Match your system or pick a fixed theme."
        control={
          <SegmentedControl<ThemePreference>
            label="Theme"
            value={theme}
            onChange={setTheme}
            options={[
              { value: "light", label: "Light", icon: <Sun aria-hidden /> },
              { value: "dark", label: "Dark", icon: <Moon aria-hidden /> },
              { value: "system", label: "System", icon: <Monitor aria-hidden /> },
            ]}
          />
        }
      />
      <SettingRow
        label="Number format"
        htmlFor="pref-number-format"
        description="Digit grouping for amounts."
        control={
          <Select
            id="pref-number-format"
            className="w-full sm:w-56"
            value={user.preferences.numberFormat}
            disabled={save.isPending}
            onChange={(e) => save.mutate({ numberFormat: e.target.value as NumberFormat })}
          >
            <option value="en-IN">Indian (1,23,456)</option>
            <option value="en-US">International (123,456)</option>
          </Select>
        }
      />
      <SettingRow
        label="Currency display"
        htmlFor="pref-currency-display"
        description={`Preview: ${money(123456.78)}`}
        control={
          <Select
            id="pref-currency-display"
            className="w-full sm:w-56"
            value={user.preferences.currencyDisplay}
            disabled={save.isPending}
            onChange={(e) => save.mutate({ currencyDisplay: e.target.value as CurrencyDisplay })}
          >
            <option value="symbol">Symbol (₹)</option>
            <option value="code">Code (INR)</option>
          </Select>
        }
      />
    </SettingsSection>
  );
}
