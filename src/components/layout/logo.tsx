import { cn } from "@/lib/utils";

export function Logo({ className, showText = true }: { className?: string; showText?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-semibold tracking-tight", className)}>
      <svg viewBox="0 0 32 32" className="size-7 shrink-0" aria-hidden>
        <rect width="32" height="32" rx="8" className="fill-accent" />
        <path
          d="M9 21.5 14 16l3.5 3.5L23 12"
          fill="none"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="23" cy="12" r="1.75" fill="white" />
      </svg>
      {showText && <span className="text-[0.9375rem]">FinTrack</span>}
    </span>
  );
}
