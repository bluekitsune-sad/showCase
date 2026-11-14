import Link from "next/link";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { can, type Actor } from "@/lib/permissions";
import { formatDateTimeUtc } from "@/lib/format";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

type Search = {
  q?: string;
  entity?: string;
  action?: string;
  actor?: string;
  from?: string;
  to?: string;
  page?: string;
};

type Filters = {
  q: string;
  entity: string;
  action: string;
  actorId: number | null;
  from: string;
  to: string;
};

const ENTITY_TONE: Record<string, string> = {
  lead: "bg-accent-soft text-accent-ink",
  customer: "bg-success-soft text-success",
  task: "bg-warning-soft text-warning",
  leave: "bg-warning-soft text-warning",
  employee: "bg-surface-sunken text-ink-muted",
  project: "bg-accent-soft text-accent-ink",
  user: "bg-danger-soft text-danger",
};

function parseDate(value?: string): Date | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function humanize(value: string): string {
  const words = value.replace(/[._]+/g, " ").trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function parseFilters(search: Search): {
  filters: Filters;
  fromDate: Date | null;
  toDate: Date | null;
  error: string | null;
} {
  const q = (search.q ?? "").trim().slice(0, 100);
  const entity = (search.entity ?? "").trim();
  const action = (search.action ?? "").trim();
  const actorRaw = (search.actor ?? "").trim();
  const actorId = /^\d+$/.test(actorRaw) ? Number.parseInt(actorRaw, 10) : null;

  let error: string | null = null;
  let fromDate = parseDate(search.from);
  let toDate = parseDate(search.to);

  if (search.from && !fromDate) {
    error = "The start date was not recognised and was ignored.";
  } else if (search.to && !toDate) {
    error = "The end date was not recognised and was ignored.";
  }

  if (fromDate && toDate && fromDate > toDate) {
    error = "The start date must be on or before the end date.";
    fromDate = null;
    toDate = null;
  }

  return {
    filters: {
      q,
      entity,
      action,
      actorId,
      from: fromDate ? (search.from ?? "") : "",
      to: toDate ? (search.to ?? "") : "",
    },
    fromDate,
    toDate,
    error,
  };
}

function hrefFor(page: number, filters: Filters): string {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.entity) params.set("entity", filters.entity);
  if (filters.action) params.set("action", filters.action);
  if (filters.actorId != null) params.set("actor", String(filters.actorId));
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/activity?${query}` : "/activity";
}

export default async function ActivityPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const user = await requireUser("/activity");
  const actor: Actor = {
    id: user.id,
    role: user.role,
    departmentId: user.departmentId,
  };

  if (!can(actor, "activity.read")) {
    return <AccessDenied />;
  }

  const search = await searchParams;
  const { filters, fromDate, toDate, error } = parseFilters(search);

  const requestedPage = Number.parseInt(search.page ?? "1", 10);
  const safeRequestedPage = Number.isNaN(requestedPage) ? 1 : requestedPage;

  const toExclusive = toDate
    ? new Date(toDate.getTime() + 24 * 60 * 60 * 1000)
    : null;

  const where: Prisma.ActivityLogWhereInput = {
    ...(filters.entity ? { entityType: filters.entity } : {}),
    ...(filters.action ? { action: filters.action } : {}),
    ...(filters.actorId != null ? { actorId: filters.actorId } : {}),
    ...(filters.q ? { summary: { contains: filters.q } } : {}),
    ...(fromDate || toExclusive
      ? {
          createdAt: {
            ...(fromDate ? { gte: fromDate } : {}),
            ...(toExclusive ? { lt: toExclusive } : {}),
          },
        }
      : {}),
  };

  const [total, actionRows, entityRows, actors] = await Promise.all([
    prisma.activityLog.count({ where }),
    prisma.activityLog.findMany({
      distinct: ["action"],
      select: { action: true },
      orderBy: { action: "asc" },
    }),
    prisma.activityLog.findMany({
      distinct: ["entityType"],
      select: { entityType: true },
      orderBy: { entityType: "asc" },
    }),
    prisma.user.findMany({
      where: { activities: { some: {} } },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(Math.max(safeRequestedPage, 1), totalPages);
  const start = total === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const end = Math.min(currentPage * PAGE_SIZE, total);

  const entries = await prisma.activityLog.findMany({
    where,
    include: { actor: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    skip: (currentPage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  const hasFilters = Boolean(
    filters.q ||
      filters.entity ||
      filters.action ||
      filters.actorId != null ||
      filters.from ||
      filters.to,
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-ink">
          Activity log
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Append-only audit trail. Every mutation records its actor, entity and
          timestamp.
        </p>
      </div>

      <form
        method="get"
        className="rounded-lg border border-line bg-surface p-3"
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <div className="sm:col-span-2">
            <label
              htmlFor="q"
              className="mb-1 block text-xs font-medium text-ink-muted"
            >
              Summary
            </label>
            <input
              id="q"
              name="q"
              type="search"
              defaultValue={filters.q}
              placeholder="Search the summary text"
              className="w-full rounded-md border border-line bg-surface px-2.5 py-2 text-sm text-ink placeholder:text-ink-subtle"
            />
          </div>
          <div>
            <label
              htmlFor="entity"
              className="mb-1 block text-xs font-medium text-ink-muted"
            >
              Entity
            </label>
            <select
              id="entity"
              name="entity"
              defaultValue={filters.entity}
              className="w-full rounded-md border border-line bg-surface px-2.5 py-2 text-sm text-ink"
            >
              <option value="">All entities</option>
              {entityRows.map((row) => (
                <option key={row.entityType} value={row.entityType}>
                  {humanize(row.entityType)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="action"
              className="mb-1 block text-xs font-medium text-ink-muted"
            >
              Action
            </label>
            <select
              id="action"
              name="action"
              defaultValue={filters.action}
              className="w-full rounded-md border border-line bg-surface px-2.5 py-2 text-sm text-ink"
            >
              <option value="">All actions</option>
              {actionRows.map((row) => (
                <option key={row.action} value={row.action}>
                  {humanize(row.action)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="actor"
              className="mb-1 block text-xs font-medium text-ink-muted"
            >
              Actor
            </label>
            <select
              id="actor"
              name="actor"
              defaultValue={filters.actorId != null ? String(filters.actorId) : ""}
              className="w-full rounded-md border border-line bg-surface px-2.5 py-2 text-sm text-ink"
            >
              <option value="">All actors</option>
              {actors.map((row) => (
                <option key={row.id} value={row.id}>
                  {row.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="from"
              className="mb-1 block text-xs font-medium text-ink-muted"
            >
              From
            </label>
            <input
              id="from"
              name="from"
              type="date"
              defaultValue={filters.from}
              className="w-full rounded-md border border-line bg-surface px-2.5 py-2 text-sm text-ink"
            />
          </div>
          <div>
            <label
              htmlFor="to"
              className="mb-1 block text-xs font-medium text-ink-muted"
            >
              To
            </label>
            <input
              id="to"
              name="to"
              type="date"
              defaultValue={filters.to}
              className="w-full rounded-md border border-line bg-surface px-2.5 py-2 text-sm text-ink"
            />
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="submit"
            className="rounded-md bg-accent px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
          >
            Apply filters
          </button>
          <Link
            href="/activity"
            className="rounded-md border border-line px-3 py-2 text-sm font-medium text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink"
          >
            Clear
          </Link>
          <p className="text-xs text-ink-subtle" role="status">
            {total === 0
              ? "No entries match the current filters."
              : `Showing ${start}–${end} of ${total} entries.`}
          </p>
        </div>
      </form>

      {error && (
        <p
          role="status"
          className="rounded-md border border-line bg-surface-sunken px-3 py-2 text-sm text-ink-muted"
        >
          {error}
        </p>
      )}

      {entries.length === 0 ? (
        <div className="rounded-lg border border-line bg-surface px-6 py-12 text-center">
          <p className="text-sm font-medium text-ink">
            {hasFilters ? "No activity matches these filters." : "Nothing logged yet."}
          </p>
          <p className="mt-1 text-sm text-ink-muted">
            {hasFilters ? (
              <Link
                href="/activity"
                className="font-medium text-accent underline-offset-2 hover:underline"
              >
                Clear the filters
              </Link>
            ) : (
              "Mutating a lead, task, employee or leave request will write the first entry."
            )}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-line bg-surface">
          <table className="w-full min-w-[760px] text-sm">
            <caption className="sr-only">
              Audit trail entries, newest first
            </caption>
            <thead>
              <tr className="border-b border-line bg-surface-sunken/60 text-left text-xs uppercase tracking-wide text-ink-subtle">
                <th scope="col" className="px-4 py-2.5 font-medium">
                  When
                </th>
                <th scope="col" className="px-4 py-2.5 font-medium">
                  Actor
                </th>
                <th scope="col" className="px-4 py-2.5 font-medium">
                  Action
                </th>
                <th scope="col" className="px-4 py-2.5 font-medium">
                  Entity
                </th>
                <th scope="col" className="px-4 py-2.5 font-medium">
                  Summary
                </th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr
                  key={entry.id}
                  className="border-b border-line last:border-0 hover:bg-surface-sunken/50"
                >
                  <td className="whitespace-nowrap px-4 py-3 text-ink-muted">
                    <time dateTime={entry.createdAt.toISOString()}>
                      {formatDateTimeUtc(entry.createdAt)}
                    </time>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-ink">
                    {entry.actor?.name ?? (
                      <span className="text-ink-subtle">System</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span className="pill bg-surface-sunken text-ink-muted">
                      {humanize(entry.action)}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span
                      className={`pill ${
                        ENTITY_TONE[entry.entityType] ??
                        "bg-surface-sunken text-ink-muted"
                      }`}
                    >
                      {humanize(entry.entityType)}
                    </span>
                    {entry.entityId != null && (
                      <span className="ml-2 text-xs tabular-nums text-ink-subtle">
                        #{entry.entityId}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-ink">{entry.summary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {total > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-ink-subtle">
            Page {currentPage} of {totalPages} · {PAGE_SIZE} per page
          </p>
          <div className="flex items-center gap-2">
            {currentPage > 1 ? (
              <Link
                href={hrefFor(currentPage - 1, filters)}
                className="rounded-md border border-line px-3 py-1.5 text-sm font-medium text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink"
              >
                Previous
              </Link>
            ) : (
              <span
                aria-disabled="true"
                className="rounded-md border border-line px-3 py-1.5 text-sm font-medium text-ink-subtle opacity-60"
              >
                Previous
              </span>
            )}
            {currentPage < totalPages ? (
              <Link
                href={hrefFor(currentPage + 1, filters)}
                className="rounded-md border border-line px-3 py-1.5 text-sm font-medium text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink"
              >
                Next
              </Link>
            ) : (
              <span
                aria-disabled="true"
                className="rounded-md border border-line px-3 py-1.5 text-sm font-medium text-ink-subtle opacity-60"
              >
                Next
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function AccessDenied() {
  return (
    <div className="rounded-lg border border-line bg-surface px-6 py-12 text-center">
      <p className="text-sm font-medium text-ink">
        You do not have access to the activity log.
      </p>
      <p className="mt-1 text-sm text-ink-muted">
        The audit trail is limited to owners and admins.
      </p>
    </div>
  );
}
