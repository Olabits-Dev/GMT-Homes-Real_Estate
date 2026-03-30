import type { Metadata } from "next";
import { SignupForm } from "@/components/signup-form";
import { getSafeRedirectPath } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create a GMT Homes account to publish and manage property listings.",
};

type SignupPageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const resolvedSearchParams = await searchParams;
  const nextPath = getSafeRedirectPath(resolvedSearchParams.next);

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
      <section className="rounded-[2rem] border border-[color:var(--border)] bg-[linear-gradient(135deg,color-mix(in_oklab,var(--accent)_24%,transparent),color-mix(in_oklab,var(--accent-strong)_16%,transparent),var(--surface))] px-6 py-8 shadow-[var(--shadow-card)] sm:px-8 sm:py-10">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-[color:var(--muted)]">
          Publisher setup
        </p>
        <h1 className="mt-4 max-w-3xl font-display text-6xl leading-none text-[color:var(--foreground)]">
          Create an account and start publishing with confidence.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-8 text-[color:var(--muted)]">
          This flow gives GMT Homes a more realistic real-estate workflow:
          signed-in contributors can publish listings, revisit a dashboard, and
          keep new submissions tied to their account.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="app-detail-card app-detail-card--blue px-5 py-5">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[color:var(--muted)]">
              Account-backed listings
            </p>
            <p className="mt-3 text-sm leading-7 text-[color:var(--foreground)]">
              Every property submission is linked to a real dashboard owner.
            </p>
          </div>
          <div className="app-detail-card app-detail-card--violet px-5 py-5">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[color:var(--muted)]">
              Public browsing stays open
            </p>
            <p className="mt-3 text-sm leading-7 text-[color:var(--foreground)]">
              Visitors can still explore the catalog freely while management
              actions stay protected.
            </p>
          </div>
        </div>
      </section>

      <SignupForm nextPath={nextPath} />
    </div>
  );
}
