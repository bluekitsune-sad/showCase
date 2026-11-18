import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { ProductGallery } from "@/components/product-gallery";
import { ProductCard } from "@/components/product-card";
import { VariantPicker } from "@/components/variant-picker";
import { PRODUCT_CARD_INCLUDE, sortSizes } from "@/lib/catalog";
import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/format";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

const getProduct = cache(async (slug: string) =>
  prisma.product.findUnique({
    where: { slug },
    include: {
      collection: { select: { name: true, slug: true } },
      images: {
        orderBy: { sortOrder: "asc" },
        select: { id: true, alt: true },
      },
      variants: {
        orderBy: [{ colour: "asc" }, { size: "asc" }],
        select: {
          id: true,
          size: true,
          colour: true,
          sku: true,
          stock: true,
        },
      },
    },
  }),
);

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) {
    notFound();
  }
  return {
    title: product.name,
    description: product.description,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  const related = await prisma.product.findMany({
    where: {
      collectionId: product.collectionId,
      id: { not: product.id },
    },
    orderBy: [{ featured: "desc" }, { createdAt: "asc" }],
    take: 4,
    include: PRODUCT_CARD_INCLUDE,
  });

  const colours = [...new Set(product.variants.map((variant) => variant.colour))];
  const sizes = sortSizes(product.variants.map((variant) => variant.size));
  const hasApparelSizes = sizes.some((size) => size !== "One Size");
  const onSale =
    product.compareAtPrice !== null && product.compareAtPrice > product.price;

  return (
    <div className="container-x py-10 lg:py-16">
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
        <Link
          href={`/collections/${product.collection.slug}`}
          className="hover:text-accent"
        >
          {product.collection.name}
        </Link>
        <span aria-hidden="true" className="mx-2">
          /
        </span>
        <span className="text-ink">{product.name}</span>
      </nav>

      <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-16">
        <ProductGallery
          slug={product.slug}
          name={product.name}
          images={product.images}
        />

        <div>
          <Link
            href={`/collections/${product.collection.slug}`}
            className="text-xs uppercase tracking-[0.12em] text-ink-subtle hover:text-accent"
          >
            {product.collection.name}
          </Link>
          <h1 className="display mt-2 text-4xl text-ink sm:text-5xl">
            {product.name}
          </h1>

          <p className="mt-4 flex items-baseline gap-3 text-lg">
            {onSale ? (
              <span className="text-sm text-ink-subtle line-through">
                {formatPrice(product.compareAtPrice ?? 0, product.currency)}
              </span>
            ) : null}
            <span className="text-ink">
              {formatPrice(product.price, product.currency)}
            </span>
            {onSale ? (
              <span className="bg-sale-soft px-2 py-1 text-xs text-sale">
                Sale
              </span>
            ) : null}
          </p>

          <p className="mt-5 leading-relaxed text-ink-muted">
            {product.description}
          </p>

          {product.variants.length > 0 ? (
            <VariantPicker
              variants={product.variants}
              sizes={sizes}
              colours={colours}
            />
          ) : (
            <p className="mt-8 border border-dashed border-line-strong px-4 py-6 text-sm text-ink-muted">
              This piece is being recut and has no sizes available yet.
            </p>
          )}

          <details className="mt-8 border-t border-line pt-5">
            <summary className="cursor-pointer text-sm text-ink">
              Size guide
            </summary>
            {hasApparelSizes ? (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                  <caption className="sr-only">
                    Body measurements in inches
                  </caption>
                  <thead>
                    <tr className="border-b border-line text-xs uppercase tracking-[0.08em] text-ink-subtle">
                      <th scope="col" className="py-2 pr-4 font-medium">
                        Size
                      </th>
                      <th scope="col" className="py-2 pr-4 font-medium">
                        Chest
                      </th>
                      <th scope="col" className="py-2 font-medium">
                        Waist
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-line">
                      <th scope="row" className="py-2 pr-4 font-normal">
                        S
                      </th>
                      <td className="py-2 pr-4 text-ink-muted">34 – 36</td>
                      <td className="py-2 text-ink-muted">28 – 30</td>
                    </tr>
                    <tr className="border-b border-line">
                      <th scope="row" className="py-2 pr-4 font-normal">
                        M
                      </th>
                      <td className="py-2 pr-4 text-ink-muted">38 – 40</td>
                      <td className="py-2 text-ink-muted">32 – 34</td>
                    </tr>
                    <tr>
                      <th scope="row" className="py-2 pr-4 font-normal">
                        L
                      </th>
                      <td className="py-2 pr-4 text-ink-muted">42 – 44</td>
                      <td className="py-2 text-ink-muted">36 – 38</td>
                    </tr>
                  </tbody>
                </table>
                <p className="mt-3 text-xs text-ink-subtle">
                  Body measurements in inches. Cut for a relaxed layer; take your
                  usual size.
                </p>
              </div>
            ) : (
              <p className="mt-4 text-sm leading-relaxed text-ink-muted">
                This piece is made in one size. Dimensions are listed with the
                materials below.
              </p>
            )}
          </details>

          <dl className="mt-6 space-y-2 border-t border-line pt-5 text-sm">
            {product.material ? (
              <div className="flex gap-4">
                <dt className="w-24 shrink-0 text-ink-subtle">Material</dt>
                <dd className="text-ink-muted">{product.material}</dd>
              </div>
            ) : null}
            <div className="flex gap-4">
              <dt className="w-24 shrink-0 text-ink-subtle">Collection</dt>
              <dd className="text-ink-muted">{product.collection.name}</dd>
            </div>
            <div className="flex gap-4">
              <dt className="w-24 shrink-0 text-ink-subtle">Colours</dt>
              <dd className="text-ink-muted">{colours.join(", ")}</dd>
            </div>
          </dl>
        </div>
      </div>

      {related.length > 0 ? (
        <section className="mt-20 border-t border-line pt-10">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="font-display text-2xl text-ink sm:text-3xl">
              More from {product.collection.name}
            </h2>
            <Link
              href={`/collections/${product.collection.slug}`}
              className="text-sm text-ink underline decoration-line-strong underline-offset-4 hover:text-accent"
            >
              View the collection
            </Link>
          </div>
          <div className="mt-8 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
