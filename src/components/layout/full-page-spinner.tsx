import { LoaderCircle } from "lucide-react";

export function FullPageSpinner({ label = "Loading" }: { label?: string }) {
  return (
    <div role="status" className="flex min-h-dvh items-center justify-center">
      <LoaderCircle className="size-6 animate-spin text-muted-foreground" aria-hidden />
      <span className="sr-only">{label}</span>
    </div>
  );
}
