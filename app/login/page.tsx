import type { Metadata } from "next";
import { LoginForm } from "@/components/login-form";
import { getSafeRedirectPath } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Access your GMT Homes dashboard and listing workflow.",
};

type LoginPageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = await searchParams;
  const nextPath = getSafeRedirectPath(resolvedSearchParams.next);

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
      <section className="rounded-[2rem] border border-[color:var(--border)] bg-[linear-gradient(135deg,color-mix(in_oklab,var(--accent)_24%,transparent),color-mix(in_oklab,var(--accent-strong)_16%,transparent),var(--surface))] px-6 py-8 shadow-[var(--shadow-card)] sm:px-8 sm:py-10">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-[color:var(--muted)]">
          Account access
        </p>
        <h1 className="mt-4 max-w-3xl font-display text-6xl leading-none text-[color:var(--foreground)]">
          Sign in and pick up your listing workflow where you left off.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-8 text-[color:var(--muted)]">
          GMT Homes keeps browsing public, but publishing and dashboard access
          now happen behind your account so every submission has a clear owner.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="app-detail-card app-detail-card--sky px-5 py-5">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[color:var(--muted)]">
              Publish securely
            </p>
            <p className="mt-3 text-sm leading-7 text-[color:var(--foreground)]">
              Create community listings with a real session behind each
              submission instead of browser-only storage.
            </p>
          </div>
          <div className="app-detail-card app-detail-card--mint px-5 py-5">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[color:var(--muted)]">
              Manage everything
            </p>
            <p className="mt-3 text-sm leading-7 text-[color:var(--foreground)]">
              Return to your dashboard to review recent properties and keep your
              publishing flow organized.
            </p>
          </div>
        </div>
      </section>

      <LoginForm nextPath={nextPath} />
    </div>
  );
}
