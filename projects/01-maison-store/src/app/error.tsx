"use client";

import Link from "next/link";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container-x py-20">
      <div className="mx-auto max-w-xl border border-line bg-surface px-6 py-14 text-center">
        <p className="font-display text-2xl text-ink">
          The shop could not be loaded.
        </p>
        <p className="mt-3 text-ink-muted">
          Something went wrong on our side. Try again, or head back to the
          collections.
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <button type="button" onClick={() => reset()} className="btn btn-primary">
            Try again
          </button>
          <Link href="/collections" className="btn btn-ghost">
            Browse collections
          </Link>
        </div>
      </div>
    </div>
  );
}
