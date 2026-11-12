import Link from "next/link";
import { ProjectStatusBadge } from "@/components/work/badges";
import { prisma } from "@/lib/db";
import {
  PROJECT_STATUSES,
  PROJECT_STATUS_LABELS,
  isProjectStatus,
} from "@/lib/domain";
import { formatDateUtc } from "@/lib/format";
import { can, scopeLabel, type Actor } from "@/lib/permissions";
import { requireUser } from "@/lib/session";
import { isOverdue, taskScope } from "@/lib/work";
import { createProject, updateProjectStatus } from "./actions";

export const dynamic = "force-dynamic";

type Search = { q?: string; status?: string; notice?: string };

const NOTICE: Record<string, { tone: string; text: string }> = {
  created: { tone: "success", text: "Project created and logged." },
  updated: { tone: "success", text: "Project status updated and logged." },
  unchanged: { tone: "success", text: "Nothing changed." },
  invalid: {
    tone: "warning",
    text: "Check the name, description and dates, then try again.",
  },
  "not-found": { tone: "warning", text: "That project no longer exists." },
  forbidden: { tone: "danger", text: "Your role may not manage projects." },
};

function noticeClass(tone: string): string {
  if (tone === "success") return "border-success/30 bg-success-soft text-success";
  if (tone === "danger") return "border-danger/30 bg-danger-soft text-danger";
  return "border-warning/30 bg-warning-soft text-warning";
}

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const user = await requireUser("/projects");
  const actor: Actor = {
    id: user.id,
    role: user.role,
    departmentId: user.departmentId,
  };
  if (!can(actor, "project.read")) {
    return (
      <div className="rounded-lg border border-line bg-surface px-6 py-12 text-center">
        <p className="text-sm font-medium text-ink">
          You do not have access to projects.
        </p>
      </div>
    );
  }

  const { q: rawQ, status: rawStatus, notice } = await searchParams;
  const q = rawQ?.trim() ?? "";
  const status = rawStatus && isProjectStatus(rawStatus) ? rawStatus : "";
  const banner = notice ? NOTICE[notice] : undefined;
  const canManage = can(actor, "project.manage");
  const filtered = Boolean(q) || Boolean(status);

  const projects = await prisma.project.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q } },
              { description: { contains: q } },
            ],
          }
        : {}),
    },
    include: {
      tasks: {
        where: taskScope(actor),
        select: { status: true, dueDate: true },
      },
    },
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
    take: 100,
  });

  const allTasks = projects.flatMap((project) => project.tasks);
  const openTasks = allTasks.filter((task) => task.status !== "done").length;
  const overdueTasks = allTasks.filter((task) =>
    isOverdue(task.dueDate, task.status),
  ).length;
  const activeProjects = projects.filter(
    (project) => project.status === "active",
  ).length;
  const completedProjects = projects.filter(
    (project) => project.status === "completed",
  ).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-ink">
            Projects
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            {scopeLabel(actor)} · delivery work and its task load
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-md border border-line bg-surface p-1 text-sm">
          <span className="rounded bg-accent-soft px-2.5 py-1 font-medium text-accent-ink">
            Projects
          </span>
          <Link
            href="/tasks"
            className="rounded px-2.5 py-1 text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink"
          >
            Task board
          </Link>
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
          { label: "Active", value: activeProjects, hint: "In this view" },
          { label: "Open tasks", value: openTasks, hint: "Not done yet" },
          { label: "Overdue", value: overdueTasks, hint: "Past due date" },
          { label: "Completed", value: completedProjects, hint: "Projects" },
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

      {canManage && (
        <section className="rounded-lg border border-line bg-surface p-4">
          <h2 className="text-sm font-semibold text-ink">New project</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Creating or moving a project writes an activity log entry.
          </p>
          <form action={createProject} className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label
                htmlFor="name"
                className="mb-1 block text-xs font-medium text-ink-muted"
              >
                Name
              </label>
              <input
                id="name"
                name="name"
                required
                maxLength={120}
                placeholder="Onboarding Revamp"
                className="w-full rounded-md border border-line bg-surface px-2.5 py-2 text-sm text-ink placeholder:text-ink-subtle"
              />
            </div>
            <div>
              <label
                htmlFor="status"
                className="mb-1 block text-xs font-medium text-ink-muted"
              >
                Status
              </label>
              <select
                id="status"
                name="status"
                defaultValue="planning"
                className="w-full rounded-md border border-line bg-surface px-2.5 py-2 text-sm text-ink"
              >
                {PROJECT_STATUSES.map((value) => (
                  <option key={value} value={value}>
                    {PROJECT_STATUS_LABELS[value]}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label
                htmlFor="description"
                className="mb-1 block text-xs font-medium text-ink-muted"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={2}
                maxLength={500}
                className="w-full rounded-md border border-line bg-surface px-2.5 py-2 text-sm text-ink"
              />
            </div>
            <div>
              <label
                htmlFor="startDate"
                className="mb-1 block text-xs font-medium text-ink-muted"
              >
                Start <span className="font-normal">(optional)</span>
              </label>
              <input
                id="startDate"
                type="date"
                name="startDate"
                className="w-full rounded-md border border-line bg-surface px-2.5 py-2 text-sm text-ink"
              />
            </div>
            <div>
              <label
                htmlFor="endDate"
                className="mb-1 block text-xs font-medium text-ink-muted"
              >
                End <span className="font-normal">(optional)</span>
              </label>
              <input
                id="endDate"
                type="date"
                name="endDate"
                className="w-full rounded-md border border-line bg-surface px-2.5 py-2 text-sm text-ink"
              />
            </div>
            <div className="sm:col-span-2">
              <button
                type="submit"
                className="rounded-md bg-accent px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
              >
                Create project
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
            placeholder="Name or description"
            className="w-full rounded-md border border-line bg-surface px-2.5 py-2 text-sm text-ink placeholder:text-ink-subtle"
          />
        </div>
        <div>
          <label
            htmlFor="statusFilter"
            className="mb-1 block text-xs font-medium text-ink-muted"
          >
            Status
          </label>
          <select
            id="statusFilter"
            name="status"
            defaultValue={status}
            className="rounded-md border border-line bg-surface px-2.5 py-2 text-sm text-ink"
          >
            <option value="">All statuses</option>
            {PROJECT_STATUSES.map((value) => (
              <option key={value} value={value}>
                {PROJECT_STATUS_LABELS[value]}
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
            href="/projects"
            className="rounded-md border border-line px-3 py-2 text-sm font-medium text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink"
          >
            Reset
          </Link>
        )}
      </form>

      {projects.length === 0 ? (
        <div className="rounded-lg border border-line bg-surface px-6 py-12 text-center">
          <p className="text-sm font-medium text-ink">No projects in this view.</p>
          <p className="mt-1 text-sm text-ink-muted">
            {filtered
              ? "Nothing matches that filter. Clear it to see every project."
              : canManage
                ? "Create the first project above, then attach tasks to it."
                : "Projects will appear here once a manager creates one."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {projects.map((project) => {
            const total = project.tasks.length;
            const done = project.tasks.filter(
              (task) => task.status === "done",
            ).length;
            const late = project.tasks.filter((task) =>
              isOverdue(task.dueDate, task.status),
            ).length;
            const percent = total === 0 ? 0 : Math.round((done / total) * 100);

            return (
              <article
                key={project.id}
                className="flex flex-col rounded-lg border border-line bg-surface p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold leading-snug text-ink">
                      {project.name}
                    </h2>
                    <p className="mt-1 text-sm text-ink-muted">
                      {project.description}
                    </p>
                  </div>
                  <ProjectStatusBadge status={project.status} />
                </div>

                <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-ink-muted">
                  <div>
                    <dt className="inline text-ink-subtle">Start </dt>
                    <dd className="inline text-ink">
                      {project.startDate
                        ? formatDateUtc(project.startDate)
                        : "Not set"}
                    </dd>
                  </div>
                  <div className="text-right">
                    <dt className="inline text-ink-subtle">End </dt>
                    <dd className="inline text-ink">
                      {project.endDate
                        ? formatDateUtc(project.endDate)
                        : "Open"}
                    </dd>
                  </div>
                </dl>

                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-ink-muted">
                      {done} of {total} tasks done
                    </span>
                    {late > 0 ? (
                      <span className="font-medium text-danger">
                        {late} overdue
                      </span>
                    ) : (
                      <span className="tabular-nums text-ink-subtle">
                        {percent}%
                      </span>
                    )}
                  </div>
                  <div
                    role="progressbar"
                    aria-label={`${project.name} completion`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={percent}
                    className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-sunken"
                  >
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
                  <Link
                    href={`/tasks?projectId=${project.id}`}
                    className="text-sm font-medium text-accent underline-offset-2 hover:underline"
                  >
                    View tasks
                  </Link>
                  {canManage && (
                    <form
                      action={updateProjectStatus}
                      className="flex items-center gap-1"
                    >
                      <input
                        type="hidden"
                        name="projectId"
                        value={project.id}
                      />
                      <label
                        htmlFor={`status-${project.id}`}
                        className="sr-only"
                      >
                        Status for {project.name}
                      </label>
                      <select
                        id={`status-${project.id}`}
                        name="status"
                        defaultValue={project.status}
                        className="rounded border border-line bg-surface px-1.5 py-1 text-xs text-ink"
                      >
                        {PROJECT_STATUSES.map((value) => (
                          <option key={value} value={value}>
                            {PROJECT_STATUS_LABELS[value]}
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        className="rounded bg-surface-sunken px-1.5 py-1 text-xs font-medium text-ink-muted transition-colors hover:bg-accent-soft hover:text-accent-ink"
                      >
                        Update
                      </button>
                    </form>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {!canManage && (
        <p className="text-xs text-ink-subtle">
          Creating and moving projects is limited to owners, admins and managers.
        </p>
      )}
    </div>
  );
}
