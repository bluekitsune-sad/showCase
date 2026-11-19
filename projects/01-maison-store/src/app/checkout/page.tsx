import type { Metadata } from "next";
import Link from "next/link";
import {
  CheckoutForm,
  type CheckoutLine,
} from "@/components/checkout-form";
import { cartItemCount, cartSubtotal, getCart } from "@/lib/cart";
import { shippingFor } from "@/lib/checkout";

export const metadata: Metadata = {
  title: "Checkout",
};

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const cart = await getCart();
  const items = cart?.items ?? [];

  if (!cart || items.length === 0) {
    return (
      <div className="container-x py-14 lg:py-20">
        <nav aria-label="Breadcrumb" className="text-sm text-ink-subtle">
          <Link href="/" className="hover:text-accent">
            Home
          </Link>
          <span aria-hidden="true" className="mx-2">
            /
          </span>
          <span className="text-ink">Checkout</span>
        </nav>

        <header className="mt-6 max-w-2xl">
          <h1 className="display text-4xl text-ink sm:text-5xl">Checkout</h1>
        </header>

        <div className="mt-12 border border-line bg-surface px-6 py-16 text-center">
          <p className="font-display text-2xl text-ink">
            There is nothing to check out yet.
          </p>
          <p className="mx-auto mt-3 max-w-md text-ink-muted">
            Add a piece to your bag first, then come back to finish the order.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link href="/collections" className="btn btn-primary">
              Browse collections
            </Link>
            <Link href="/cart" className="btn btn-ghost">
              View bag
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const subtotal = cartSubtotal(cart);
  const count = cartItemCount(cart);
  const currency = items[0].variant.product.currency;
  const shipping = shippingFor(subtotal);
  const lines: CheckoutLine[] = items.map((item) => ({
    id: item.id,
    name: item.variant.product.name,
    slug: item.variant.product.slug,
    colour: item.variant.colour,
    size: item.variant.size,
    quantity: item.quantity,
    price: item.variant.product.price,
    currency: item.variant.product.currency,
  }));

  return (
    <div className="container-x py-10 lg:py-16">
      <nav aria-label="Breadcrumb" className="text-sm text-ink-subtle">
        <Link href="/" className="hover:text-accent">
          Home
        </Link>
        <span aria-hidden="true" className="mx-2">
          /
        </span>
        <Link href="/cart" className="hover:text-accent">
          Bag
        </Link>
        <span aria-hidden="true" className="mx-2">
          /
        </span>
        <span className="text-ink">Checkout</span>
      </nav>

      <header className="mt-6 max-w-2xl">
        <h1 className="display text-4xl text-ink sm:text-5xl">Checkout</h1>
        <p className="mt-3 text-ink-muted">
          Where it goes, then a mock payment. No card is charged and nothing
          leaves the demo database.
        </p>
      </header>

      <CheckoutForm
        lines={lines}
        subtotal={subtotal}
        shipping={shipping}
        currency={currency}
        count={count}
      />
    </div>
  );
}
