/**
 * Thin, SSR-safe wrapper around localStorage with JSON (de)serialisation and an
 * in-memory fallback (private mode, quota errors, tests without a DOM).
 */

const memory = new Map<string, string>();

function backend(): Pick<Storage, "getItem" | "setItem" | "removeItem"> {
  try {
    if (typeof window !== "undefined" && window.localStorage) return window.localStorage;
  } catch {
    // Access can throw (e.g. blocked third-party storage). Fall through.
  }
  return {
    getItem: (k) => memory.get(k) ?? null,
    setItem: (k, v) => void memory.set(k, v),
    removeItem: (k) => void memory.delete(k),
  };
}

export const STORAGE_PREFIX = "fintrack:";

export function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = backend().getItem(STORAGE_PREFIX + key);
    return raw == null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function writeJSON(key: string, value: unknown): void {
  try {
    backend().setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch {
    // Quota exceeded or storage disabled — the demo keeps working in memory.
    memory.set(STORAGE_PREFIX + key, JSON.stringify(value));
  }
}

export function removeKey(key: string): void {
  try {
    backend().removeItem(STORAGE_PREFIX + key);
  } catch {
    memory.delete(STORAGE_PREFIX + key);
  }
}
