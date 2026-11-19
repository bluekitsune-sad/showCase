"use client";

import Link from "next/link";
import { useActionState, type InputHTMLAttributes } from "react";
import {
  applyDiscountCode,
  initialDiscountState,
  placeOrder,
  type CheckoutState,
} from "@/app/checkout/actions";
import { formatPrice, toneGradient } from "@/lib/format";

export type CheckoutLine = {
  id: number;
  name: string;
  slug: string;
  colour: string;
  size: string;
  quantity: number;
  price: number;
  currency: string;
};

const initialCheckoutState: CheckoutState = {
  status: "idle",
  message: "",
  errors: {},
};

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  fieldClassName?: string;
};

function Field({
  id,
  label,
  error,
  hint,
  fieldClassName,
  ...input
}: FieldProps) {
  return (
    <div className={fieldClassName}>
      <label htmlFor={id} className="block text-xs font-medium text-ink-muted">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={
          error ? `${id}-error` : hint ? `${id}-hint` : undefined
        }
        className="mt-2 w-full border border-line-strong bg-surface px-3 py-2.5 text-sm text-ink transition-colors placeholder:text-ink-subtle focus:border-accent"
        {...input}
      />
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-sale">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-ink-subtle">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function CheckoutForm({
  lines,
  subtotal,
  shipping,
  currency,
  count,
}: {
  lines: CheckoutLine[];
  subtotal: number;
  shipping: number;
  currency: string;
  count: number;
}) {
  const [orderState, orderAction, orderPending] = useActionState(
    placeOrder,
    initialCheckoutState,
  );
  const [discountState, discountAction, discountPending] = useActionState(
    applyDiscountCode,
    initialDiscountState,
  );

  const errors = orderState.errors;
  const discountAmount =
    discountState.status === "applied" ? discountState.amount : 0;
  const appliedCode = discountState.status === "applied" ? discountState.code : "";
  const total = Math.max(subtotal - discountAmount + shipping, 0);

  return (
    <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-14">
      <form action={orderAction} noValidate className="space-y-10">
        <input type="hidden" name="discountCode" value={appliedCode} />

        <fieldset>
          <legend className="font-display text-2xl text-ink">Contact</legend>
          <p className="mt-2 text-sm text-ink-muted">
            Order updates go to this address. The demo keeps it in a local
            database only.
          </p>
          <div className="mt-5">
            <Field
              id="email"
              name="email"
              type="email"
              label="Email address"
              autoComplete="email"
              inputMode="email"
              required
              error={errors.email}
            />
          </div>
        </fieldset>

        <fieldset>
          <legend className="font-display text-2xl text-ink">
            Shipping address
          </legend>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field
              id="name"
              name="name"
              label="Full name"
              autoComplete="name"
              required
              error={errors.name}
              fieldClassName="sm:col-span-2"
            />
            <Field
              id="line1"
              name="line1"
              label="Street address"
              autoComplete="address-line1"
              required
              error={errors.line1}
              fieldClassName="sm:col-span-2"
            />
            <Field
              id="line2"
              name="line2"
              label="Apartment, suite or floor (optional)"
              autoComplete="address-line2"
              error={errors.line2}
              fieldClassName="sm:col-span-2"
            />
            <Field
              id="city"
              name="city"
              label="City"
              autoComplete="address-level2"
              required
              error={errors.city}
            />
            <Field
              id="region"
              name="region"
              label="State, region or county"
              autoComplete="address-level1"
              required
              error={errors.region}
            />
            <Field
              id="postalCode"
              name="postalCode"
              label="Postal code"
              autoComplete="postal-code"
              required
              error={errors.postalCode}
            />
            <Field
              id="country"
              name="country"
              label="Country"
              autoComplete="country-name"
              defaultValue="US"
              required
              error={errors.country}
            />
          </div>
        </fieldset>

        <fieldset>
          <legend className="font-display text-2xl text-ink">Payment</legend>
          <p className="mt-2 text-sm text-ink-muted">
            This is a mock payment step. Nothing is charged, and card details
            are never stored.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field
              id="cardName"
              name="cardName"
              label="Name on card"
              autoComplete="cc-name"
              required
              error={errors.cardName}
              fieldClassName="sm:col-span-2"
            />
            <Field
              id="cardNumber"
              name="cardNumber"
              label="Card number"
              autoComplete="cc-number"
              inputMode="numeric"
              placeholder="4242 4242 4242 4242"
              required
              error={errors.cardNumber}
              hint="Any 13–19 digits work."
              fieldClassName="sm:col-span-2"
            />
            <Field
              id="expiry"
              name="expiry"
              label="Expiry (MM/YY)"
              autoComplete="cc-exp"
              inputMode="numeric"
              placeholder="12/30"
              required
              error={errors.expiry}
            />
            <Field
              id="cvc"
              name="cvc"
              label="Security code"
              autoComplete="cc-csc"
              inputMode="numeric"
              placeholder="123"
              required
              error={errors.cvc}
            />
          </div>
        </fieldset>

        {orderState.status === "error" ? (
          <p
            role="alert"
            className="border border-sale/40 bg-sale-soft px-4 py-3 text-sm text-sale"
          >
            {orderState.message}
          </p>
        ) : null}

        <div>
          <button
            type="submit"
            disabled={orderPending}
            className="btn btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
          >
            {orderPending ? "Placing order…" : "Place order"}
          </button>
          <p className="mt-3 text-center text-xs text-ink-subtle">
            No card is charged. The order is written to the demo database and
            your bag is cleared.
          </p>
        </div>
      </form>

      <aside
        aria-label="Order summary"
        className="h-fit border border-line bg-surface p-6 lg:sticky lg:top-24"
      >
        <h2 className="font-display text-xl text-ink">Order summary</h2>
        <ul className="mt-5 space-y-4">
          {lines.map((line) => (
            <li key={line.id} className="flex gap-3">
              <div
                aria-hidden="true"
                className="h-16 w-14 shrink-0 rounded-sm"
                style={{ background: toneGradient(line.slug) }}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-ink">{line.name}</p>
                <p className="text-xs text-ink-muted">
                  {line.colour} / {line.size} · Qty {line.quantity}
                </p>
              </div>
              <p className="text-sm text-ink">
                {formatPrice(line.price * line.quantity, line.currency)}
              </p>
            </li>
          ))}
        </ul>

        <dl className="mt-5 space-y-3 border-t border-line pt-5 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-ink-muted">
              Subtotal ({count} {count === 1 ? "piece" : "pieces"})
            </dt>
            <dd className="text-ink">{formatPrice(subtotal, currency)}</dd>
          </div>
          {discountAmount > 0 ? (
            <div className="flex justify-between gap-4">
              <dt className="text-ink-muted">Discount ({appliedCode})</dt>
              <dd className="text-accent">
                −{formatPrice(discountAmount, currency)}
              </dd>
            </div>
          ) : null}
          <div className="flex justify-between gap-4">
            <dt className="text-ink-muted">Delivery</dt>
            <dd className="text-ink">
              {shipping === 0 ? "Complimentary" : formatPrice(shipping, currency)}
            </dd>
          </div>
        </dl>
        <div className="mt-4 flex justify-between border-t border-line pt-4 text-base">
          <span className="text-ink">Total</span>
          <span className="text-ink">{formatPrice(total, currency)}</span>
        </div>

        <form action={discountAction} className="mt-6 border-t border-line pt-5">
          <label
            htmlFor="discountCode"
            className="block text-xs font-medium text-ink-muted"
          >
            Discount code
          </label>
          <div className="mt-2 flex gap-2">
            <input
              id="discountCode"
              name="code"
              defaultValue={appliedCode}
              placeholder="WELCOME10"
              className="min-w-0 flex-1 border border-line-strong bg-surface px-3 py-2 text-sm uppercase tracking-wide text-ink placeholder:normal-case placeholder:tracking-normal placeholder:text-ink-subtle focus:border-accent"
            />
            <button
              type="submit"
              disabled={discountPending}
              className="btn btn-ghost px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {discountPending ? "Checking…" : "Apply"}
            </button>
          </div>
          {discountState.status === "applied" ? (
            <button
              type="submit"
              name="intent"
              value="clear"
              className="mt-2 text-xs text-ink-muted underline decoration-line-strong underline-offset-4 hover:text-accent"
            >
              Remove code
            </button>
          ) : null}
          <p
            role="status"
            aria-live="polite"
            className={`mt-2 min-h-4 text-xs leading-relaxed ${
              discountState.status === "error" ? "text-sale" : "text-ink-subtle"
            }`}
          >
            {discountState.message || "Demo codes: WELCOME10, ATELIER25."}
          </p>
        </form>

        <Link
          href="/cart"
          className="mt-5 inline-block text-sm text-ink underline decoration-line-strong underline-offset-4 hover:text-accent"
        >
          Edit bag
        </Link>
      </aside>
    </div>
  );
}
