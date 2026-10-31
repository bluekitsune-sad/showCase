"use client";

import { logout } from "@/app/(app)/logout/actions";
import { ROLE_LABELS } from "@/lib/domain";
import { ThemeToggle } from "./theme-toggle";
import type { ShellUser } from "./app-shell";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function Topbar({
  onMenu,
  user,
}: {
  onMenu: () => void;
  user: ShellUser;
}) {
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-line bg-surface px-4 lg:px-6">
      <button
        type="button"
        onClick={onMenu}
        aria-label="Open navigation"
        aria-controls="app-sidebar"
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-line text-ink-muted lg:hidden"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div className="ml-auto flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium leading-tight text-ink">{user.name}</p>
          <p className="text-xs leading-tight text-ink-subtle">
            {ROLE_LABELS[user.role]}
            {user.departmentName ? ` · ${user.departmentName}` : " · Company-wide"}
          </p>
        </div>
        <ThemeToggle />
        <span
          aria-hidden="true"
          title={user.email}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-accent-ink"
        >
          {initials(user.name)}
        </span>
        <form action={logout}>
          <button
            type="submit"
            className="rounded-md border border-line px-2.5 py-1.5 text-xs font-medium text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink"
          >
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
