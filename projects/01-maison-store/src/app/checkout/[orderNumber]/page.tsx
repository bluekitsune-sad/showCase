import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";

type OrderPageProps = {
  params: Promise<{ orderNumber: string }>;
};

export async function generateMetadata({
  params,
}: OrderPageProps): Promise<Metadata> {
  const { orderNumber } = await params;
  return { title: `Order ${orderNumber}` };
}

function statusLabel(status: string): string {
  return status.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());
}

export default async function OrderConfirmationPage({
  params,
}: OrderPageProps) {
  const { orderNumber } = await params;
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: { orderBy: { id: "asc" } } },
  });

  if (!order) {
    notFound();
  }

  const placed = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(order.placedAt);
  const firstName = order.shippingName.split(" ")[0];

  return (
    <div className="container-x py-10 lg:py-16">
      <nav aria-label="Breadcrumb" className="text-sm text-ink-subtle">
        <Link href="/" className="hover:text-accent">
          Home
        </Link>
        <span aria-hidden="true" className="mx-2">
          /
        </span>
        <span className="text-ink">Order</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-14">
        <section>
          <p className="text-sm text-accent">Order confirmed</p>
          <h1 className="display mt-2 text-4xl text-ink sm:text-5xl">
            Thank you, {firstName}.
          </h1>
          <p className="mt-4 max-w-xl text-ink-muted">
            We have your order. A receipt would normally go to {order.email};
            this demo keeps everything in its local database.
          </p>

          <div className="mt-8 border border-line bg-surface p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <div>
                <p className="text-xs text-ink-muted">Order number</p>
                <p className="mt-1 font-display text-xl text-ink">
                  {order.orderNumber}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-ink-muted">Placed</p>
                <p className="mt-1 text-sm text-ink">{placed}</p>
              </div>
            </div>
            <p className="mt-4 inline-block border border-line-strong px-2.5 py-1 text-xs text-ink">
              {statusLabel(order.status)}
            </p>
          </div>

          <h2 className="mt-10 font-display text-2xl text-ink">Your pieces</h2>
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {order.items.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-4"
              >
                <div>
                  <p className="text-sm text-ink">{item.productName}</p>
                  <p className="text-xs text-ink-muted">
                    {item.variantLabel} · Qty {item.quantity}
                  </p>
                </div>
                <p className="text-sm text-ink">
                  {formatPrice(item.lineTotal, order.currency)}
                </p>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/collections" className="btn btn-primary">
              Continue shopping
            </Link>
            <Link href="/" className="btn btn-ghost">
              Back home
            </Link>
          </div>
        </section>

        <aside className="h-fit space-y-8">
          <div className="border border-line bg-surface p-6">
            <h2 className="font-display text-xl text-ink">Summary</h2>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-ink-muted">Subtotal</dt>
                <dd className="text-ink">
                  {formatPrice(order.subtotal, order.currency)}
                </dd>
              </div>
              {order.discountTotal > 0 ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-ink-muted">
                    Discount
                    {order.discountCode ? ` (${order.discountCode})` : ""}
                  </dt>
                  <dd className="text-accent">
                    −{formatPrice(order.discountTotal, order.currency)}
                  </dd>
                </div>
              ) : null}
              <div className="flex justify-between gap-4">
                <dt className="text-ink-muted">Delivery</dt>
                <dd className="text-ink">
                  {order.shippingTotal === 0
                    ? "Complimentary"
                    : formatPrice(order.shippingTotal, order.currency)}
                </dd>
              </div>
            </dl>
            <div className="mt-4 flex justify-between border-t border-line pt-4 text-base">
              <span className="text-ink">Total</span>
              <span className="text-ink">
                {formatPrice(order.total, order.currency)}
              </span>
            </div>
          </div>

          <div className="border border-line bg-surface p-6">
            <h2 className="font-display text-xl text-ink">Delivering to</h2>
            <address className="mt-3 text-sm not-italic leading-relaxed text-ink-muted">
              {order.shippingName}
              <br />
              {order.shippingLine1}
              <br />
              {order.shippingLine2 ? (
                <>
                  {order.shippingLine2}
                  <br />
                </>
              ) : null}
              {order.shippingCity}, {order.shippingRegion}{" "}
              {order.shippingPostalCode}
              <br />
              {order.shippingCountry}
            </address>
            <p className="mt-4 text-xs leading-relaxed text-ink-subtle">
              Mock payment received. No amount was charged and card details were
              not stored.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
