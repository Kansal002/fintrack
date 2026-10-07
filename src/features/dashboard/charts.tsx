"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Recharts is ~100 kB gzipped, so charts are split into their own chunks and
 * loaded on the client only after the dashboard shell has rendered.
 */
export const CashFlowChart = dynamic(() => import("./cash-flow-chart"), {
  ssr: false,
  loading: () => <Skeleton className="h-[280px] w-full rounded-lg" />,
});

export const SpendingDonut = dynamic(() => import("./spending-donut"), {
  ssr: false,
  loading: () => <Skeleton className="mx-auto size-[200px] rounded-full" />,
});
