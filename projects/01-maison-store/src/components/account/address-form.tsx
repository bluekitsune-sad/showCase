"use client";

import Link from "next/link";
import { useActionState, type InputHTMLAttributes } from "react";
import {
  deleteAddress,
  type AddressState,
} from "@/app/account/addresses/actions";
import type { AddressValues } from "@/lib/addresses";

const initialAddressState: AddressState = {
  status: "idle",
  message: "",
  errors: {},
};

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  error?: string;
};

function Field({ id, label, error, ...input }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium text-ink-muted">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className="mt-2 w-full border border-line-control bg-surface px-3 py-2.5 text-sm text-ink transition-colors placeholder:text-ink-subtle focus:border-accent aria-invalid:border-sale"
        {...input}
      />
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-sale">
          {error}
        </p>
      ) : null}
    </div>
  );
}

type AddressFormProps = {
  action: (state: AddressState, formData: FormData) => Promise<AddressState>;
  values?: Partial<AddressValues>;
  addressId?: number;
  submitLabel: string;
  pendingLabel: string;
};

export function AddressForm({
  action,
  values,
  addressId,
  submitLabel,
  pendingLabel,
}: AddressFormProps) {
  const [state, formAction, pending] = useActionState(
    action,
    initialAddressState,
  );

  return (
    <form action={formAction} noValidate className="space-y-5">
      {addressId ? <input type="hidden" name="id" value={addressId} /> : null}

      {state.status === "error" && state.message ? (
        <p
          role="alert"
          className="border border-sale/40 bg-sale-soft px-4 py-3 text-sm text-sale"
        >
          {state.message}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          id="address-label"
          name="label"
          label="Label"
          placeholder="Home"
          defaultValue={values?.label}
          autoComplete="off"
          error={state.errors.label}
          required
        />
        <Field
          id="address-line1"
          name="line1"
          label="Street address"
          autoComplete="address-line1"
          defaultValue={values?.line1}
          error={state.errors.line1}
          required
        />
        <Field
          id="address-line2"
          name="line2"
          label="Apartment, suite or floor (optional)"
          autoComplete="address-line2"
          defaultValue={values?.line2}
          error={state.errors.line2}
        />
        <Field
          id="address-city"
          name="city"
          label="City"
          autoComplete="address-level2"
          defaultValue={values?.city}
          error={state.errors.city}
          required
        />
        <Field
          id="address-region"
          name="region"
          label="State, region or county"
          autoComplete="address-level1"
          defaultValue={values?.region}
          error={state.errors.region}
          required
        />
        <Field
          id="address-postal-code"
          name="postalCode"
          label="Postal code"
          autoComplete="postal-code"
          defaultValue={values?.postalCode}
          error={state.errors.postalCode}
          required
        />
        <Field
          id="address-country"
          name="country"
          label="Country"
          autoComplete="country-name"
          defaultValue={values?.country ?? "US"}
          error={state.errors.country}
          required
        />
      </div>

      <div className="flex items-start gap-3">
        <input
          id="address-default"
          name="isDefault"
          type="checkbox"
          defaultChecked={values?.isDefault}
          className="mt-0.5 h-4 w-4 border border-line-control accent-accent"
        />
        <label htmlFor="address-default" className="text-sm text-ink-muted">
          Use this as my default address
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? pendingLabel : submitLabel}
        </button>
        <Link
          href="/account/addresses"
          className="text-sm text-ink-muted underline decoration-line-strong underline-offset-4 hover:text-accent"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}

export function DeleteAddressForm({ id }: { id: number }) {
  return (
    <form
      action={deleteAddress}
      onSubmit={(event) => {
        if (!window.confirm("Delete this saved address?")) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="text-sm text-ink-muted underline decoration-line-strong underline-offset-4 hover:text-sale"
      >
        Delete
      </button>
    </form>
  );
}
