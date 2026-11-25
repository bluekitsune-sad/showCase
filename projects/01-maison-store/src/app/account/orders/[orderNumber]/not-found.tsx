import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Order not found",
  robots: { index: false, follow: false },
};

export default function OrderNotFound() {
  return (
    <div className="container-x py-16">
      <div className="mx-auto max-w-xl border border-line bg-surface px-6 py-14 text-center">
        <p className="font-display text-2xl text-ink">
          We could not find that order.
        </p>
        <p className="mt-3 text-ink-muted">
          It may belong to another account, or the link may be old. Your order
          history lists everything placed while signed in.
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link href="/account/orders" className="btn btn-primary">
            View your orders
          </Link>
          <Link href="/account" className="btn btn-ghost">
            Back to account
          </Link>
        </div>
      </div>
    </div>
  );
}
