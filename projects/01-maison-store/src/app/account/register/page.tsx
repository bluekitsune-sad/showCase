import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SignUpForm } from "@/components/account/auth-form";
import { getCurrentCustomer } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Create an account",
};

export default async function RegisterPage() {
  const customer = await getCurrentCustomer();
  if (customer) {
    redirect("/account");
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
        <Link href="/account/sign-in" className="hover:text-accent">
          Sign in
        </Link>
        <span aria-hidden="true" className="mx-2">
          /
        </span>
        <span className="text-ink">Create account</span>
      </nav>

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_26rem] lg:gap-16">
        <section className="max-w-xl">
          <p className="text-sm text-accent">Your account</p>
          <h1 className="display mt-3 text-4xl text-ink sm:text-5xl">
            Keep your name and address ready for the next order.
          </h1>
          <p className="mt-5 text-ink-muted">
            An account holds the details you use at checkout. This is a local
            demo, so nothing is shared and no email is sent.
          </p>
        </section>

        <section
          aria-labelledby="register-heading"
          className="h-fit border border-line bg-surface p-6 sm:p-8"
        >
          <h2 id="register-heading" className="font-display text-2xl text-ink">
            Create an account
          </h2>
          <div className="mt-6">
            <SignUpForm />
          </div>
        </section>
      </div>
    </div>
  );
}
