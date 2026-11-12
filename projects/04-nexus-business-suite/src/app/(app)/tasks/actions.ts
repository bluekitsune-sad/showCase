"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import {
  TASK_PRIORITIES,
  TASK_STATUSES,
  TASK_STATUS_LABELS,
} from "@/lib/domain";
import { can, scopeFor, type Actor } from "@/lib/permissions";
import { requireUser } from "@/lib/session";
import { canTouchTask, utcDay } from "@/lib/work";

const dateField = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

const createTaskSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(1000).optional(),
  priority: z.enum(TASK_PRIORITIES),
  dueDate: dateField.optional(),
  assigneeId: z.coerce.number().int().positive().optional(),
  projectId: z.coerce.number().int().positive().optional(),
});

const updateTaskSchema = z.object({
  taskId: z.coerce.number().int().positive(),
  status: z.enum(TASK_STATUSES),
});

function optionalText(formData: FormData, key: string): string | undefined {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() ? value : undefined;
}

function optionalId(formData: FormData, key: string): string | undefined {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() ? value : undefined;
}

export async function createTask(formData: FormData): Promise<void> {
  const user = await requireUser("/tasks");
  const actor: Actor = {
    id: user.id,
    role: user.role,
    departmentId: user.departmentId,
  };
  if (!can(actor, "task.create")) redirect("/tasks?notice=forbidden");

  const parsed = createTaskSchema.safeParse({
    title: formData.get("title"),
    description: optionalText(formData, "description"),
    priority: formData.get("priority"),
    dueDate: optionalText(formData, "dueDate"),
    assigneeId: optionalId(formData, "assigneeId"),
    projectId: optionalId(formData, "projectId"),
  });
  if (!parsed.success) redirect("/tasks?notice=invalid");

  const data = parsed.data;
  const canAssign = can(actor, "task.assign");

  let assigneeId: number | null = canAssign ? (data.assigneeId ?? null) : actor.id;
  if (assigneeId == null && scopeFor(actor) !== "all") assigneeId = actor.id;
  let assigneeName: string | null = null;

  if (assigneeId != null) {
    const assignee = await prisma.user.findUnique({
      where: { id: assigneeId },
      select: { id: true, name: true, active: true, departmentId: true },
    });
    if (!assignee || !assignee.active) redirect("/tasks?notice=not-found");
    if (
      scopeFor(actor) !== "all" &&
      assignee.departmentId !== actor.departmentId
    ) {
      redirect("/tasks?notice=forbidden");
    }
    assigneeId = assignee.id;
    assigneeName = assignee.name;
  }

  if (data.projectId != null) {
    const project = await prisma.project.findUnique({
      where: { id: data.projectId },
      select: { id: true },
    });
    if (!project) redirect("/tasks?notice=not-found");
  }

  await prisma.$transaction(async (tx) => {
    const task = await tx.task.create({
      data: {
        title: data.title,
        description: data.description ?? null,
        priority: data.priority,
        dueDate: utcDay(data.dueDate),
        assigneeId,
        createdById: actor.id,
        projectId: data.projectId ?? null,
      },
    });

    await tx.activityLog.create({
      data: {
        actorId: actor.id,
        action: "task.created",
        entityType: "task",
        entityId: task.id,
        summary: `${user.name} created "${task.title}"${assigneeName ? ` for ${assigneeName}` : ""}`,
        metadata: JSON.stringify({
          projectId: data.projectId ?? null,
          assigneeId,
          priority: data.priority,
        }),
      },
    });

    if (assigneeId != null && assigneeId !== actor.id) {
      await tx.notification.create({
        data: {
          userId: assigneeId,
          title: "Task assigned to you",
          body: `${user.name} assigned "${task.title}" with ${data.priority} priority.`,
          type: "task_assigned",
        },
      });
    }
  });

  revalidatePath("/tasks");
  revalidatePath("/projects");
  redirect("/tasks?notice=created");
}

