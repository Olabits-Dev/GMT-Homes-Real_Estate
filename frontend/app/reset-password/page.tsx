import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/reset-password-form";
import { ResetPasswordTokenForm } from "@/components/reset-password-token-form";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Update your GMT Homes account password securely.",
};

type ResetPasswordPageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const resolvedSearchParams = await searchParams;
  const token = String(resolvedSearchParams.token ?? "").trim();

  if (token) {
    return (
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
        <section className="rounded-[2rem] border border-[color:var(--border)] bg-[linear-gradient(135deg,color-mix(in_oklab,var(--accent)_24%,transparent),color-mix(in_oklab,var(--accent-strong)_16%,transparent),var(--surface))] px-6 py-8 shadow-[var(--shadow-card)] sm:px-8 sm:py-10">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[color:var(--muted)]">
            Recovery confirmation
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-6xl leading-none text-[color:var(--foreground)]">
            Finish your password reset with a fresh password.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-[color:var(--muted)]">
            This recovery step keeps the rest of your GMT Homes account intact
            while replacing the old sign-in password behind it.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="app-detail-card app-detail-card--sky px-5 py-5">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[color:var(--muted)]">
                Token-protected step
              </p>
              <p className="mt-3 text-sm leading-7 text-[color:var(--foreground)]">
                Only the issued reset link can complete this recovery flow, and
                it expires automatically after a short period.
              </p>
            </div>
            <div className="app-detail-card app-detail-card--mint px-5 py-5">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[color:var(--muted)]">
                Ready to sign back in
              </p>
              <p className="mt-3 text-sm leading-7 text-[color:var(--foreground)]">
                Once saved, your new password works immediately with the normal
                sign-in page and the rest of the workflow stays unchanged.
              </p>
            </div>
          </div>
        </section>

        <ResetPasswordTokenForm token={token} />
      </div>
    );
  }

  const user = await requireUser();

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
      <section className="rounded-[2rem] border border-[color:var(--border)] bg-[linear-gradient(135deg,color-mix(in_oklab,var(--accent)_24%,transparent),color-mix(in_oklab,var(--accent-strong)_16%,transparent),var(--surface))] px-6 py-8 shadow-[var(--shadow-card)] sm:px-8 sm:py-10">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-[color:var(--muted)]">
          Account security
        </p>
        <h1 className="mt-4 max-w-3xl font-display text-6xl leading-none text-[color:var(--foreground)]">
          Reset the password behind your GMT Homes account.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-8 text-[color:var(--muted)]">
          You are signed in as {user.name}. Confirm your current password to
          keep your dashboard and publishing workflow protected.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="app-detail-card app-detail-card--sky px-5 py-5">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[color:var(--muted)]">
              Keep account access tight
            </p>
            <p className="mt-3 text-sm leading-7 text-[color:var(--foreground)]">
              Your session stays active, but future sign-ins will require the
              new password immediately.
            </p>
          </div>
          <div className="app-detail-card app-detail-card--mint px-5 py-5">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[color:var(--muted)]">
              No workflow disruption
            </p>
            <p className="mt-3 text-sm leading-7 text-[color:var(--foreground)]">
              Listings, dashboard access, and saved properties stay exactly as
              they are while your credentials are updated.
            </p>
          </div>
        </div>
      </section>

      <ResetPasswordForm />
    </div>
  );
}
