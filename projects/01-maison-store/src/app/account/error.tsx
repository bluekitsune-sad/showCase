"use client";

import Link from "next/link";

export default function AccountError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container-x py-16">
      <div className="mx-auto max-w-xl border border-line bg-surface px-6 py-14 text-center">
        <p className="font-display text-2xl text-ink">
          Your account could not be loaded.
        </p>
        <p className="mt-3 text-ink-muted">
          Something went wrong while fetching your details. Try again, or return
          to the storefront and come back in a moment.
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <button type="button" onClick={() => reset()} className="btn btn-primary">
            Try again
          </button>
          <Link href="/" className="btn btn-ghost">
            Back to the shop
          </Link>
        </div>
      </div>
    </div>
  );
}
