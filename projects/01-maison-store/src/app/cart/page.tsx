import type { Metadata } from "next";
import Link from "next/link";
import { removeCartItem, updateCartItem } from "@/app/cart/actions";
import { cartItemCount, cartSubtotal, getCart, MAX_PER_LINE } from "@/lib/cart";
import { formatPrice, toneGradient } from "@/lib/format";

export const metadata: Metadata = {
  title: "Your bag",
};

export default async function CartPage() {
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
          <span className="text-ink">Bag</span>
        </nav>

        <header className="mt-6 max-w-2xl">
          <h1 className="display text-4xl text-ink sm:text-5xl">Your bag</h1>
        </header>

        <div className="mt-12 border border-line bg-surface px-6 py-16 text-center">
          <p className="font-display text-2xl text-ink">Your bag is empty.</p>
          <p className="mx-auto mt-3 max-w-md text-ink-muted">
            Nothing has been added yet. Start with a collection, or the pieces we
            are showing this season.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link href="/collections" className="btn btn-primary">
              Browse collections
            </Link>
            <Link href="/" className="btn btn-ghost">
              Back home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const subtotal = cartSubtotal(cart);
  const count = cartItemCount(cart);
  const currency = items[0].variant.product.currency;

  return (
    <div className="container-x py-10 lg:py-16">
      <nav aria-label="Breadcrumb" className="text-sm text-ink-subtle">
        <Link href="/" className="hover:text-accent">
          Home
        </Link>
        <span aria-hidden="true" className="mx-2">
          /
        </span>
        <span className="text-ink">Bag</span>
      </nav>

      <header className="mt-6 flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="display text-4xl text-ink sm:text-5xl">Your bag</h1>
        <p className="text-sm text-ink-muted">
          {count} {count === 1 ? "piece" : "pieces"}
        </p>
      </header>

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-14">
        <section aria-label="Bag contents">
          <ul className="divide-y divide-line border-y border-line">
            {items.map((item) => {
              const { product } = item.variant;
              const lineTotal = product.price * item.quantity;
              const soldOut = item.variant.stock === 0;
              const atStockLimit = item.quantity >= item.variant.stock;
              const atLineLimit = item.quantity >= MAX_PER_LINE;
              const label = `${product.name}, ${item.variant.colour} / ${item.variant.size}`;

              return (
                <li key={item.id} className="flex gap-4 py-6 sm:gap-6">
                  <div
                    aria-hidden="true"
                    className="h-28 w-24 shrink-0 rounded-sm sm:h-32 sm:w-28"
                    style={{ background: toneGradient(product.slug) }}
                  />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                      <Link
                        href={`/products/${product.slug}`}
                        className="font-display text-lg text-ink hover:text-accent"
                      >
                        {product.name}
                      </Link>
                      <p className="text-sm text-ink">
                        {formatPrice(lineTotal, product.currency)}
                      </p>
                    </div>
                    <p className="mt-1 text-sm text-ink-muted">
                      {item.variant.colour} / {item.variant.size} ·{" "}
                      {formatPrice(product.price, product.currency)} each
                    </p>
                    <p className="mt-1 text-xs text-ink-subtle">
                      SKU {item.variant.sku}
                    </p>

                    {soldOut ? (
                      <p className="mt-2 text-xs text-sale">
                        Sold out since you added it. Remove it to continue.
                      </p>
                    ) : item.quantity > item.variant.stock ? (
                      <p className="mt-2 text-xs text-sale">
                        Only {item.variant.stock} left. Reduce the quantity to
                        continue.
                      </p>
                    ) : item.variant.stock <= 3 ? (
                      <p className="mt-2 text-xs text-ink-subtle">
                        Only {item.variant.stock} left in this size.
                      </p>
                    ) : null}

                    <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-3 pt-4">
                      <div className="flex items-center border border-line-strong">
                        <form action={updateCartItem}>
                          <input type="hidden" name="itemId" value={item.id} />
                          <input
                            type="hidden"
                            name="quantity"
                            value={item.quantity - 1}
                          />
                          <button
                            type="submit"
                            disabled={item.quantity <= 1}
                            aria-label={`Decrease quantity of ${label}`}
                            className="flex h-9 w-9 items-center justify-center text-ink transition-colors hover:bg-surface-sunken disabled:cursor-not-allowed disabled:text-ink-subtle"
                          >
                            <span aria-hidden="true">−</span>
                          </button>
                        </form>
                        <span
                          className="min-w-8 text-center text-sm text-ink"
                          aria-live="polite"
                        >
                          {item.quantity}
                        </span>
                        <form action={updateCartItem}>
                          <input type="hidden" name="itemId" value={item.id} />
                          <input
                            type="hidden"
                            name="quantity"
                            value={item.quantity + 1}
                          />
                          <button
                            type="submit"
                            disabled={
                              soldOut || atStockLimit || atLineLimit
                            }
                            aria-label={`Increase quantity of ${label}`}
                            className="flex h-9 w-9 items-center justify-center text-ink transition-colors hover:bg-surface-sunken disabled:cursor-not-allowed disabled:text-ink-subtle"
                          >
                            <span aria-hidden="true">+</span>
                          </button>
                        </form>
                      </div>

                      <form action={removeCartItem}>
                        <input type="hidden" name="itemId" value={item.id} />
                        <button
                          type="submit"
                          className="text-xs text-ink-muted underline decoration-line-strong underline-offset-4 transition-colors hover:text-accent"
                        >
                          Remove
                          <span className="sr-only"> {label} from your bag</span>
                        </button>
                      </form>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="mt-6">
            <Link
              href="/collections"
              className="text-sm text-ink underline decoration-line-strong underline-offset-4 hover:text-accent"
            >
              Continue shopping
            </Link>
          </div>
        </section>

        <aside
          aria-label="Order summary"
          className="h-fit border border-line bg-surface p-6 lg:sticky lg:top-24"
        >
          <h2 className="font-display text-xl text-ink">Order summary</h2>
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-ink-muted">
                Subtotal ({count} {count === 1 ? "piece" : "pieces"})
              </dt>
              <dd className="text-ink">{formatPrice(subtotal, currency)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-muted">Delivery</dt>
              <dd className="text-ink-muted">Calculated at checkout</dd>
            </div>
          </dl>
          <div className="mt-4 flex justify-between border-t border-line pt-4 text-base">
            <span className="text-ink">Estimated total</span>
            <span className="text-ink">{formatPrice(subtotal, currency)}</span>
          </div>
          <p className="mt-5 text-xs leading-relaxed text-ink-subtle">
            Checkout opens with the next collection update. Your bag is saved on
            this device for 30 days.
          </p>
        </aside>
      </div>
    </div>
  );
}
