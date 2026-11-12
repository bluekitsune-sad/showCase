import { prisma } from "@/lib/db";
import { TrendBars } from "@/components/dashboard/trend-bars";
import { LEAD_STAGE_LABELS, type LeadStage } from "@/lib/domain";
import {
  formatDateUtc,
  formatMoney,
  formatMoneyCompact,
  formatPercent,
} from "@/lib/format";
import {
  can,
  departmentFilter,
  ownerDepartmentFilter,
  scopeFor,
  scopeLabel,
  type Actor,
} from "@/lib/permissions";
import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";

type StageCount = { stage: string; count: number; totalMinor: number };
type TrendPoint = { label: string; value: number; display: string };

const MONTH_LABEL = new Intl.DateTimeFormat("en-GB", {
  month: "short",
  timeZone: "UTC",
});
const DAY_LABEL = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

function startOfUtcDay(date: Date): Date {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function daysAgoUtc(days: number): Date {
  const d = startOfUtcDay(new Date());
  d.setUTCDate(d.getUTCDate() - days);
  return d;
}

function monthKey(date: Date): string {
  return `${date.getUTCFullYear()}-${date.getUTCMonth()}`;
}

function lastMonthsUtc(count: number): Date[] {
  const now = new Date();
  const months: Date[] = [];
  for (let offset = count - 1; offset >= 0; offset -= 1) {
    months.push(
      new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - offset, 1)),
    );
  }
  return months;
}

async function getOverview(actor: Actor) {
  const scoped = scopeFor(actor) !== "all";
  const [
    leadStageRows,
    leadTrendRows,
    attendanceRows,
    customers,
    employees,
    openTasks,
    overdueTasks,
    recentActivity,
  ] = await Promise.all([
    prisma.lead.groupBy({
      by: ["stage"],
      _count: { _all: true },
      _sum: { valueMinor: true },
      where: ownerDepartmentFilter(actor),
    }),
    prisma.lead.findMany({
      where: ownerDepartmentFilter(actor),
      select: { createdAt: true, valueMinor: true, stage: true },
    }),
    prisma.attendance.findMany({
      where: {
        date: { gte: daysAgoUtc(13) },
        employee: departmentFilter(actor),
      },
      select: { date: true, status: true },
    }),
    prisma.customer.count({
      where: {
        status: "active",
        ...(scoped ? { sourceLead: ownerDepartmentFilter(actor) } : {}),
      },
    }),
    prisma.employee.count({
      where: { status: "active", ...departmentFilter(actor) },
    }),
    prisma.task.count({
      where: {
        status: { in: ["todo", "in_progress", "blocked"] },
        ...(scoped ? { assignee: departmentFilter(actor) } : {}),
      },
    }),
    prisma.task.count({
      where: {
        status: { in: ["todo", "in_progress", "blocked"] },
        dueDate: { lt: new Date() },
        ...(scoped ? { assignee: departmentFilter(actor) } : {}),
      },
    }),
    scoped
      ? Promise.resolve([])
      : prisma.activityLog.findMany({
          orderBy: { createdAt: "desc" },
          take: 8,
          include: { actor: { select: { name: true } } },
        }),
  ]);

  const stageCounts: StageCount[] = leadStageRows.map((row) => ({
    stage: row.stage,
    count: row._count._all,
    totalMinor: row._sum.valueMinor ?? 0,
  }));

  const pipelineMinor = stageCounts
    .filter((s) => !["won", "lost"].includes(s.stage))
    .reduce((sum, s) => sum + s.totalMinor, 0);
  const openLeads = stageCounts
    .filter((s) => !["won", "lost"].includes(s.stage))
    .reduce((sum, s) => sum + s.count, 0);

  const pipelineByMonth = new Map<string, number>();
  for (const lead of leadTrendRows) {
    if (lead.stage === "lost") continue;
    const key = monthKey(lead.createdAt);
    pipelineByMonth.set(key, (pipelineByMonth.get(key) ?? 0) + lead.valueMinor);
  }
  const pipelineTrend: TrendPoint[] = lastMonthsUtc(6).map((month) => {
    const value = pipelineByMonth.get(monthKey(month)) ?? 0;
    return {
      label: MONTH_LABEL.format(month),
      value,
      display: formatMoneyCompact(value),
    };
  });

  const attendanceByDay = new Map<
    string,
    { date: Date; present: number; total: number }
  >();
  for (const row of attendanceRows) {
    const key = row.date.toISOString().slice(0, 10);
    const entry = attendanceByDay.get(key) ?? {
      date: row.date,
      present: 0,
      total: 0,
    };
    entry.total += 1;
    if (row.status === "present" || row.status === "remote") entry.present += 1;
    attendanceByDay.set(key, entry);
  }
  const attendanceDays = [...attendanceByDay.values()].sort(
    (a, b) => a.date.getTime() - b.date.getTime(),
  );
  const attendanceTrend: TrendPoint[] = attendanceDays.map((entry) => {
    const rate = entry.total > 0 ? entry.present / entry.total : 0;
    return {
      label: DAY_LABEL.format(entry.date),
      value: rate,
      display: formatPercent(rate),
    };
  });
  const latestAttendance =
    attendanceDays.length > 0
      ? attendanceDays[attendanceDays.length - 1]
      : null;

  return {
    stageCounts,
    pipelineMinor,
    openLeads,
    customers,
    employees,
    openTasks,
    overdueTasks,
    recentActivity,
    activityAllowed: can(actor, "activity.read"),
    pipelineTrend,
    attendanceTrend,
    attendanceRate:
      latestAttendance && latestAttendance.total > 0
        ? latestAttendance.present / latestAttendance.total
        : null,
    attendanceSummary: latestAttendance,
  };
}

