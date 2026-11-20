import type { Metadata } from "next";
import "./globals.css";
import { AnnouncementBar, SiteFooter } from "@/components/layout/site-chrome";
import { SiteHeader } from "@/components/layout/site-header";
import { getCurrentCustomer } from "@/lib/auth";
import { getCartCount } from "@/lib/cart";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: "Maison Store — clothing made in short runs",
    template: "%s · Maison Store",
  },
  description:
    "A small clothing label working with mills and workshops we have used for years. Tailoring, linen and knitwear, made in short runs.",
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
