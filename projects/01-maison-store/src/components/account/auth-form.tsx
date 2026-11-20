"use client";

import Link from "next/link";
import { useActionState, type InputHTMLAttributes } from "react";
import { signIn, signUp, type AuthState } from "@/app/account/actions";

const initialAuthState: AuthState = {
  status: "idle",
  message: "",
  errors: {},
};

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  error?: string;
  hint?: string;
};

function Field({ id, label, error, hint, ...input }: FieldProps) {
  return (
    <div>
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

function FormMessage({ state }: { state: AuthState }) {
  if (state.status !== "error") {
    return null;
  }

  return (
    <p
      role="alert"
      className="border border-sale/40 bg-sale-soft px-4 py-3 text-sm text-sale"
    >
      {state.message}
    </p>
  );
}

export function SignInForm() {
  const [state, action, pending] = useActionState(signIn, initialAuthState);

  return (
    <form action={action} noValidate className="space-y-5">
      <FormMessage state={state} />
      <Field
        id="sign-in-email"
        name="email"
        type="email"
        label="Email"
        autoComplete="email"
        placeholder="you@example.com"
        error={state.errors.email}
        required
      />
      <Field
        id="sign-in-password"
        name="password"
        type="password"
        label="Password"
        autoComplete="current-password"
        error={state.errors.password}
        required
      />
      <button
        type="submit"
        disabled={pending}
        className="btn btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
      <p className="text-center text-sm text-ink-muted">
        New to Maison?{" "}
        <Link
          href="/account/register"
          className="text-ink underline decoration-line-strong underline-offset-4 hover:text-accent"
        >
          Create an account
        </Link>
      </p>
    </form>
  );
}

export function SignUpForm() {
  const [state, action, pending] = useActionState(signUp, initialAuthState);

  return (
    <form action={action} noValidate className="space-y-5">
      <FormMessage state={state} />
      <Field
        id="register-name"
        name="name"
        type="text"
        label="Name"
        autoComplete="name"
        placeholder="Ada Winters"
        error={state.errors.name}
        required
      />
      <Field
        id="register-email"
        name="email"
        type="email"
        label="Email"
        autoComplete="email"
        placeholder="you@example.com"
        error={state.errors.email}
        required
      />
      <Field
        id="register-password"
        name="password"
        type="password"
        label="Password"
        autoComplete="new-password"
        hint="At least 8 characters."
        error={state.errors.password}
        required
      />
      <Field
        id="register-password-confirmation"
        name="passwordConfirmation"
        type="password"
        label="Confirm password"
        autoComplete="new-password"
        error={state.errors.passwordConfirmation}
        required
      />
      <button
        type="submit"
        disabled={pending}
        className="btn btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "Creating account…" : "Create account"}
      </button>
      <p className="text-center text-sm text-ink-muted">
        Already have an account?{" "}
        <Link
          href="/account/sign-in"
          className="text-ink underline decoration-line-strong underline-offset-4 hover:text-accent"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
