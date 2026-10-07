"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { DEFAULT_FAILURE_RATE, getApiConfig, setApiConfig } from "@/lib/api";
import { SettingRow, SettingsSection } from "./settings-section";

const RATES = [0.1, 0.3, 0.5, 1] as const;

/**
 * Lets reviewers force API failures to see optimistic-update rollbacks, error
 * states and retry buttons without touching the code.
 */
export function DeveloperSection() {
  const [failureRate, setFailureRate] = useState(() => getApiConfig().failureRate);
  const enabled = failureRate > 0;

  const update = (rate: number) => {
    setApiConfig({ failureRate: rate });
    setFailureRate(rate);
  };

  return (
    <SettingsSection
      title="Network simulation"
      description="The mock API adds 300–700 ms of latency. Inject failures to demo rollbacks and error states."
    >
      <SettingRow
        label="Simulate network errors"
        description={enabled ? "Requests will randomly fail." : "All requests succeed."}
        control={
          <Switch
            checked={enabled}
            aria-label="Simulate network errors"
            onCheckedChange={(checked) => {
              update(checked ? DEFAULT_FAILURE_RATE : 0);
              toast(checked ? "Network errors enabled" : "Network errors disabled", {
                description: checked ? "Try editing or deleting a transaction." : undefined,
              });
            }}
          />
        }
      />
      {enabled && (
        <SettingRow
          label="Failure rate"
          htmlFor="failure-rate"
          description="Share of requests that fail."
          control={
            <Select
              id="failure-rate"
              className="w-full sm:w-40"
              value={String(failureRate)}
              onChange={(e) => update(Number(e.target.value))}
            >
              {RATES.map((rate) => (
                <option key={rate} value={rate}>
                  {rate * 100}%
                </option>
              ))}
            </Select>
          }
        />
      )}
    </SettingsSection>
  );
}
