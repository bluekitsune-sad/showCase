import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { Catalog } from "@/components/catalog";
import { StructuredData } from "@/components/structured-data";
import {
  PRODUCT_CARD_INCLUDE,
  catalogOptions,
  orderByForSort,
  readCatalogFilters,
  whereForFilters,
  type CatalogSearchParams,
} from "@/lib/catalog";
import { prisma } from "@/lib/db";
import { breadcrumbNode, buildMetadata, collectionNode } from "@/lib/seo";

type CollectionPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<CatalogSearchParams>;
};

const getCollection = cache(async (slug: string) =>
  prisma.collection.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      tagline: true,
      description: true,
    },
  }),
);

export async function generateMetadata({ params }: CollectionPageProps) {
  const { slug } = await params;
  const collection = await getCollection(slug);
  if (!collection) {
    notFound();
  }
  return buildMetadata({
    title: collection.name,
    description: collection.tagline,
    path: `/collections/${collection.slug}`,
  });
}

export default async function CollectionPage({
  params,
  searchParams,
}: CollectionPageProps) {
  const { slug } = await params;
  const collection = await getCollection(slug);

  if (!collection) {
    notFound();
  }

  const filters = readCatalogFilters(await searchParams);

  const [products, options] = await Promise.all([
    prisma.product.findMany({
      where: whereForFilters(filters, collection.id),
      orderBy: orderByForSort(filters.sort),
      include: PRODUCT_CARD_INCLUDE,
    }),
    catalogOptions(collection.id),
  ]);

  return (
    <div className="container-x py-14 lg:py-20">
      <StructuredData
        nodes={[
          collectionNode(collection),
          breadcrumbNode([
            { name: "Home", path: "/" },
            { name: "Collections", path: "/collections" },
            { name: collection.name, path: `/collections/${collection.slug}` },
          ]),
        ]}
      />
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
        <h1 className="display text-4xl text-ink sm:text-5xl">
          {collection.name}
        </h1>
        <p className="mt-3 text-lg text-ink-muted">{collection.tagline}</p>
        <p className="mt-4 leading-relaxed text-ink-muted">
          {collection.description}
        </p>
      </header>

      <div className="mt-10">
        <Catalog
          basePath={`/collections/${collection.slug}`}
          filters={filters}
          products={products}
          sizes={options.sizes}
          colours={options.colours}
          emptyMessage="Nothing in this collection matches those filters."
        />
      </div>

      <div className="mt-14 flex flex-wrap gap-x-6 gap-y-3 border-t border-line pt-6">
        <Link
          href="/collections"
          className="text-sm text-ink underline decoration-line-strong underline-offset-4 hover:text-accent"
        >
          Back to all collections
        </Link>
        <Link
          href="/products"
          className="text-sm text-ink underline decoration-line-strong underline-offset-4 hover:text-accent"
        >
          Shop all pieces
        </Link>
      </div>
    </div>
  );
}
