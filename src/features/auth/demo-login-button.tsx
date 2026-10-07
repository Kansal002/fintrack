"use client";

import { useMutation } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { api, getErrorMessage } from "@/lib/api";

/** One-click entry for recruiters/reviewers: logs into a pre-seeded account. */
export function DemoLoginButton() {
  const demo = useMutation({
    mutationFn: api.auth.logInAsDemo,
    onSuccess: (user) =>
      toast.success(`Welcome, ${user.name.split(" ")[0]}!`, {
        description: "You're exploring the demo account.",
      }),
    onError: (error) =>
      toast.error("Couldn't start the demo", { description: getErrorMessage(error) }),
  });

  return (
    <Button size="lg" className="w-full" onClick={() => demo.mutate()} loading={demo.isPending}>
      {!demo.isPending && <Sparkles aria-hidden />}
      Try demo account
    </Button>
  );
}
