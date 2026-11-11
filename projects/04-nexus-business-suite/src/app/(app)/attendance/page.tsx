import Link from "next/link";
import { AttendanceStatusBadge } from "@/components/hr/badges";
import { prisma } from "@/lib/db";
import { ATTENDANCE_STATUSES, ATTENDANCE_STATUS_LABELS } from "@/lib/domain";
import { formatDateUtc } from "@/lib/format";
import {
  can,
  scopeFor,
  scopeLabel,
  type Actor,
} from "@/lib/permissions";
import { requireUser } from "@/lib/session";
import { checkIn, checkOut } from "./actions";

export const dynamic = "force-dynamic";

type Search = { date?: string; notice?: string };

const NOTICE: Record<string, { tone: string; text: string }> = {
  "checked-in": { tone: "success", text: "Checked in for today." },
  "checked-out": { tone: "success", text: "Checked out for today." },
  "already-in": { tone: "warning", text: "You are already checked in today." },
  "already-out": { tone: "warning", text: "You have already checked out today." },
  "not-in": { tone: "warning", text: "Check in before checking out." },
  "no-employee": {
    tone: "warning",
    text: "Your account has no employee record, so attendance cannot be recorded.",
  },
  forbidden: { tone: "danger", text: "Your role may not record attendance." },
};

function todayUtc(): Date {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
}

