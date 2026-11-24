import Link from "next/link";
import { ProductMedia } from "@/components/product-media";
import { colourHex, formatPrice } from "@/lib/format";

type ProductCardData = {
  name: string;
  slug: string;
  price: number;
  compareAtPrice: number | null;
  currency: string;
  collection: { name: string };
  variants: { colour: string; size: string; stock: number }[];
};

export function ProductCard({ product }: { product: ProductCardData }) {
  const colours = [...new Set(product.variants.map((variant) => variant.colour))];
  const sizes = [...new Set(product.variants.map((variant) => variant.size))];
  const inStock = product.variants.filter((variant) => variant.stock > 0);
  const sizesInStock = [
    ...new Set(inStock.map((variant) => variant.size)),
  ].filter((size) => size !== "One Size");
  const soldOut = inStock.length === 0;
  const onSale =
    product.compareAtPrice !== null && product.compareAtPrice > product.price;

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden rounded-sm border border-line">
        <ProductMedia
          seed={product.slug}
          alt={`${product.name} from ${product.collection.name}`}
        />
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {soldOut ? (
            <span className="bg-surface px-2 py-1 text-xs text-ink-muted">
              Sold out
            </span>
          ) : null}
          {onSale ? (
            <span className="bg-sale-soft px-2 py-1 text-xs text-sale">Sale</span>
          ) : null}
        </div>
      </div>

      <div className="mt-3 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-lg leading-snug text-ink group-hover:text-accent">
            {product.name}
          </h3>
          <p className="mt-0.5 text-xs text-ink-subtle">{product.collection.name}</p>
        </div>
        <div className="shrink-0 text-right text-sm">
          {onSale ? (
            <span className="mr-2 text-xs text-ink-subtle line-through">
              {formatPrice(product.compareAtPrice ?? 0, product.currency)}
            </span>
          ) : null}
          <span className="text-ink">{formatPrice(product.price, product.currency)}</span>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <span className="flex items-center gap-1.5">
          {colours.map((colour) => (
            <span
              key={colour}
              title={colour}
              className="h-2.5 w-2.5 rounded-full border border-line-strong"
              style={{ background: colourHex(colour) }}
            />
          ))}
        </span>
        <span className="text-xs text-ink-subtle">
          {soldOut
            ? "Restocking"
            : sizes.length === 1 && sizes[0] === "One Size"
              ? "One size"
              : `Sizes ${sizesInStock.join(", ")}`}
        </span>
      </div>
    </Link>
  );
}
