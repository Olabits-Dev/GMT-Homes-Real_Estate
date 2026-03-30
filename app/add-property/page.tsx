import type { Metadata } from "next";
import { AddPropertyForm } from "@/components/add-property-form";

export const metadata: Metadata = {
  title: "Add Property",
  description:
    "Create a new local property listing with title, price, location, description, and simulated image upload.",
};

export default function AddPropertyPage() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-[2rem] border border-[color:var(--border)] bg-[linear-gradient(135deg,color-mix(in_oklab,var(--accent)_22%,transparent),color-mix(in_oklab,var(--accent-strong)_16%,transparent),var(--surface))] px-6 py-8 shadow-[var(--shadow-card)] sm:px-8 sm:py-10">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-[color:var(--muted)]">
          Listing workflow
        </p>
        <h1 className="mt-4 max-w-4xl font-display text-6xl leading-none text-[color:var(--foreground)]">
          Create a polished demo property listing in minutes.
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-[color:var(--muted)]">
          This form simulates a lightweight property submission flow. New
          entries are stored locally in the browser and become available on the
          listings page right away.
        </p>
      </section>

      <AddPropertyForm />
    </div>
  );
}

