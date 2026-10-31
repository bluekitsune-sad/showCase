"use client";

import { ThemeToggle } from "./theme-toggle";

export function Topbar({ onMenu }: { onMenu: () => void }) {
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
        <span className="hidden text-xs text-ink-subtle sm:inline">
          Demo workspace
        </span>
        <ThemeToggle />
        <span
          aria-hidden="true"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-accent-ink"
        >
          AN
        </span>
      </div>
    </header>
  );
}
