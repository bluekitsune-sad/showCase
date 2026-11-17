import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { prisma } from "@/lib/db";
import { toneGradient } from "@/lib/format";

export default async function HomePage() {
  const [collections, featured] = await Promise.all([
    prisma.collection.findMany({
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { products: true } } },
    }),
    prisma.product.findMany({
      where: { featured: true },
      take: 6,
      orderBy: { createdAt: "asc" },
      include: {
        collection: { select: { name: true } },
        variants: { select: { colour: true, size: true, stock: true } },
      },
    }),
  ]);

  return (
    <>
      <section className="border-b border-line">
        <div className="container-x grid gap-10 py-16 lg:grid-cols-12 lg:gap-8 lg:py-24">
          <div className="lg:col-span-8">
            <p className="text-sm text-ink-subtle">Autumn, in four parts</p>
            <h1 className="display mt-4 max-w-3xl text-[2.75rem] text-ink sm:text-6xl lg:text-7xl">
              Clothes that earn their place.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-muted">
              Tailoring, washed linen and slow knitwear, cut in small numbers
              from cloth we can trace. Nothing that needs a special occasion.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link href="/collections" className="btn btn-primary">
                Shop the collections
              </Link>
              <Link href="/#story" className="btn btn-ghost">
                How we make things
              </Link>
            </div>
          </div>

          <aside className="self-end border-line lg:col-span-4 lg:border-l lg:pl-10">
            <p className="font-display text-2xl leading-snug text-ink">
              The studio keeps one rule: if it will not last five winters, it
              does not leave the cutting table.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-ink-muted">
              Every piece is made with a mill or workshop we have worked with for
              at least three seasons. When something wears through, we repair it.
            </p>
          </aside>
        </div>
      </section>

      <section id="collections" className="container-x py-16 lg:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="display text-3xl text-ink sm:text-4xl">The collections</h2>
            <p className="mt-3 max-w-xl text-ink-muted">
              Four ways into the wardrobe, restocked slowly through the year.
            </p>
          </div>
          <Link
            href="/collections"
            className="text-sm text-ink underline decoration-line-strong underline-offset-4 hover:text-accent"
          >
            All collections
          </Link>
        </div>

        {collections.length === 0 ? (
          <p className="mt-10 border border-dashed border-line-strong px-6 py-12 text-center text-ink-muted">
            The first collection is being catalogued. Check back soon.
          </p>
        ) : (
          <div className="mt-9 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {collections.map((collection) => (
              <Link
                key={collection.id}
                href={`/collections/${collection.slug}`}
                className="group block"
              >
                <div
                  className="relative aspect-[3/4] overflow-hidden rounded-sm border border-line"
                  style={{ background: toneGradient(collection.slug) }}
                >
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/55 to-transparent p-5 pt-14">
                    <p className="font-display text-2xl text-surface">
                      {collection.name}
                    </p>
                    <p className="mt-1 text-xs text-surface/80">
                      {collection._count.products} pieces
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-ink-muted group-hover:text-ink">
                  {collection.tagline}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="border-y border-line bg-surface">
        <div className="container-x py-16 lg:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="display text-3xl text-ink sm:text-4xl">New this season</h2>
            <Link
              href="/collections"
              className="text-sm text-ink underline decoration-line-strong underline-offset-4 hover:text-accent"
            >
              Browse everything
            </Link>
          </div>

          {featured.length === 0 ? (
            <p className="mt-10 border border-dashed border-line-strong px-6 py-12 text-center text-ink-muted">
              Nothing is featured yet. The full catalogue is in the collections.
            </p>
          ) : (
            <div className="mt-9 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section id="story" className="container-x py-16 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 className="display text-3xl text-ink sm:text-4xl">
              Made slowly, kept longer.
            </h2>
            <p className="mt-5 text-ink-muted">
              Maison began with a rail of coats in a shared studio and a stubborn
              idea: a wardrobe should get smaller as it gets better. We still work
              that way, with two pattern cutters and a handful of mills in
              Portugal and northern Italy.
            </p>
            <p className="mt-4 text-ink-muted">
              Runs are short because we would rather sell out than discount. If a
              piece returns, it comes back with the same price and the same cloth.
            </p>
          </div>

          <dl className="grid gap-6 self-start sm:grid-cols-2 lg:col-span-6 lg:col-start-7">
            <div className="border-t border-line pt-4">
              <dt className="font-display text-xl text-ink">Traceable cloth</dt>
              <dd className="mt-2 text-sm leading-relaxed text-ink-muted">
                Wool from a mill in Biella, linen from a weaver outside Porto.
                Every order carries the mill on its care card.
              </dd>
            </div>
            <div className="border-t border-line pt-4">
              <dt className="font-display text-xl text-ink">Small runs</dt>
              <dd className="mt-2 text-sm leading-relaxed text-ink-muted">
                Between forty and ninety pieces per style. When a run is gone, it
                is gone until the cloth comes back.
              </dd>
            </div>
            <div className="border-t border-line pt-4">
              <dt className="font-display text-xl text-ink">Repairs, not landfill</dt>
              <dd className="mt-2 text-sm leading-relaxed text-ink-muted">
                Send anything back for mending. We patch, re-stitch and return it,
                for the life of the garment.
              </dd>
            </div>
            <div className="border-t border-line pt-4">
              <dt className="font-display text-xl text-ink">Honest pricing</dt>
              <dd className="mt-2 text-sm leading-relaxed text-ink-muted">
                No seasonal sales and no invented markdowns. What you see is what
                the cloth, the cutter and the shipping cost.
              </dd>
            </div>
          </dl>
        </div>
      </section>
    </>
  );
}
