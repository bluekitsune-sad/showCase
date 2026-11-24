import type { Metadata } from "next";

export const SITE_NAME = "Maison Store";

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000"
).replace(/\/+$/, "");

export const DEFAULT_DESCRIPTION =
  "A small clothing label working with mills and workshops we have used for years. Tailoring, linen and knitwear, made in short runs.";

export type BreadcrumbItem = {
  name: string;
  path: string;
};

export function absoluteUrl(path = "/"): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function buildMetadata({
  title,
  description,
  path,
  type = "website",
}: {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
}): Metadata {
  const url = absoluteUrl(path);
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type,
      title,
      description,
      url,
      siteName: SITE_NAME,
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

export function organizationNode() {
  return {
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    description: DEFAULT_DESCRIPTION,
  };
}

export function websiteNode() {
  return {
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: DEFAULT_DESCRIPTION,
    inLanguage: "en-US",
  };
}

export function breadcrumbNode(items: BreadcrumbItem[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function collectionNode(collection: {
  name: string;
  slug: string;
  description: string;
}) {
  return {
    "@type": "CollectionPage",
    name: collection.name,
    description: collection.description,
    url: absoluteUrl(`/collections/${collection.slug}`),
  };
}

export function productNode(product: {
  name: string;
  slug: string;
  description: string;
  price: number;
  currency: string;
  collection: { name: string; slug: string };
  variants: { sku: string; stock: number }[];
}) {
  const inStock = product.variants.some((variant) => variant.stock > 0);
  const firstSku = product.variants[0]?.sku;

  return {
    "@type": "Product",
    name: product.name,
    description: product.description,
    url: absoluteUrl(`/products/${product.slug}`),
    category: product.collection.name,
    ...(firstSku ? { sku: firstSku } : {}),
    brand: { "@type": "Brand", name: SITE_NAME },
    offers: {
      "@type": "Offer",
      url: absoluteUrl(`/products/${product.slug}`),
      priceCurrency: product.currency,
      price: (product.price / 100).toFixed(2),
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };
}
