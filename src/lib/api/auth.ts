import type { User, UserPreferences } from "@/types";
import { hashPassword } from "./crypto";
import {
  deleteUserData,
  emptyData,
  sampleData,
  toPublicUser,
  usersTable,
  writeUserData,
} from "./db";
import { ApiError } from "./errors";
import { createId } from "./ids";
import { request } from "./request";
import { endSession, notifySessionChange, requireUserId, startSession } from "./session";

export const DEMO_EMAIL = "demo@fintrack.app";
const DEMO_PASSWORD = "demo-password";

const DEFAULT_PREFERENCES: UserPreferences = { numberFormat: "en-IN", currencyDisplay: "symbol" };

export interface SignUpInput {
  name: string;
  email: string;
  password: string;
}

export interface LogInInput {
  email: string;
  password: string;
}

export function signUp(input: SignUpInput): Promise<User> {
  return request(async () => {
    const email = input.email.trim().toLowerCase();
    if (usersTable.findByEmail(email)) {
      throw new ApiError("An account with this email already exists.", 409, "CONFLICT");
    }
    const user = usersTable.upsert({
      id: createId("usr"),
      name: input.name.trim(),
      email,
      createdAt: new Date().toISOString(),
      isDemo: false,
      preferences: DEFAULT_PREFERENCES,
      passwordHash: await hashPassword(email, input.password),
    });
    writeUserData(user.id, emptyData());
    startSession(user.id);
    return toPublicUser(user);
  });
}

export function logIn(input: LogInInput): Promise<User> {
  return request(async () => {
    const user = usersTable.findByEmail(input.email);
    const hash = await hashPassword(input.email, input.password);
    if (!user || user.passwordHash !== hash) {
      throw new ApiError("Incorrect email or password.", 401, "INVALID_CREDENTIALS");
    }
    startSession(user.id);
    return toPublicUser(user);
  });
}

/** Logs into the shared demo account, creating and seeding it on first use. */
export function logInAsDemo(): Promise<User> {
  return request(async () => {
    let user = usersTable.findByEmail(DEMO_EMAIL);
    if (!user) {
      user = usersTable.upsert({
        id: createId("usr"),
        name: "Aarav Sharma",
        email: DEMO_EMAIL,
        createdAt: new Date().toISOString(),
        isDemo: true,
        preferences: DEFAULT_PREFERENCES,
        passwordHash: await hashPassword(DEMO_EMAIL, DEMO_PASSWORD),
      });
      writeUserData(user.id, sampleData());
    }
    startSession(user.id);
    return toPublicUser(user);
  });
}

export async function logOut(): Promise<void> {
  // Logging out is local-only and should never fail, so it skips `request()`.
  endSession();
}

export interface ProfileUpdate {
  name?: string;
  preferences?: Partial<UserPreferences>;
}

export function updateProfile(update: ProfileUpdate): Promise<User> {
  return request(() => {
    const user = usersTable.findById(requireUserId());
    if (!user) throw new ApiError("User not found.", 404, "NOT_FOUND");
    const next = usersTable.upsert({
      ...user,
      name: update.name?.trim() || user.name,
      preferences: { ...user.preferences, ...update.preferences },
    });
    notifySessionChange();
    return toPublicUser(next);
  });
}

/** Replaces the current user's data with a fresh set of sample data. */
export function resetData(mode: "sample" | "empty" = "sample"): Promise<void> {
  return request(() => {
    const userId = requireUserId();
    deleteUserData(userId);
    writeUserData(userId, mode === "sample" ? sampleData() : emptyData());
  });
}
