"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { FullPageSpinner } from "@/components/layout/full-page-spinner";
import { useAuth } from "./auth-provider";

/** Only allow same-origin, path-relative redirects (prevents open redirects). */
export function safeRedirectPath(
  value: string | null | undefined,
  fallback = "/dashboard/",
): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return fallback;
  return value;
}

/** Protects app routes: unauthenticated visitors are sent to /login. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(`/login/?next=${encodeURIComponent(pathname)}`);
    }
  }, [status, router, pathname]);

  if (status !== "authenticated") return <FullPageSpinner label="Loading your workspace" />;
  return children;
}

/** Keeps signed-in users out of /login and /signup. */
export function RedirectIfAuthenticated({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      const next = new URLSearchParams(window.location.search).get("next");
      router.replace(safeRedirectPath(next));
    }
  }, [status, router]);

  if (status === "authenticated") return <FullPageSpinner label="Signing you in" />;
  return children;
}
