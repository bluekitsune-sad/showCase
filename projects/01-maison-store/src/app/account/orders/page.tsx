import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentCustomer } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import { statusLabel } from "@/lib/orders";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your orders",
};

export default async function OrdersPage() {
  const customer = await getCurrentCustomer();
  if (!customer) {
    redirect("/account/sign-in");
  }

  const orders = await prisma.order.findMany({
    where: { customerId: customer.id },
    orderBy: { placedAt: "desc" },
    select: {
      orderNumber: true,
      status: true,
      total: true,
      currency: true,
      placedAt: true,
      _count: { select: { items: true } },
    },
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
        <span className="text-ink">Orders</span>
      </nav>

      <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-accent">Order history</p>
          <h1 className="display mt-2 text-4xl text-ink sm:text-5xl">
            Your orders.
          </h1>
          <p className="mt-4 max-w-xl text-ink-muted">
            Every order placed while signed in, with its current status and
            delivery timeline.
          </p>
        </div>
        <Link href="/account" className="btn btn-ghost">
          Back to account
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="mt-10 border border-line bg-surface p-8 text-center sm:p-12">
          <h2 className="font-display text-2xl text-ink">No orders yet</h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-ink-muted">
            When you place an order it will appear here with its status and
            tracking timeline.
          </p>
          <Link href="/collections" className="btn btn-primary mt-6">
            Browse collections
          </Link>
        </div>
      ) : (
        <ul className="mt-10 divide-y divide-line border-y border-line">
          {orders.map((order) => {
            const placed = new Intl.DateTimeFormat("en-US", {
              dateStyle: "medium",
            }).format(order.placedAt);
            const itemLabel =
              order._count.items === 1
                ? "1 piece"
                : `${order._count.items} pieces`;

            return (
              <li
                key={order.orderNumber}
                className="grid gap-4 py-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
              >
                <div>
                  <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                    <p className="font-display text-xl text-ink">
                      {order.orderNumber}
                    </p>
                    <span className="border border-line-strong px-2 py-0.5 text-xs text-ink">
                      {statusLabel(order.status)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-ink-muted">
                    Placed {placed} · {itemLabel}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 sm:justify-end">
                  <p className="text-sm text-ink">
                    {formatPrice(order.total, order.currency)}
                  </p>
                  <Link
                    href={`/account/orders/${order.orderNumber}`}
                    className="btn btn-ghost"
                  >
                    View order
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
