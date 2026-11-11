import Link from "next/link";
import {
  LeaveStatusBadge,
  LeaveTypeLabel,
} from "@/components/hr/badges";
import { prisma } from "@/lib/db";
import {
  LEAVE_STATUSES,
  LEAVE_STATUS_LABELS,
  LEAVE_TYPES,
  LEAVE_TYPE_LABELS,
  isLeaveStatus,
} from "@/lib/domain";
import { formatDateUtc } from "@/lib/format";
import {
  can,
  canAccessDepartment,
  scopeFor,
  scopeLabel,
  type Actor,
} from "@/lib/permissions";
import { requireUser } from "@/lib/session";
import { decideLeave, requestLeave } from "./actions";

export const dynamic = "force-dynamic";

type Search = { status?: string; notice?: string };

const NOTICE: Record<string, { tone: string; text: string }> = {
  requested: { tone: "success", text: "Leave request submitted for approval." },
  approved: { tone: "success", text: "Leave request approved." },
  rejected: { tone: "success", text: "Leave request rejected." },
  invalid: {
    tone: "warning",
    text: "Check the dates and leave type, then try again.",
  },
  "no-employee": {
    tone: "warning",
    text: "Your account has no employee record, so leave cannot be requested.",
  },
  "not-pending": {
    tone: "warning",
    text: "That request has already been decided.",
  },
  "not-found": { tone: "warning", text: "That leave request no longer exists." },
  forbidden: {
    tone: "danger",
    text: "Your role may not perform that leave action.",
  },
};

function dayCount(start: Date, end: Date): number {
  return Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1;
}

