"use client";

import Link from "next/link";
import { useActionState } from "react";
import { toggleWishlist, type WishlistState } from "@/app/wishlist/actions";

type WishlistButtonProps = {
  productId: number;
  productName: string;
  saved: boolean;
  signedIn: boolean;
};

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path
        d="M12 20s-7-4.35-7-9.5A4 4 0 0 1 12 7a4 4 0 0 1 7 3.5C19 15.65 12 20 12 20Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function WishlistButton({
  productId,
  productName,
  saved,
  signedIn,
}: WishlistButtonProps) {
  const initialState: WishlistState = {
    status: "idle",
    message: "",
    saved,
  };
  const [state, formAction, pending] = useActionState(
    toggleWishlist,
    initialState,
  );

  if (!signedIn) {
    return (
      <div className="mt-8">
        <Link
          href="/account/sign-in"
          className="inline-flex items-center gap-2 text-sm text-ink underline decoration-line-strong underline-offset-4 hover:text-accent"
        >
          <HeartIcon filled={false} />
          Sign in to save this piece
        </Link>
        <p className="mt-2 text-xs text-ink-subtle">
          Your wishlist follows you between visits and stays private to your
          account.
        </p>
      </div>
    );
  }

  const isSaved = state.saved;

  return (
    <div className="mt-8">
      <form action={formAction}>
        <input type="hidden" name="productId" value={productId} />
        <button
          type="submit"
          disabled={pending}
          aria-pressed={isSaved}
          className={`inline-flex items-center gap-2 rounded-sm border px-4 py-2.5 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
            isSaved
              ? "border-accent bg-accent-soft text-accent-ink"
              : "border-line-strong text-ink hover:border-ink"
          }`}
        >
          <HeartIcon filled={isSaved} />
          {pending
            ? "Saving…"
            : isSaved
              ? "Saved to wishlist"
              : "Save to wishlist"}
        </button>
      </form>
      <p
        role="status"
        aria-live="polite"
        className={`mt-2 min-h-5 text-xs leading-relaxed ${
          state.status === "error" ? "text-sale" : "text-ink-subtle"
        }`}
      >
        {state.message ||
          `${productName} can be kept on your wishlist for later.`}
      </p>
    </div>
  );
}
