import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";

interface SettingsSectionProps {
  title: string;
  description: string;
  children: ReactNode;
}

/** Two-column settings block: heading on the left, controls on the right. */
export function SettingsSection({ title, description, children }: SettingsSectionProps) {
  return (
    <Card className="grid gap-4 p-5 md:grid-cols-[16rem_1fr] md:gap-8 md:p-6">
      <div>
        <h2 className="text-sm font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="flex flex-col gap-5">{children}</div>
    </Card>
  );
}

export function SettingRow({
  label,
  description,
  control,
  htmlFor,
}: {
  label: string;
  description?: string;
  control: ReactNode;
  htmlFor?: string;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        {htmlFor ? (
          <label htmlFor={htmlFor} className="text-sm font-medium">
            {label}
          </label>
        ) : (
          <p className="text-sm font-medium">{label}</p>
        )}
        {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
      </div>
      <div className="shrink-0">{control}</div>
    </div>
  );
}
