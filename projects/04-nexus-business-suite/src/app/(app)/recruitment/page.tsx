import {
  ApplicantStageBadge,
  JobOpeningStatusBadge,
} from "@/components/hr/badges";
import { prisma } from "@/lib/db";
import {
  APPLICANT_STAGES,
  APPLICANT_STAGE_LABELS,
  isApplicantStage,
} from "@/lib/domain";
import { formatDateUtc } from "@/lib/format";
import {
  can,
  departmentFilter,
  scopeFor,
  scopeLabel,
  type Actor,
} from "@/lib/permissions";
import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function RecruitmentPage() {
  const user = await requireUser("/recruitment");
  const actor: Actor = {
    id: user.id,
    role: user.role,
    departmentId: user.departmentId,
  };
  if (!can(actor, "recruitment.read")) {
    return (
      <div className="rounded-lg border border-line bg-surface px-6 py-12 text-center">
        <p className="text-sm font-medium text-ink">
          You do not have access to recruitment.
        </p>
        <p className="mt-1 text-sm text-ink-muted">
          Hiring pipelines are visible to owners, admins and managers.
        </p>
      </div>
    );
  }

  const openings = await prisma.jobOpening.findMany({
    where: departmentFilter(actor),
    include: {
      department: { select: { name: true } },
      applicants: { orderBy: { appliedAt: "desc" } },
    },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take: 50,
  });

  const scoped = scopeFor(actor) !== "all";
  const totalApplicants = openings.reduce(
    (sum, opening) => sum + opening.applicants.length,
    0,
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-ink">
          Recruitment
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          {scopeLabel(actor)}
          {scoped ? " · department-scoped by your role" : " · company-wide"}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-line bg-surface p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-subtle">
            Open roles
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-ink">
            {openings.filter((opening) => opening.status === "open").length}
          </p>
        </div>
        <div className="rounded-lg border border-line bg-surface p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-subtle">
            Job openings
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-ink">
            {openings.length}
          </p>
        </div>
        <div className="rounded-lg border border-line bg-surface p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-subtle">
            Applicants
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-ink">
            {totalApplicants}
          </p>
        </div>
      </div>

      {openings.length === 0 ? (
        <div className="rounded-lg border border-line bg-surface px-6 py-12 text-center">
          <p className="text-sm font-medium text-ink">No job openings yet.</p>
          <p className="mt-1 text-sm text-ink-muted">
            Openings for your department will appear here once they are created.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {openings.map((opening) => {
            const counts = Object.fromEntries(
              APPLICANT_STAGES.map((stage) => [
                stage,
                opening.applicants.filter((applicant) => applicant.stage === stage)
                  .length,
              ]),
            ) as Record<string, number>;
            return (
              <section
                key={opening.id}
                className="rounded-lg border border-line bg-surface"
              >
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-4 py-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-sm font-semibold text-ink">
                        {opening.title}
                      </h2>
                      <JobOpeningStatusBadge status={opening.status} />
                    </div>
                    <p className="mt-1 text-sm text-ink-muted">
                      {opening.department.name} · {opening.applicants.length}{" "}
                      {opening.applicants.length === 1 ? "applicant" : "applicants"}
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto p-4">
                  <div className="grid min-w-[900px] grid-cols-6 gap-3">
                    {APPLICANT_STAGES.map((stage) => {
                      const applicants = opening.applicants.filter(
                        (applicant) => applicant.stage === stage,
                      );
                      return (
                        <div key={stage} className="flex flex-col gap-2">
                          <div className="flex items-center justify-between rounded-md bg-surface-sunken px-2.5 py-1.5">
                            <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                              {isApplicantStage(stage)
                                ? APPLICANT_STAGE_LABELS[stage]
                                : stage}
                            </span>
                            <span className="tabular-nums text-xs text-ink-subtle">
                              {counts[stage]}
                            </span>
                          </div>
                          {applicants.length === 0 ? (
                            <p className="rounded-md border border-dashed border-line px-2.5 py-4 text-center text-xs text-ink-subtle">
                              Empty
                            </p>
                          ) : (
                            applicants.map((applicant) => (
                              <div
                                key={applicant.id}
                                className="rounded-md border border-line bg-surface-raised px-2.5 py-2"
                              >
                                <p className="text-sm font-medium leading-tight text-ink">
                                  {applicant.name}
                                </p>
                                <p className="mt-0.5 truncate text-xs text-ink-muted">
                                  {applicant.email}
                                </p>
                                <div className="mt-1.5 flex items-center justify-between gap-1">
                                  <ApplicantStageBadge stage={applicant.stage} />
                                  <span className="text-[11px] text-ink-subtle">
                                    {formatDateUtc(applicant.appliedAt)}
                                  </span>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
