import type { Metadata } from "next";
import Link from "next/link";
import { Catalog } from "@/components/catalog";
import {
  PRODUCT_CARD_INCLUDE,
  catalogOptions,
  orderByForSort,
  readCatalogFilters,
  whereForFilters,
  type CatalogSearchParams,
} from "@/lib/catalog";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Shop all pieces",
  description:
    "The full Maison Store catalogue: tailoring, linen, leather goods and knitwear, filterable by size, colour, price and availability.",
};

type ProductsPageProps = {
  searchParams: Promise<CatalogSearchParams>;
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const filters = readCatalogFilters(await searchParams);

  const [products, options] = await Promise.all([
    prisma.product.findMany({
      where: whereForFilters(filters),
      orderBy: orderByForSort(filters.sort),
      include: PRODUCT_CARD_INCLUDE,
    }),
    catalogOptions(),
  ]);

  return (
    <div className="container-x py-14 lg:py-20">
      <nav aria-label="Breadcrumb" className="text-sm text-ink-subtle">
        <Link href="/" className="hover:text-accent">
          Home
        </Link>
        <span aria-hidden="true" className="mx-2">
          /
        </span>
        <span className="text-ink">Shop all</span>
      </nav>

      <header className="mt-6 max-w-2xl">
        <h1 className="display text-4xl text-ink sm:text-5xl">All pieces</h1>
        <p className="mt-4 text-lg leading-relaxed text-ink-muted">
          Everything currently in the studio, from a single collection view. Sort
          by price or newness, then narrow by size, colour and availability.
        </p>
      </header>

      <div className="mt-10">
        <Catalog
          basePath="/products"
          filters={filters}
          products={products}
          sizes={options.sizes}
          colours={options.colours}
          emptyMessage="Nothing matches those filters."
        />
      </div>

      <div className="mt-14 border-t border-line pt-6">
        <Link
          href="/collections"
          className="text-sm text-ink underline decoration-line-strong underline-offset-4 hover:text-accent"
        >
          Browse by collection
        </Link>
      </div>
    </div>
  );
}
