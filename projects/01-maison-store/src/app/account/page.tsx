import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { signOut } from "@/app/account/actions";
import { getCurrentCustomer } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import { statusLabel } from "@/lib/orders";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your account",
};

export default async function AccountPage() {
  const customer = await getCurrentCustomer();
  if (!customer) {
    redirect("/account/sign-in");
  }

  const firstName = customer.name.split(" ")[0];
  const memberSince = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(customer.createdAt);

  const orders = await prisma.order.findMany({
    where: { customerId: customer.id },
    orderBy: { placedAt: "desc" },
    take: 3,
    select: {
      orderNumber: true,
      status: true,
      total: true,
      currency: true,
      placedAt: true,
      _count: { select: { items: true } },
    },
  });
  const orderCount = await prisma.order.count({
    where: { customerId: customer.id },
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
        <span className="text-ink">Account</span>
      </nav>

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-14">
        <section>
          <p className="text-sm text-accent">Your account</p>
          <h1 className="display mt-3 text-4xl text-ink sm:text-5xl">
            Welcome back, {firstName}.
          </h1>
          <p className="mt-5 max-w-xl text-ink-muted">
            Your account is held in this store&apos;s local demo database. You
            are signed in on this browser until you sign out.
          </p>

          <div className="mt-10 border border-line bg-surface p-6">
            <h2 className="font-display text-xl text-ink">Account details</h2>
            <dl className="mt-5 space-y-4 text-sm">
              <div className="flex flex-wrap justify-between gap-x-6 gap-y-1 border-b border-line pb-4">
                <dt className="text-ink-muted">Name</dt>
                <dd className="text-ink">{customer.name}</dd>
              </div>
              <div className="flex flex-wrap justify-between gap-x-6 gap-y-1 border-b border-line pb-4">
                <dt className="text-ink-muted">Email</dt>
                <dd className="text-ink">{customer.email}</dd>
              </div>
              <div className="flex flex-wrap justify-between gap-x-6 gap-y-1">
                <dt className="text-ink-muted">Customer since</dt>
                <dd className="text-ink">{memberSince}</dd>
              </div>
            </dl>
          </div>

          <div className="mt-8 border border-line bg-surface p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 className="font-display text-xl text-ink">Order history</h2>
              <Link
                href="/account/orders"
                className="text-sm text-accent hover:text-accent-hover"
              >
                {orderCount === 0
                  ? "View orders"
                  : `All ${orderCount} orders`}
              </Link>
            </div>

            {orders.length === 0 ? (
              <div className="mt-5">
                <p className="text-sm text-ink-muted">
                  No orders yet. Anything you buy while signed in will appear
                  here with its status and delivery timeline.
                </p>
                <Link href="/collections" className="btn btn-ghost mt-4">
                  Browse collections
                </Link>
              </div>
            ) : (
              <ul className="mt-5 divide-y divide-line border-y border-line">
                {orders.map((order) => {
                  const placed = new Intl.DateTimeFormat("en-US", {
                    dateStyle: "medium",
                  }).format(order.placedAt);
                  return (
                    <li
                      key={order.orderNumber}
                      className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-4"
                    >
                      <div>
                        <Link
                          href={`/account/orders/${order.orderNumber}`}
                          className="text-sm text-ink hover:text-accent"
                        >
                          {order.orderNumber}
                        </Link>
                        <p className="mt-1 text-xs text-ink-muted">
                          {placed} · {statusLabel(order.status)} ·{" "}
                          {order._count.items === 1
                            ? "1 piece"
                            : `${order._count.items} pieces`}
                        </p>
                      </div>
                      <p className="text-sm text-ink">
                        {formatPrice(order.total, order.currency)}
                      </p>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>

        <aside className="h-fit space-y-6">
          <div className="border border-line bg-surface p-6">
            <h2 className="font-display text-xl text-ink">Keep shopping</h2>
            <p className="mt-2 text-sm text-ink-muted">
              Your bag is waiting, and the collections are open.
            </p>
            <div className="mt-5 flex flex-col gap-3">
              <Link href="/cart" className="btn btn-primary">
                View your bag
              </Link>
              <Link href="/collections" className="btn btn-ghost">
                Browse collections
              </Link>
            </div>
          </div>

          <form action={signOut} className="border border-line bg-surface p-6">
            <h2 className="font-display text-xl text-ink">Sign out</h2>
            <p className="mt-2 text-sm text-ink-muted">
              Use this on a shared device. Your account stays in the demo
              database.
            </p>
            <button type="submit" className="btn btn-ghost mt-5 w-full">
              Sign out
            </button>
          </form>
        </aside>
      </div>
    </div>
  );
}
