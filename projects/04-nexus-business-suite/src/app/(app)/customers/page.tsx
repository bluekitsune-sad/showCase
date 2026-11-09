import Link from "next/link";
import { CustomerStatusBadge } from "@/components/crm/badges";
import { prisma } from "@/lib/db";
import {
  CUSTOMER_STATUSES,
  CUSTOMER_STATUS_LABELS,
  isCustomerStatus,
} from "@/lib/domain";
import { formatDateUtc } from "@/lib/format";
import {
  scopeFor,
  scopeLabel,
  type Actor,
} from "@/lib/permissions";
import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";

type Search = { q?: string; status?: string };

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const user = await requireUser("/customers");
  const actor: Actor = {
    id: user.id,
    role: user.role,
    departmentId: user.departmentId,
  };
  const { q: rawQ, status: rawStatus } = await searchParams;
  const q = rawQ?.trim() ?? "";
  const status = rawStatus && isCustomerStatus(rawStatus) ? rawStatus : "";
  const scoped = scopeFor(actor) !== "all";

  const where = {
    ...(status ? { status } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q } },
            { company: { contains: q } },
            { email: { contains: q } },
          ],
        }
      : {}),
    ...(scoped
      ? {
          sourceLead: {
            owner: { departmentId: actor.departmentId ?? -1 },
          },
        }
      : {}),
  };

  const customers = await prisma.customer.findMany({
    where,
    include: {
      contacts: {
        orderBy: { isPrimary: "desc" },
        take: 1,
        select: { name: true, title: true },
      },
      sourceLead: { include: { owner: { select: { name: true } } } },
      _count: { select: { contacts: true, notes: true } },
    },
    orderBy: [{ status: "asc" }, { name: "asc" }],
    take: 100,
  });

  const activeCount = customers.filter((c) => c.status === "active").length;
  const atRiskCount = customers.filter((c) => c.status === "at_risk").length;
  const filtered = Boolean(q || status);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-ink">
          Customers
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          {scopeLabel(actor)}
          {scoped
            ? " · customers converted from your department's leads"
            : " · every trading account"}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-line bg-surface p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-subtle">
            Customers shown
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-ink">
            {customers.length}
          </p>
          <p className="mt-1 text-xs text-ink-muted">
            {filtered ? "Matching the current filters" : "In your visible scope"}
          </p>
        </div>
        <div className="rounded-lg border border-line bg-surface p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-subtle">
            Active
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-success">
            {activeCount}
          </p>
          <p className="mt-1 text-xs text-ink-muted">Trading accounts</p>
        </div>
        <div className="rounded-lg border border-line bg-surface p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-subtle">
            At risk
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-warning">
            {atRiskCount}
          </p>
          <p className="mt-1 text-xs text-ink-muted">Need a check-in</p>
        </div>
      </div>

      <form method="get" className="rounded-lg border border-line bg-surface p-3">
        <div className="flex flex-wrap items-end gap-2">
          <div className="min-w-[220px] flex-1">
            <label htmlFor="q" className="sr-only">
              Search customers
            </label>
            <input
              id="q"
              name="q"
              defaultValue={q}
              placeholder="Search name, company or email"
              className="w-full rounded-md border border-line bg-surface px-2.5 py-2 text-sm text-ink placeholder:text-ink-subtle"
            />
          </div>
          <div>
            <label htmlFor="status" className="sr-only">
              Filter by status
            </label>
            <select
              id="status"
              name="status"
              defaultValue={status}
              className="rounded-md border border-line bg-surface px-2.5 py-2 text-sm text-ink"
            >
              <option value="">All statuses</option>
              {CUSTOMER_STATUSES.map((value) => (
                <option key={value} value={value}>
                  {CUSTOMER_STATUS_LABELS[value]}
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
              href="/customers"
              className="rounded-md border border-line px-3 py-2 text-sm font-medium text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink"
            >
              Reset
            </Link>
          )}
        </div>
      </form>

      <div className="overflow-hidden rounded-lg border border-line bg-surface">
        {customers.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm font-medium text-ink">
              No customers match this view.
            </p>
            <p className="mt-1 text-sm text-ink-muted">
              {filtered
                ? "Clear the filters to see the rest of the accounts."
                : "Customers appear here after a lead is won."}
            </p>
            {filtered && (
              <Link
                href="/customers"
                className="mt-3 inline-block text-sm font-medium text-accent underline-offset-2 hover:underline"
              >
                Clear filters
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-sm">
              <thead>
                <tr className="border-b border-line bg-surface-sunken/60 text-left text-xs uppercase tracking-wide text-ink-subtle">
                  <th scope="col" className="px-4 py-2.5 font-medium">
                    Customer
                  </th>
                  <th scope="col" className="px-4 py-2.5 font-medium">
                    Status
                  </th>
                  <th scope="col" className="px-4 py-2.5 font-medium">
                    Primary contact
                  </th>
                  <th scope="col" className="px-4 py-2.5 font-medium">
                    Owner
                  </th>
                  <th scope="col" className="px-4 py-2.5 text-right font-medium">
                    Contacts
                  </th>
                  <th scope="col" className="px-4 py-2.5 text-right font-medium">
                    Notes
                  </th>
                  <th scope="col" className="px-4 py-2.5 text-right font-medium">
                    Since
                  </th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => {
                  const primary = customer.contacts[0];
                  return (
                    <tr
                      key={customer.id}
                      className="border-b border-line last:border-0 hover:bg-surface-sunken/50"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/customers/${customer.id}`}
                          className="font-medium text-ink underline-offset-2 hover:text-accent hover:underline"
                        >
                          {customer.name}
                        </Link>
                        <p className="text-xs text-ink-muted">
                          {customer.company}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <CustomerStatusBadge status={customer.status} />
                      </td>
                      <td className="px-4 py-3">
                        {primary ? (
                          <>
                            <p className="text-ink">{primary.name}</p>
                            <p className="text-xs text-ink-muted">
                              {primary.title ?? "Contact"}
                            </p>
                          </>
                        ) : (
                          <span className="text-ink-subtle">No contacts</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-ink-muted">
                        {customer.sourceLead?.owner?.name ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-ink-muted">
                        {customer._count.contacts}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-ink-muted">
                        {customer._count.notes}
                      </td>
                      <td className="px-4 py-3 text-right text-ink-subtle">
                        {formatDateUtc(customer.createdAt)}
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
