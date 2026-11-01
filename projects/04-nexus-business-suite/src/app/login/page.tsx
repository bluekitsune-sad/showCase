import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Sign in",
};

function safeNext(value: string | string[] | undefined): string | undefined {
  if (typeof value !== "string") return undefined;
  if (!value.startsWith("/") || value.startsWith("//")) return undefined;
  return value;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  const { next } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center gap-2">
          <span
            aria-hidden="true"
            className="flex h-8 w-8 items-center justify-center rounded-md bg-accent text-sm font-bold text-white"
          >
            N
          </span>
          <div>
            <p className="text-base font-semibold tracking-tight text-ink">
              Nexus Business Suite
            </p>
            <p className="text-xs text-ink-muted">Sign in to the demo workspace</p>
          </div>
        </div>

        <div className="rounded-lg border border-line bg-surface p-6 shadow-sm">
          <LoginForm next={safeNext(next)} />
        </div>

        <p className="mt-4 text-center text-xs text-ink-subtle">
          Synthetic demo data. No real accounts, no real email.
        </p>
      </div>
    </main>
  );
}
