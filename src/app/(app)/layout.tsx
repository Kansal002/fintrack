import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { RequireAuth } from "@/features/auth/auth-guards";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <RequireAuth>
      <AppShell>{children}</AppShell>
    </RequireAuth>
  );
}
