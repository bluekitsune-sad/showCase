import Link from "next/link";
import { EmployeeStatusBadge } from "@/components/hr/badges";
import { prisma } from "@/lib/db";
import { formatDateUtc, formatMoney } from "@/lib/format";
import {
  can,
  departmentFilter,
  scopeFor,
  scopeLabel,
  type Actor,
} from "@/lib/permissions";
import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";

type Search = { q?: string; department?: string };

export default async function EmployeesPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const user = await requireUser("/employees");
  const actor: Actor = {
    id: user.id,
    role: user.role,
    departmentId: user.departmentId,
  };
  if (!can(actor, "employee.read")) {
    return <AccessDenied />;
  }

  const { q: rawQ, department: rawDepartment } = await searchParams;
  const q = rawQ?.trim() ?? "";
  const departmentId =
    rawDepartment && /^\d+$/.test(rawDepartment)
      ? Number.parseInt(rawDepartment, 10)
      : null;

  const departments = await prisma.department.findMany({
    where:
      scopeFor(actor) === "all"
        ? {}
        : actor.departmentId != null
          ? { id: actor.departmentId }
          : { id: -1 },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  const where = {
    ...departmentFilter(actor),
    ...(departmentId &&
    departments.some((department) => department.id === departmentId)
      ? { departmentId }
      : {}),
    ...(q
      ? {
          OR: [
            { user: { name: { contains: q } } },
            { user: { email: { contains: q } } },
            { jobTitle: { contains: q } },
          ],
        }
      : {}),
  };

  const employees = await prisma.employee.findMany({
    where,
    include: {
      user: { select: { name: true, email: true } },
      department: { select: { name: true } },
      manager: { include: { user: { select: { name: true } } } },
    },
    orderBy: [{ department: { name: "asc" } }, { user: { name: "asc" } }],
    take: 200,
  });

  const activeCount = employees.filter((employee) => employee.status === "active").length;
  const onLeaveCount = employees.filter((employee) => employee.status === "on_leave").length;
  const scoped = scopeFor(actor) !== "all";
  const filtered = Boolean(q || departmentId);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-ink">Employees</h1>
          <p className="mt-1 text-sm text-ink-muted">
            {scopeLabel(actor)}
            {scoped ? " · department-scoped by your role" : " · company-wide"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-line bg-surface p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-subtle">
            People shown
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-ink">
            {employees.length}
          </p>
          <p className="mt-1 text-xs text-ink-muted">
            {filtered ? "Matching the current filters" : "In your visible scope"}
          </p>
        </div>
        <div className="rounded-lg border border-line bg-surface p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-subtle">
            Active
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-ink">
            {activeCount}
          </p>
          <p className="mt-1 text-xs text-ink-muted">Available for new work</p>
        </div>
        <div className="rounded-lg border border-line bg-surface p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-subtle">
            On leave
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-ink">
            {onLeaveCount}
          </p>
          <p className="mt-1 text-xs text-ink-muted">Away from their desk</p>
        </div>
      </div>

      <form method="get" className="rounded-lg border border-line bg-surface p-3">
        <div className="flex flex-wrap items-end gap-2">
          <div className="min-w-[220px] flex-1">
            <label htmlFor="q" className="sr-only">
              Search employees
            </label>
            <input
              id="q"
              name="q"
              defaultValue={q}
              placeholder="Search name, email or job title"
              className="w-full rounded-md border border-line bg-surface px-2.5 py-2 text-sm text-ink placeholder:text-ink-subtle"
            />
          </div>
          <div>
            <label htmlFor="department" className="sr-only">
              Filter by department
            </label>
            <select
              id="department"
              name="department"
              defaultValue={departmentId ? String(departmentId) : ""}
              className="rounded-md border border-line bg-surface px-2.5 py-2 text-sm text-ink"
            >
              <option value="">All departments</option>
              {departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
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
              href="/employees"
              className="rounded-md border border-line px-3 py-2 text-sm font-medium text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink"
            >
              Reset
            </Link>
          )}
        </div>
      </form>

      <div className="overflow-hidden rounded-lg border border-line bg-surface">
        {employees.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm font-medium text-ink">No employees match this view.</p>
            <p className="mt-1 text-sm text-ink-muted">
              {filtered
                ? "Clear the filters to see the rest of the directory."
                : "People appear here once they are added to the company."}
            </p>
            {filtered && (
              <Link
                href="/employees"
                className="mt-3 inline-block text-sm font-medium text-accent underline-offset-2 hover:underline"
              >
                Clear filters
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr className="border-b border-line bg-surface-sunken/60 text-left text-xs uppercase tracking-wide text-ink-subtle">
                  <th scope="col" className="px-4 py-2.5 font-medium">
                    Employee
                  </th>
                  <th scope="col" className="px-4 py-2.5 font-medium">
                    Job title
                  </th>
                  <th scope="col" className="px-4 py-2.5 font-medium">
                    Department
                  </th>
                  <th scope="col" className="px-4 py-2.5 font-medium">
                    Manager
                  </th>
                  <th scope="col" className="px-4 py-2.5 font-medium">
                    Status
                  </th>
                  <th scope="col" className="px-4 py-2.5 text-right font-medium">
                    Salary
                  </th>
                  <th scope="col" className="px-4 py-2.5 text-right font-medium">
                    Hired
                  </th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee) => (
                  <tr
                    key={employee.id}
                    className="border-b border-line last:border-0 hover:bg-surface-sunken/50"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink">{employee.user.name}</p>
                      <p className="text-xs text-ink-muted">{employee.user.email}</p>
                    </td>
                    <td className="px-4 py-3 text-ink-muted">{employee.jobTitle}</td>
                    <td className="px-4 py-3 text-ink-muted">
                      {employee.department.name}
                    </td>
                    <td className="px-4 py-3 text-ink-muted">
                      {employee.manager?.user.name ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <EmployeeStatusBadge status={employee.status} />
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-ink">
                      {formatMoney(employee.salaryMinor, employee.currency)}
                    </td>
                    <td className="px-4 py-3 text-right text-ink-subtle">
                      {formatDateUtc(employee.hiredAt)}
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

function AccessDenied() {
  return (
    <div className="rounded-lg border border-line bg-surface px-6 py-12 text-center">
      <p className="text-sm font-medium text-ink">You do not have access to this page.</p>
      <p className="mt-1 text-sm text-ink-muted">
        Ask an owner or admin if you need to see the employee directory.
      </p>
    </div>
  );
}
