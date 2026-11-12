import Link from "next/link";
import { TaskPriorityBadge } from "@/components/work/badges";
import { prisma } from "@/lib/db";
import {
  TASK_PRIORITIES,
  TASK_PRIORITY_LABELS,
  TASK_STATUSES,
  TASK_STATUS_LABELS,
} from "@/lib/domain";
import { formatDateUtc } from "@/lib/format";
import {
  can,
  scopeFor,
  scopeLabel,
  type Actor,
} from "@/lib/permissions";
import { requireUser } from "@/lib/session";
import { isOverdue, taskScope } from "@/lib/work";
import { createTask, updateTask } from "./actions";

export const dynamic = "force-dynamic";

type Search = { q?: string; projectId?: string; notice?: string };

const NOTICE: Record<string, { tone: string; text: string }> = {
  created: { tone: "success", text: "Task created." },
  updated: { tone: "success", text: "Task updated and logged." },
  unchanged: { tone: "success", text: "Nothing changed." },
  invalid: {
    tone: "warning",
    text: "Check the title, priority and dates, then try again.",
  },
  "not-found": {
    tone: "warning",
    text: "That task, project or assignee no longer exists.",
  },
  forbidden: { tone: "danger", text: "Your role may not perform that action." },
};

function noticeClass(tone: string): string {
  if (tone === "success") return "border-success/30 bg-success-soft text-success";
  if (tone === "danger") return "border-danger/30 bg-danger-soft text-danger";
  return "border-warning/30 bg-warning-soft text-warning";
}

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const user = await requireUser("/tasks");
  const actor: Actor = {
    id: user.id,
    role: user.role,
    departmentId: user.departmentId,
  };
  if (!can(actor, "task.read")) {
    return (
      <div className="rounded-lg border border-line bg-surface px-6 py-12 text-center">
        <p className="text-sm font-medium text-ink">
          You do not have access to tasks.
        </p>
      </div>
    );
  }

  const { q: rawQ, projectId: rawProject, notice } = await searchParams;
  const q = rawQ?.trim() ?? "";
  const projectId = rawProject ? Number.parseInt(rawProject, 10) : 0;
  const banner = notice ? NOTICE[notice] : undefined;

  const canAssign = can(actor, "task.assign");
  const canCreate = can(actor, "task.create");
  const scoped = scopeFor(actor) !== "all";
  const userWhere =
    scopeFor(actor) === "all"
      ? {}
      : { departmentId: actor.departmentId ?? -1 };

  const [tasks, projects, employees] = await Promise.all([
    prisma.task.findMany({
      where: {
        ...taskScope(actor),
        ...(q
          ? {
              OR: [
                { title: { contains: q } },
                { description: { contains: q } },
              ],
            }
          : {}),
        ...(Number.isFinite(projectId) && projectId > 0 ? { projectId } : {}),
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            department: { select: { name: true } },
          },
        },
        project: { select: { id: true, name: true } },
        createdBy: { select: { name: true } },
      },
      orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
      take: 200,
    }),
    prisma.project.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.user.findMany({
      where: { active: true, ...userWhere },
      select: { id: true, name: true, department: { select: { name: true } } },
      orderBy: { name: "asc" },
    }),
  ]);

  const open = tasks.filter((task) => task.status !== "done").length;
  const overdue = tasks.filter((task) => isOverdue(task.dueDate, task.status)).length;
  const done = tasks.filter((task) => task.status === "done").length;
  const today = new Date().toISOString().slice(0, 10);
  const filtered = Boolean(q) || (Number.isFinite(projectId) && projectId > 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-ink">Tasks</h1>
          <p className="mt-1 text-sm text-ink-muted">
            {scopeLabel(actor)}
            {scoped ? " · board limited to tasks you may see" : " · company-wide"}
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-md border border-line bg-surface p-1 text-sm">
          <Link
            href="/projects"
            className="rounded px-2.5 py-1 text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink"
          >
            Projects
          </Link>
          <span className="rounded bg-accent-soft px-2.5 py-1 font-medium text-accent-ink">
            Task board
          </span>
        </div>
      </div>

      {banner && (
        <div
          role="status"
          className={`rounded-md border px-3 py-2 text-sm ${noticeClass(banner.tone)}`}
        >
          {banner.text}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Open", value: open, hint: "Not done yet" },
          { label: "Overdue", value: overdue, hint: "Past due date" },
          { label: "Done", value: done, hint: "In this view" },
          { label: "Projects", value: projects.length, hint: "Across the company" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-line bg-surface p-4"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-ink-subtle">
              {stat.label}
            </p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-ink">
              {stat.value}
            </p>
            <p className="mt-1 text-xs text-ink-muted">{stat.hint}</p>
          </div>
        ))}
      </div>

      {canCreate && (
        <section className="rounded-lg border border-line bg-surface p-4">
          <h2 className="text-sm font-semibold text-ink">New task</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Every task is written to the activity log; assigning one notifies the
            assignee.
          </p>
          <form action={createTask} className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label
                htmlFor="title"
                className="mb-1 block text-xs font-medium text-ink-muted"
              >
                Title
              </label>
              <input
                id="title"
                name="title"
                required
                maxLength={120}
                placeholder="Draft renewal quote"
                className="w-full rounded-md border border-line bg-surface px-2.5 py-2 text-sm text-ink placeholder:text-ink-subtle"
              />
            </div>
            <div>
              <label
                htmlFor="priority"
                className="mb-1 block text-xs font-medium text-ink-muted"
              >
                Priority
              </label>
              <select
                id="priority"
                name="priority"
                defaultValue="medium"
                className="w-full rounded-md border border-line bg-surface px-2.5 py-2 text-sm text-ink"
              >
                {TASK_PRIORITIES.map((value) => (
                  <option key={value} value={value}>
                    {TASK_PRIORITY_LABELS[value]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="dueDate"
                className="mb-1 block text-xs font-medium text-ink-muted"
              >
                Due date <span className="font-normal">(optional)</span>
              </label>
              <input
                id="dueDate"
                type="date"
                name="dueDate"
                className="w-full rounded-md border border-line bg-surface px-2.5 py-2 text-sm text-ink"
              />
            </div>
            {canAssign && (
              <div>
                <label
                  htmlFor="assigneeId"
                  className="mb-1 block text-xs font-medium text-ink-muted"
                >
                  Assignee
                </label>
                <select
                  id="assigneeId"
                  name="assigneeId"
                  defaultValue={String(user.id)}
                  className="w-full rounded-md border border-line bg-surface px-2.5 py-2 text-sm text-ink"
                >
                  {!scoped && <option value="">Unassigned</option>}
                  {employees.map((person) => (
                    <option key={person.id} value={person.id}>
                      {person.name}
                      {person.department ? ` · ${person.department.name}` : ""}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label
                htmlFor="projectId"
                className="mb-1 block text-xs font-medium text-ink-muted"
              >
                Project <span className="font-normal">(optional)</span>
              </label>
              <select
                id="projectId"
                name="projectId"
                defaultValue=""
                className="w-full rounded-md border border-line bg-surface px-2.5 py-2 text-sm text-ink"
              >
                <option value="">No project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label
                htmlFor="description"
                className="mb-1 block text-xs font-medium text-ink-muted"
              >
                Description <span className="font-normal">(optional)</span>
              </label>
              <textarea
                id="description"
                name="description"
                rows={2}
                maxLength={1000}
                className="w-full rounded-md border border-line bg-surface px-2.5 py-2 text-sm text-ink"
              />
            </div>
            <div className="sm:col-span-2">
              <button
                type="submit"
                className="rounded-md bg-accent px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
              >
                Create task
              </button>
            </div>
          </form>
        </section>
      )}

      <form
        method="get"
        className="flex flex-wrap items-end gap-2 rounded-lg border border-line bg-surface p-3"
      >
        <div className="min-w-[220px] flex-1">
          <label
            htmlFor="q"
            className="mb-1 block text-xs font-medium text-ink-muted"
          >
            Search
          </label>
          <input
            id="q"
            name="q"
            defaultValue={q}
            placeholder="Title or description"
            className="w-full rounded-md border border-line bg-surface px-2.5 py-2 text-sm text-ink placeholder:text-ink-subtle"
          />
        </div>
        <div>
          <label
            htmlFor="projectFilter"
            className="mb-1 block text-xs font-medium text-ink-muted"
          >
            Project
          </label>
          <select
            id="projectFilter"
            name="projectId"
            defaultValue={projectId > 0 ? String(projectId) : ""}
            className="rounded-md border border-line bg-surface px-2.5 py-2 text-sm text-ink"
          >
            <option value="">All projects</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="rounded-md bg-accent px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
        >
          Apply
        </button>
        {filtered && (
          <Link
            href="/tasks"
            className="rounded-md border border-line px-3 py-2 text-sm font-medium text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink"
          >
            Reset
          </Link>
        )}
      </form>

      {tasks.length === 0 ? (
        <div className="rounded-lg border border-line bg-surface px-6 py-12 text-center">
          <p className="text-sm font-medium text-ink">No tasks in this view.</p>
          <p className="mt-1 text-sm text-ink-muted">
            {filtered
              ? "Nothing matches that filter. Clear it to see the board."
              : "New tasks will appear here in their status column."}
          </p>
        </div>
      ) : (
        <div className="grid grid-flow-col auto-cols-[minmax(260px,1fr)] gap-3 overflow-x-auto pb-2">
          {TASK_STATUSES.map((status) => {
            const column = tasks.filter((task) => task.status === status);
            return (
              <section
                key={status}
                aria-labelledby={`task-column-${status}`}
                className="flex min-h-[260px] flex-col rounded-lg border border-line bg-surface"
              >
                <div className="flex items-center justify-between gap-2 border-b border-line px-3 py-2.5">
                  <h2
                    id={`task-column-${status}`}
                    className="text-sm font-semibold text-ink"
                  >
                    {TASK_STATUS_LABELS[status]}
                  </h2>
                  <span className="text-xs font-medium tabular-nums text-ink-subtle">
                    {column.length}
                  </span>
                </div>

                <div className="flex-1 space-y-2 p-2">
                  {column.length === 0 ? (
                    <p className="px-1 py-4 text-xs text-ink-subtle">
                      Nothing here.
                    </p>
                  ) : (
                    column.map((task) => {
                      const late = isOverdue(task.dueDate, task.status);
                      return (
                        <article
                          key={task.id}
                          className="rounded-md border border-line bg-surface-raised p-2.5 shadow-sm"
                        >
                          <p className="text-sm font-medium leading-snug text-ink">
                            {task.title}
                          </p>
                          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-muted">
                            {task.project && (
                              <Link
                                href={`/projects?q=${encodeURIComponent(task.project.name)}`}
                                className="truncate underline-offset-2 hover:text-accent hover:underline"
                              >
                                {task.project.name}
                              </Link>
                            )}
                            <TaskPriorityBadge priority={task.priority} />
                          </div>
                          <dl className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1 text-[11px]">
                            <div>
                              <dt className="sr-only">Assignee</dt>
                              <dd className="truncate text-ink-muted">
                                {task.assignee?.name ?? "Unassigned"}
                              </dd>
                            </div>
                            <div className="text-right">
                              <dt className="sr-only">Due date</dt>
                              <dd
                                className={
                                  late
                                    ? "font-medium text-danger"
                                    : "text-ink-subtle"
                                }
                              >
                                {task.dueDate
                                  ? `${late ? "Overdue · " : "Due "}${formatDateUtc(task.dueDate)}`
                                  : "No due date"}
                              </dd>
                            </div>
                          </dl>

                          <form
                            action={updateTask}
                            className="mt-2 flex flex-wrap items-center gap-1 border-t border-line pt-2"
                          >
                            <input type="hidden" name="taskId" value={task.id} />
                            <label
                              htmlFor={`status-${task.id}`}
                              className="sr-only"
                            >
                              Status for {task.title}
                            </label>
                            <select
                              id={`status-${task.id}`}
                              name="status"
                              defaultValue={task.status}
                              className="min-w-0 flex-1 rounded border border-line bg-surface px-1.5 py-1 text-xs text-ink"
                            >
                              {TASK_STATUSES.map((value) => (
                                <option key={value} value={value}>
                                  {TASK_STATUS_LABELS[value]}
                                </option>
                              ))}
                            </select>
                            {canAssign && (
                              <>
                                <label
                                  htmlFor={`assignee-${task.id}`}
                                  className="sr-only"
                                >
                                  Assignee for {task.title}
                                </label>
                                <select
                                  id={`assignee-${task.id}`}
                                  name="assigneeId"
                                  defaultValue={
                                    task.assigneeId ? String(task.assigneeId) : ""
                                  }
                                  className="min-w-0 flex-1 rounded border border-line bg-surface px-1.5 py-1 text-xs text-ink"
                                >
                                  {!scoped && <option value="">Unassigned</option>}
                                  {employees.map((person) => (
                                    <option key={person.id} value={person.id}>
                                      {person.name}
                                    </option>
                                  ))}
                                </select>
                              </>
                            )}
                            <button
                              type="submit"
                              className="rounded bg-surface-sunken px-1.5 py-1 text-xs font-medium text-ink-muted transition-colors hover:bg-accent-soft hover:text-accent-ink"
                            >
                              Save
                            </button>
                          </form>
                        </article>
                      );
                    })
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}

      <p className="text-xs text-ink-subtle">
        Today is {formatDateUtc(new Date(`${today}T00:00:00.000Z`))} (UTC). Tasks
        you cannot see are filtered at the query layer, not in the browser.
        {!canAssign
          ? " Only owners, admins and managers can reassign work."
          : ""}
      </p>
    </div>
  );
}
