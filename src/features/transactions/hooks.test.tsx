import { act, renderHook, waitFor } from "@testing-library/react";
import { toast } from "sonner";
import { afterEach, describe, expect, it, vi } from "vitest";
import { api, ApiError } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { createTestQueryClient, createWrapper, makeTransaction } from "@/test/utils";
import type { Paginated, Transaction, TransactionQuery } from "@/types";
import { useDeleteTransaction, useUpdateTransaction } from "./hooks";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const query: TransactionQuery = { sort: "date", order: "desc", page: 1, pageSize: 10 };
const key = queryKeys.transactions.list(query);

function seedCache(items: Transaction[]) {
  const client = createTestQueryClient();
  client.setQueryData<Paginated<Transaction>>(key, {
    items,
    total: items.length,
    page: 1,
    pageSize: 10,
    totalPages: 1,
  });
  return client;
}

/** A promise we can settle from the test to observe the in-flight optimistic state. */
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

afterEach(() => vi.restoreAllMocks());

describe("optimistic transaction mutations", () => {
  it("removes a row immediately, then rolls back and toasts when the API fails", async () => {
    const tx = makeTransaction({ id: "keep-me", description: "Swiggy" });
    const other = makeTransaction({ id: "other" });
    const client = seedCache([tx, other]);
    const request = deferred<{ id: string }>();
    vi.spyOn(api.transactions, "remove").mockReturnValue(request.promise);

    const { result } = renderHook(() => useDeleteTransaction(), { wrapper: createWrapper(client) });
    act(() => result.current.mutate(tx));

    // Optimistic: gone from the cache before the server has answered.
    await waitFor(() => {
      expect(client.getQueryData<Paginated<Transaction>>(key)?.items.map((t) => t.id)).toEqual([
        "other",
      ]);
    });

    await act(async () => request.reject(new ApiError("Network error", 503, "NETWORK_ERROR")));

    // Rollback: the row is restored exactly as it was.
    await waitFor(() => expect(result.current.isError).toBe(true));
    const restored = client.getQueryData<Paginated<Transaction>>(key);
    expect(restored?.items.map((t) => t.id)).toEqual(["keep-me", "other"]);
    expect(restored?.total).toBe(2);
    expect(toast.error).toHaveBeenCalledWith("Couldn't delete transaction", expect.any(Object));
  });

  it("applies an edit optimistically and reverts it on failure", async () => {
    const tx = makeTransaction({ id: "t1", description: "Old name", amount: 100 });
    const client = seedCache([tx]);
    const request = deferred<Transaction>();
    vi.spyOn(api.transactions, "update").mockReturnValue(request.promise);

    const { result } = renderHook(() => useUpdateTransaction(), { wrapper: createWrapper(client) });
    const {
      id: _id,
      createdAt: _c,
      updatedAt: _u,
      ...input
    } = { ...tx, description: "New name", amount: 999 };
    act(() => result.current.mutate({ id: tx.id, input, previous: tx }));

    await waitFor(() => {
      expect(client.getQueryData<Paginated<Transaction>>(key)?.items[0]).toMatchObject({
        description: "New name",
        amount: 999,
      });
    });

    await act(async () => request.reject(new ApiError("Network error", 503, "NETWORK_ERROR")));
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(client.getQueryData<Paginated<Transaction>>(key)?.items[0]).toEqual(tx);
  });

  it("keeps the optimistic result when the API succeeds", async () => {
    const tx = makeTransaction({ id: "t2" });
    const client = seedCache([tx]);
    vi.spyOn(api.transactions, "remove").mockResolvedValue({ id: tx.id });
    vi.spyOn(api.transactions, "list").mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      pageSize: 10,
      totalPages: 1,
    });

    const { result } = renderHook(() => useDeleteTransaction(), { wrapper: createWrapper(client) });
    act(() => result.current.mutate(tx));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(client.getQueryData<Paginated<Transaction>>(key)?.items).toEqual([]);
    expect(toast.success).toHaveBeenCalled();
  });
});
