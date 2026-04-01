"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import {
  getCommunityPropertiesServerSnapshot,
  readCommunityProperties,
  subscribeToCommunityProperties,
} from "@/lib/browser-storage";
import type { Property } from "@/types/property";
import { PropertyDetailView } from "@/components/property-detail-view";

type PropertyDetailResolverProps = {
  slug: string;
  initialProperty: Property | null;
};

export function PropertyDetailResolver({
  slug,
  initialProperty,
}: PropertyDetailResolverProps) {
  const communityProperties = useSyncExternalStore(
    subscribeToCommunityProperties,
    readCommunityProperties,
    getCommunityPropertiesServerSnapshot,
  );
  const property =
    initialProperty ??
    communityProperties.find((item) => item.slug === slug) ??
    null;

  if (property) {
    return <PropertyDetailView property={property} viewer={null} />;
  }

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-3xl items-center justify-center px-4 py-16 text-center sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--surface)] px-8 py-12 shadow-[var(--shadow-card)]">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-[color:var(--muted)]">
          Property not found
        </p>
        <h1 className="mt-4 font-display text-5xl text-[color:var(--foreground)]">
          This listing is no longer available.
        </h1>
        <p className="mt-4 text-base leading-8 text-[color:var(--muted)]">
          The property may have been removed, or the link may be incorrect.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/properties"
            className="inline-flex items-center justify-center rounded-full bg-[color:var(--accent-strong)] px-5 py-3 text-sm font-semibold text-white"
          >
            Browse listings
          </Link>
          <Link
            href="/add-property"
            className="inline-flex items-center justify-center rounded-full border border-[color:var(--border)] px-5 py-3 text-sm font-semibold text-[color:var(--foreground)]"
          >
            Add a property
          </Link>
        </div>
      </div>
    </div>
  );
}
