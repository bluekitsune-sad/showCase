import Link from "next/link";
import { formatDateTimeUtc } from "@/lib/format";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { markAllNotificationsRead, markNotificationRead } from "./actions";

export const dynamic = "force-dynamic";

type Search = { filter?: string; notice?: string };

const TYPE_LABELS: Record<string, string> = {
  task_assigned: "Task",
  leave_decided: "Leave",
  lead_update: "Lead",
  mention: "Mention",
  system: "System",
};

const NOTICE: Record<string, { tone: string; text: string }> = {
  read: { tone: "success", text: "Notification marked as read." },
  "all-read": { tone: "success", text: "All notifications marked as read." },
  invalid: { tone: "warning", text: "That notification could not be updated." },
};

function noticeClass(tone: string): string {
  if (tone === "success") return "border-success/30 bg-success-soft text-success";
  if (tone === "danger") return "border-danger/30 bg-danger-soft text-danger";
  return "border-warning/30 bg-warning-soft text-warning";
}

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const user = await requireUser("/notifications");
  const { filter: rawFilter, notice } = await searchParams;
  const filter = rawFilter === "unread" ? "unread" : "all";
  const banner = notice ? NOTICE[notice] : undefined;

  const [items, unread, total] = await Promise.all([
    prisma.notification.findMany({
      where: {
        userId: user.id,
        ...(filter === "unread" ? { readAt: null } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.notification.count({ where: { userId: user.id, readAt: null } }),
    prisma.notification.count({ where: { userId: user.id } }),
  ]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-ink">
            Notifications
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            {unread === 0
              ? "You are up to date."
              : `${unread} unread of ${total} in your feed.`}
          </p>
        </div>
        {unread > 0 && (
          <form action={markAllNotificationsRead}>
            <button
              type="submit"
              className="rounded-md border border-line px-3 py-2 text-sm font-medium text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink"
            >
              Mark all read
            </button>
          </form>
        )}
      </div>

      {banner && (
        <div
          role="status"
          className={`rounded-md border px-3 py-2 text-sm ${noticeClass(banner.tone)}`}
        >
          {banner.text}
        </div>
      )}

      <div className="flex items-center gap-1 rounded-md border border-line bg-surface p-1 text-sm">
        <Link
          href="/notifications"
          aria-current={filter === "all" ? "page" : undefined}
          className={`rounded px-2.5 py-1 transition-colors ${
            filter === "all"
              ? "bg-accent-soft font-medium text-accent-ink"
              : "text-ink-muted hover:bg-surface-sunken hover:text-ink"
          }`}
        >
          All · {total}
        </Link>
        <Link
          href="/notifications?filter=unread"
          aria-current={filter === "unread" ? "page" : undefined}
          className={`rounded px-2.5 py-1 transition-colors ${
            filter === "unread"
              ? "bg-accent-soft font-medium text-accent-ink"
              : "text-ink-muted hover:bg-surface-sunken hover:text-ink"
          }`}
        >
          Unread · {unread}
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="rounded-lg border border-line bg-surface px-6 py-12 text-center">
          <p className="text-sm font-medium text-ink">
            {filter === "unread"
              ? "Nothing unread. You are all caught up."
              : "No notifications yet."}
          </p>
          <p className="mt-1 text-sm text-ink-muted">
            {filter === "unread" ? (
              <Link
                href="/notifications"
                className="font-medium text-accent underline-offset-2 hover:underline"
              >
                See the full feed
              </Link>
            ) : (
              "Task assignments and decisions will land here."
            )}
          </p>
        </div>
      ) : (
        <ul className="overflow-hidden rounded-lg border border-line bg-surface">
          {items.map((item) => {
            const unreadItem = item.readAt === null;
            return (
              <li
                key={item.id}
                className={`border-b border-line px-4 py-3 last:border-b-0 ${
                  unreadItem ? "bg-accent-soft" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {unreadItem && (
                        <span
                          aria-label="Unread"
                          className="h-1.5 w-1.5 rounded-full bg-accent"
                        />
                      )}
                      <p className="text-sm font-medium text-ink">
                        {item.title}
                      </p>
                      <span className="pill bg-surface-sunken text-ink-muted">
                        {TYPE_LABELS[item.type] ?? item.type}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-ink-muted">{item.body}</p>
                    <p className="mt-1 text-xs text-ink-subtle">
                      {formatDateTimeUtc(item.createdAt)}
                      {item.readAt
                        ? ` · read ${formatDateTimeUtc(item.readAt)}`
                        : ""}
                    </p>
                  </div>
                  {unreadItem && (
                    <form action={markNotificationRead}>
                      <input
                        type="hidden"
                        name="notificationId"
                        value={item.id}
                      />
                      <button
                        type="submit"
                        className="whitespace-nowrap rounded-md border border-line px-2.5 py-1.5 text-xs font-medium text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink"
                      >
                        Mark read
                      </button>
                    </form>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
