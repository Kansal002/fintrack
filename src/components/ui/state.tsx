import { CircleAlert, RefreshCw } from "lucide-react";
import type { ReactNode } from "react";
import { getErrorMessage } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn("flex flex-col items-center justify-center px-6 py-12 text-center", className)}
    >
      <div className="mb-4 flex size-12 items-center justify-center rounded-xl border border-border bg-muted text-muted-foreground [&_svg]:size-5">
        {icon}
      </div>
      <h3 className="text-sm font-semibold">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

interface ErrorStateProps {
  error: unknown;
  onRetry: () => void;
  retrying?: boolean;
  title?: string;
  className?: string;
}

export function ErrorState({
  error,
  onRetry,
  retrying,
  title = "Couldn't load this data",
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn("flex flex-col items-center justify-center px-6 py-10 text-center", className)}
    >
      <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-danger-soft text-danger">
        <CircleAlert className="size-5" aria-hidden />
      </div>
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{getErrorMessage(error)}</p>
      <Button variant="secondary" size="sm" className="mt-5" onClick={onRetry} loading={retrying}>
        {!retrying && <RefreshCw aria-hidden />}
        Try again
      </Button>
    </div>
  );
}
