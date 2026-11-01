import type { Role } from "@/lib/domain";

// Single source of truth for the permission matrix. Every server-side check
// goes through can() / assertCan(); the UI only ever mirrors this table.
// Department scoping is applied separately via departmentFilter() so that a
// role can be allowed an action but still limited to its own department.

export const ACTIONS = [
  "dashboard.view",
  "lead.read",
  "lead.create",
  "lead.update",
  "lead.delete",
  "lead.stage_change",
  "customer.read",
  "customer.create",
  "customer.update",
  "customer.delete",
  "employee.read",
  "employee.create",
  "employee.update",
  "attendance.read",
  "attendance.check_in",
  "attendance.check_out",
  "leave.read",
  "leave.request",
  "leave.approve",
  "recruitment.read",
  "recruitment.manage",
  "project.read",
  "project.manage",
  "task.read",
  "task.create",
  "task.update",
  "task.assign",
  "activity.read",
  "user.manage",
  "report.view",
] as const;
export type Action = (typeof ACTIONS)[number];

const MATRIX: Record<Action, readonly Role[]> = {
  "dashboard.view": ["owner", "admin", "manager", "staff"],

  "lead.read": ["owner", "admin", "manager", "staff"],
  "lead.create": ["owner", "admin", "manager"],
  "lead.update": ["owner", "admin", "manager"],
  "lead.delete": ["owner", "admin"],
  "lead.stage_change": ["owner", "admin", "manager"],

  "customer.read": ["owner", "admin", "manager", "staff"],
  "customer.create": ["owner", "admin", "manager"],
  "customer.update": ["owner", "admin", "manager"],
  "customer.delete": ["owner", "admin"],

  "employee.read": ["owner", "admin", "manager", "staff"],
  "employee.create": ["owner", "admin"],
  "employee.update": ["owner", "admin", "manager"],

  "attendance.read": ["owner", "admin", "manager", "staff"],
  "attendance.check_in": ["owner", "admin", "manager", "staff"],
  "attendance.check_out": ["owner", "admin", "manager", "staff"],

  "leave.read": ["owner", "admin", "manager", "staff"],
  "leave.request": ["owner", "admin", "manager", "staff"],
  "leave.approve": ["owner", "admin", "manager"],

  "recruitment.read": ["owner", "admin", "manager"],
  "recruitment.manage": ["owner", "admin", "manager"],

  "project.read": ["owner", "admin", "manager", "staff"],
  "project.manage": ["owner", "admin", "manager"],

  "task.read": ["owner", "admin", "manager", "staff"],
  "task.create": ["owner", "admin", "manager", "staff"],
  "task.update": ["owner", "admin", "manager", "staff"],
  "task.assign": ["owner", "admin", "manager"],

  "activity.read": ["owner", "admin"],
  "user.manage": ["owner", "admin"],
  "report.view": ["owner", "admin", "manager"],
};

export type Actor = {
  id: number;
  role: Role;
  departmentId: number | null;
};

/**
 * How far a role's data access reaches:
 * - all        → whole company (owner, admin)
 * - department → the actor's own department (manager, staff)
 * - own        → only the actor's own records (staff, on personal resources)
 */
export type Scope = "all" | "department" | "own";

export function scopeFor(actor: Actor): Scope {
  if (actor.role === "owner" || actor.role === "admin") return "all";
  return "department";
}

/** Role-level permission check. Does not apply department scoping. */
export function can(actor: Actor, action: Action): boolean {
  return MATRIX[action].includes(actor.role);
}

export class AuthorizationError extends Error {
  readonly status = 403;
  constructor(
    readonly action: Action,
    readonly role: Role,
  ) {
    super(`Role "${role}" may not perform "${action}"`);
    this.name = "AuthorizationError";
  }
}

/** Throw for server code that must refuse rather than degrade. */
export function assertCan(actor: Actor, action: Action): void {
  if (!can(actor, action)) throw new AuthorizationError(action, actor.role);
}

/**
 * Prisma `where` fragment limiting rows to the actor's department, for models
 * that carry a direct `departmentId`. Returns `{}` (no restriction) for roles
 * with company-wide scope. Apply this in the query layer, never only in the UI.
 */
export function departmentFilter(
  actor: Actor,
): { departmentId: number } | Record<string, never> {
  if (scopeFor(actor) === "all") return {};
  if (actor.departmentId == null) return { departmentId: -1 }; // match nothing
  return { departmentId: actor.departmentId };
}

/**
 * Same idea for models that reach a department through a related user
 * (leads owned by a user, tasks assigned to a user).
 */
export function ownerDepartmentFilter(
  actor: Actor,
): { owner: { departmentId: number } } | Record<string, never> {
  if (scopeFor(actor) === "all") return {};
  if (actor.departmentId == null) return { owner: { departmentId: -1 } };
  return { owner: { departmentId: actor.departmentId } };
}

/** May the actor see or touch a row that belongs to `departmentId`? */
export function canAccessDepartment(
  actor: Actor,
  departmentId: number | null,
): boolean {
  if (scopeFor(actor) === "all") return true;
  return departmentId != null && departmentId === actor.departmentId;
}

/** Human-readable scope for headers and the role matrix in the README. */
export function scopeLabel(actor: Actor): string {
  switch (scopeFor(actor)) {
    case "all":
      return "All departments";
    case "department":
      return actor.departmentId != null ? "Own department" : "Own records";
    case "own":
      return "Own records";
  }
}

/** The role matrix, rendered once in the README and reused by tests/docs. */
export function roleMatrix(): { action: Action; roles: readonly Role[] }[] {
  return ACTIONS.map((action) => ({ action, roles: MATRIX[action] }));
}
