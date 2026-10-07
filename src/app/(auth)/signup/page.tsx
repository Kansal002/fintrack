import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { SignupForm } from "@/features/auth/signup-form";

export const metadata: Metadata = { title: "Sign up" };

export default function SignupPage() {
  return (
    <Card className="p-6 shadow-sm sm:p-8">
      <h1 className="text-xl font-semibold tracking-tight">Create your account</h1>
      <p className="mt-1 mb-6 text-sm text-muted-foreground">
        Start tracking where your money goes.
      </p>
      <SignupForm />
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login/"
          className="font-medium text-accent-text underline-offset-4 hover:underline"
        >
          Log in
        </Link>
      </p>
    </Card>
  );
}
