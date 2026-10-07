import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { DemoLoginButton } from "@/features/auth/demo-login-button";
import { LoginForm } from "@/features/auth/login-form";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <Card className="p-6 shadow-sm sm:p-8">
      <h1 className="text-xl font-semibold tracking-tight">Welcome back</h1>
      <p className="mt-1 text-sm text-muted-foreground">Log in to see your money at a glance.</p>

      <div className="mt-6">
        <DemoLoginButton />
        <p className="mt-2 text-center text-xs text-muted-foreground">
          No sign-up needed — explore 6 months of sample data.
        </p>
      </div>

      <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground" role="separator">
        <span className="h-px flex-1 bg-border" />
        or log in with email
        <span className="h-px flex-1 bg-border" />
      </div>

      <LoginForm />

      <p className="mt-6 text-center text-sm text-muted-foreground">
        New to FinTrack?{" "}
        <Link
          href="/signup/"
          className="font-medium text-accent-text underline-offset-4 hover:underline"
        >
          Create an account
        </Link>
      </p>
    </Card>
  );
}
