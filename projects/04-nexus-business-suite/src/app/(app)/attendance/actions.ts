"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { can, type Actor } from "@/lib/permissions";
import { requireUser } from "@/lib/session";

function todayUtc(): Date {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
}

async function actorAndEmployee(path: string) {
  const user = await requireUser(path);
  const actor: Actor = {
    id: user.id,
    role: user.role,
    departmentId: user.departmentId,
  };
  const employee = await prisma.employee.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });
  return { user, actor, employee };
}

export async function checkIn(): Promise<void> {
  const { user, actor, employee } = await actorAndEmployee("/attendance");
  if (!can(actor, "attendance.check_in")) {
    redirect("/attendance?notice=forbidden");
  }
  if (!employee) redirect("/attendance?notice=no-employee");

  const date = todayUtc();
  const existing = await prisma.attendance.findUnique({
    where: { employeeId_date: { employeeId: employee.id, date } },
  });
  if (existing?.checkIn) redirect("/attendance?notice=already-in");

  const now = new Date();
  await prisma.$transaction([
    prisma.attendance.upsert({
      where: { employeeId_date: { employeeId: employee.id, date } },
      create: {
        employeeId: employee.id,
        date,
        checkIn: now,
        status: "present",
      },
      update: { checkIn: now, status: "present" },
    }),
    prisma.activityLog.create({
      data: {
        actorId: actor.id,
        action: "attendance.checked_in",
        entityType: "employee",
        entityId: employee.id,
        summary: `${user.name} checked in`,
      },
    }),
  ]);

  revalidatePath("/attendance");
  redirect("/attendance?notice=checked-in");
}

export async function checkOut(): Promise<void> {
  const { user, actor, employee } = await actorAndEmployee("/attendance");
  if (!can(actor, "attendance.check_out")) {
    redirect("/attendance?notice=forbidden");
  }
  if (!employee) redirect("/attendance?notice=no-employee");

  const date = todayUtc();
  const existing = await prisma.attendance.findUnique({
    where: { employeeId_date: { employeeId: employee.id, date } },
  });
  if (!existing?.checkIn) redirect("/attendance?notice=not-in");
  if (existing.checkOut) redirect("/attendance?notice=already-out");

  const now = new Date();
  await prisma.$transaction([
    prisma.attendance.update({
      where: { id: existing.id },
      data: { checkOut: now },
    }),
    prisma.activityLog.create({
      data: {
        actorId: actor.id,
        action: "attendance.checked_out",
        entityType: "employee",
        entityId: employee.id,
        summary: `${user.name} checked out`,
      },
    }),
  ]);

  revalidatePath("/attendance");
  redirect("/attendance?notice=checked-out");
}
