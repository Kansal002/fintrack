import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach } from "vitest";
import { overrideApiConfig } from "@/lib/api/config";

beforeEach(() => {
  localStorage.clear();
  // Tests shouldn't wait on simulated network latency.
  overrideApiConfig({ latency: [0, 0] });
});

afterEach(() => {
  cleanup();
  overrideApiConfig(null);
});
