"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LogOut, RotateCcw, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/dialog";
import { useAuth } from "@/features/auth/auth-provider";
import { api, getErrorMessage } from "@/lib/api";
import { SettingRow, SettingsSection } from "./settings-section";

type Pending = "sample" | "empty" | null;

export function DataSection() {
  const queryClient = useQueryClient();
  const { logOut } = useAuth();
  const [confirm, setConfirm] = useState<Pending>(null);

  const reset = useMutation({
    mutationFn: (mode: "sample" | "empty") => api.auth.resetData(mode),
    onSuccess: (_data, mode) => {
      setConfirm(null);
      toast.success(mode === "sample" ? "Demo data restored" : "All data cleared");
      return queryClient.invalidateQueries();
    },
    onError: (error) => toast.error("Couldn't reset data", { description: getErrorMessage(error) }),
  });

  return (
    <SettingsSection
      title="Data & account"
      description="Everything is stored locally in this browser."
    >
      <SettingRow
        label="Reset demo data"
        description="Replace your data with 6 fresh months of sample transactions."
        control={
          <Button variant="secondary" onClick={() => setConfirm("sample")}>
            <RotateCcw aria-hidden />
            Reset data
          </Button>
        }
      />
      <SettingRow
        label="Clear all data"
        description="Delete every transaction and budget. Useful to try empty states."
        control={
          <Button variant="secondary" className="text-danger" onClick={() => setConfirm("empty")}>
            <Trash2 aria-hidden />
            Clear data
          </Button>
        }
      />
      <SettingRow
        label="Log out"
        description="End your session on this device."
        control={
          <Button variant="secondary" onClick={logOut}>
            <LogOut aria-hidden />
            Log out
          </Button>
        }
      />

      <ConfirmDialog
        open={confirm !== null}
        onClose={() => setConfirm(null)}
        loading={reset.isPending}
        title={confirm === "sample" ? "Reset to demo data?" : "Clear all data?"}
        description={
          confirm === "sample"
            ? "Your current transactions and budgets will be replaced with fresh sample data."
            : "All of your transactions will be deleted and budgets cleared. This can't be undone."
        }
        confirmLabel={confirm === "sample" ? "Reset data" : "Clear data"}
        onConfirm={() => confirm && reset.mutate(confirm)}
      />
    </SettingsSection>
  );
}
