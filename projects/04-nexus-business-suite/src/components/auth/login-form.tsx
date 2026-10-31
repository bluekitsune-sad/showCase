"use client";

import { useActionState, useState } from "react";
import { authenticate } from "@/app/login/actions";
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from "@/lib/demo-accounts";

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction, pending] = useActionState(authenticate, {
    error: null,
  });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="space-y-6">
      <form action={formAction} className="space-y-4">
        {next && <input type="hidden" name="next" value={next} />}
        <div>
          <label
            htmlFor="email"
            className="block text-xs font-medium uppercase tracking-wide text-ink-muted"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-subtle"
            placeholder="avery@nexus.demo"
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="block text-xs font-medium uppercase tracking-wide text-ink-muted"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-subtle"
            placeholder="••••••••"
          />
        </div>

        {state.error && (
          <p
            role="alert"
            className="rounded-md border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger"
          >
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
        >
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <div className="border-t border-line pt-5">
        <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
          Demo accounts · password <code className="font-mono">{DEMO_PASSWORD}</code>
        </p>
        <ul className="mt-2 space-y-1">
          {DEMO_ACCOUNTS.map((account) => (
            <li key={account.email}>
              <button
                type="button"
                onClick={() => {
                  setEmail(account.email);
                  setPassword(DEMO_PASSWORD);
                }}
                className="flex w-full items-baseline justify-between gap-2 rounded-md px-2 py-1.5 text-left text-sm text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink"
              >
                <span className="font-medium capitalize text-ink">{account.role}</span>
                <span className="truncate font-mono text-xs">{account.email}</span>
              </button>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-ink-subtle">
          Pick an account to fill the form, then sign in. Every demo user shares
          the same password.
        </p>
      </div>
    </div>
  );
}
