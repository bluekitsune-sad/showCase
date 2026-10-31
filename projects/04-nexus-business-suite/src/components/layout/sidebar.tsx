"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_GROUPS } from "@/lib/nav";

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-ink/40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        id="app-sidebar"
        className={`fixed inset-y-0 left-0 z-40 flex w-[var(--sidebar-width)] flex-col border-r border-line bg-surface transition-transform lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Main navigation"
      >
        <div className="flex h-14 items-center gap-2 border-b border-line px-4">
          <span
            aria-hidden="true"
            className="flex h-7 w-7 items-center justify-center rounded-md bg-accent text-[13px] font-bold text-white"
          >
            N
          </span>
          <span className="text-[15px] font-semibold tracking-tight text-ink">
            Nexus
          </span>
          <span className="ml-auto text-[11px] font-medium uppercase tracking-wide text-ink-subtle">
            Suite
          </span>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="mb-5">
              <p className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-subtle">
                {group.label}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const active =
                    !item.planned &&
                    (pathname === item.href || pathname.startsWith(item.href + "/"));
                  if (item.planned) {
                    return (
                      <li key={item.href}>
                        <span
                          className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm text-ink-subtle opacity-70"
                          aria-disabled="true"
                        >
                          {item.label}
                          <span className="text-[10px] font-medium uppercase tracking-wide">
                            Soon
                          </span>
                        </span>
                      </li>
                    );
                  }
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        aria-current={active ? "page" : undefined}
                        className={`block rounded-md px-2 py-1.5 text-sm transition-colors ${
                          active
                            ? "bg-accent-soft font-medium text-accent-ink"
                            : "text-ink-muted hover:bg-surface-sunken hover:text-ink"
                        }`}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-line px-4 py-3">
          <p className="text-[11px] leading-relaxed text-ink-subtle">
            Demo data is synthetic. Auth and role-scoped views arrive next.
          </p>
        </div>
      </aside>
    </>
  );
}
