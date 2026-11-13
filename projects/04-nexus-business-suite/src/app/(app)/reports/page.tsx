import Link from "next/link";
import { requireUser } from "@/lib/session";
import { can, scopeLabel, type Actor } from "@/lib/permissions";
import {
  getReportData,
  parseReportRange,
  type ReportKey,
} from "@/lib/reports";
import { formatMoney, formatPercent } from "@/lib/format";

export const dynamic = "force-dynamic";

type Search = { from?: string; to?: string };

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const user = await requireUser("/reports");
  const actor: Actor = {
    id: user.id,
    role: user.role,
    departmentId: user.departmentId,
  };

  if (!can(actor, "report.view")) {
    return <AccessDenied />;
  }

  const { from, to } = await searchParams;
  const { range, error } = parseReportRange(from, to);
  const data = await getReportData(actor, range);

  const exportHref = (type: ReportKey) =>
    `/reports/export?type=${type}&from=${range.from}&to=${range.to}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-ink">
            Reports
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            {scopeLabel(actor)} · {range.from} to {range.to} (UTC)
          </p>
        </div>
      </div>

      <form
        method="get"
        className="rounded-lg border border-line bg-surface p-3"
      >
        <div className="flex flex-wrap items-end gap-2">
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
              defaultValue={range.from}
              className="rounded-md border border-line bg-surface px-2.5 py-2 text-sm text-ink"
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
              defaultValue={range.to}
              className="rounded-md border border-line bg-surface px-2.5 py-2 text-sm text-ink"
            />
          </div>
          <button
            type="submit"
            className="rounded-md bg-accent px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
          >
            Apply range
          </button>
          <Link
            href="/reports"
            className="rounded-md border border-line px-3 py-2 text-sm font-medium text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink"
          >
            Last 30 days
          </Link>
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

      <section aria-labelledby="pipeline-report" className="space-y-3">
        <SectionHeader
          id="pipeline-report"
          title="Sales pipeline"
          description="Leads created in the selected range, by stage."
          href={exportHref("pipeline")}
          exportLabel="Export pipeline CSV"
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard label="Leads created" value={String(data.pipeline.totalCount)} />
          <SummaryCard
            label="Pipeline value"
            value={formatMoney(data.pipeline.totalMinor, data.pipeline.currency)}
          />
          <SummaryCard label="Won" value={String(data.pipeline.wonCount)} />
          <SummaryCard label="Lost" value={String(data.pipeline.lostCount)} />
        </div>
        {data.pipeline.totalCount === 0 ? (
          <EmptyState message="No leads were created in this range. Widen the dates to see pipeline activity." />
        ) : (
          <ReportTable
            caption="Pipeline by stage"
            head={["Stage", "Leads", "Value"]}
            align={["left", "right", "right"]}
            rows={data.pipeline.rows.map((row) => [
              row.label,
              String(row.count),
              formatMoney(row.valueMinor, data.pipeline.currency),
            ])}
          />
        )}
      </section>

      <section aria-labelledby="headcount-report" className="space-y-3">
        <SectionHeader
          id="headcount-report"
          title="Headcount"
          description="People on the books at the end of the range, by department."
          href={exportHref("headcount")}
          exportLabel="Export headcount CSV"
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SummaryCard label="Headcount" value={String(data.headcount.headcount)} />
          <SummaryCard label="New hires" value={String(data.headcount.newHires)} />
          <SummaryCard
            label="Active salary"
            value={formatMoney(data.headcount.salaryMinor)}
          />
        </div>
        {data.headcount.rows.length === 0 ? (
          <EmptyState message="No employees are visible in your scope." />
        ) : (
          <ReportTable
            caption="Headcount by department"
            head={[
              "Department",
              "Headcount",
              "Active",
              "On leave",
              "Ended",
              "New hires",
              "Active salary",
            ]}
            align={["left", "right", "right", "right", "right", "right", "right"]}
            rows={data.headcount.rows.map((row) => [
              row.department,
              String(row.headcount),
              String(row.active),
              String(row.onLeave),
              String(row.ended),
              String(row.newHires),
              formatMoney(row.salaryMinor),
            ])}
          />
        )}
      </section>

      <section aria-labelledby="attendance-report" className="space-y-3">
        <SectionHeader
          id="attendance-report"
          title="Attendance"
          description="Logged attendance days in the selected range."
          href={exportHref("attendance")}
          exportLabel="Export attendance CSV"
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SummaryCard label="Days logged" value={String(data.attendance.total)} />
          <SummaryCard
            label="Present or remote"
            value={String(data.attendance.present)}
          />
          <SummaryCard
            label="Attendance rate"
            value={
              data.attendance.rate == null
                ? "—"
                : formatPercent(data.attendance.rate)
            }
          />
        </div>
        {data.attendance.total === 0 ? (
          <EmptyState message="No attendance was recorded in this range." />
        ) : (
          <ReportTable
            caption="Attendance by status"
            head={["Status", "Days", "Share"]}
            align={["left", "right", "right"]}
            rows={data.attendance.rows.map((row) => [
              row.label,
              String(row.count),
              formatPercent(row.share),
            ])}
          />
        )}
      </section>

      <section aria-labelledby="tasks-report" className="space-y-3">
        <SectionHeader
          id="tasks-report"
          title="Tasks"
          description="Tasks created in the selected range, by status and priority."
          href={exportHref("tasks")}
          exportLabel="Export tasks CSV"
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SummaryCard label="Tasks created" value={String(data.tasks.total)} />
          <SummaryCard label="Done" value={String(data.tasks.done)} />
          <SummaryCard
            label="Completion rate"
            value={
              data.tasks.total === 0
                ? "—"
                : formatPercent(data.tasks.done / data.tasks.total)
            }
          />
        </div>
        {data.tasks.total === 0 ? (
          <EmptyState message="No tasks were created in this range." />
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ReportTable
              caption="Tasks by status"
              head={["Status", "Tasks"]}
              align={["left", "right"]}
              rows={data.tasks.byStatus.map((row) => [
                row.label,
                String(row.count),
              ])}
            />
            <ReportTable
              caption="Tasks by priority"
              head={["Priority", "Tasks"]}
              align={["left", "right"]}
              rows={data.tasks.byPriority.map((row) => [
                row.label,
                String(row.count),
              ])}
            />
          </div>
        )}
      </section>
    </div>
  );
}

function SectionHeader({
  id,
  title,
  description,
  href,
  exportLabel,
}: {
  id: string;
  title: string;
  description: string;
  href: string;
  exportLabel: string;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-2">
      <div>
        <h2 id={id} className="text-base font-semibold text-ink">
          {title}
        </h2>
        <p className="mt-0.5 text-sm text-ink-muted">{description}</p>
      </div>
      <a
        href={href}
        className="rounded-md border border-line px-3 py-1.5 text-sm font-medium text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink"
        aria-label={exportLabel}
      >
        Export CSV
      </a>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line bg-surface p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-subtle">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-ink">
        {value}
      </p>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-line bg-surface px-6 py-10 text-center">
      <p className="text-sm text-ink-muted">{message}</p>
    </div>
  );
}

function ReportTable({
  caption,
  head,
  align,
  rows,
}: {
  caption: string;
  head: string[];
  align: ("left" | "right")[];
  rows: string[][];
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-line bg-surface">
      <table className="w-full min-w-[520px] text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-line bg-surface-sunken/60 text-left text-xs uppercase tracking-wide text-ink-subtle">
            {head.map((label, index) => (
              <th
                key={label}
                scope="col"
                className={`px-4 py-2.5 font-medium ${
                  align[index] === "right" ? "text-right" : ""
                }`}
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row[0]}
              className="border-b border-line last:border-0 hover:bg-surface-sunken/50"
            >
              {row.map((cell, index) => (
                <td
                  key={`${row[0]}-${head[index]}`}
                  className={`px-4 py-3 ${
                    align[index] === "right"
                      ? "text-right tabular-nums text-ink"
                      : "text-ink"
                  }`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AccessDenied() {
  return (
    <div className="rounded-lg border border-line bg-surface px-6 py-12 text-center">
      <p className="text-sm font-medium text-ink">
        You do not have access to reports.
      </p>
      <p className="mt-1 text-sm text-ink-muted">
        Reports are limited to owners, admins and managers.
      </p>
    </div>
  );
}
