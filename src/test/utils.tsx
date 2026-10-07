import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import type { Transaction } from "@/types";

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity }, mutations: { retry: false } },
  });
}

export function createWrapper(client = createTestQueryClient()) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

let counter = 0;
export function makeTransaction(overrides: Partial<Transaction> = {}): Transaction {
  counter += 1;
  return {
    id: `txn_${counter}`,
    date: "2026-09-15",
    description: `Transaction ${counter}`,
    amount: 1000,
    type: "expense",
    category: "food",
    createdAt: "2026-09-15T10:00:00.000Z",
    updatedAt: "2026-09-15T10:00:00.000Z",
    ...overrides,
  };
}
