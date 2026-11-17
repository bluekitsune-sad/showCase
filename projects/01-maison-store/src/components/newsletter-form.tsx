"use client";

import { useActionState } from "react";
import {
  initialNewsletterState,
  subscribeToNewsletter,
} from "@/app/newsletter/actions";

export function NewsletterForm() {
  const [state, formAction, pending] = useActionState(
    subscribeToNewsletter,
    initialNewsletterState,
  );

  return (
    <form action={formAction} noValidate className="mt-7">
      <label
        htmlFor="newsletter-email"
        className="text-xs uppercase tracking-[0.14em] text-surface/70"
      >
        Email address
      </label>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <input
          id="newsletter-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          aria-describedby="newsletter-note newsletter-status"
          disabled={pending}
          className="min-h-11 w-full rounded-sm border border-surface/40 bg-surface px-3 text-sm text-ink placeholder:text-ink-subtle focus-visible:outline-surface disabled:opacity-70"
        />
        <button
          type="submit"
          disabled={pending}
          className="btn shrink-0 border-surface/60 bg-surface text-ink hover:bg-surface-sunken disabled:opacity-70"
        >
          {pending ? "Joining…" : "Join the list"}
        </button>
      </div>
      <p id="newsletter-note" className="mt-3 max-w-md text-xs leading-relaxed text-surface/70">
        One letter a month: new cloth, restocks and notes from the studio. No
        sales, and you can leave whenever you like.
      </p>
      <p
        id="newsletter-status"
        role="status"
        aria-live="polite"
        className={`mt-3 min-h-5 text-sm ${
          state.status === "error" ? "text-sale-soft" : "text-surface"
        }`}
      >
        {state.message}
      </p>
    </form>
  );
}
