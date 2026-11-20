"use server";

import { redirect } from "next/navigation";
import { createSession, destroySession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password";

export type AuthState = {
  status: "idle" | "error";
  message: string;
  errors: Record<string, string>;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MIN_PASSWORD_LENGTH = 8;

export async function signIn(
  previous: AuthState,
  formData: FormData,
): Promise<AuthState> {
  void previous;
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const errors: Record<string, string> = {};

  if (!email) {
    errors.email = "Enter the email address on your account.";
  } else if (email.length > 254 || !EMAIL_PATTERN.test(email)) {
    errors.email = "Enter a valid email address.";
  }
  if (!password) {
    errors.password = "Enter your password.";
  }

  if (Object.keys(errors).length > 0) {
    return {
      status: "error",
      message: "Check the highlighted fields and try again.",
      errors,
    };
  }

  let customer: { id: number; passwordHash: string | null } | null = null;
  try {
    customer = await prisma.customer.findUnique({
      where: { email },
      select: { id: true, passwordHash: true },
    });
  } catch {
    return {
      status: "error",
      message: "We could not reach the account database just now. Try again.",
      errors: {},
    };
  }

  const matches = await verifyPassword(password, customer?.passwordHash ?? null);
  if (!customer || !matches) {
    return {
      status: "error",
      message: "Email or password does not match. Check both and try again.",
      errors: {},
    };
  }

  await createSession(customer.id);
  redirect("/account");
}

export async function signUp(
  previous: AuthState,
  formData: FormData,
): Promise<AuthState> {
  void previous;
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirmation = String(formData.get("passwordConfirmation") ?? "");
  const errors: Record<string, string> = {};

  if (name.length < 2 || name.length > 80) {
    errors.name = "Enter your name, between 2 and 80 characters.";
  }
  if (!email) {
    errors.email = "Enter an email address for your account.";
  } else if (email.length > 254 || !EMAIL_PATTERN.test(email)) {
    errors.email = "Enter a valid email address.";
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
  } else if (password.length > 128) {
    errors.password = "Use 128 characters or fewer.";
  }
  if (confirmation !== password) {
    errors.passwordConfirmation = "The two passwords do not match.";
  }

  if (Object.keys(errors).length > 0) {
    return {
      status: "error",
      message: "Check the highlighted fields and try again.",
      errors,
    };
  }

  try {
    const existing = await prisma.customer.findUnique({
      where: { email },
      select: { id: true },
    });
    if (existing) {
      return {
        status: "error",
        message: "An account with that email already exists. Sign in instead.",
        errors: { email: "This email is already registered." },
      };
    }

    const customer = await prisma.customer.create({
      data: {
        name,
        email,
        passwordHash: await hashPassword(password),
      },
      select: { id: true },
    });

    await createSession(customer.id);
  } catch {
    return {
      status: "error",
      message: "We could not create the account just now. Please try again.",
      errors: {},
    };
  }

  redirect("/account");
}

export async function signOut(): Promise<void> {
  await destroySession();
  redirect("/");
}
