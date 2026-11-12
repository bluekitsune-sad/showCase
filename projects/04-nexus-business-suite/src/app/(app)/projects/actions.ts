"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import {
  PROJECT_STATUSES,
  PROJECT_STATUS_LABELS,
} from "@/lib/domain";
import { can, type Actor } from "@/lib/permissions";
import { requireUser } from "@/lib/session";
import { utcDay } from "@/lib/work";

const dateField = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

const projectSchema = z
  .object({
    name: z.string().trim().min(1).max(120),
    description: z.string().trim().min(1).max(500),
    status: z.enum(PROJECT_STATUSES),
    startDate: dateField.optional(),
    endDate: dateField.optional(),
  })
  .refine((data) => !data.startDate || !data.endDate || data.endDate >= data.startDate, {
    message: "End date must be on or after the start date.",
    path: ["endDate"],
  });

const statusSchema = z.object({
  projectId: z.coerce.number().int().positive(),
  status: z.enum(PROJECT_STATUSES),
});

function optionalText(formData: FormData, key: string): string | undefined {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() ? value : undefined;
}

export async function createProject(formData: FormData): Promise<void> {
  const user = await requireUser("/projects");
  const actor: Actor = {
    id: user.id,
    role: user.role,
    departmentId: user.departmentId,
  };
  if (!can(actor, "project.manage")) redirect("/projects?notice=forbidden");

  const parsed = projectSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    status: formData.get("status"),
    startDate: optionalText(formData, "startDate"),
    endDate: optionalText(formData, "endDate"),
  });
  if (!parsed.success) redirect("/projects?notice=invalid");

  const data = parsed.data;

  await prisma.$transaction(async (tx) => {
    const project = await tx.project.create({
      data: {
        name: data.name,
        description: data.description,
        status: data.status,
        startDate: utcDay(data.startDate),
        endDate: utcDay(data.endDate),
      },
    });

    await tx.activityLog.create({
      data: {
        actorId: actor.id,
        action: "project.created",
        entityType: "project",
        entityId: project.id,
        summary: `${user.name} created the project "${project.name}"`,
        metadata: JSON.stringify({ status: data.status }),
      },
    });
  });

  revalidatePath("/projects");
  revalidatePath("/tasks");
  redirect("/projects?notice=created");
}

export async function updateProjectStatus(formData: FormData): Promise<void> {
  const user = await requireUser("/projects");
  const actor: Actor = {
    id: user.id,
    role: user.role,
    departmentId: user.departmentId,
  };
  if (!can(actor, "project.manage")) redirect("/projects?notice=forbidden");

  const parsed = statusSchema.safeParse({
    projectId: formData.get("projectId"),
    status: formData.get("status"),
  });
  if (!parsed.success) redirect("/projects?notice=invalid");

  const project = await prisma.project.findUnique({
    where: { id: parsed.data.projectId },
    select: { id: true, name: true, status: true },
  });
  if (!project) redirect("/projects?notice=not-found");
  if (project.status === parsed.data.status) {
    redirect("/projects?notice=unchanged");
  }

  const from =
    PROJECT_STATUS_LABELS[project.status as keyof typeof PROJECT_STATUS_LABELS] ??
    project.status;

  await prisma.$transaction([
    prisma.project.update({
      where: { id: project.id },
      data: { status: parsed.data.status },
    }),
    prisma.activityLog.create({
      data: {
        actorId: actor.id,
        action: "project.status_changed",
        entityType: "project",
        entityId: project.id,
        summary: `${user.name} moved "${project.name}" from ${from} to ${PROJECT_STATUS_LABELS[parsed.data.status]}`,
        metadata: JSON.stringify({
          from: project.status,
          to: parsed.data.status,
        }),
      },
    }),
  ]);

  revalidatePath("/projects");
  redirect("/projects?notice=updated");
}
