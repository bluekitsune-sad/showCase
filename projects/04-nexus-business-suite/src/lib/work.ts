import type { Actor } from "@/lib/permissions";
import { scopeFor } from "@/lib/permissions";

/**
 * Query-layer scope for tasks. Managers are limited to tasks assigned inside
 * their department; staff only ever see work assigned to them. Project records
 * carry no department column, so project visibility follows `project.read`.
 */
export type TaskScope =
  | Record<string, never>
  | { assigneeId: number }
  | { assignee: { departmentId: number } };

export function taskScope(actor: Actor): TaskScope {
  if (scopeFor(actor) === "all") return {};
  if (actor.role === "staff") return { assigneeId: actor.id };
  if (actor.departmentId == null) return { assigneeId: -1 };
  return { assignee: { departmentId: actor.departmentId } };
}

/** Row-level check used by mutations, mirroring `taskScope` in the query. */
export function canTouchTask(
  actor: Actor,
  task: { assigneeId: number | null; assigneeDepartmentId: number | null },
): boolean {
  if (scopeFor(actor) === "all") return true;
  if (actor.role === "staff") return task.assigneeId === actor.id;
  return (
    task.assigneeDepartmentId != null &&
    task.assigneeDepartmentId === actor.departmentId
  );
}

/** Overdue means the UTC due day has passed and the task is not done. */
export function isOverdue(
  dueDate: Date | null,
  status: string,
  now = new Date(),
): boolean {
  if (!dueDate || status === "done") return false;
  const startOfDay = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  );
  return dueDate.getTime() < startOfDay;
}

/** Parse a `YYYY-MM-DD` form value as UTC midnight, or return null. */
export function utcDay(value: string | null | undefined): Date | null {
  if (!value) return null;
  return new Date(`${value}T00:00:00.000Z`);
}
