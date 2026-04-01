"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestPasswordReset } from "@/app/actions/auth";
import { FormSubmitButton } from "@/components/form-submit-button";
import type { ForgotPasswordFormState } from "@/types/auth";

const initialState: ForgotPasswordFormState = {};

export function ForgotPasswordForm() {
  const [state, formAction] = useActionState(requestPasswordReset, initialState);

  return (
    <form
      action={formAction}
      className="rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-6 shadow-[var(--shadow-card)] sm:p-8"
    >
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-[color:var(--muted)]">
          Forgot password
        </p>
        <h2 className="mt-3 font-display text-4xl text-[color:var(--foreground)]">
          Request a secure password reset link.
        </h2>
        <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">
          Enter the email tied to your GMT Homes account and we&apos;ll prepare a
          one-time password reset path for you.
        </p>
      </div>

      <div className="mt-8 space-y-5">
        <label className="block space-y-2">
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--muted)]">
            Email address
          </span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            placeholder="name@example.com"
            className="w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--background)] px-4 py-3 text-sm text-[color:var(--foreground)] outline-none transition focus:border-[color:var(--accent)]"
          />
          {state.errors?.email ? (
            <p className="text-sm text-[color:#b42318]">{state.errors.email[0]}</p>
          ) : null}
        </label>
      </div>

      {state.message ? (
        <div className="mt-6 rounded-[1.5rem] border border-[color:color-mix(in_oklab,#b42318_24%,transparent)] bg-[color:color-mix(in_oklab,#b42318_10%,transparent)] px-4 py-4 text-sm text-[color:#b42318]">
          {state.message}
        </div>
      ) : null}

      {state.successMessage ? (
        <div className="mt-6 rounded-[1.5rem] border border-[color:color-mix(in_oklab,#027a48_24%,transparent)] bg-[color:color-mix(in_oklab,#027a48_10%,transparent)] px-4 py-4 text-sm text-[color:#027a48]">
          <p>{state.successMessage}</p>
          {state.resetLink ? (
            <p className="mt-3 break-all">
              Local reset link:{" "}
              <Link href={state.resetLink} className="font-semibold underline">
                {state.resetLink}
              </Link>
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="mt-8 space-y-4">
        <FormSubmitButton
          pendingLabel="Preparing reset link..."
          className="inline-flex w-full items-center justify-center rounded-full bg-[color:var(--accent-strong)] px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Send reset instructions
        </FormSubmitButton>
        <Link
          href="/login"
          className="inline-flex w-full items-center justify-center rounded-full border border-[color:var(--border)] px-6 py-3 text-sm font-semibold text-[color:var(--foreground)] transition hover:-translate-y-0.5"
        >
          Back to sign in
        </Link>
      </div>
    </form>
  );
}
