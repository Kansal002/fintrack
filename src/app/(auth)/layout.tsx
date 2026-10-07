import type { ReactNode } from "react";
import { Logo } from "@/components/layout/logo";
import { RedirectIfAuthenticated } from "@/features/auth/auth-guards";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <RedirectIfAuthenticated>
      <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-4 py-12">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,var(--accent-soft),transparent_60%)]"
        />
        <Logo className="mb-8 text-lg" />
        <main className="w-full max-w-sm">{children}</main>
        <p className="mt-8 max-w-sm text-center text-xs text-muted-foreground">
          Demo project — accounts and data are stored only in this browser.
        </p>
      </div>
    </RedirectIfAuthenticated>
  );
}
