import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import {
  AVAILABILITY_OPTIONS,
  PRICE_OPTIONS,
  SORT_OPTIONS,
  hasActiveFilters,
  type CatalogFilters,
} from "@/lib/catalog";

type CatalogProduct = {
  id: number;
  name: string;
  slug: string;
  price: number;
  compareAtPrice: number | null;
  currency: string;
  collection: { name: string };
  variants: { colour: string; size: string; stock: number }[];
};

type CatalogProps = {
  basePath: string;
  filters: CatalogFilters;
  products: CatalogProduct[];
  sizes: string[];
  colours: string[];
  emptyMessage: string;
};

const selectClass =
  "mt-1.5 block min-h-11 w-full appearance-none rounded-sm border border-line-control bg-surface px-3 py-2 text-sm text-ink";

function SelectField({
  label,
  name,
  value,
  children,
  className = "",
}: {
  label: string;
  name: string;
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="text-xs uppercase tracking-[0.12em] text-ink-subtle">
        {label}
      </span>
      <select name={name} defaultValue={value} className={selectClass}>
        {children}
      </select>
    </label>
  );
}

export function Catalog({
  basePath,
  filters,
  products,
  sizes,
  colours,
  emptyMessage,
}: CatalogProps) {
  const filtered = hasActiveFilters(filters);

  return (
    <section aria-label="Catalogue">
      <form
        method="get"
        action={basePath}
        className="border-y border-line py-4"
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <SelectField label="Sort" name="sort" value={filters.sort}>
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </SelectField>

          <SelectField label="Size" name="size" value={filters.size}>
            <option value="">All sizes</option>
            {sizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </SelectField>

          <SelectField label="Colour" name="colour" value={filters.colour}>
            <option value="">All colours</option>
            {colours.map((colour) => (
              <option key={colour} value={colour}>
                {colour}
              </option>
            ))}
          </SelectField>

          <SelectField
            label="Availability"
            name="availability"
            value={filters.availability}
          >
            {AVAILABILITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </SelectField>

          <SelectField label="Price" name="price" value={filters.price}>
            <option value="">Any price</option>
            {PRICE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </SelectField>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button type="submit" className="btn btn-primary">
            Apply filters
          </button>
          {filtered ? (
            <Link href={basePath} className="btn btn-ghost">
              Clear
            </Link>
          ) : null}
        </div>
      </form>

      <p className="mt-6 text-sm text-ink-subtle" role="status">
        {products.length} {products.length === 1 ? "piece" : "pieces"}
        {filtered ? " match these filters" : ""}
      </p>

      {products.length === 0 ? (
        <div className="mt-8 border border-dashed border-line-strong px-6 py-14 text-center">
          <p className="font-display text-2xl text-ink">{emptyMessage}</p>
          <p className="mx-auto mt-3 max-w-md text-ink-muted">
            Try a different size, colour or price, or start again from the full
            catalogue.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link href={basePath} className="btn btn-primary">
              Clear filters
            </Link>
            <Link href="/collections" className="btn btn-ghost">
              Browse collections
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-8 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