export async function updateTask(formData: FormData): Promise<void> {
  const user = await requireUser("/tasks");
  const actor: Actor = {
    id: user.id,
    role: user.role,
    departmentId: user.departmentId,
  };
  if (!can(actor, "task.update")) redirect("/tasks?notice=forbidden");

  const parsed = updateTaskSchema.safeParse({
    taskId: formData.get("taskId"),
    status: formData.get("status"),
  });
  if (!parsed.success) redirect("/tasks?notice=invalid");

  const rawAssignee = formData.get("assigneeId");
  const assigneeProvided = rawAssignee !== null;
  const canAssign = can(actor, "task.assign");
  if (assigneeProvided && !canAssign) redirect("/tasks?notice=forbidden");

  const task = await prisma.task.findUnique({
    where: { id: parsed.data.taskId },
    include: {
      assignee: { select: { id: true, name: true, departmentId: true } },
    },
  });
  if (!task) redirect("/tasks?notice=not-found");
  if (
    !canTouchTask(actor, {
      assigneeId: task.assigneeId,
      assigneeDepartmentId: task.assignee?.departmentId ?? null,
    })
  ) {
    redirect("/tasks?notice=forbidden");
  }

  const status = parsed.data.status;
  let nextAssigneeId = task.assigneeId;
  let nextAssigneeName = task.assignee?.name ?? null;

  if (assigneeProvided) {
    const raw = typeof rawAssignee === "string" ? rawAssignee.trim() : "";
    if (!raw) {
      nextAssigneeId = null;
      nextAssigneeName = null;
    } else {
      const parsedAssignee = z.coerce.number().int().positive().safeParse(raw);
      if (!parsedAssignee.success) redirect("/tasks?notice=invalid");
      const assignee = await prisma.user.findUnique({
        where: { id: parsedAssignee.data },
        select: { id: true, name: true, active: true, departmentId: true },
      });
      if (!assignee || !assignee.active) redirect("/tasks?notice=not-found");
      if (
        scopeFor(actor) !== "all" &&
        assignee.departmentId !== actor.departmentId
      ) {
        redirect("/tasks?notice=forbidden");
      }
      nextAssigneeId = assignee.id;
      nextAssigneeName = assignee.name;
    }
  }

  if (assigneeProvided && nextAssigneeId === null && scopeFor(actor) !== "all") {
    redirect("/tasks?notice=forbidden");
  }

  const statusChanged = task.status !== status;
  const assigneeChanged = assigneeProvided && nextAssigneeId !== task.assigneeId;
  if (!statusChanged && !assigneeChanged) {
    redirect("/tasks?notice=unchanged");
  }

  const changes: string[] = [];
  if (statusChanged) {
    const from =
      TASK_STATUS_LABELS[task.status as keyof typeof TASK_STATUS_LABELS] ??
      task.status;
    changes.push(`status ${from} → ${TASK_STATUS_LABELS[status]}`);
  }
  if (assigneeChanged) {
    changes.push(
      nextAssigneeName ? `assigned to ${nextAssigneeName}` : "unassigned",
    );
  }

  await prisma.$transaction(async (tx) => {
    await tx.task.update({
      where: { id: task.id },
      data: {
        status,
        completedAt:
          status === "done"
            ? (task.completedAt ?? new Date())
            : null,
        ...(assigneeProvided ? { assigneeId: nextAssigneeId } : {}),
      },
    });

    await tx.activityLog.create({
      data: {
        actorId: actor.id,
        action: statusChanged ? "task.status_changed" : "task.assigned",
        entityType: "task",
        entityId: task.id,
        summary: `${user.name} updated "${task.title}": ${changes.join(", ")}`,
        metadata: JSON.stringify({
          from: task.status,
          to: status,
          assigneeId: nextAssigneeId,
        }),
      },
    });

    if (
      assigneeChanged &&
      nextAssigneeId != null &&
      nextAssigneeId !== actor.id
    ) {
      await tx.notification.create({
        data: {
          userId: nextAssigneeId,
          title: "Task assigned to you",
          body: `${user.name} assigned "${task.title}" to you.`,
          type: "task_assigned",
        },
      });
    } else if (
      statusChanged &&
      status === "done" &&
      task.assigneeId != null &&
      task.assigneeId !== actor.id
    ) {
      await tx.notification.create({
        data: {
          userId: task.assigneeId,
          title: "Task completed",
          body: `${user.name} marked "${task.title}" done.`,
          type: "system",
        },
      });
    }
  });

  revalidatePath("/tasks");
  revalidatePath("/projects");
  redirect("/tasks?notice=updated");
}
