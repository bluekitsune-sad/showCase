"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { LEAVE_TYPES, LEAVE_TYPE_LABELS } from "@/lib/domain";
import {
  can,
  canAccessDepartment,
  type Actor,
} from "@/lib/permissions";
import { requireUser } from "@/lib/session";

const requestSchema = z
  .object({
    type: z.enum(LEAVE_TYPES),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    reason: z.string().trim().max(500).optional(),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: "End date must be on or after the start date.",
    path: ["endDate"],
  });

const decisionSchema = z.object({
  leaveId: z.coerce.number().int().positive(),
  decision: z.enum(["approve", "reject"]),
});

function utcDay(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

export async function requestLeave(formData: FormData): Promise<void> {
  const user = await requireUser("/leave");
  const actor: Actor = {
    id: user.id,
    role: user.role,
    departmentId: user.departmentId,
  };
  if (!can(actor, "leave.request")) redirect("/leave?notice=forbidden");

  const parsed = requestSchema.safeParse({
    type: formData.get("type"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    reason: formData.get("reason") || undefined,
  });
  if (!parsed.success) redirect("/leave?notice=invalid");

  const employee = await prisma.employee.findUnique({
    where: { userId: user.id },
    select: { id: true, departmentId: true },
  });
  if (!employee) redirect("/leave?notice=no-employee");

  const data = parsed.data;
  const typeLabel = LEAVE_TYPE_LABELS[data.type];

  await prisma.$transaction(async (tx) => {
    const leave = await tx.leaveRequest.create({
      data: {
        employeeId: employee.id,
        type: data.type,
        startDate: utcDay(data.startDate),
        endDate: utcDay(data.endDate),
        status: "pending",
        reason: data.reason?.trim() ? data.reason.trim() : null,
      },
    });
    await tx.activityLog.create({
      data: {
        actorId: actor.id,
        action: "leave.requested",
        entityType: "leave",
        entityId: leave.id,
        summary: `${user.name} requested ${typeLabel.toLowerCase()} (${data.startDate} to ${data.endDate})`,
        metadata: JSON.stringify({
          employeeDepartmentId: employee.departmentId,
          type: data.type,
        }),
      },
    });
  });

  revalidatePath("/leave");
  redirect("/leave?notice=requested");
}

export async function decideLeave(formData: FormData): Promise<void> {
  const user = await requireUser("/leave");
  const actor: Actor = {
    id: user.id,
    role: user.role,
    departmentId: user.departmentId,
  };
  if (!can(actor, "leave.approve")) redirect("/leave?notice=forbidden");

  const parsed = decisionSchema.safeParse({
    leaveId: formData.get("leaveId"),
    decision: formData.get("decision"),
  });
  if (!parsed.success) redirect("/leave?notice=invalid");

  const leave = await prisma.leaveRequest.findUnique({
    where: { id: parsed.data.leaveId },
    include: {
      employee: {
        select: {
          departmentId: true,
          user: { select: { name: true } },
        },
      },
    },
  });
  if (!leave) redirect("/leave?notice=not-found");
  if (!canAccessDepartment(actor, leave.employee.departmentId)) {
    redirect("/leave?notice=forbidden");
  }
  if (leave.status !== "pending") redirect("/leave?notice=not-pending");

  const status = parsed.data.decision === "approve" ? "approved" : "rejected";

  await prisma.$transaction([
    prisma.leaveRequest.update({
      where: { id: leave.id },
      data: {
        status,
        decidedById: actor.id,
        decidedAt: new Date(),
      },
    }),
    prisma.activityLog.create({
      data: {
        actorId: actor.id,
        action: `leave.${status}`,
        entityType: "leave",
        entityId: leave.id,
        summary: `${leave.employee.user.name}'s leave request was ${status}`,
        metadata: JSON.stringify({ decision: status }),
      },
    }),
  ]);

  revalidatePath("/leave");
  redirect(`/leave?notice=${status}`);
}
