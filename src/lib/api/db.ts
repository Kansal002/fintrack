import type { Budget, Transaction, User } from "@/types";
import { DEFAULT_BUDGETS, generateSeedTransactions } from "./seed";
import { readJSON, removeKey, writeJSON } from "./storage";

/**
 * The mock "database". Each user's data lives in its own localStorage key, so
 * accounts are fully isolated. Only `src/lib/api/*` touches this module.
 */

export interface StoredUser extends User {
  passwordHash: string;
}

export interface UserData {
  transactions: Transaction[];
  budgets: Budget[];
}

const USERS_KEY = "users";
const dataKey = (userId: string) => `data:${userId}`;

export const usersTable = {
  all: () => readJSON<StoredUser[]>(USERS_KEY, []),
  findById: (id: string) => usersTable.all().find((u) => u.id === id),
  findByEmail: (email: string) =>
    usersTable.all().find((u) => u.email.toLowerCase() === email.trim().toLowerCase()),
  upsert(user: StoredUser) {
    const users = usersTable.all().filter((u) => u.id !== user.id);
    writeJSON(USERS_KEY, [...users, user]);
    return user;
  },
};

export function sampleData(now = new Date()): UserData {
  return {
    transactions: generateSeedTransactions(now),
    budgets: DEFAULT_BUDGETS.map((b) => ({ ...b })),
  };
}

export function emptyData(): UserData {
  return { transactions: [], budgets: DEFAULT_BUDGETS.map((b) => ({ ...b, limit: 0 })) };
}

export function readUserData(userId: string): UserData {
  return readJSON<UserData>(dataKey(userId), emptyData());
}

export function writeUserData(userId: string, data: UserData): void {
  writeJSON(dataKey(userId), data);
}

export function deleteUserData(userId: string): void {
  removeKey(dataKey(userId));
}

/** Read-modify-write helper for a user's data. */
export function updateUserData<T>(userId: string, fn: (data: UserData) => T): T {
  const data = readUserData(userId);
  const result = fn(data);
  writeUserData(userId, data);
  return result;
}

export function toPublicUser({ passwordHash: _passwordHash, ...user }: StoredUser): User {
  return user;
}
