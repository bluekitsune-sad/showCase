import Link from "next/link";
import { updateLeadStage } from "@/app/(app)/leads/actions";
import { LeadStageBadge, SourceLabel } from "@/components/crm/badges";
import { prisma } from "@/lib/db";
import {
  LEAD_STAGES,
  LEAD_STAGE_LABELS,
  type LeadStage,
} from "@/lib/domain";
import { formatDateUtc, formatMoney } from "@/lib/format";
import {
  can,
  ownerDepartmentFilter,
  scopeFor,
  scopeLabel,
  type Actor,
} from "@/lib/permissions";
import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";

const STAGE_ORDER: LeadStage[] = [...LEAD_STAGES];

type Search = { q?: string };

export default async function PipelinePage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const user = await requireUser("/pipeline");
  const actor: Actor = {
    id: user.id,
    role: user.role,
    departmentId: user.departmentId,
  };
  const { q: rawQ } = await searchParams;
  const q = rawQ?.trim() ?? "";

  const leads = await prisma.lead.findMany({
    where: {
      ...ownerDepartmentFilter(actor),
      ...(q
        ? {
            OR: [
              { name: { contains: q } },
              { company: { contains: q } },
              { email: { contains: q } },
            ],
          }
        : {}),
    },
    include: {
      owner: { select: { name: true } },
      _count: { select: { notes: true } },
    },
    orderBy: [{ valueMinor: "desc" }],
    take: 200,
  });

  const canMove = can(actor, "lead.stage_change");
  const scoped = scopeFor(actor) !== "all";

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-ink">
            Lead pipeline
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            {scopeLabel(actor)}
            {scoped ? " · drag-free stage control, audited per move" : " · company-wide"}
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-md border border-line bg-surface p-1 text-sm">
          <Link
            href="/leads"
            className="rounded px-2.5 py-1 text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink"
          >
            List
          </Link>
          <span className="rounded bg-accent-soft px-2.5 py-1 font-medium text-accent-ink">
            Pipeline board
          </span>
        </div>
      </div>

      <form method="get" className="flex flex-wrap items-center gap-2">
        <label htmlFor="q" className="sr-only">
          Search the pipeline
        </label>
        <input
          id="q"
          name="q"
          defaultValue={q}
          placeholder="Search name, company or email"
          className="min-w-[240px] flex-1 rounded-md border border-line bg-surface px-2.5 py-2 text-sm text-ink placeholder:text-ink-subtle"
        />
        <button
          type="submit"
          className="rounded-md bg-accent px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
        >
          Search
        </button>
        {q && (
          <Link
            href="/pipeline"
            className="rounded-md border border-line px-3 py-2 text-sm font-medium text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink"
          >
            Reset
          </Link>
        )}
      </form>

      {leads.length === 0 ? (
        <div className="rounded-lg border border-line bg-surface px-6 py-12 text-center">
          <p className="text-sm font-medium text-ink">No leads in this view.</p>
          <p className="mt-1 text-sm text-ink-muted">
            {q
              ? "Nothing matches that search. Clear it to see the board."
              : "Leads will appear in their stage column once created."}
          </p>
        </div>
      ) : (
        <div className="grid grid-flow-col auto-cols-[minmax(250px,1fr)] gap-3 overflow-x-auto pb-2">
          {STAGE_ORDER.map((stage) => {
            const column = leads.filter((lead) => lead.stage === stage);
            const totalMinor = column.reduce(
              (sum, lead) => sum + lead.valueMinor,
              0,
            );
            return (
              <section
                key={stage}
                aria-labelledby={`stage-${stage}`}
                className="flex min-h-[220px] flex-col rounded-lg border border-line bg-surface"
              >
                <div className="border-b border-line px-3 py-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <h2
                      id={`stage-${stage}`}
                      className="text-sm font-semibold text-ink"
                    >
                      {LEAD_STAGE_LABELS[stage]}
                    </h2>
                    <span className="text-xs font-medium tabular-nums text-ink-subtle">
                      {column.length}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs tabular-nums text-ink-muted">
                    {formatMoney(totalMinor)}
                  </p>
                </div>

                <div className="flex-1 space-y-2 p-2">
                  {column.length === 0 ? (
                    <p className="px-1 py-4 text-xs text-ink-subtle">
                      Nothing at this stage.
                    </p>
                  ) : (
                    column.map((lead) => (
                      <article
                        key={lead.id}
                        className="rounded-md border border-line bg-surface-raised p-2.5 shadow-sm"
                      >
                        <p className="text-sm font-medium leading-snug text-ink">
                          {lead.name}
                        </p>
                        <p className="mt-0.5 text-xs text-ink-muted">
                          {lead.company}
                        </p>
                        <div className="mt-1.5 flex items-center justify-between gap-2">
                          <span className="text-xs tabular-nums font-medium text-ink">
                            {formatMoney(lead.valueMinor, lead.currency)}
                          </span>
                          <LeadStageBadge stage={lead.stage} />
                        </div>
                        <dl className="mt-2 grid grid-cols-2 gap-x-2 gap-y-0.5 text-[11px] text-ink-subtle">
                          <dt className="sr-only">Owner</dt>
                          <dd className="truncate">
                            {lead.owner?.name ?? "Unassigned"}
                          </dd>
                          <dt className="sr-only">Source</dt>
                          <dd className="truncate text-right">
                            <SourceLabel source={lead.source} />
                          </dd>
                          <dt className="sr-only">Notes</dt>
                          <dd>{lead._count.notes} notes</dd>
                          <dt className="sr-only">Updated</dt>
                          <dd className="text-right">
                            {formatDateUtc(lead.updatedAt)}
                          </dd>
                        </dl>

                        {canMove && (
                          <form
                            action={updateLeadStage}
                            className="mt-2 flex items-center gap-1 border-t border-line pt-2"
                          >
                            <input
                              type="hidden"
                              name="leadId"
                              value={lead.id}
                            />
                            <label
                              htmlFor={`move-${lead.id}`}
                              className="sr-only"
                            >
                              Move {lead.name} to another stage
                            </label>
                            <select
                              id={`move-${lead.id}`}
                              name="stage"
                              defaultValue={lead.stage}
                              className="min-w-0 flex-1 rounded border border-line bg-surface px-1.5 py-1 text-xs text-ink"
                            >
                              {STAGE_ORDER.map((value) => (
                                <option key={value} value={value}>
                                  {LEAD_STAGE_LABELS[value]}
                                </option>
                              ))}
                            </select>
                            <button
                              type="submit"
                              className="rounded bg-surface-sunken px-1.5 py-1 text-xs font-medium text-ink-muted transition-colors hover:bg-accent-soft hover:text-accent-ink"
                            >
                              Move
                            </button>
                          </form>
                        )}
                      </article>
                    ))
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {!canMove && (
        <p className="text-xs text-ink-subtle">
          Moving leads between stages is limited to owners, admins and managers.
        </p>
      )}
    </div>
  );
}
