"use client";

import Link from "next/link";
import { useActionState } from "react";
import { completePasswordReset } from "@/app/actions/auth";
import { FormSubmitButton } from "@/components/form-submit-button";
import type { PasswordResetFormState } from "@/types/auth";

const initialState: PasswordResetFormState = {};

type ResetPasswordTokenFormProps = {
  token: string;
};

export function ResetPasswordTokenForm({
  token,
}: ResetPasswordTokenFormProps) {
  const [state, formAction] = useActionState(completePasswordReset, initialState);

  return (
    <form
      action={formAction}
      className="rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-6 shadow-[var(--shadow-card)] sm:p-8"
    >
      <input type="hidden" name="token" value={token} />

      <div>
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-[color:var(--muted)]">
          Choose a new password
        </p>
        <h2 className="mt-3 font-display text-4xl text-[color:var(--foreground)]">
          Set a fresh password for your account.
        </h2>
        <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">
          This link is single-use and time-limited, so your reset stays tied to
          this recovery request only.
        </p>
      </div>

      <div className="mt-8 space-y-5">
        <label className="block space-y-2">
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--muted)]">
            New password
          </span>
          <input
            name="newPassword"
            type="password"
            autoComplete="new-password"
            placeholder="Use at least 8 characters"
            className="w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--background)] px-4 py-3 text-sm text-[color:var(--foreground)] outline-none transition focus:border-[color:var(--accent)]"
          />
          {state.errors?.newPassword ? (
            <div className="text-sm text-[color:#b42318]">
              {state.errors.newPassword.map((error) => (
                <p key={error}>{error}</p>
              ))}
            </div>
          ) : null}
        </label>

        <label className="block space-y-2">
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--muted)]">
            Confirm new password
          </span>
          <input
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="Re-enter your new password"
            className="w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--background)] px-4 py-3 text-sm text-[color:var(--foreground)] outline-none transition focus:border-[color:var(--accent)]"
          />
          {state.errors?.confirmPassword ? (
            <p className="text-sm text-[color:#b42318]">
              {state.errors.confirmPassword[0]}
            </p>
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
          {state.successMessage}
        </div>
      ) : null}

      <div className="mt-8 space-y-4">
        <FormSubmitButton
          pendingLabel="Saving new password..."
          className="inline-flex w-full items-center justify-center rounded-full bg-[color:var(--accent-strong)] px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Save and finish reset
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
