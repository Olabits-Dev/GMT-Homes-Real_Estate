import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/forgot-password-form";
import { canSendPasswordResetEmails } from "@/lib/mailer";

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Request a secure GMT Homes password reset link.",
};

export default function ForgotPasswordPage() {
  const emailDeliveryEnabled = canSendPasswordResetEmails();
  const showDeliveryNotice =
    process.env.NODE_ENV === "production" && !emailDeliveryEnabled;

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
      <section className="rounded-[2rem] border border-[color:var(--border)] bg-[linear-gradient(135deg,color-mix(in_oklab,var(--accent)_24%,transparent),color-mix(in_oklab,var(--accent-strong)_16%,transparent),var(--surface))] px-6 py-8 shadow-[var(--shadow-card)] sm:px-8 sm:py-10">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-[color:var(--muted)]">
          Recovery flow
        </p>
        <h1 className="mt-4 max-w-3xl font-display text-6xl leading-none text-[color:var(--foreground)]">
          Recover access without changing the rest of your workflow.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-8 text-[color:var(--muted)]">
          GMT Homes can prepare a one-time reset path so you can create a new
          password and return to your dashboard securely.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="app-detail-card app-detail-card--sky px-5 py-5">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[color:var(--muted)]">
              One-time recovery token
            </p>
            <p className="mt-3 text-sm leading-7 text-[color:var(--foreground)]">
              Every reset link is generated per request, expires automatically,
              and becomes invalid after the password is changed.
            </p>
          </div>
          <div className="app-detail-card app-detail-card--mint px-5 py-5">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[color:var(--muted)]">
              Existing account stays intact
            </p>
            <p className="mt-3 text-sm leading-7 text-[color:var(--foreground)]">
              Your listings, dashboard data, and saved property experience stay
              exactly where they are after the password update.
            </p>
          </div>
        </div>

        {showDeliveryNotice ? (
          <div className="mt-8 rounded-[1.5rem] border border-[color:color-mix(in_oklab,#b42318_24%,transparent)] bg-[color:color-mix(in_oklab,#b42318_10%,transparent)] px-5 py-4 text-sm text-[color:#b42318]">
            Password reset emails are not configured on this deployment yet.
            Once SMTP is added to the environment, this page will deliver secure
            reset links automatically.
          </div>
        ) : null}
      </section>

      <ForgotPasswordForm />
    </div>
  );
}
