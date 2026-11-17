import Link from "next/link";

export function AnnouncementBar() {
  return (
    <div className="border-b border-line bg-accent text-surface">
      <div className="container-x flex flex-wrap items-center justify-center gap-x-6 gap-y-1 py-2.5 text-center text-xs">
        <span>Complimentary shipping over $150</span>
        <span aria-hidden="true" className="hidden h-3 w-px bg-surface/40 sm:block" />
        <span className="text-surface/85">
          Orders leave the studio in two working days
        </span>
      </div>
    </div>
  );
}

type FooterCollection = { name: string; slug: string };

export function SiteFooter({ collections }: { collections: FooterCollection[] }) {
  return (
    <footer className="mt-24 border-t border-line bg-surface">
      <div className="container-x grid gap-12 py-14 sm:grid-cols-2 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="font-display text-2xl tracking-[0.26em] text-ink">MAISON</p>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-muted">
            A small clothing label working with mills and workshops we have used
            for years. Made in short runs, repaired rather than replaced.
          </p>
        </div>

        <div className="lg:col-span-3">
          <h2 className="text-xs uppercase tracking-[0.14em] text-ink-subtle">
            Collections
          </h2>
          <ul className="mt-4 space-y-2 text-sm">
            {collections.map((collection) => (
              <li key={collection.slug}>
                <Link
                  href={`/collections/${collection.slug}`}
                  className="text-ink hover:text-accent"
                >
                  {collection.name}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/collections" className="text-ink hover:text-accent">
                All collections
              </Link>
            </li>
          </ul>
        </div>

        <div className="lg:col-span-4">
          <h2 className="text-xs uppercase tracking-[0.14em] text-ink-subtle">
            Customer care
          </h2>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link href="/#story" className="text-ink hover:text-accent">
                How we make things
              </Link>
            </li>
            <li>
              <a
                href="mailto:studio@example.com"
                className="text-ink hover:text-accent"
              >
                studio@example.com
              </a>
            </li>
            <li>
              <Link href="/cart" className="text-ink hover:text-accent">
                Your bag
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="container-x flex flex-col gap-2 py-5 text-xs text-ink-subtle sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Maison Store. A demonstration storefront.</p>
          <p>Prices in USD. No payment is taken.</p>
        </div>
      </div>
    </footer>
  );
}
