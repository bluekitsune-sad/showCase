import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import type { Role } from "@/lib/domain";

export const SESSION_COOKIE = "nexus_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days — demo convenience
const COOKIE_PREFIX = "v1";

// Falls back to the documented dev value so a clean clone runs with no setup.
// Set AUTH_SECRET in any environment that matters; see .env.example.
function authSecret(): string {
  return process.env.AUTH_SECRET ?? "dev-only-secret-change-me";
}

function sign(payload: string): string {
  return createHmac("sha256", authSecret()).update(payload).digest("hex");
}

export function createSessionToken(userId: number): string {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const body = `${COOKIE_PREFIX}.${userId}.${expiresAt}`;
  return `${body}.${sign(body)}`;
}

export function verifySessionToken(
  token: string,
): { userId: number } | null {
  const parts = token.split(".");
  if (parts.length !== 4) return null;
  const [version, userIdRaw, expiresRaw, signature] = parts;
  if (version !== COOKIE_PREFIX) return null;

  const body = `${version}.${userIdRaw}.${expiresRaw}`;
  const expected = Buffer.from(sign(body));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length) return null;
  if (!timingSafeEqual(expected, actual)) return null;

  const userId = Number.parseInt(userIdRaw, 10);
  const expiresAt = Number.parseInt(expiresRaw, 10);
  if (!Number.isFinite(userId) || !Number.isFinite(expiresAt)) return null;
  if (Date.now() > expiresAt) return null;

  return { userId };
}

export type SessionUser = {
  id: number;
  email: string;
  name: string;
  role: Role;
  departmentId: number | null;
  departmentName: string | null;
};

export async function setSessionCookie(userId: number): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, createSessionToken(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

async function loadSessionUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const parsed = verifySessionToken(token);
  if (!parsed) return null;

  const user = await prisma.user.findUnique({
    where: { id: parsed.userId },
    include: { department: { select: { name: true } } },
  });
  if (!user || !user.active) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as Role,
    departmentId: user.departmentId,
    departmentName: user.department?.name ?? null,
  };
}

/** Returns the signed-in user, or null. Never throws. */
export async function getCurrentUser(): Promise<SessionUser | null> {
  return loadSessionUser();
}

/**
 * Server-side gate for every authenticated surface. Redirects to the login
 * page (carrying the intended path) when there is no valid session.
 */
export async function requireUser(nextPath?: string): Promise<SessionUser> {
  const user = await loadSessionUser();
  if (!user) {
    const next = nextPath && nextPath !== "/" ? `?next=${encodeURIComponent(nextPath)}` : "";
    redirect(`/login${next}`);
  }
  return user;
}
