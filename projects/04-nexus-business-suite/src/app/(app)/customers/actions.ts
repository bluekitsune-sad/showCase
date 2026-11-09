"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import {
  can,
  canAccessDepartment,
  type Actor,
} from "@/lib/permissions";
import { requireUser } from "@/lib/session";

const noteSchema = z.object({
  customerId: z.coerce.number().int().positive(),
  body: z.string().trim().min(1, "Write a note first.").max(2000),
});

export async function addCustomerNote(formData: FormData): Promise<void> {
  const user = await requireUser("/customers");
  const actor: Actor = {
    id: user.id,
    role: user.role,
    departmentId: user.departmentId,
  };
  if (!can(actor, "customer.update")) return;

  const parsed = noteSchema.safeParse({
    customerId: formData.get("customerId"),
    body: formData.get("body"),
  });
  if (!parsed.success) return;

  const customer = await prisma.customer.findUnique({
    where: { id: parsed.data.customerId },
    include: {
      sourceLead: { include: { owner: { select: { departmentId: true } } } },
    },
  });
  if (!customer) return;

  const departmentId = customer.sourceLead?.owner?.departmentId ?? null;
  if (!canAccessDepartment(actor, departmentId)) return;

  await prisma.$transaction([
    prisma.note.create({
      data: {
        body: parsed.data.body,
        authorId: actor.id,
        customerId: customer.id,
      },
    }),
    prisma.activityLog.create({
      data: {
        actorId: actor.id,
        action: "note.added",
        entityType: "customer",
        entityId: customer.id,
        summary: `Note added to ${customer.name}`,
      },
    }),
  ]);

  revalidatePath(`/customers/${customer.id}`);
  revalidatePath("/customers");
  revalidatePath("/dashboard");
}
