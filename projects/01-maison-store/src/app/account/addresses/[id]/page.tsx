import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AddressForm } from "@/components/account/address-form";
import { updateAddress } from "@/app/account/addresses/actions";
import { getCurrentCustomer } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Edit address",
};

type EditAddressProps = {
  params: Promise<{ id: string }>;
};

export default async function EditAddressPage({ params }: EditAddressProps) {
  const customer = await getCurrentCustomer();
  if (!customer) {
    redirect("/account/sign-in");
  }

  const { id } = await params;
  const addressId = Number(id);
  if (!Number.isInteger(addressId) || addressId <= 0) {
    notFound();
  }

  const address = await prisma.address.findFirst({
    where: { id: addressId, customerId: customer.id },
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
  if (!address) {
    notFound();
  }

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
        <Link href="/account/addresses" className="hover:text-accent">
          Addresses
        </Link>
        <span aria-hidden="true" className="mx-2">
          /
        </span>
        <span className="text-ink">Edit</span>
      </nav>

      <div className="mt-8 max-w-3xl">
        <p className="text-sm text-accent">Saved address</p>
        <h1 className="display mt-3 text-4xl text-ink sm:text-5xl">
          Edit {address.label}.
        </h1>
        <p className="mt-5 max-w-xl text-ink-muted">
          Changes are validated on the server before they are saved.
        </p>

        <div className="mt-10 border border-line bg-surface p-6">
          <AddressForm
            action={updateAddress}
            addressId={address.id}
            values={{
              label: address.label,
              line1: address.line1,
              line2: address.line2 ?? "",
              city: address.city,
              region: address.region,
              postalCode: address.postalCode,
              country: address.country,
              isDefault: address.isDefault,
            }}
            submitLabel="Save changes"
            pendingLabel="Saving…"
          />
        </div>
      </div>
    </div>
  );
}
