import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { signOut } from "@/app/account/actions";
import { getCurrentCustomer } from "@/lib/auth";

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
