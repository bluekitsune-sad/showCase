"use server";

import { prisma } from "@/lib/db";

export type NewsletterState = {
  status: "idle" | "success" | "error";
  message: string;
};

export const initialNewsletterState: NewsletterState = {
  status: "idle",
  message: "",
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function subscribeToNewsletter(
  previous: NewsletterState,
  formData: FormData,
): Promise<NewsletterState> {
  void previous;
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (email.length > 254 || !EMAIL_PATTERN.test(email)) {
    return {
      status: "error",
      message: "Enter a valid email address so the letter can reach you.",
    };
  }

  try {
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existing) {
      return {
        status: "success",
        message: "You are already on the list. The next studio letter will find you.",
      };
    }

    await prisma.newsletterSubscriber.create({ data: { email } });
    return {
      status: "success",
      message: "Thank you — you are on the list for the next studio letter.",
    };
  } catch {
    return {
      status: "error",
      message: "We could not save that just now. Please try again in a moment.",
    };
  }
}
