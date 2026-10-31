import Link from "next/link";
import { prisma } from "@/lib/db";
import { LEAD_STAGE_LABELS, type LeadStage } from "@/lib/domain";
import { formatDateUtc, formatMoney } from "@/lib/format";

export const dynamic = "force-dynamic";

type StageCount = { stage: string; count: number; totalMinor: number };

async function getOverview() {
  const [leadStageRows, customers, employees, openTasks, overdueTasks, todayAttendance, recentActivity] =
    await Promise.all([
      prisma.lead.groupBy({
        by: ["stage"],
        _count: { _all: true },
        _sum: { valueMinor: true },
      }),
      prisma.customer.count({ where: { status: "active" } }),
      prisma.employee.count({ where: { status: "active" } }),
      prisma.task.count({ where: { status: { in: ["todo", "in_progress", "blocked"] } } }),
      prisma.task.count({
        where: {
          status: { in: ["todo", "in_progress", "blocked"] },
          dueDate: { lt: new Date() },
        },
      }),
      prisma.attendance.count({
        where: { date: { gte: startOfTodayUtc() }, status: { in: ["present", "remote"] } },
      }),
      prisma.activityLog.findMany({
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

  return {
    stageCounts,
    pipelineMinor,
    openLeads,
    customers,
    employees,
    openTasks,
    overdueTasks,
    todayAttendance,
    recentActivity,
  };
}

function startOfTodayUtc(): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
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
  const data = await getOverview();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-ink">Dashboard</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Company snapshot for {formatDateUtc(new Date(), "en-GB")} · demo data
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Open pipeline"
          value={formatMoney(data.pipelineMinor)}
          hint={`${data.openLeads} leads in play`}
        />
        <StatCard
          label="Active customers"
          value={String(data.customers)}
          hint="Converted and trading"
        />
        <StatCard
          label="Headcount"
          value={String(data.employees)}
          hint="Active employees"
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
        <section className="rounded-lg border border-line bg-surface p-4 lg:col-span-3">
          <h2 className="text-sm font-semibold text-ink">Pipeline by stage</h2>
          {data.stageCounts.length === 0 ? (
            <p className="mt-3 text-sm text-ink-muted">
              No leads yet. Add one from the CRM surface.
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
          <h2 className="text-sm font-semibold text-ink">Attendance today</h2>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-ink">
            {data.todayAttendance}
            <span className="ml-1 text-sm font-normal text-ink-muted">
              of {data.employees} checked in
            </span>
          </p>
          <div className="mt-4 border-t border-line pt-4">
            <h2 className="text-sm font-semibold text-ink">Recent activity</h2>
            {data.recentActivity.length === 0 ? (
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
          </div>
          <p className="mt-4 text-xs">
            <Link href="/activity" className="text-accent underline-offset-2 hover:underline">
              View full activity log
            </Link>{" "}
            <span className="text-ink-subtle">(arrives with the work module)</span>
          </p>
        </section>
      </div>
    </div>
  );
}
