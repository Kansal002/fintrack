"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { FullPageSpinner } from "@/components/layout/full-page-spinner";
import { useAuth } from "@/features/auth/auth-provider";

/** Entry point: route to the dashboard or the login page. */
export default function HomePage() {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status !== "loading")
      router.replace(status === "authenticated" ? "/dashboard/" : "/login/");
  }, [status, router]);

  return <FullPageSpinner />;
}
