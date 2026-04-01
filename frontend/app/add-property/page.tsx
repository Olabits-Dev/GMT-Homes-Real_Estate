import type { Metadata } from "next";
import { AddPropertyForm } from "@/components/add-property-form";
import { requirePublisher } from "@/lib/auth";
import { getCommunityPropertiesByOwner } from "@/lib/community-property-store";

export const metadata: Metadata = {
  title: "Add Property",
  description:
    "Create a new authenticated property listing with cloud image uploads and moderation-aware publishing.",
};

export default async function AddPropertyPage() {
  const user = await requirePublisher();
  const recentProperties = await getCommunityPropertiesByOwner(user.id);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-[2rem] border border-[color:var(--border)] bg-[linear-gradient(135deg,color-mix(in_oklab,var(--accent)_22%,transparent),color-mix(in_oklab,var(--accent-strong)_16%,transparent),var(--surface))] px-6 py-8 shadow-[var(--shadow-card)] sm:px-8 sm:py-10">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-[color:var(--muted)]">
          Listing workflow
        </p>
        <h1 className="mt-4 max-w-4xl font-display text-6xl leading-none text-[color:var(--foreground)]">
          Publish a polished property listing in minutes.
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-[color:var(--muted)]">
          You are signed in as {user.name}. New submissions now go through your
          authenticated GMT Homes account, upload real images to cloud storage,
          and enter the moderation flow before appearing publicly.
        </p>
      </section>

      <AddPropertyForm recentProperties={recentProperties} viewerName={user.name} />
    </div>
  );
}
