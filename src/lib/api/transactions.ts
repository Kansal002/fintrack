import type { Paginated, Transaction, TransactionInput, TransactionQuery } from "@/types";
import { readUserData, updateUserData } from "./db";
import { ApiError } from "./errors";
import { createId } from "./ids";
import { request } from "./request";
import { requireUserId } from "./session";
import { compareTransactions, matchesQuery, queryTransactions } from "./transaction-query";

/** GET /transactions?search=&category=&type=&from=&to=&sort=&order=&page=&pageSize= */
export function getTransactions(query: TransactionQuery = {}): Promise<Paginated<Transaction>> {
  return request(() => queryTransactions(readUserData(requireUserId()).transactions, query));
}

/** GET /transactions/export — every match for the filters, unpaginated. */
export function exportTransactions(query: TransactionQuery = {}): Promise<Transaction[]> {
  return request(() =>
    readUserData(requireUserId())
      .transactions.filter((tx) => matchesQuery(tx, query))
      .sort(compareTransactions(query)),
  );
}

/** POST /transactions */
export function createTransaction(input: TransactionInput): Promise<Transaction> {
  return request(() =>
    updateUserData(requireUserId(), (data) => {
      const now = new Date().toISOString();
      const tx: Transaction = { ...input, id: createId("txn"), createdAt: now, updatedAt: now };
      data.transactions.unshift(tx);
      return tx;
    }),
  );
}

/** PATCH /transactions/:id */
export function updateTransaction(
  id: string,
  patch: Partial<TransactionInput>,
): Promise<Transaction> {
  return request(() =>
    updateUserData(requireUserId(), (data) => {
      const index = data.transactions.findIndex((tx) => tx.id === id);
      if (index === -1) throw new ApiError("Transaction not found.", 404, "NOT_FOUND");
      const updated = {
        ...data.transactions[index],
        ...patch,
        updatedAt: new Date().toISOString(),
      };
      data.transactions[index] = updated;
      return updated;
    }),
  );
}

/** DELETE /transactions/:id */
export function deleteTransaction(id: string): Promise<{ id: string }> {
  return request(() =>
    updateUserData(requireUserId(), (data) => {
      const before = data.transactions.length;
      data.transactions = data.transactions.filter((tx) => tx.id !== id);
      if (data.transactions.length === before) {
        throw new ApiError("Transaction not found.", 404, "NOT_FOUND");
      }
      return { id };
    }),
  );
}
