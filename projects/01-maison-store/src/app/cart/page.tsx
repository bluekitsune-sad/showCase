import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Your bag",
};

export default function CartPage() {
  return (
    <div className="container-x py-14 lg:py-20">
      <nav aria-label="Breadcrumb" className="text-sm text-ink-subtle">
        <Link href="/" className="hover:text-accent">
          Home
        </Link>
        <span aria-hidden="true" className="mx-2">
          /
        </span>
        <span className="text-ink">Bag</span>
      </nav>

      <header className="mt-6 max-w-2xl">
        <h1 className="display text-4xl text-ink sm:text-5xl">Your bag</h1>
      </header>

      <div className="mt-12 border border-line bg-surface px-6 py-16 text-center">
        <p className="font-display text-2xl text-ink">Your bag is empty.</p>
        <p className="mx-auto mt-3 max-w-md text-ink-muted">
          Nothing has been added yet. Start with a collection, or the pieces we
          are showing this season.
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
