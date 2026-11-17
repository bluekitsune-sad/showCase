import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { toneGradient } from "@/lib/format";

export const metadata: Metadata = {
  title: "Collections",
  description:
    "Four small collections of tailoring, linen, leather goods and knitwear, made in short runs.",
};

export default async function CollectionsPage() {
  const collections = await prisma.collection.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div className="container-x py-14 lg:py-20">
      <nav aria-label="Breadcrumb" className="text-sm text-ink-subtle">
        <Link href="/" className="hover:text-accent">
          Home
        </Link>
        <span aria-hidden="true" className="mx-2">
          /
        </span>
        <span className="text-ink">Collections</span>
      </nav>

      <header className="mt-6 max-w-2xl">
        <h1 className="display text-4xl text-ink sm:text-5xl">Collections</h1>
        <p className="mt-4 text-lg leading-relaxed text-ink-muted">
          Each collection is built around one cloth or one shape. Start where you
          need to, and layer from there.
        </p>
      </header>

      {collections.length === 0 ? (
        <p className="mt-12 border border-dashed border-line-strong px-6 py-14 text-center text-ink-muted">
          There are no collections to show yet. The first pieces are being
          catalogued.
        </p>
      ) : (
        <ul className="mt-12 divide-y divide-line border-y border-line">
          {collections.map((collection) => (
            <li key={collection.id}>
              <Link
                href={`/collections/${collection.slug}`}
                className="group grid gap-6 py-7 sm:grid-cols-12 sm:items-center"
              >
                <div
                  className="aspect-[4/3] overflow-hidden rounded-sm border border-line sm:col-span-3 sm:aspect-[3/2]"
                  style={{ background: toneGradient(collection.slug) }}
                />
                <div className="sm:col-span-7">
                  <h2 className="font-display text-2xl text-ink group-hover:text-accent sm:text-3xl">
                    {collection.name}
                  </h2>
                  <p className="mt-1 text-sm text-ink-subtle">
                    {collection._count.products} pieces
                  </p>
                  <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-muted">
                    {collection.description}
                  </p>
                </div>
                <div className="sm:col-span-2 sm:text-right">
                  <span className="text-sm text-ink underline decoration-line-strong underline-offset-4 group-hover:text-accent">
                    View collection
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
