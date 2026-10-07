import { describe, expect, it } from "vitest";
import { api, ApiError } from "./index";
import { overrideApiConfig } from "./config";

const input = {
  date: "2026-09-10",
  description: "Coffee",
  amount: 250,
  type: "expense" as const,
  category: "food" as const,
};

describe("mock REST API", () => {
  it("rejects requests without a session with a 401", async () => {
    await expect(api.transactions.list()).rejects.toMatchObject({
      status: 401,
      code: "UNAUTHORIZED",
    });
  });

  it("supports a full sign-up → CRUD round trip, isolated per user", async () => {
    await api.auth.signUp({
      name: "Priya Patel",
      email: "priya@example.com",
      password: "secret123",
    });

    const created = await api.transactions.create(input);
    expect(created.id).toMatch(/^txn_/);

    const updated = await api.transactions.update(created.id, { amount: 300 });
    expect(updated.amount).toBe(300);

    const list = await api.transactions.list();
    expect(list.total).toBe(1);
    expect(list.items[0]).toMatchObject({ description: "Coffee", amount: 300 });

    // A second account never sees the first account's data.
    await api.auth.logOut();
    await api.auth.signUp({ name: "Rahul", email: "rahul@example.com", password: "secret123" });
    expect((await api.transactions.list()).total).toBe(0);

    await api.auth.logOut();
    await api.auth.logIn({ email: "PRIYA@example.com", password: "secret123" });
    await api.transactions.remove(created.id);
    expect((await api.transactions.list()).total).toBe(0);
  });

  it("stores a password hash, never the password", async () => {
    await api.auth.signUp({ name: "Priya", email: "priya@example.com", password: "secret123" });
    const raw = localStorage.getItem("fintrack:users") ?? "";
    expect(raw).not.toContain("secret123");
    expect(raw).toMatch(/"passwordHash":"[0-9a-f]{64}"/);
  });

  it("rejects bad credentials and duplicate emails", async () => {
    await api.auth.signUp({ name: "Priya", email: "priya@example.com", password: "secret123" });
    await expect(
      api.auth.signUp({ name: "P", email: "priya@example.com", password: "x" }),
    ).rejects.toMatchObject({
      status: 409,
    });
    await expect(
      api.auth.logIn({ email: "priya@example.com", password: "wrong" }),
    ).rejects.toBeInstanceOf(ApiError);
  });

  it("seeds the demo account with ~6 months of data", async () => {
    await api.auth.logInAsDemo();
    const summary = await api.summary.get();
    expect(summary.transactionCount).toBeGreaterThan(150);
    expect(summary.monthly).toHaveLength(6);
    const budgets = await api.budgets.list();
    expect(budgets.budgets.find((b) => b.category === "rent")?.limit).toBe(32000);
  });

  it("fails with a network error when the failure rate is 100%", async () => {
    await api.auth.logInAsDemo();
    overrideApiConfig({ latency: [0, 0], failureRate: 1 });
    await expect(api.transactions.list()).rejects.toMatchObject({
      code: "NETWORK_ERROR",
      status: 503,
    });
  });
});
