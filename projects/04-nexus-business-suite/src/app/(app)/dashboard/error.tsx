"use client";

import { useEffect } from "react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="rounded-lg border border-danger bg-danger-soft p-6">
      <h1 className="text-base font-semibold text-danger">Could not load the dashboard</h1>
      <p className="mt-1 text-sm text-ink-muted">
        The database may not be set up yet. Run{" "}
        <code className="rounded bg-surface px-1 py-0.5 font-mono text-xs">npm run db:setup</code>{" "}
        in the project folder, then try again.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-4 rounded-md bg-danger px-3 py-1.5 text-sm font-medium text-white hover:opacity-90"
      >
        Try again
      </button>
    </div>
  );
}
