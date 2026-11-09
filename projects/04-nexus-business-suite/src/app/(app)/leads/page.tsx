import Link from "next/link";
import { LeadStageBadge, SourceLabel } from "@/components/crm/badges";
import { prisma } from "@/lib/db";
import {
  LEAD_SOURCES,
  LEAD_SOURCE_LABELS,
  LEAD_STAGES,
  LEAD_STAGE_LABELS,
  isLeadSource,
  isLeadStage,
} from "@/lib/domain";
import { formatDateUtc, formatMoney } from "@/lib/format";
import {
  ownerDepartmentFilter,
  scopeFor,
  scopeLabel,
  type Actor,
} from "@/lib/permissions";
import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";

type Search = { q?: string; stage?: string; source?: string };

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const user = await requireUser("/leads");
  const actor: Actor = {
    id: user.id,
    role: user.role,
    departmentId: user.departmentId,
  };
  const { q: rawQ, stage: rawStage, source: rawSource } = await searchParams;
  const q = rawQ?.trim() ?? "";
  const stage = rawStage && isLeadStage(rawStage) ? rawStage : "";
  const source = rawSource && isLeadSource(rawSource) ? rawSource : "";

  const where = {
    ...ownerDepartmentFilter(actor),
    ...(stage ? { stage } : {}),
    ...(source ? { source } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q } },
            { company: { contains: q } },
            { email: { contains: q } },
          ],
        }
      : {}),
  };

  const leads = await prisma.lead.findMany({
    where,
    include: {
      owner: { select: { name: true } },
      _count: { select: { notes: true, tasks: true } },
    },
    orderBy: [{ valueMinor: "desc" }],
    take: 100,
  });

  const openMinor = leads
    .filter((lead) => !["won", "lost"].includes(lead.stage))
    .reduce((sum, lead) => sum + lead.valueMinor, 0);
  const wonCount = leads.filter((lead) => lead.stage === "won").length;
  const filtered = Boolean(q || stage || source);
  const scoped = scopeFor(actor) !== "all";

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-ink">Leads</h1>
          <p className="mt-1 text-sm text-ink-muted">
            {scopeLabel(actor)}
            {scoped ? " · department-scoped by your role" : " · company-wide"}
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-md border border-line bg-surface p-1 text-sm">
          <span className="rounded bg-accent-soft px-2.5 py-1 font-medium text-accent-ink">
            List
          </span>
          <Link
            href="/pipeline"
            className="rounded px-2.5 py-1 text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink"
          >
            Pipeline board
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-line bg-surface p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-subtle">
            Leads shown
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-ink">
            {leads.length}
          </p>
          <p className="mt-1 text-xs text-ink-muted">
            {filtered ? "Matching the current filters" : "In your visible scope"}
          </p>
        </div>
        <div className="rounded-lg border border-line bg-surface p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-subtle">
            Open pipeline
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-ink">
            {formatMoney(openMinor)}
          </p>
          <p className="mt-1 text-xs text-ink-muted">Excludes won and lost</p>
        </div>
        <div className="rounded-lg border border-line bg-surface p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-subtle">
            Won leads
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-ink">
            {wonCount}
          </p>
          <p className="mt-1 text-xs text-ink-muted">
            Ready to convert into customers
          </p>
        </div>
      </div>

      <form method="get" className="rounded-lg border border-line bg-surface p-3">
        <div className="flex flex-wrap items-end gap-2">
          <div className="min-w-[220px] flex-1">
            <label htmlFor="q" className="sr-only">
              Search leads
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
            <label htmlFor="stage" className="sr-only">
              Filter by stage
            </label>
            <select
              id="stage"
              name="stage"
              defaultValue={stage}
              className="rounded-md border border-line bg-surface px-2.5 py-2 text-sm text-ink"
            >
              <option value="">All stages</option>
              {LEAD_STAGES.map((value) => (
                <option key={value} value={value}>
                  {LEAD_STAGE_LABELS[value]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="source" className="sr-only">
              Filter by source
            </label>
            <select
              id="source"
              name="source"
              defaultValue={source}
              className="rounded-md border border-line bg-surface px-2.5 py-2 text-sm text-ink"
            >
              <option value="">All sources</option>
              {LEAD_SOURCES.map((value) => (
                <option key={value} value={value}>
                  {LEAD_SOURCE_LABELS[value]}
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
              href="/leads"
              className="rounded-md border border-line px-3 py-2 text-sm font-medium text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink"
            >
              Reset
            </Link>
          )}
        </div>
      </form>

      <div className="overflow-hidden rounded-lg border border-line bg-surface">
        {leads.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm font-medium text-ink">No leads match this view.</p>
            <p className="mt-1 text-sm text-ink-muted">
              {filtered
                ? "Clear the filters to see the rest of the pipeline."
                : "Leads will appear here once they are created."}
            </p>
            {filtered && (
              <Link
                href="/leads"
                className="mt-3 inline-block text-sm font-medium text-accent underline-offset-2 hover:underline"
              >
                Clear filters
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-line bg-surface-sunken/60 text-left text-xs uppercase tracking-wide text-ink-subtle">
                  <th scope="col" className="px-4 py-2.5 font-medium">
                    Lead
                  </th>
                  <th scope="col" className="px-4 py-2.5 font-medium">
                    Stage
                  </th>
                  <th scope="col" className="px-4 py-2.5 font-medium">
                    Owner
                  </th>
                  <th scope="col" className="px-4 py-2.5 font-medium">
                    Source
                  </th>
                  <th scope="col" className="px-4 py-2.5 text-right font-medium">
                    Value
                  </th>
                  <th scope="col" className="px-4 py-2.5 text-right font-medium">
                    Notes
                  </th>
                  <th scope="col" className="px-4 py-2.5 text-right font-medium">
                    Updated
                  </th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="border-b border-line last:border-0 hover:bg-surface-sunken/50"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink">{lead.name}</p>
                      <p className="text-xs text-ink-muted">{lead.company}</p>
                    </td>
                    <td className="px-4 py-3">
                      <LeadStageBadge stage={lead.stage} />
                    </td>
                    <td className="px-4 py-3 text-ink-muted">
                      {lead.owner?.name ?? "Unassigned"}
                    </td>
                    <td className="px-4 py-3 text-ink-muted">
                      <SourceLabel source={lead.source} />
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-ink">
                      {formatMoney(lead.valueMinor, lead.currency)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-ink-muted">
                      {lead._count.notes}
                    </td>
                    <td className="px-4 py-3 text-right text-ink-subtle">
                      {formatDateUtc(lead.updatedAt)}
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
