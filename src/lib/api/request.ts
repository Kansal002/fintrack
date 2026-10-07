import { getApiConfig } from "./config";
import { ApiError } from "./errors";

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Simulates a network round-trip around a handler: random latency, an optional
 * random failure, and a structured-clone of the response so callers can never
 * mutate "server" state by reference — just like a real HTTP client.
 */
export async function request<T>(handler: () => T | Promise<T>): Promise<T> {
  const { latency, failureRate } = getApiConfig();
  const [min, max] = latency;
  await sleep(min + Math.random() * Math.max(0, max - min));

  if (failureRate > 0 && Math.random() < failureRate) {
    throw new ApiError("Network error — the request could not be completed.", 503, "NETWORK_ERROR");
  }

  const result = await handler();
  return result === undefined ? result : structuredClone(result);
}
