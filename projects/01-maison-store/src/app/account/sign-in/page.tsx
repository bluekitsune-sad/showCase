import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SignInForm } from "@/components/account/auth-form";
import { getCurrentCustomer } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign in",
};

export default async function SignInPage() {
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
        <span className="text-ink">Sign in</span>
      </nav>

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_26rem] lg:gap-16">
        <section className="max-w-xl">
          <p className="text-sm text-accent">Your account</p>
          <h1 className="display mt-3 text-4xl text-ink sm:text-5xl">
            Your details, kept quietly in one place.
          </h1>
          <p className="mt-5 text-ink-muted">
            Sign in with the demo account below or create your own. Everything
            stays in the local demo database, and no email is sent.
          </p>
        </section>

        <section
          aria-labelledby="sign-in-heading"
          className="h-fit border border-line bg-surface p-6 sm:p-8"
        >
          <h2 id="sign-in-heading" className="font-display text-2xl text-ink">
            Sign in
          </h2>
          <div className="mt-6">
            <SignInForm />
          </div>
          <p className="mt-6 border-t border-line pt-4 text-xs leading-relaxed text-ink-muted">
            Demo account: ada.winters@example.com
            <br />
            Password: Maison2026!
          </p>
        </section>
      </div>
    </div>
  );
}
