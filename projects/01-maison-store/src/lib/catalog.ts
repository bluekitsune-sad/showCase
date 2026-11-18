import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";

export type CatalogFilters = {
  sort: string;
  size: string;
  colour: string;
  availability: string;
  price: string;
};

export type CatalogSearchParams = Record<
  string,
  string | string[] | undefined
>;

export const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "newest", label: "Newest" },
  { value: "name", label: "Name A–Z" },
] as const;

export const PRICE_OPTIONS = [
  { value: "under-100", label: "Under $100" },
  { value: "100-250", label: "$100 – $250" },
  { value: "over-250", label: "Over $250" },
] as const;

export const AVAILABILITY_OPTIONS = [
  { value: "", label: "All pieces" },
  { value: "in-stock", label: "In stock" },
  { value: "sold-out", label: "Sold out" },
] as const;

const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL", "One Size"];

export function sortSizes(sizes: string[]): string[] {
  return [...new Set(sizes)].sort((a, b) => {
    const aIndex = SIZE_ORDER.indexOf(a);
    const bIndex = SIZE_ORDER.indexOf(b);
    if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });
}

function single(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export function readCatalogFilters(params: CatalogSearchParams): CatalogFilters {
  return {
    sort: single(params.sort),
    size: single(params.size),
    colour: single(params.colour),
    availability: single(params.availability),
    price: single(params.price),
  };
}

export function hasActiveFilters(filters: CatalogFilters): boolean {
  return Boolean(
    filters.size ||
      filters.colour ||
      filters.availability ||
      filters.price ||
      (filters.sort && filters.sort !== "featured"),
  );
}

export function orderByForSort(
  sort: string,
): Prisma.ProductOrderByWithRelationInput[] {
  switch (sort) {
    case "price-asc":
      return [{ price: "asc" }, { name: "asc" }];
    case "price-desc":
      return [{ price: "desc" }, { name: "asc" }];
    case "newest":
      return [{ createdAt: "desc" }];
    case "name":
      return [{ name: "asc" }];
    default:
      return [{ featured: "desc" }, { createdAt: "asc" }];
  }
}

export function whereForFilters(
  filters: CatalogFilters,
  collectionId?: number,
): Prisma.ProductWhereInput {
  const and: Prisma.ProductWhereInput[] = [];

  if (collectionId !== undefined) {
    and.push({ collectionId });
  }

  if (filters.price === "under-100") {
    and.push({ price: { lt: 10000 } });
  } else if (filters.price === "100-250") {
    and.push({ price: { gte: 10000, lte: 25000 } });
  } else if (filters.price === "over-250") {
    and.push({ price: { gt: 25000 } });
  }

  if (filters.availability === "sold-out") {
    and.push({ variants: { none: { stock: { gt: 0 } } } });
    const anyVariant: Prisma.VariantWhereInput = {};
    if (filters.size) anyVariant.size = filters.size;
    if (filters.colour) anyVariant.colour = filters.colour;
    if (Object.keys(anyVariant).length > 0) {
      and.push({ variants: { some: anyVariant } });
    }
  } else {
    const variant: Prisma.VariantWhereInput = {};
    if (filters.size) variant.size = filters.size;
    if (filters.colour) variant.colour = filters.colour;
    if (filters.availability === "in-stock" || filters.size || filters.colour) {
      variant.stock = { gt: 0 };
    }
    if (Object.keys(variant).length > 0) {
      and.push({ variants: { some: variant } });
    }
  }

  return and.length > 0 ? { AND: and } : {};
}

export async function catalogOptions(collectionId?: number): Promise<{
  sizes: string[];
  colours: string[];
}> {
  const variants = await prisma.variant.findMany({
    where:
      collectionId === undefined ? {} : { product: { collectionId } },
    select: { size: true, colour: true },
  });

  const sizes = sortSizes(variants.map((variant) => variant.size));
  const colours = [...new Set(variants.map((variant) => variant.colour))].sort(
    (a, b) => a.localeCompare(b),
  );

  return { sizes, colours };
}

export const PRODUCT_CARD_INCLUDE = {
  collection: { select: { name: true } },
  variants: { select: { colour: true, size: true, stock: true } },
} as const;
