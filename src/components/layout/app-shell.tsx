"use client";

import { LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useUser, useAuth } from "@/features/auth/auth-provider";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";
import { isActivePath, NAV_ITEMS } from "./nav-items";
import { UserAvatar } from "./user-avatar";

/**
 * Responsive application frame: a fixed sidebar on desktop, and a compact top
 * bar plus bottom tab bar on mobile (thumb-friendly, no hidden drawer).
 */
export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const user = useUser();
  const { logOut } = useAuth();

  return (
    <div className="min-h-dvh">
      <a
        href="#main"
        className="sr-only z-50 rounded-md bg-card px-3 py-2 text-sm font-medium shadow focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-border bg-card lg:flex">
        <div className="flex h-16 items-center px-5">
          <Link href="/dashboard/" className="rounded-md" aria-label="FinTrack dashboard">
            <Logo />
          </Link>
        </div>
        <nav aria-label="Main" className="flex-1 px-3 py-2">
          <ul className="flex flex-col gap-0.5">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
              const active = isActivePath(pathname, href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex h-9 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors",
                      active
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                    )}
                  >
                    <Icon className={cn("size-4", active && "text-accent-text")} aria-hidden />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="border-t border-border p-3">
          <div className="flex items-center gap-3 rounded-lg px-2 py-2">
            <UserAvatar name={user.name} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{user.name}</p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={logOut}
              aria-label="Log out"
            >
              <LogOut aria-hidden />
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-card/85 px-4 backdrop-blur-md lg:hidden">
        <Link href="/dashboard/" className="rounded-md" aria-label="FinTrack dashboard">
          <Logo />
        </Link>
        <div className="flex items-center gap-1">
          {user.isDemo && <Badge tone="accent">Demo</Badge>}
          <Button variant="ghost" size="icon" onClick={logOut} aria-label="Log out">
            <LogOut aria-hidden />
          </Button>
        </div>
      </header>

      <main id="main" className="pb-24 lg:pb-0 lg:pl-60">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</div>
      </main>

      {/* Mobile bottom navigation */}
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
      >
        <ul className="grid grid-cols-4">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = isActivePath(pathname, href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex h-16 flex-col items-center justify-center gap-1 text-[0.6875rem] font-medium transition-colors",
                    active ? "text-accent-text" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="size-5" aria-hidden />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
