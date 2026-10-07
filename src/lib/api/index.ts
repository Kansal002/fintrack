/**
 * Public surface of the mock backend. UI code imports `api` from here and never
 * reaches into storage directly, so swapping this folder for a real HTTP client
 * (fetch/axios against a REST API) requires no component changes.
 */
import * as auth from "./auth";
import * as budgets from "./budgets";
import * as summary from "./summary";
import * as transactions from "./transactions";

export const api = {
  auth: {
    signUp: auth.signUp,
    logIn: auth.logIn,
    logInAsDemo: auth.logInAsDemo,
    logOut: auth.logOut,
    updateProfile: auth.updateProfile,
    resetData: auth.resetData,
  },
  transactions: {
    list: transactions.getTransactions,
    export: transactions.exportTransactions,
    create: transactions.createTransaction,
    update: transactions.updateTransaction,
    remove: transactions.deleteTransaction,
  },
  budgets: {
    list: budgets.getBudgets,
    update: budgets.updateBudget,
  },
  summary: {
    get: summary.getSummary,
  },
};

export { DEMO_EMAIL } from "./auth";
export { ApiError, isApiError, getErrorMessage } from "./errors";
export { getApiConfig, setApiConfig, DEFAULT_FAILURE_RATE, type ApiConfig } from "./config";
export { getAuthSnapshot, subscribeToSession, SERVER_SNAPSHOT, type AuthSnapshot } from "./session";
