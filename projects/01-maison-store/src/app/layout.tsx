import type { Metadata } from "next";
import "./globals.css";
import { AnnouncementBar, SiteFooter } from "@/components/layout/site-chrome";
import { SiteHeader } from "@/components/layout/site-header";
import { StructuredData } from "@/components/structured-data";
import { getCurrentCustomer } from "@/lib/auth";
import { getCartCount } from "@/lib/cart";
import { prisma } from "@/lib/db";
import {
  DEFAULT_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  organizationNode,
  websiteNode,
} from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  title: {
    default: "Maison Store — clothing made in short runs",
    template: "%s · Maison Store",
  },
  description: DEFAULT_DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_US",
    url: "/",
    title: "Maison Store — clothing made in short runs",
    description: DEFAULT_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "Maison Store — clothing made in short runs",
    description: DEFAULT_DESCRIPTION,
  },
};

async function getNavigation() {
  try {
    return await prisma.collection.findMany({
      orderBy: { sortOrder: "asc" },
      select: { name: true, slug: true },
    });
  } catch {
    return [];
  }
}

async function getBagCount() {
  try {
    return await getCartCount();
  } catch {
    return 0;
  }
}

async function getAccountName() {
  try {
    const customer = await getCurrentCustomer();
    return customer?.name ?? null;
  } catch {
    return null;
  }
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [collections, cartCount, customerName] = await Promise.all([
    getNavigation(),
    getBagCount(),
    getAccountName(),
  ]);

  return (
    <html lang="en">
      <body>
        <StructuredData nodes={[organizationNode(), websiteNode()]} />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-sm focus:bg-accent focus:px-4 focus:py-2 focus:text-surface"
        >
          Skip to content
        </a>
        <AnnouncementBar />
        <SiteHeader
          collections={collections}
          cartCount={cartCount}
          customerName={customerName}
        />
        <main id="main">{children}</main>
        <SiteFooter collections={collections} />
      </body>
    </html>
  );
}
