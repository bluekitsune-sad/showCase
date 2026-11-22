import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  AddressForm,
  DeleteAddressForm,
} from "@/components/account/address-form";
import { createAddress, setDefaultAddress } from "@/app/account/addresses/actions";
import { getCurrentCustomer } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Saved addresses",
};

export default async function AddressesPage() {
  const customer = await getCurrentCustomer();
  if (!customer) {
    redirect("/account/sign-in");
  }

  const addresses = await prisma.address.findMany({
    where: { customerId: customer.id },
    orderBy: [{ isDefault: "desc" }, { id: "asc" }],
    select: {
      id: true,
      label: true,
      line1: true,
      line2: true,
      city: true,
      region: true,
      postalCode: true,
      country: true,
      isDefault: true,
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
        <span className="text-ink">Addresses</span>
      </nav>

      <div className="mt-8 max-w-3xl">
        <p className="text-sm text-accent">Account</p>
        <h1 className="display mt-3 text-4xl text-ink sm:text-5xl">
          Saved addresses.
        </h1>
        <p className="mt-5 max-w-xl text-ink-muted">
          Keep the places you ship to most often. One address is always marked
          as your default, and you can change it at any time.
        </p>

        <section aria-labelledby="saved-addresses" className="mt-10">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2
              id="saved-addresses"
              className="font-display text-2xl text-ink"
            >
              Your addresses
            </h2>
            <p className="text-sm text-ink-muted">
              {addresses.length === 1
                ? "1 address"
                : `${addresses.length} addresses`}
            </p>
          </div>

          {addresses.length === 0 ? (
            <div className="mt-5 border border-line bg-surface p-6">
              <p className="text-sm text-ink-muted">
                No saved addresses yet. Add one below and it will be ready for
                your next order.
              </p>
            </div>
          ) : (
            <ul className="mt-5 space-y-4">
              {addresses.map((address) => (
                <li
                  key={address.id}
                  className="border border-line bg-surface p-6"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="font-display text-lg text-ink">
                        {address.label}
                      </h3>
                      {address.isDefault ? (
                        <span className="border border-accent/40 bg-accent-soft px-2 py-0.5 text-xs text-accent">
                          Default
                        </span>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                      <Link
                        href={`/account/addresses/${address.id}`}
                        className="text-sm text-ink underline decoration-line-strong underline-offset-4 hover:text-accent"
                      >
                        Edit
                      </Link>
                      {address.isDefault ? null : (
                        <form action={setDefaultAddress}>
                          <input
                            type="hidden"
                            name="id"
                            value={address.id}
                          />
                          <button
                            type="submit"
                            className="text-sm text-ink-muted underline decoration-line-strong underline-offset-4 hover:text-accent"
                          >
                            Set as default
                          </button>
                        </form>
                      )}
                      <DeleteAddressForm id={address.id} />
                    </div>
                  </div>
                  <address className="mt-3 text-sm not-italic leading-relaxed text-ink-muted">
                    {address.line1}
                    {address.line2 ? (
                      <>
                        <br />
                        {address.line2}
                      </>
                    ) : null}
                    <br />
                    {address.city}, {address.region} {address.postalCode}
                    <br />
                    {address.country}
                  </address>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section
          aria-labelledby="add-address"
          className="mt-10 border border-line bg-surface p-6"
        >
          <h2 id="add-address" className="font-display text-2xl text-ink">
            Add an address
          </h2>
          <p className="mt-2 text-sm text-ink-muted">
            New addresses are validated before they are saved.
          </p>
          <div className="mt-6">
            <AddressForm
              action={createAddress}
              submitLabel="Save address"
              pendingLabel="Saving…"
            />
          </div>
        </section>

        <p className="mt-8">
          <Link
            href="/account"
            className="text-sm text-ink-muted underline decoration-line-strong underline-offset-4 hover:text-accent"
          >
            Back to your account
          </Link>
        </p>
      </div>
    </div>
  );
}
