import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { ProductCard } from "@/components/product-card";
import { prisma } from "@/lib/db";

type CollectionPageProps = {
  params: Promise<{ slug: string }>;
};

const getCollection = cache(async (slug: string) =>
  prisma.collection.findUnique({
    where: { slug },
    include: {
      products: {
        orderBy: { createdAt: "asc" },
        include: {
          collection: { select: { name: true } },
          variants: { select: { colour: true, size: true, stock: true } },
        },
      },
    },
  }),
);

export async function generateMetadata({ params }: CollectionPageProps) {
  const { slug } = await params;
  const collection = await getCollection(slug);
  if (!collection) {
    notFound();
  }
  return { title: collection.name, description: collection.tagline };
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params;
  const collection = await getCollection(slug);

  if (!collection) {
    notFound();
  }

  return (
    <div className="container-x py-14 lg:py-20">
      <nav aria-label="Breadcrumb" className="text-sm text-ink-subtle">
        <Link href="/" className="hover:text-accent">
          Home
        </Link>
        <span aria-hidden="true" className="mx-2">
          /
        </span>
        <Link href="/collections" className="hover:text-accent">
          Collections
        </Link>
        <span aria-hidden="true" className="mx-2">
          /
        </span>
        <span className="text-ink">{collection.name}</span>
      </nav>

      <header className="mt-6 max-w-2xl">
        <h1 className="display text-4xl text-ink sm:text-5xl">{collection.name}</h1>
        <p className="mt-3 text-lg text-ink-muted">{collection.tagline}</p>
        <p className="mt-4 leading-relaxed text-ink-muted">{collection.description}</p>
        <p className="mt-4 text-sm text-ink-subtle">
          {collection.products.length}{" "}
          {collection.products.length === 1 ? "piece" : "pieces"}
        </p>
      </header>

      {collection.products.length === 0 ? (
        <p className="mt-12 border border-dashed border-line-strong px-6 py-14 text-center text-ink-muted">
          This collection is being prepared. The first pieces will appear here.
        </p>
      ) : (
        <div className="mt-12 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {collection.products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      <div className="mt-14 border-t border-line pt-6">
        <Link
          href="/collections"
          className="text-sm text-ink underline decoration-line-strong underline-offset-4 hover:text-accent"
        >
          Back to all collections
        </Link>
      </div>
    </div>
  );
}
