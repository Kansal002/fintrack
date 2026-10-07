import type { User } from "@/types";
import { toPublicUser, usersTable } from "./db";
import { ApiError } from "./errors";
import { readJSON, removeKey, STORAGE_PREFIX, writeJSON } from "./storage";

/**
 * Client-side session store. Exposes a `useSyncExternalStore`-compatible
 * subscribe/getSnapshot pair so React re-renders on login/logout/profile
 * changes — including changes made in another browser tab.
 */

interface StoredSession {
  userId: string;
  createdAt: string;
}

export type AuthSnapshot =
  | { status: "loading"; user: null }
  | { status: "authenticated"; user: User }
  | { status: "unauthenticated"; user: null };

const SESSION_KEY = "session";
const CHANGE_EVENT = "fintrack:session-change";

export const SERVER_SNAPSHOT: AuthSnapshot = { status: "loading", user: null };
const SIGNED_OUT: AuthSnapshot = { status: "unauthenticated", user: null };

let cached: AuthSnapshot | null = null;

function computeSnapshot(): AuthSnapshot {
  const session = readJSON<StoredSession | null>(SESSION_KEY, null);
  const stored = session ? usersTable.findById(session.userId) : undefined;
  return stored ? { status: "authenticated", user: toPublicUser(stored) } : SIGNED_OUT;
}

export function getAuthSnapshot(): AuthSnapshot {
  cached ??= computeSnapshot();
  return cached;
}

export function notifySessionChange(): void {
  cached = null;
  if (typeof window !== "undefined") window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function subscribeToSession(callback: () => void): () => void {
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key.startsWith(STORAGE_PREFIX)) notifySessionChange();
  };
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener("storage", onStorage);
  };
}

export function startSession(userId: string): void {
  writeJSON(SESSION_KEY, { userId, createdAt: new Date().toISOString() } satisfies StoredSession);
  notifySessionChange();
}

export function endSession(): void {
  removeKey(SESSION_KEY);
  notifySessionChange();
}

/** Equivalent of validating a bearer token server-side. */
export function requireUserId(): string {
  const session = readJSON<StoredSession | null>(SESSION_KEY, null);
  if (!session || !usersTable.findById(session.userId)) {
    throw new ApiError("Your session has expired. Please log in again.", 401, "UNAUTHORIZED");
  }
  return session.userId;
}
