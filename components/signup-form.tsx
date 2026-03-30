"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signup } from "@/app/actions/auth";
import { FormSubmitButton } from "@/components/form-submit-button";
import type { AuthFormState } from "@/types/auth";

const initialState: AuthFormState = {};

type SignupFormProps = {
  nextPath: string;
};

export function SignupForm({ nextPath }: SignupFormProps) {
  const [state, formAction] = useActionState(signup, initialState);
  const loginHref = nextPath ? `/login?next=${encodeURIComponent(nextPath)}` : "/login";

  return (
    <form action={formAction} className="rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-6 shadow-[var(--shadow-card)] sm:p-8">
      <input type="hidden" name="next" value={nextPath} />

      <div>
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-[color:var(--muted)]">
          Create your account
        </p>
        <h2 className="mt-3 font-display text-4xl text-[color:var(--foreground)]">
          Start publishing with GMT Homes.
        </h2>
        <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">
          Set up a simple account so your property submissions, dashboard, and
          listing workflow stay tied to you.
        </p>
      </div>

      <div className="mt-8 space-y-5">
        <label className="block space-y-2">
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--muted)]">
            Full name
          </span>
          <input
            name="name"
            autoComplete="name"
            placeholder="Grace Olanrewaju"
            className="w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--background)] px-4 py-3 text-sm text-[color:var(--foreground)] outline-none transition focus:border-[color:var(--accent)]"
          />
          {state.errors?.name ? (
            <p className="text-sm text-[color:#b42318]">{state.errors.name[0]}</p>
          ) : null}
        </label>

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

        <label className="block space-y-2">
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--muted)]">
            Password
          </span>
          <input
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            className="w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--background)] px-4 py-3 text-sm text-[color:var(--foreground)] outline-none transition focus:border-[color:var(--accent)]"
          />
          {state.errors?.password ? (
            <div className="text-sm text-[color:#b42318]">
              {state.errors.password.map((error) => (
                <p key={error}>{error}</p>
              ))}
            </div>
          ) : null}
        </label>

        <label className="block space-y-2">
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--muted)]">
            Confirm password
          </span>
          <input
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="Re-enter your password"
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

      <div className="mt-8 space-y-4">
        <FormSubmitButton
          pendingLabel="Creating your account..."
          className="inline-flex w-full items-center justify-center rounded-full bg-[color:var(--accent-strong)] px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Create account
        </FormSubmitButton>
        <p className="text-sm text-[color:var(--muted)]">
          Already have an account?{" "}
          <Link href={loginHref} className="font-semibold text-[color:var(--accent)]">
            Sign in
          </Link>
        </p>
      </div>
    </form>
  );
}
