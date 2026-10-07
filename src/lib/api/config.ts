import { readJSON, writeJSON } from "./storage";

/**
 * Network simulation settings for the mock backend. Exposed in Settings so the
 * optimistic-update rollback and error states can be demoed on purpose.
 */
export interface ApiConfig {
  /** Probability (0–1) that any request fails with a simulated network error. */
  failureRate: number;
  /** Min/max simulated latency in milliseconds. */
  latency: [min: number, max: number];
}

const KEY = "api-config";
export const DEFAULT_FAILURE_RATE = 0.3;
const DEFAULTS: ApiConfig = { failureRate: 0, latency: [300, 700] };

let override: Partial<ApiConfig> | null = null;

export function getApiConfig(): ApiConfig {
  return { ...DEFAULTS, ...readJSON<Partial<ApiConfig>>(KEY, {}), ...override };
}

export function setApiConfig(patch: Partial<ApiConfig>): ApiConfig {
  const next = { ...readJSON<Partial<ApiConfig>>(KEY, {}), ...patch };
  writeJSON(KEY, next);
  return getApiConfig();
}

/** Test hook: force config values without touching storage (e.g. zero latency). */
export function overrideApiConfig(value: Partial<ApiConfig> | null): void {
  override = value;
}
