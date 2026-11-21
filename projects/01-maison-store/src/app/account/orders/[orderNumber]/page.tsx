import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentCustomer } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import { orderTimeline, statusLabel } from "@/lib/orders";

export const dynamic = "force-dynamic";

type OrderDetailProps = {
  params: Promise<{ orderNumber: string }>;
};

export async function generateMetadata({
  params,
}: OrderDetailProps): Promise<Metadata> {
  const { orderNumber } = await params;
  return { title: `Order ${orderNumber}` };
}

export default async function OrderDetailPage({ params }: OrderDetailProps) {
  const customer = await getCurrentCustomer();
  if (!customer) {
    redirect("/account/sign-in");
  }

  const { orderNumber } = await params;
  const order = await prisma.order.findFirst({
    where: { orderNumber, customerId: customer.id },
    include: { items: { orderBy: { id: "asc" } } },
  });

  if (!order) {
    notFound();
  }

  const placed = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(order.placedAt);
  const timeline = orderTimeline(order);
  const dateFormat = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  });

  return (
    <div className="container-x py-10 lg:py-16">
      <nav aria-label="Breadcrumb" className="text-sm text-ink-subtle">
        <Link href="/" className="hover:text-accent">
          Home
        </Link>
        <span aria-hidden="true" className="mx-2">
          /
        </span>
        <Link href="/account" className="hover:text-accent">
          Account
        </Link>
        <span aria-hidden="true" className="mx-2">
          /
        </span>
        <Link href="/account/orders" className="hover:text-accent">
          Orders
        </Link>
        <span aria-hidden="true" className="mx-2">
          /
        </span>
        <span className="text-ink">{order.orderNumber}</span>
      </nav>

      <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-accent">Order detail</p>
          <h1 className="display mt-2 text-4xl text-ink sm:text-5xl">
            {order.orderNumber}
          </h1>
          <p className="mt-4 text-ink-muted">
            Placed {placed} · {order.email}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="border border-line-strong px-3 py-1 text-sm text-ink">
            {statusLabel(order.status)}
          </span>
          <Link href="/account/orders" className="btn btn-ghost">
            All orders
          </Link>
        </div>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-14">
        <section>
          <h2 className="font-display text-2xl text-ink">Your pieces</h2>
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {order.items.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2 py-4"
              >
                <div>
                  <p className="text-sm text-ink">{item.productName}</p>
                  <p className="mt-1 text-xs text-ink-muted">
                    {item.variantLabel} · Qty {item.quantity}
                  </p>
                  <span className="mt-2 inline-block border border-line px-2 py-0.5 text-xs text-ink-muted">
                    {statusLabel(item.status)}
                  </span>
                </div>
                <p className="text-sm text-ink">
                  {formatPrice(item.lineTotal, order.currency)}
                </p>
              </li>
            ))}
          </ul>

          <h2 className="mt-10 font-display text-2xl text-ink">Tracking</h2>
          <ol className="mt-5 space-y-0">
            {timeline.map((step, index) => {
              const isLast = index === timeline.length - 1;
              return (
                <li
                  key={step.status}
                  aria-current={step.state === "current" ? "step" : undefined}
                  className="relative flex gap-4 pb-6 last:pb-0"
                >
                  {!isLast ? (
                    <span
                      aria-hidden="true"
                      className={`absolute left-[0.4375rem] top-4 h-full w-px ${
                        step.state === "complete" ? "bg-accent" : "bg-line"
                      }`}
                    />
                  ) : null}
                  <span
                    aria-hidden="true"
                    className={`relative mt-1 h-3.5 w-3.5 shrink-0 rounded-full border ${
                      step.state === "complete"
                        ? "border-accent bg-accent"
                        : step.state === "current"
                          ? "border-accent bg-paper ring-2 ring-accent-soft"
                          : "border-line-strong bg-paper"
                    }`}
                  />
                  <div>
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <p
                        className={`text-sm ${
                          step.state === "upcoming"
                            ? "text-ink-muted"
                            : "text-ink"
                        }`}
                      >
                        {step.label}
                      </p>
                      <p className="text-xs text-ink-subtle">
                        {step.state === "upcoming" ? "Expected " : ""}
                        {dateFormat.format(step.at)}
                      </p>
                    </div>
                    <p className="mt-1 text-sm text-ink-muted">
                      {step.description}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
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
          </div>
        </aside>
      </div>
    </div>
  );
}
