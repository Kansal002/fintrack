"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  api,
  getAuthSnapshot,
  SERVER_SNAPSHOT,
  subscribeToSession,
  type AuthSnapshot,
} from "@/lib/api";
import type { User } from "@/types";

type AuthContextValue = AuthSnapshot & {
  logOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const getServerSnapshot = () => SERVER_SNAPSHOT;

/**
 * Exposes the current session to the tree. Session state lives in an external
 * store (localStorage-backed) and is read with `useSyncExternalStore`, so it's
 * hydration-safe and stays in sync across browser tabs.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const snapshot = useSyncExternalStore(subscribeToSession, getAuthSnapshot, getServerSnapshot);
  const queryClient = useQueryClient();

  // Never leak one account's cached data into another's session.
  const userId = snapshot.user?.id ?? null;
  const previousUserId = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    if (snapshot.status === "loading") return;
    if (previousUserId.current !== undefined && previousUserId.current !== userId) {
      queryClient.clear();
    }
    previousUserId.current = userId;
  }, [snapshot.status, userId, queryClient]);

  const logOut = useCallback(async () => {
    await api.auth.logOut();
    queryClient.clear();
  }, [queryClient]);

  const value = useMemo(() => ({ ...snapshot, logOut }), [snapshot, logOut]);
  return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth(): AuthContextValue {
  const context = use(AuthContext);
  if (!context) throw new Error("useAuth must be used within <AuthProvider>");
  return context;
}

/** For components rendered inside the authenticated app shell. */
export function useUser(): User {
  const { user } = useAuth();
  if (!user) throw new Error("useUser must be used inside an authenticated route");
  return user;
}
