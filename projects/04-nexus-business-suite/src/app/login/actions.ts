"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { setSessionCookie } from "@/lib/session";

export type LoginState = { error: string | null };

const LoginSchema = z.object({
  email: z.string().trim().toLowerCase().min(1).max(200),
  password: z.string().min(1).max(200),
  next: z.string().max(500).optional(),
});

function safeNext(next: string | undefined): string {
  // Only same-origin absolute paths; never let a crafted `next` leave the app.
  if (!next || !next.startsWith("/") || next.startsWith("//")) return "/dashboard";
  return next;
}

export async function authenticate(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next") || undefined,
  });
  if (!parsed.success) {
    return { error: "Enter a valid email and password." };
  }

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });

  // Same message for unknown email and bad password — no account enumeration.
  if (!user || !user.active || !verifyPassword(password, user.passwordHash)) {
    return { error: "Email or password is incorrect." };
  }

  await setSessionCookie(user.id);
  redirect(safeNext(parsed.data.next));
}
