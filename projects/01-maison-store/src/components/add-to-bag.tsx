"use client";

import Link from "next/link";
import { useActionState } from "react";
import { addToCart, type AddToBagState } from "@/app/cart/actions";

const initialState: AddToBagState = { status: "idle", message: "" };

export function AddToBag({
  variantId,
  soldOut,
}: {
  variantId: number;
  soldOut: boolean;
}) {
  const [state, formAction, pending] = useActionState(addToCart, initialState);

  return (
    <div>
      <form action={formAction}>
        <input type="hidden" name="variantId" value={variantId} />
        <input type="hidden" name="quantity" value={1} />
        <button
          type="submit"
          disabled={pending || soldOut}
          className="btn btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Adding…" : soldOut ? "Sold out" : "Add to bag"}
        </button>
      </form>
      <p
        role="status"
        aria-live="polite"
        className={`mt-3 min-h-5 text-xs leading-relaxed ${
          state.status === "error" ? "text-sale" : "text-ink-subtle"
        }`}
      >
        {state.message ||
          "Made in short runs. Complimentary delivery and returns within 30 days."}
      </p>
      {state.status === "success" ? (
        <Link
          href="/cart"
          className="mt-2 inline-block text-sm text-ink underline decoration-line-strong underline-offset-4 hover:text-accent"
        >
          View bag
        </Link>
      ) : null}
    </div>
  );
}
