"use client";

import Link from "next/link";
import { FavoriteButton } from "@/components/favorite-button";
import { PropertyGallery } from "@/components/property-gallery";
import { formatNumber, formatPrice } from "@/lib/property-utils";
import type { Property } from "@/types/property";

type PropertyDetailViewProps = {
  property: Property;
};

export function PropertyDetailView({ property }: PropertyDetailViewProps) {
  const mapQuery = encodeURIComponent(`${property.location}, ${property.city}`);
  const propertyFacts = [
    {
      icon: (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-6 w-6 fill-none stroke-current stroke-2"
        >
          <path d="M3 11.5L12 4l9 7.5" />
          <path d="M5 10.5V20h14v-9.5" />
        </svg>
      ),
      label: "Bedrooms",
      toneClassName: "app-detail-card--blue",
      value: property.bedrooms.toString(),
    },
    {
      icon: (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-6 w-6 fill-none stroke-current stroke-2"
        >
          <path d="M4 12h16" />
          <path d="M6 12V7a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v5" />
          <path d="M6 12v7" />
          <path d="M18 12v7" />
        </svg>
      ),
      label: "Bathrooms",
      toneClassName: "app-detail-card--mint",
      value: property.bathrooms.toString(),
    },
    {
      icon: (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-6 w-6 fill-none stroke-current stroke-2"
        >
          <path d="M4 19V5" />
          <path d="M10 19V10" />
          <path d="M16 19V7" />
          <path d="M22 19H2" />
        </svg>
      ),
      label: "Area",
      toneClassName: "app-detail-card--sky",
      value: `${formatNumber(property.area)} sqm`,
    },
    {
      detail: true,
      icon: (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-6 w-6 fill-none stroke-current stroke-2"
        >
          <path d="M5 15l4-4 3 3 7-7" />
          <path d="M14 7h5v5" />
        </svg>
      ),
      label: "Highlight",
      toneClassName: "app-detail-card--violet",
      value: property.highlight,
    },
  ];

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center gap-3 text-sm font-semibold">
        <Link href="/properties" className="text-[color:var(--muted)] transition hover:text-[color:var(--foreground)]">
          Properties
        </Link>
        <span className="text-[color:var(--muted)]">/</span>
        <span className="text-[color:var(--foreground)]">{property.title}</span>
      </div>

      <section className="grid gap-10 lg:grid-cols-[1.35fr_0.85fr]">
        <div className="space-y-8">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-[color:var(--accent)] px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-white">
                {property.status}
              </span>
              <span className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--foreground)]">
                {property.type}
              </span>
              <span className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--muted)]">
                Built {property.yearBuilt}
              </span>
            </div>
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div className="space-y-3">
                <h1 className="font-display text-5xl leading-none text-[color:var(--foreground)] sm:text-6xl">
                  {property.title}
                </h1>
                <p className="max-w-3xl text-lg leading-8 text-[color:var(--muted)]">
                  {property.location}, {property.city}, {property.state}
                </p>
              </div>
              <FavoriteButton slug={property.slug} />
            </div>
            <p className="text-3xl font-black text-[color:var(--accent)]">
              {formatPrice(property.price, property.billingPeriod)}
            </p>
            <p className="max-w-4xl text-base leading-8 text-[color:var(--foreground)]">
              {property.description}
            </p>
          </div>

          <PropertyGallery title={property.title} gallery={property.gallery} />

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {propertyFacts.map((item) => (
              <div
                key={item.label}
                className={`app-detail-card ${item.toneClassName} px-5 py-5`}
              >
                <div className="app-detail-card__icon">
                  {item.icon}
                </div>
                <p className="mt-5 text-xs font-bold uppercase tracking-[0.24em] text-[color:var(--muted)]">
                  {item.label}
                </p>
                {item.detail ? (
                  <p className="mt-3 text-base font-semibold leading-7 text-[color:var(--foreground)]">
                    {item.value}
                  </p>
                ) : (
                  <p className="mt-3 text-3xl font-black leading-none text-[color:var(--foreground)]">
                    {item.value}
                  </p>
                )}
              </div>
            ))}
          </div>

          <section className="rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-6 shadow-[var(--shadow-card)] sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[color:var(--muted)]">
              Property perks
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {property.amenities.map((amenity) => (
                <div
                  key={amenity}
                  className="rounded-2xl bg-[color:var(--surface-strong)] px-4 py-4 text-sm font-medium text-[color:var(--foreground)]"
                >
                  {amenity}
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-6 shadow-[var(--shadow-card)] sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[color:var(--muted)]">
              Agent contact
            </p>
            <div className="mt-6 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[color:var(--accent-strong)] text-lg font-bold text-white">
                {property.agent.initials}
              </div>
              <div>
                <p className="text-lg font-semibold text-[color:var(--foreground)]">
                  {property.agent.name}
                </p>
                <p className="text-sm text-[color:var(--muted)]">
                  {property.agent.role}
                </p>
              </div>
            </div>
            <div className="mt-6 space-y-3 text-sm text-[color:var(--foreground)]">
              <p>{property.agent.company}</p>
              <a href={`tel:${property.agent.phone}`} className="block">
                {property.agent.phone}
              </a>
              <a
                href={`https://wa.me/${property.agent.phone.replace(/\D/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="block"
              >
                Chat on WhatsApp
              </a>
              <p className="text-[color:var(--muted)]">
                {property.agent.responseTime}
              </p>
            </div>
            <div className="mt-6 flex flex-col gap-3">
              <a
                href={`https://wa.me/${property.agent.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hello, I am interested in ${property.title}.`)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-full bg-[color:var(--accent-strong)] px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
              >
                Message on WhatsApp
              </a>
              <a
                href={`tel:${property.agent.phone}`}
                className="inline-flex items-center justify-center rounded-full border border-[color:var(--border)] px-5 py-3 text-sm font-semibold text-[color:var(--foreground)] transition hover:-translate-y-0.5"
              >
                Call agent
              </a>
            </div>
          </section>

          <section className="rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-6 shadow-[var(--shadow-card)] sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[color:var(--muted)]">
              Location snapshot
            </p>
            <p className="mt-5 text-lg font-semibold text-[color:var(--foreground)]">
              {property.city}, {property.state}
            </p>
            <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">
              Browse a location-aware experience with faster commute planning,
              neighborhood targeting, and map-ready coordinates.
            </p>
            <div className="mt-6 rounded-[1.5rem] bg-[radial-gradient(circle_at_top_left,var(--surface-strong),transparent_60%),linear-gradient(135deg,color-mix(in_oklab,var(--accent)_20%,transparent),transparent_70%)] px-5 py-5">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[color:var(--muted)]">
                Coordinates
              </p>
              <p className="mt-3 text-sm font-medium text-[color:var(--foreground)]">
                {property.coordinates.lat.toFixed(4)}, {property.coordinates.lng.toFixed(4)}
              </p>
            </div>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex items-center justify-center rounded-full border border-[color:var(--border)] px-5 py-3 text-sm font-semibold text-[color:var(--foreground)] transition hover:-translate-y-0.5"
            >
              Open in Google Maps
            </a>
          </section>
        </aside>
      </section>
    </div>
  );
}
