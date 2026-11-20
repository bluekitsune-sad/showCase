import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

export const SESSION_COOKIE = "maison_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

// The demo works without configuration: with no AUTH_SECRET a random secret is
// generated per process, so sessions end when the server restarts. Set
// AUTH_SECRET to a private value to keep sessions across restarts or outside a
// local demo.
const SESSION_SECRET =
  process.env.AUTH_SECRET?.trim() || randomBytes(32).toString("hex");

export type SessionCustomer = {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
};

function sign(value: string): string {
  return createHmac("sha256", SESSION_SECRET).update(value).digest("base64url");
}

function encodeSession(customerId: number): string {
  const expiresAt = Date.now() + SESSION_MAX_AGE * 1000;
  const value = `${customerId}.${expiresAt}`;
  return `${value}.${sign(value)}`;
}

function decodeSession(raw: string): number | null {
  const parts = raw.split(".");
  if (parts.length !== 3) {
    return null;
  }

  const [idRaw, expiresRaw, signature] = parts;
  const value = `${idRaw}.${expiresRaw}`;
  const received = Buffer.from(signature, "utf8");
  const expected = Buffer.from(sign(value), "utf8");

  if (
    received.length !== expected.length ||
    !timingSafeEqual(received, expected)
  ) {
    return null;
  }

  const customerId = Number(idRaw);
  const expiresAt = Number(expiresRaw);
  if (
    !Number.isInteger(customerId) ||
    customerId <= 0 ||
    !Number.isFinite(expiresAt) ||
    expiresAt <= Date.now()
  ) {
    return null;
  }

  return customerId;
}

export async function createSession(customerId: number): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, encodeSession(customerId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function getCurrentCustomer(): Promise<SessionCustomer | null> {
  const store = await cookies();
  const raw = store.get(SESSION_COOKIE)?.value;
  if (!raw) {
    return null;
  }

  const customerId = decodeSession(raw);
  if (!customerId) {
    return null;
  }

  return prisma.customer.findUnique({
    where: { id: customerId },
    select: { id: true, name: true, email: true, createdAt: true },
  });
}
