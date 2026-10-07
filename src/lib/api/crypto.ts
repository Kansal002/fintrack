/** SHA-256 hex digest via the Web Crypto API. */
export async function sha256(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Demo-grade password hashing (salted with the email). A real backend would use
 * a slow KDF like Argon2/bcrypt server-side — this only avoids storing plaintext.
 */
export function hashPassword(email: string, password: string): Promise<string> {
  return sha256(`fintrack:${email.trim().toLowerCase()}:${password}`);
}
