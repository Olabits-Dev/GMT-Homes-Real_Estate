"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FavoriteButton } from "@/components/favorite-button";
import { ImageLightbox } from "@/components/image-lightbox";
import { formatNumber, formatPrice } from "@/lib/property-utils";
import type { Property } from "@/types/property";

type PropertyCardProps = {
  property: Property;
  viewMode?: "grid" | "list";
};

export function PropertyCard({
  property,
  viewMode = "grid",
}: PropertyCardProps) {
  const listView = viewMode === "list";
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  return (
    <>
      <article
        className={`group overflow-hidden rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--surface)] shadow-[var(--shadow-card)] transition hover:-translate-y-1 hover:shadow-[var(--shadow-soft)] ${listView ? "grid gap-0 lg:grid-cols-[1.05fr_1.2fr]" : ""}`}
      >
        <div className="relative">
          <div className={`relative overflow-hidden ${listView ? "h-full min-h-72" : "aspect-[4/3]"}`}>
            <button
              type="button"
              onClick={() => {
                setActiveIndex(0);
                setIsLightboxOpen(true);
              }}
              className="group/image relative h-full w-full cursor-zoom-in text-left"
              aria-label={`Open ${property.title} gallery in full view`}
            >
              <Image
                src={property.gallery[0]}
                alt={property.title}
                fill
                className="object-cover transition duration-500 group-hover:scale-105 group-hover/image:scale-[1.02]"
                sizes={listView ? "(min-width: 1024px) 40vw, 100vw" : "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"}
              />
              <span className="pointer-events-none absolute bottom-4 right-4 rounded-full bg-[color:color-mix(in_oklab,var(--accent-strong)_84%,black_16%)] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white">
                View full image
              </span>
            </button>
          </div>
          <div className="absolute left-5 top-5 z-10 flex flex-wrap gap-2">
            <span className="rounded-full border border-white/40 bg-[color:color-mix(in_oklab,white_84%,var(--accent)_16%)] px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--accent-strong)] shadow-sm">
              {property.status}
            </span>
            <span className="rounded-full bg-[color:color-mix(in_oklab,var(--accent-strong)_78%,black_8%)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white">
              {property.type}
            </span>
          </div>
          <FavoriteButton slug={property.slug} className="absolute right-5 top-5 z-10" />
        </div>

        <div className="flex flex-col gap-6 p-6 sm:p-7">
          <div className="space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-[color:var(--muted)]">
                  {property.city}, {property.state}
                </p>
                <h3 className="mt-2 font-display text-3xl leading-none text-[color:var(--foreground)]">
                  <Link href={`/properties/${property.slug}`}>{property.title}</Link>
                </h3>
              </div>
              <p className="text-lg font-black text-[color:var(--accent)]">
                {formatPrice(property.price, property.billingPeriod)}
              </p>
            </div>

            <p className="text-sm leading-7 text-[color:var(--muted)]">
              {property.location}
            </p>
            <p className="text-sm leading-7 text-[color:var(--muted)]">
              {property.shortDescription}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl bg-[color:var(--surface-strong)] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted)]">
                Beds
              </p>
              <p className="mt-2 text-xl font-bold text-[color:var(--foreground)]">
                {property.bedrooms}
              </p>
            </div>
            <div className="rounded-2xl bg-[color:var(--surface-strong)] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted)]">
                Baths
              </p>
              <p className="mt-2 text-xl font-bold text-[color:var(--foreground)]">
                {property.bathrooms}
              </p>
            </div>
            <div className="rounded-2xl bg-[color:var(--surface-strong)] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted)]">
                Sq m
              </p>
              <p className="mt-2 text-xl font-bold text-[color:var(--foreground)]">
                {formatNumber(property.area)}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-medium text-[color:var(--foreground)]">
              {property.highlight}
            </p>
            <Link
              href={`/properties/${property.slug}`}
              className="inline-flex items-center justify-center rounded-full bg-[color:var(--accent-strong)] px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
            >
              View details
            </Link>
          </div>
        </div>
      </article>
      {isLightboxOpen ? (
        <ImageLightbox
          activeIndex={activeIndex}
          images={property.gallery}
          onClose={() => setIsLightboxOpen(false)}
          onSelect={setActiveIndex}
          title={property.title}
        />
      ) : null}
    </>
  );
}
