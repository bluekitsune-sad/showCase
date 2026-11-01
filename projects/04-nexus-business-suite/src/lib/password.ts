import { createHash, timingSafeEqual } from "node:crypto";

// Demo password scheme, matching prisma/seed.ts: `sha256:<hex>`.
// Deliberately weak and saltless — this is a local SQLite demo with a shared
// throwaway password. A production deployment would use argon2/scrypt with
// per-user salts; that trade-off is documented in the project README.

export function hashPassword(password: string): string {
  return `sha256:${createHash("sha256").update(password).digest("hex")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const expected = Buffer.from(stored);
  const actual = Buffer.from(hashPassword(password));
  if (expected.length !== actual.length) return false;
  return timingSafeEqual(expected, actual);
}
