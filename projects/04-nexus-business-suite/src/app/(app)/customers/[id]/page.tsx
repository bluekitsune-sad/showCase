import Link from "next/link";
import { notFound } from "next/navigation";
import { addCustomerNote } from "@/app/(app)/customers/actions";
import { CustomerStatusBadge } from "@/components/crm/badges";
import { prisma } from "@/lib/db";
import {
  TASK_STATUS_LABELS,
  isTaskStatus,
  type TaskStatus,
} from "@/lib/domain";
import { formatDateUtc, formatDateTimeUtc } from "@/lib/format";
import {
  can,
  canAccessDepartment,
  type Actor,
} from "@/lib/permissions";
import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";

function taskTone(status: string): string {
  if (!isTaskStatus(status)) return "bg-surface-sunken text-ink-muted";
  const tone: Record<TaskStatus, string> = {
    todo: "bg-surface-sunken text-ink-muted",
    in_progress: "bg-info-soft text-info",
    blocked: "bg-danger-soft text-danger",
    done: "bg-success-soft text-success",
  };
  return tone[status];
}

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser("/customers");
  const actor: Actor = {
    id: user.id,
    role: user.role,
    departmentId: user.departmentId,
  };
  const { id } = await params;
  const customerId = Number.parseInt(id, 10);
  if (!Number.isFinite(customerId) || customerId <= 0) notFound();

  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    include: {
      contacts: {
        orderBy: [{ isPrimary: "desc" }, { name: "asc" }],
      },
      notes: {
        orderBy: { createdAt: "desc" },
        include: { author: { select: { name: true } } },
      },
      sourceLead: {
        include: { owner: { select: { name: true, departmentId: true } } },
      },
      tasks: {
        orderBy: { dueDate: "asc" },
        take: 5,
        include: { assignee: { select: { name: true } } },
      },
    },
  });
  if (!customer) notFound();

  const departmentId = customer.sourceLead?.owner?.departmentId ?? null;
  if (!canAccessDepartment(actor, departmentId)) notFound();

  const activities = await prisma.activityLog.findMany({
    where: {
      OR: [
        { entityType: "customer", entityId: customer.id },
        ...(customer.sourceLeadId
          ? [{ entityType: "lead", entityId: customer.sourceLeadId }]
          : []),
      ],
    },
    include: { actor: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 25,
  });

  const canWriteNotes = can(actor, "customer.update");

  return (
    <div className="space-y-5">
      <div>
        <Link
          href="/customers"
          className="text-sm text-ink-muted underline-offset-2 hover:text-ink hover:underline"
        >
          ← Customers
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-semibold tracking-tight text-ink">
            {customer.name}
          </h1>
          <CustomerStatusBadge status={customer.status} />
        </div>
        <p className="mt-1 text-sm text-ink-muted">
          {customer.company}
          {customer.sourceLead
            ? ` · converted from ${customer.sourceLead.name}`
            : " · direct account"}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <section className="rounded-lg border border-line bg-surface p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-ink">Contacts</h2>
              <span className="text-xs text-ink-subtle">
                {customer.contacts.length} on record
              </span>
            </div>
            {customer.contacts.length === 0 ? (
              <p className="mt-3 text-sm text-ink-muted">
                No contacts on this account yet.
              </p>
            ) : (
              <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {customer.contacts.map((contact) => (
                  <li
                    key={contact.id}
                    className="rounded-md border border-line bg-surface-raised p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-ink">
                        {contact.name}
                      </p>
                      {contact.isPrimary && (
                        <span className="pill bg-accent-soft text-accent-ink">
                          Primary
                        </span>
                      )}
                    </div>
                    {contact.title && (
                      <p className="text-xs text-ink-muted">{contact.title}</p>
                    )}
                    <dl className="mt-2 space-y-0.5 text-xs">
                      {contact.email && (
                        <div className="flex gap-1">
                          <dt className="text-ink-subtle">Email</dt>
                          <dd className="truncate text-ink-muted">
                            {contact.email}
                          </dd>
                        </div>
                      )}
                      {contact.phone && (
                        <div className="flex gap-1">
                          <dt className="text-ink-subtle">Phone</dt>
                          <dd className="text-ink-muted">{contact.phone}</dd>
                        </div>
                      )}
                    </dl>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-lg border border-line bg-surface p-4">
            <h2 className="text-sm font-semibold text-ink">Notes</h2>
            {canWriteNotes ? (
              <form action={addCustomerNote} className="mt-3">
                <input
                  type="hidden"
                  name="customerId"
                  value={customer.id}
                />
                <label htmlFor="body" className="sr-only">
                  Add a note
                </label>
                <textarea
                  id="body"
                  name="body"
                  required
                  maxLength={2000}
                  rows={3}
                  placeholder="Add context for the account team…"
                  className="w-full rounded-md border border-line bg-surface px-2.5 py-2 text-sm text-ink placeholder:text-ink-subtle"
                />
                <div className="mt-2 flex items-center justify-between gap-2">
                  <p className="text-xs text-ink-subtle">
                    Notes are written to the activity log.
                  </p>
                  <button
                    type="submit"
                    className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
                  >
                    Add note
                  </button>
                </div>
              </form>
            ) : (
              <p className="mt-2 text-xs text-ink-subtle">
                Adding notes is limited to owners, admins and managers.
              </p>
            )}

            {customer.notes.length === 0 ? (
              <p className="mt-4 border-t border-line pt-3 text-sm text-ink-muted">
                No notes yet.
              </p>
            ) : (
              <ul className="mt-4 space-y-3 border-t border-line pt-3">
                {customer.notes.map((note) => (
                  <li key={note.id} className="text-sm">
                    <p className="text-ink">{note.body}</p>
                    <p className="mt-1 text-xs text-ink-subtle">
                      {note.author.name} · {formatDateTimeUtc(note.createdAt)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className="space-y-4">
          <section className="rounded-lg border border-line bg-surface p-4">
            <h2 className="text-sm font-semibold text-ink">Account details</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-ink-subtle">Email</dt>
                <dd className="truncate text-ink-muted">
                  {customer.email ?? "—"}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-subtle">Phone</dt>
                <dd className="text-ink-muted">{customer.phone ?? "—"}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-subtle">Owner</dt>
                <dd className="text-ink-muted">
                  {customer.sourceLead?.owner?.name ?? "—"}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-subtle">Customer since</dt>
                <dd className="text-ink-muted">
                  {formatDateUtc(customer.createdAt)}
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-lg border border-line bg-surface p-4">
            <h2 className="text-sm font-semibold text-ink">Activity timeline</h2>
            {activities.length === 0 ? (
              <p className="mt-2 text-sm text-ink-muted">
                Nothing logged for this account yet.
              </p>
            ) : (
              <ol className="mt-3 space-y-3 border-l border-line pl-4">
                {activities.map((entry) => (
                  <li key={entry.id} className="relative">
                    <span
                      aria-hidden="true"
                      className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full border border-surface bg-line-strong"
                    />
                    <p className="text-sm leading-snug text-ink">
                      {entry.summary}
                    </p>
                    <p className="mt-0.5 text-xs text-ink-subtle">
                      {entry.actor?.name ?? "System"} ·{" "}
                      {formatDateTimeUtc(entry.createdAt)}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </section>

          <section className="rounded-lg border border-line bg-surface p-4">
            <h2 className="text-sm font-semibold text-ink">Open work</h2>
            {customer.tasks.length === 0 ? (
              <p className="mt-2 text-sm text-ink-muted">
                No tasks linked to this account.
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {customer.tasks.map((task) => (
                  <li key={task.id} className="text-sm">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-ink">{task.title}</p>
                      <span className={`pill ${taskTone(task.status)}`}>
                        {isTaskStatus(task.status)
                          ? TASK_STATUS_LABELS[task.status]
                          : task.status}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-ink-subtle">
                      {task.assignee?.name ?? "Unassigned"}
                      {task.dueDate
                        ? ` · due ${formatDateUtc(task.dueDate)}`
                        : ""}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
