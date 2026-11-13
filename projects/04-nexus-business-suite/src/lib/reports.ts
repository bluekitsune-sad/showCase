import { prisma } from "@/lib/db";
import {
  ATTENDANCE_STATUSES,
  ATTENDANCE_STATUS_LABELS,
  LEAD_STAGES,
  LEAD_STAGE_LABELS,
  TASK_PRIORITIES,
  TASK_PRIORITY_LABELS,
  TASK_STATUSES,
  TASK_STATUS_LABELS,
  type AttendanceStatus,
  type LeadStage,
  type TaskPriority,
  type TaskStatus,
} from "@/lib/domain";
import {
  departmentFilter,
  ownerDepartmentFilter,
  scopeFor,
  type Actor,
} from "@/lib/permissions";

export const REPORT_KEYS = [
  "pipeline",
  "headcount",
  "attendance",
  "tasks",
] as const;
export type ReportKey = (typeof REPORT_KEYS)[number];

export function isReportKey(value: string | null): value is ReportKey {
  return value != null && (REPORT_KEYS as readonly string[]).includes(value);
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function startOfUtcDay(date: Date): Date {
  const copy = new Date(date);
  copy.setUTCHours(0, 0, 0, 0);
  return copy;
}

function addDaysUtc(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setUTCDate(copy.getUTCDate() + days);
  return copy;
}

function dateInput(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export type ReportRange = {
  from: string;
  to: string;
  start: Date;
  endExclusive: Date;
};

/**
 * Parses `from` / `to` into a UTC day range. Missing values default to the
 * last 30 days; malformed values fall back and report an error so the page can
 * tell the reader what happened instead of silently querying the wrong range.
 */
export function parseReportRange(
  fromRaw?: string,
  toRaw?: string,
): { range: ReportRange; error: string | null } {
  const today = startOfUtcDay(new Date());
  const defaultFrom = addDaysUtc(today, -29);
  let error: string | null = null;

  const parse = (value: string | undefined, fallback: Date): Date => {
    if (!value) return fallback;
    if (!DATE_RE.test(value)) return new Date(Number.NaN);
    const parsed = new Date(`${value}T00:00:00.000Z`);
    return Number.isNaN(parsed.getTime()) ? new Date(Number.NaN) : parsed;
  };

  let start = parse(fromRaw, defaultFrom);
  if (Number.isNaN(start.getTime())) {
    error = "The start date was not valid; showing the last 30 days.";
    start = defaultFrom;
  }

  let end = parse(toRaw, today);
  if (Number.isNaN(end.getTime())) {
    error = "The end date was not valid; showing today.";
    end = today;
  }

  if (start.getTime() > end.getTime()) {
    error = "The start date was after the end date; the range was swapped.";
    [start, end] = [end, start];
  }

  return {
    range: {
      from: dateInput(start),
      to: dateInput(end),
      start,
      endExclusive: addDaysUtc(end, 1),
    },
    error,
  };
}

export type PipelineRow = {
  stage: LeadStage;
  label: string;
  count: number;
  valueMinor: number;
};

export type HeadcountRow = {
  department: string;
  headcount: number;
  active: number;
  onLeave: number;
  ended: number;
  newHires: number;
  salaryMinor: number;
};

export type AttendanceRow = {
  status: AttendanceStatus;
  label: string;
  count: number;
  share: number;
};

export type TaskStatusRow = { status: TaskStatus; label: string; count: number };
export type TaskPriorityRow = {
  priority: TaskPriority;
  label: string;
  count: number;
};

export type ReportData = {
  pipeline: {
    rows: PipelineRow[];
    totalCount: number;
    totalMinor: number;
    wonCount: number;
    lostCount: number;
    currency: string;
  };
  headcount: {
    rows: HeadcountRow[];
    headcount: number;
    newHires: number;
    salaryMinor: number;
  };
  attendance: {
    rows: AttendanceRow[];
    total: number;
    present: number;
    rate: number | null;
  };
  tasks: {
    byStatus: TaskStatusRow[];
    byPriority: TaskPriorityRow[];
    total: number;
    done: number;
  };
};

export async function getReportData(
  actor: Actor,
  range: ReportRange,
): Promise<ReportData> {
  const createdInRange = { gte: range.start, lt: range.endExclusive };
  const scoped = scopeFor(actor) !== "all";

  const [leadRows, employees, attendanceRows, tasks] = await Promise.all([
    prisma.lead.groupBy({
      by: ["stage"],
      where: {
        createdAt: createdInRange,
        ...ownerDepartmentFilter(actor),
      },
      _count: { _all: true },
      _sum: { valueMinor: true },
    }),
    prisma.employee.findMany({
      where: {
        ...departmentFilter(actor),
        hiredAt: { lt: range.endExclusive },
      },
      select: {
        department: { select: { name: true } },
        status: true,
        salaryMinor: true,
        hiredAt: true,
      },
    }),
    prisma.attendance.findMany({
      where: {
        date: { gte: range.start, lt: range.endExclusive },
        employee: departmentFilter(actor),
      },
      select: { status: true },
    }),
    prisma.task.findMany({
      where: {
        createdAt: createdInRange,
        ...(scoped ? { assignee: departmentFilter(actor) } : {}),
      },
      select: { status: true, priority: true },
    }),
  ]);

  const leadByStage = new Map(
    leadRows.map((row) => [row.stage, row] as const),
  );
  const pipelineRows: PipelineRow[] = LEAD_STAGES.map((stage) => {
    const row = leadByStage.get(stage);
    return {
      stage,
      label: LEAD_STAGE_LABELS[stage],
      count: row?._count._all ?? 0,
      valueMinor: row?._sum.valueMinor ?? 0,
    };
  });

  const departmentMap = new Map<string, HeadcountRow>();
  for (const employee of employees) {
    const name = employee.department.name;
    const row =
      departmentMap.get(name) ??
      {
        department: name,
        headcount: 0,
        active: 0,
        onLeave: 0,
        ended: 0,
        newHires: 0,
        salaryMinor: 0,
      };
    if (employee.status !== "ended") row.headcount += 1;
    if (employee.status === "active") {
      row.active += 1;
      row.salaryMinor += employee.salaryMinor;
    }
    if (employee.status === "on_leave") row.onLeave += 1;
    if (employee.status === "ended") row.ended += 1;
    if (
      employee.hiredAt.getTime() >= range.start.getTime() &&
      employee.hiredAt.getTime() < range.endExclusive.getTime()
    ) {
      row.newHires += 1;
    }
    departmentMap.set(name, row);
  }
  const headcountRows = [...departmentMap.values()].sort((a, b) =>
    a.department.localeCompare(b.department),
  );

  const attendanceCounts = new Map<string, number>();
  for (const row of attendanceRows) {
    attendanceCounts.set(row.status, (attendanceCounts.get(row.status) ?? 0) + 1);
  }
  const attendanceTotal = attendanceRows.length;
  const attendancePresent =
    (attendanceCounts.get("present") ?? 0) + (attendanceCounts.get("remote") ?? 0);
  const attendanceReportRows: AttendanceRow[] = ATTENDANCE_STATUSES.map(
    (status) => {
      const count = attendanceCounts.get(status) ?? 0;
      return {
        status,
        label: ATTENDANCE_STATUS_LABELS[status],
        count,
        share: attendanceTotal > 0 ? count / attendanceTotal : 0,
      };
    },
  );

  const statusCounts = new Map<string, number>();
  const priorityCounts = new Map<string, number>();
  for (const task of tasks) {
    statusCounts.set(task.status, (statusCounts.get(task.status) ?? 0) + 1);
    priorityCounts.set(
      task.priority,
      (priorityCounts.get(task.priority) ?? 0) + 1,
    );
  }

  return {
    pipeline: {
      rows: pipelineRows,
      totalCount: pipelineRows.reduce((sum, row) => sum + row.count, 0),
      totalMinor: pipelineRows.reduce((sum, row) => sum + row.valueMinor, 0),
      wonCount: leadByStage.get("won")?._count._all ?? 0,
      lostCount: leadByStage.get("lost")?._count._all ?? 0,
      currency: "USD",
    },
    headcount: {
      rows: headcountRows,
      headcount: headcountRows.reduce((sum, row) => sum + row.headcount, 0),
      newHires: headcountRows.reduce((sum, row) => sum + row.newHires, 0),
      salaryMinor: headcountRows.reduce((sum, row) => sum + row.salaryMinor, 0),
    },
    attendance: {
      rows: attendanceReportRows,
      total: attendanceTotal,
      present: attendancePresent,
      rate: attendanceTotal > 0 ? attendancePresent / attendanceTotal : null,
    },
    tasks: {
      byStatus: TASK_STATUSES.map((status) => ({
        status,
        label: TASK_STATUS_LABELS[status],
        count: statusCounts.get(status) ?? 0,
      })),
      byPriority: TASK_PRIORITIES.map((priority) => ({
        priority,
        label: TASK_PRIORITY_LABELS[priority],
        count: priorityCounts.get(priority) ?? 0,
      })),
      total: tasks.length,
      done: statusCounts.get("done") ?? 0,
    },
  };
}

function csvCell(value: string | number): string {
  const raw = String(value);
  return /[",\r\n]/.test(raw) ? `"${raw.replace(/"/g, '""')}"` : raw;
}

function csvLine(cells: (string | number)[]): string {
  return cells.map(csvCell).join(",");
}

function money(valueMinor: number): string {
  return (valueMinor / 100).toFixed(2);
}

export function reportCsv(key: ReportKey, data: ReportData): string {
  switch (key) {
    case "pipeline":
      return [
        csvLine(["Stage", "Leads", "Value (minor)", "Value (USD)"]),
        ...data.pipeline.rows.map((row) =>
          csvLine([row.label, row.count, row.valueMinor, money(row.valueMinor)]),
        ),
        csvLine([
          "Total",
          data.pipeline.totalCount,
          data.pipeline.totalMinor,
          money(data.pipeline.totalMinor),
        ]),
      ].join("\n");

    case "headcount":
      return [
        csvLine([
          "Department",
          "Headcount",
          "Active",
          "On leave",
          "Ended",
          "New hires",
          "Active salary (minor)",
          "Active salary (USD)",
        ]),
        ...data.headcount.rows.map((row) =>
          csvLine([
            row.department,
            row.headcount,
            row.active,
            row.onLeave,
            row.ended,
            row.newHires,
            row.salaryMinor,
            money(row.salaryMinor),
          ]),
        ),
        csvLine([
          "Total",
          data.headcount.headcount,
          "",
          "",
          "",
          data.headcount.newHires,
          data.headcount.salaryMinor,
          money(data.headcount.salaryMinor),
        ]),
      ].join("\n");

    case "attendance":
      return [
        csvLine(["Status", "Days", "Share"]),
        ...data.attendance.rows.map((row) =>
          csvLine([
            row.label,
            row.count,
            data.attendance.total > 0
              ? `${((row.count / data.attendance.total) * 100).toFixed(1)}%`
              : "0.0%",
          ]),
        ),
        csvLine(["Total", data.attendance.total, "100.0%"]),
      ].join("\n");

    case "tasks":
      return [
        csvLine(["Breakdown", "Value", "Tasks"]),
        ...data.tasks.byStatus.map((row) =>
          csvLine(["Status", row.label, row.count]),
        ),
        ...data.tasks.byPriority.map((row) =>
          csvLine(["Priority", row.label, row.count]),
        ),
        csvLine(["Total", "", data.tasks.total]),
      ].join("\n");
  }
}
