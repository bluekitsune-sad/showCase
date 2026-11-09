"use client";

export default function AppError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div
      role="alert"
      className="rounded-lg border border-danger/40 bg-surface p-6"
    >
      <h1 className="text-lg font-semibold text-ink">
        This view could not load
      </h1>
      <p className="mt-1 text-sm text-ink-muted">
        Something went wrong while reading the data. Try again, or go back to
        the dashboard if it keeps happening.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-4 rounded-md bg-accent px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
      >
        Try again
      </button>
    </div>
  );
}