export default async function LeavePage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const user = await requireUser("/leave");
  const actor: Actor = {
    id: user.id,
    role: user.role,
    departmentId: user.departmentId,
  };
  if (!can(actor, "leave.read")) {
    return (
      <div className="rounded-lg border border-line bg-surface px-6 py-12 text-center">
        <p className="text-sm font-medium text-ink">
          You do not have access to leave records.
        </p>
      </div>
    );
  }

  const { status: rawStatus, notice } = await searchParams;
  const status = rawStatus && isLeaveStatus(rawStatus) ? rawStatus : "";
  const banner = notice ? NOTICE[notice] : undefined;

  const employeeScope =
    scopeFor(actor) === "all"
      ? {}
      : actor.role === "staff"
        ? { userId: actor.id }
        : actor.departmentId != null
          ? { departmentId: actor.departmentId }
          : { id: -1 };

  const [requests, me] = await Promise.all([
    prisma.leaveRequest.findMany({
      where: {
        employee: employeeScope,
        ...(status ? { status } : {}),
      },
      include: {
        employee: {
          include: {
            user: { select: { name: true } },
            department: { select: { name: true } },
          },
        },
        decidedBy: { select: { name: true } },
      },
      orderBy: [{ status: "asc" }, { startDate: "asc" }],
      take: 200,
    }),
    prisma.employee.findUnique({
      where: { userId: user.id },
      select: { id: true, jobTitle: true, department: { select: { name: true } } },
    }),
  ]);

  const pending = requests.filter((request) => request.status === "pending").length;
  const approved = requests.filter((request) => request.status === "approved").length;
  const rejected = requests.filter((request) => request.status === "rejected").length;
  const canApprove = can(actor, "leave.approve");
  const scoped = scopeFor(actor) !== "all";
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-ink">Leave</h1>
        <p className="mt-1 text-sm text-ink-muted">
          {scopeLabel(actor)}
          {scoped ? " · your role limits which requests are shown" : " · company-wide"}
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-line bg-surface p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-subtle">
            Pending
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-ink">
            {pending}
          </p>
          <p className="mt-1 text-xs text-ink-muted">Waiting on a decision</p>
        </div>
        <div className="rounded-lg border border-line bg-surface p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-subtle">
            Approved
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-ink">
            {approved}
          </p>
          <p className="mt-1 text-xs text-ink-muted">In the current view</p>
        </div>
        <div className="rounded-lg border border-line bg-surface p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-subtle">
            Rejected
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-ink">
            {rejected}
          </p>
          <p className="mt-1 text-xs text-ink-muted">In the current view</p>
        </div>
      </div>

      {can(actor, "leave.request") && (
        <section className="rounded-lg border border-line bg-surface p-4">
          <h2 className="text-sm font-semibold text-ink">Request leave</h2>
          <p className="mt-1 text-sm text-ink-muted">
            {me
              ? `${me.jobTitle} · ${me.department.name}. Requests start as pending.`
              : "No employee record is linked to your account yet."}
          </p>
          {me && (
            <form action={requestLeave} className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="type"
                  className="mb-1 block text-xs font-medium text-ink-muted"
                >
                  Leave type
                </label>
                <select
                  id="type"
                  name="type"
                  required
                  className="w-full rounded-md border border-line bg-surface px-2.5 py-2 text-sm text-ink"
                >
                  {LEAVE_TYPES.map((value) => (
                    <option key={value} value={value}>
                      {LEAVE_TYPE_LABELS[value]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="startDate"
                    className="mb-1 block text-xs font-medium text-ink-muted"
                  >
                    Start
                  </label>
                  <input
                    id="startDate"
                    type="date"
                    name="startDate"
                    required
                    defaultValue={today}
                    className="w-full rounded-md border border-line bg-surface px-2.5 py-2 text-sm text-ink"
                  />
                </div>
                <div>
                  <label
                    htmlFor="endDate"
                    className="mb-1 block text-xs font-medium text-ink-muted"
                  >
                    End
                  </label>
                  <input
                    id="endDate"
                    type="date"
                    name="endDate"
                    required
                    defaultValue={today}
                    className="w-full rounded-md border border-line bg-surface px-2.5 py-2 text-sm text-ink"
                  />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label
                  htmlFor="reason"
                  className="mb-1 block text-xs font-medium text-ink-muted"
                >
                  Reason <span className="font-normal">(optional)</span>
                </label>
                <textarea
                  id="reason"
                  name="reason"
                  rows={2}
                  maxLength={500}
                  className="w-full rounded-md border border-line bg-surface px-2.5 py-2 text-sm text-ink"
                />
              </div>
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="rounded-md bg-accent px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
                >
                  Submit request
                </button>
              </div>
            </form>
          )}
        </section>
      )}

      <form method="get" className="rounded-lg border border-line bg-surface p-3">
        <div className="flex flex-wrap items-end gap-2">
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
              defaultValue={status}
              className="rounded-md border border-line bg-surface px-2.5 py-2 text-sm text-ink"
            >
              <option value="">All statuses</option>
              {LEAVE_STATUSES.map((value) => (
                <option key={value} value={value}>
                  {LEAVE_STATUS_LABELS[value]}
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
          {status && (
            <Link
              href="/leave"
              className="rounded-md border border-line px-3 py-2 text-sm font-medium text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink"
            >
              Reset
            </Link>
          )}
        </div>
      </form>

      <div className="overflow-hidden rounded-lg border border-line bg-surface">
        {requests.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm font-medium text-ink">No leave requests here.</p>
            <p className="mt-1 text-sm text-ink-muted">
              {status
                ? "Clear the status filter to see the other requests."
                : "Requests will appear here once someone submits one."}
            </p>
            {status && (
              <Link
                href="/leave"
                className="mt-3 inline-block text-sm font-medium text-accent underline-offset-2 hover:underline"
              >
                Clear filter
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-sm">
              <thead>
                <tr className="border-b border-line bg-surface-sunken/60 text-left text-xs uppercase tracking-wide text-ink-subtle">
                  <th scope="col" className="px-4 py-2.5 font-medium">
                    Employee
                  </th>
                  <th scope="col" className="px-4 py-2.5 font-medium">
                    Type
                  </th>
                  <th scope="col" className="px-4 py-2.5 font-medium">
                    Dates
                  </th>
                  <th scope="col" className="px-4 py-2.5 text-right font-medium">
                    Days
                  </th>
                  <th scope="col" className="px-4 py-2.5 font-medium">
                    Reason
                  </th>
                  <th scope="col" className="px-4 py-2.5 font-medium">
                    Status
                  </th>
                  <th scope="col" className="px-4 py-2.5 font-medium">
                    Decision
                  </th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => {
                  const canDecide =
                    canApprove &&
                    request.status === "pending" &&
                    canAccessDepartment(actor, request.employee.departmentId);
                  return (
                    <tr
                      key={request.id}
                      className="border-b border-line last:border-0 hover:bg-surface-sunken/50"
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-ink">
                          {request.employee.user.name}
                        </p>
                        <p className="text-xs text-ink-muted">
                          {request.employee.department.name}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-ink-muted">
                        <LeaveTypeLabel type={request.type} />
                      </td>
                      <td className="px-4 py-3 text-ink-muted">
                        {formatDateUtc(request.startDate)} —{" "}
                        {formatDateUtc(request.endDate)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-ink">
                        {dayCount(request.startDate, request.endDate)}
                      </td>
                      <td className="max-w-[220px] px-4 py-3 text-ink-muted">
                        {request.reason ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <LeaveStatusBadge status={request.status} />
                      </td>
                      <td className="px-4 py-3">
                        {canDecide ? (
                          <div className="flex items-center gap-2">
                            <form action={decideLeave}>
                              <input
                                type="hidden"
                                name="leaveId"
                                value={request.id}
                              />
                              <input
                                type="hidden"
                                name="decision"
                                value="approve"
                              />
                              <button
                                type="submit"
                                className="rounded-md bg-success-soft px-2.5 py-1.5 text-xs font-semibold text-success transition-colors hover:bg-success hover:text-white"
                              >
                                Approve
                              </button>
                            </form>
                            <form action={decideLeave}>
                              <input
                                type="hidden"
                                name="leaveId"
                                value={request.id}
                              />
                              <input
                                type="hidden"
                                name="decision"
                                value="reject"
                              />
                              <button
                                type="submit"
                                className="rounded-md bg-danger-soft px-2.5 py-1.5 text-xs font-semibold text-danger transition-colors hover:bg-danger hover:text-white"
                              >
                                Reject
                              </button>
                            </form>
                          </div>
                        ) : (
                          <span className="text-xs text-ink-subtle">
                            {request.status === "pending"
                              ? "Awaiting a manager"
                              : `${request.decidedBy?.name ?? "System"} · ${
                                  request.decidedAt
                                    ? formatDateUtc(request.decidedAt)
                                    : "—"
                                }`}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
