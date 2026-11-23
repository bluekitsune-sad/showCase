import type { Metadata } from "next";
import Link from "next/link";
import { removeFromWishlist } from "@/app/wishlist/actions";
import { ProductCard } from "@/components/product-card";
import { getCurrentCustomer } from "@/lib/auth";
import { PRODUCT_CARD_INCLUDE } from "@/lib/catalog";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your wishlist",
};

export default async function WishlistPage() {
  const customer = await getCurrentCustomer();

  return (
    <div className="container-x py-10 lg:py-16">
      <nav aria-label="Breadcrumb" className="text-sm text-ink-subtle">
        <Link href="/" className="hover:text-accent">
          Home
        </Link>
        <span aria-hidden="true" className="mx-2">
          /
        </span>
        <span className="text-ink">Wishlist</span>
      </nav>

      {customer ? (
        <SignedInWishlist customerId={customer.id} />
      ) : (
        <section className="mt-8 max-w-xl">
          <p className="text-sm text-accent">Your wishlist</p>
          <h1 className="display mt-3 text-4xl text-ink sm:text-5xl">
            Keep a list for later.
          </h1>
          <p className="mt-5 text-ink-muted">
            Sign in to save the pieces you are considering and find them here
            next time. Your wishlist is private to your account and stays in the
            local demo database.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/account/sign-in" className="btn btn-primary">
              Sign in
            </Link>
            <Link href="/collections" className="btn btn-ghost">
              Browse collections
            </Link>
          </div>
          <p className="mt-6 border border-line bg-surface p-5 text-sm text-ink-muted">
            New here? You can{" "}
            <Link
              href="/account/register"
              className="text-ink underline decoration-line-strong underline-offset-4 hover:text-accent"
            >
              create an account
            </Link>{" "}
            in a moment; no email is sent.
          </p>
        </section>
      )}
    </div>
  );
}

async function SignedInWishlist({ customerId }: { customerId: number }) {
  const items = await prisma.wishlistItem.findMany({
    where: { customerId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          compareAtPrice: true,
          currency: true,
          ...PRODUCT_CARD_INCLUDE,
        },
      },
    },
  });

  return (
    <section className="mt-8">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <p className="text-sm text-accent">Your wishlist</p>
          <h1 className="display mt-3 text-4xl text-ink sm:text-5xl">
            Saved for later.
          </h1>
        </div>
        {items.length > 0 ? (
          <p className="text-sm text-ink-subtle">
            {items.length === 1 ? "1 piece" : `${items.length} pieces`}
          </p>
        ) : null}
      </div>

      {items.length === 0 ? (
        <div className="mt-10 max-w-xl border border-dashed border-line-strong p-8">
          <h2 className="font-display text-2xl text-ink">
            Nothing saved yet
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-muted">
            Open any piece and choose “Save to wishlist”. It will wait here until
            you are ready, and we will not email you about it.
          </p>
          <Link href="/collections" className="btn btn-primary mt-6">
            Browse collections
          </Link>
        </div>
      ) : (
        <ul className="mt-8 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <li key={item.id} className="flex flex-col">
              <ProductCard product={item.product} />
              <form action={removeFromWishlist} className="mt-3">
                <input
                  type="hidden"
                  name="productId"
                  value={item.product.id}
                />
                <button
                  type="submit"
                  className="text-xs text-ink-muted underline decoration-line-strong underline-offset-4 hover:text-accent"
                >
                  Remove from wishlist
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
