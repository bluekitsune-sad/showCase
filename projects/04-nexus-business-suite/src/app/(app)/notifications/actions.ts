"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";

const idSchema = z.coerce.number().int().positive();

export async function markNotificationRead(formData: FormData): Promise<void> {
  const user = await requireUser("/notifications");
  const parsed = idSchema.safeParse(formData.get("notificationId"));
  if (!parsed.success) redirect("/notifications?notice=invalid");

  await prisma.notification.updateMany({
    where: { id: parsed.data, userId: user.id, readAt: null },
    data: { readAt: new Date() },
  });

  revalidatePath("/notifications");
  redirect("/notifications?notice=read");
}

export async function markAllNotificationsRead(): Promise<void> {
  const user = await requireUser("/notifications");

  await prisma.notification.updateMany({
    where: { userId: user.id, readAt: null },
    data: { readAt: new Date() },
  });

  revalidatePath("/notifications");
  redirect("/notifications?notice=all-read");
}
