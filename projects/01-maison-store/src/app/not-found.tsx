import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <div className="container-x py-20">
      <div className="mx-auto max-w-xl border border-line bg-surface px-6 py-16 text-center">
        <p className="font-display text-2xl text-ink">
          We could not find that page.
        </p>
        <p className="mt-3 text-ink-muted">
          The link may be old, or the collection may have sold through. The
          catalogue is still open.
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link href="/collections" className="btn btn-primary">
            Browse collections
          </Link>
          <Link href="/" className="btn btn-ghost">
            Back home
          </Link>
        </div>
      </div>
    </div>
  );
}