function parseDate(raw: string | undefined): Date {
  if (raw && /^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const parsed = new Date(`${raw}T00:00:00.000Z`);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return todayUtc();
}

function dateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function formatTime(date: Date | null): string {
  if (!date) return "—";
  return `${new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(date)} UTC`;
}

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const user = await requireUser("/attendance");
  const actor: Actor = {
    id: user.id,
    role: user.role,
    departmentId: user.departmentId,
  };
  if (!can(actor, "attendance.read")) {
    return (
      <div className="rounded-lg border border-line bg-surface px-6 py-12 text-center">
        <p className="text-sm font-medium text-ink">
          You do not have access to attendance records.
        </p>
      </div>
    );
  }

  const { date: rawDate, notice } = await searchParams;
  const date = parseDate(rawDate);
  const banner = notice ? NOTICE[notice] : undefined;

  const employeeScope =
    scopeFor(actor) === "all"
      ? {}
      : actor.role === "staff"
        ? { userId: actor.id }
        : actor.departmentId != null
          ? { departmentId: actor.departmentId }
          : { id: -1 };

  const [rows, me] = await Promise.all([
    prisma.attendance.findMany({
      where: { date, employee: employeeScope },
      include: {
        employee: {
          include: {
            user: { select: { name: true } },
            department: { select: { name: true } },
          },
        },
      },
      orderBy: { employee: { user: { name: "asc" } } },
      take: 200,
    }),
    prisma.employee.findUnique({
      where: { userId: user.id },
      include: {
        department: { select: { name: true } },
        attendance: { where: { date } },
      },
    }),
  ]);

  const mine = me?.attendance[0] ?? null;
  const counts = Object.fromEntries(
    ATTENDANCE_STATUSES.map((status) => [
      status,
      rows.filter((row) => row.status === status).length,
    ]),
  ) as Record<string, number>;
  const canCheck = can(actor, "attendance.check_in");
  const scoped = scopeFor(actor) !== "all";

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-ink">Attendance</h1>
        <p className="mt-1 text-sm text-ink-muted">
          {scopeLabel(actor)}
          {scoped ? " · your role limits which records are shown" : " · company-wide"}
        </p>
      </div>

      {banner && (
        <div
          role="status"
          className={`rounded-md border px-3 py-2 text-sm ${
            banner.tone === "success"
              ? "border-success/30 bg-success-soft text-success"
              : banner.tone === "danger"
                ? "border-danger/30 bg-danger-soft text-danger"
                : "border-warning/30 bg-warning-soft text-warning"
          }`}
        >
          {banner.text}
        </div>
      )}

      {canCheck && (
        <section className="rounded-lg border border-line bg-surface p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-ink">Your day</h2>
              <p className="mt-1 text-sm text-ink-muted">
                {me
                  ? `${me.jobTitle} · ${me.department.name}`
                  : "No employee record is linked to your account yet."}
              </p>
            </div>
            {me && (
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div>
                  <p className="text-xs uppercase tracking-wide text-ink-subtle">
                    Check in
                  </p>
                  <p className="font-medium tabular-nums text-ink">
                    {formatTime(mine?.checkIn ?? null)}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-ink-subtle">
                    Check out
                  </p>
                  <p className="font-medium tabular-nums text-ink">
                    {formatTime(mine?.checkOut ?? null)}
                  </p>
                </div>
                <form action={checkIn}>
                  <button
                    type="submit"
                    disabled={Boolean(mine?.checkIn)}
                    className="rounded-md bg-accent px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Check in
                  </button>
                </form>
                <form action={checkOut}>
                  <button
                    type="submit"
                    disabled={!mine?.checkIn || Boolean(mine?.checkOut)}
                    className="rounded-md border border-line px-3 py-2 text-sm font-medium text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Check out
                  </button>
                </form>
              </div>
            )}
          </div>
        </section>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        {ATTENDANCE_STATUSES.map((status) => (
          <div key={status} className="rounded-lg border border-line bg-surface p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-subtle">
              {ATTENDANCE_STATUS_LABELS[status]}
            </p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-ink">
              {counts[status]}
            </p>
          </div>
        ))}
      </div>

      <form method="get" className="rounded-lg border border-line bg-surface p-3">
        <div className="flex flex-wrap items-end gap-2">
          <div>
            <label
              htmlFor="date"
              className="mb-1 block text-xs font-medium text-ink-muted"
            >
              Working day (UTC)
            </label>
            <input
              id="date"
              type="date"
              name="date"
              defaultValue={dateInputValue(date)}
              className="rounded-md border border-line bg-surface px-2.5 py-2 text-sm text-ink"
            />
          </div>
          <button
            type="submit"
            className="rounded-md bg-accent px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
          >
            View day
          </button>
          <Link
            href="/attendance"
            className="rounded-md border border-line px-3 py-2 text-sm font-medium text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink"
          >
            Today
          </Link>
        </div>
      </form>

      <div className="overflow-hidden rounded-lg border border-line bg-surface">
        <div className="border-b border-line bg-surface-sunken/60 px-4 py-2.5">
          <h2 className="text-xs font-medium uppercase tracking-wide text-ink-subtle">
            Log · {formatDateUtc(date)}
          </h2>
        </div>
        {rows.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm font-medium text-ink">No attendance recorded.</p>
            <p className="mt-1 text-sm text-ink-muted">
              Nothing was logged for this day in your visible scope. Weekends and
              holidays often have no entries.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-line bg-surface-sunken/60 text-left text-xs uppercase tracking-wide text-ink-subtle">
                  <th scope="col" className="px-4 py-2.5 font-medium">
                    Employee
                  </th>
                  <th scope="col" className="px-4 py-2.5 font-medium">
                    Department
                  </th>
                  <th scope="col" className="px-4 py-2.5 font-medium">
                    Status
                  </th>
                  <th scope="col" className="px-4 py-2.5 text-right font-medium">
                    Check in
                  </th>
                  <th scope="col" className="px-4 py-2.5 text-right font-medium">
                    Check out
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-line last:border-0 hover:bg-surface-sunken/50"
                  >
                    <td className="px-4 py-3 font-medium text-ink">
                      {row.employee.user.name}
                      <p className="text-xs font-normal text-ink-muted">
                        {row.employee.jobTitle}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-ink-muted">
                      {row.employee.department.name}
                    </td>
                    <td className="px-4 py-3">
                      <AttendanceStatusBadge status={row.status} />
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-ink-muted">
                      {formatTime(row.checkIn)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-ink-muted">
                      {formatTime(row.checkOut)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