const STAGE_ORDER: LeadStage[] = [
  "new",
  "contacted",
  "qualified",
  "proposal",
  "negotiation",
  "won",
  "lost",
];

function StatCard({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "danger" | "success";
}) {
  const toneClass =
    tone === "danger" ? "text-danger" : tone === "success" ? "text-success" : "text-ink";
  return (
    <div className="rounded-lg border border-line bg-surface p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-subtle">{label}</p>
      <p className={`mt-1 text-2xl font-semibold tabular-nums ${toneClass}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-ink-muted">{hint}</p>}
    </div>
  );
}

export default async function DashboardPage() {
  const user = await requireUser("/dashboard");
  const actor: Actor = {
    id: user.id,
    role: user.role,
    departmentId: user.departmentId,
  };
  const data = await getOverview(actor);
  const scoped = scopeFor(actor) !== "all";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-ink">Dashboard</h1>
        <p className="mt-1 text-sm text-ink-muted">
          {formatDateUtc(new Date(), "en-GB")} · showing{" "}
          <span className="font-medium text-ink">{scopeLabel(actor).toLowerCase()}</span>
          {" · "}
          {scoped ? "department-scoped by your role" : "company-wide"}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          label="Open pipeline"
          value={formatMoney(data.pipelineMinor)}
          hint={`${data.openLeads} leads in play`}
        />
        <StatCard
          label="Active customers"
          value={String(data.customers)}
          hint={scoped ? "Converted from your leads" : "Converted and trading"}
        />
        <StatCard
          label="Headcount"
          value={String(data.employees)}
          hint={scoped ? "In your department" : "Active employees"}
        />
        <StatCard
          label="Attendance rate"
          value={
            data.attendanceRate == null ? "—" : formatPercent(data.attendanceRate)
          }
          hint={
            data.attendanceSummary
              ? `${data.attendanceSummary.present} of ${data.attendanceSummary.total} in on ${formatDateUtc(data.attendanceSummary.date)}`
              : "No records in the last 14 days"
          }
          tone={
            data.attendanceRate != null && data.attendanceRate < 0.8
              ? "danger"
              : "default"
          }
        />
        <StatCard
          label="Open tasks"
          value={String(data.openTasks)}
          hint={
            data.overdueTasks > 0
              ? `${data.overdueTasks} overdue`
              : "None overdue"
          }
          tone={data.overdueTasks > 0 ? "danger" : "default"}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <TrendBars
            title="Pipeline created"
            caption="Open and won value · last 6 months"
            points={data.pipelineTrend}
            emptyMessage={
              scoped
                ? "No pipeline created by your department in the last six months."
                : "No pipeline created in the last six months."
            }
            ariaLabel="Bar chart of pipeline value created each month for the last six months"
          />
        </div>
        <div className="lg:col-span-2">
          <TrendBars
            title="Attendance rate"
            caption="Last 14 days"
            points={data.attendanceTrend}
            emptyMessage="No attendance records in the last 14 days."
            ariaLabel="Bar chart of the daily attendance rate for the last 14 days"
            tone="success"
            maxValue={1}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <section className="rounded-lg border border-line bg-surface p-4 lg:col-span-3">
          <h2 className="text-sm font-semibold text-ink">Pipeline by stage</h2>
          {data.stageCounts.length === 0 ? (
            <p className="mt-3 text-sm text-ink-muted">
              {scoped
                ? "No leads owned by your department yet."
                : "No leads yet. Add one from the CRM surface."}
            </p>
          ) : (
            <table className="mt-3 w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-subtle">
                  <th scope="col" className="py-1.5 font-medium">Stage</th>
                  <th scope="col" className="py-1.5 text-right font-medium">Leads</th>
                  <th scope="col" className="py-1.5 text-right font-medium">Value</th>
                </tr>
              </thead>
              <tbody>
                {STAGE_ORDER.map((stage) => {
                  const row = data.stageCounts.find((s) => s.stage === stage);
                  if (!row) return null;
                  return (
                    <tr key={stage} className="border-b border-line last:border-0">
                      <td className="py-2 text-ink">{LEAD_STAGE_LABELS[stage]}</td>
                      <td className="py-2 text-right tabular-nums text-ink-muted">{row.count}</td>
                      <td className="py-2 text-right tabular-nums text-ink">
                        {formatMoney(row.totalMinor)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </section>

        <section className="rounded-lg border border-line bg-surface p-4 lg:col-span-2">
          <h2 className="text-sm font-semibold text-ink">Recent activity</h2>
          {!data.activityAllowed ? (
            <p className="mt-2 text-sm text-ink-muted">
              The full activity log is limited to owners and admins.
            </p>
          ) : data.recentActivity.length === 0 ? (
            <p className="mt-2 text-sm text-ink-muted">
              Nothing logged yet. Mutations will appear here.
            </p>
          ) : (
            <ul className="mt-2 space-y-2">
              {data.recentActivity.map((entry) => (
                <li key={entry.id} className="flex items-baseline justify-between gap-2 text-sm">
                  <span className="truncate text-ink-muted">{entry.summary}</span>
                  <span className="shrink-0 text-xs text-ink-subtle">
                    {entry.actor?.name ?? "System"}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {data.activityAllowed && (
            <p className="mt-4 text-xs text-ink-subtle">
              Showing the 8 most recent entries.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
