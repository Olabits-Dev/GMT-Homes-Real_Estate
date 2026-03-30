"use client";

import Link from "next/link";
import { useState, useSyncExternalStore, useTransition } from "react";
import { getDefaultGalleryForType, propertyTypes } from "@/data/properties";
import {
  getCommunityPropertiesServerSnapshot,
  readCommunityProperties,
  subscribeToCommunityProperties,
  writeCommunityProperties,
} from "@/lib/browser-storage";
import { formatPrice, slugify } from "@/lib/property-utils";
import type { ListingStatus, Property, PropertyType } from "@/types/property";

const cityOptions = [
  {
    city: "Lagos",
    coordinates: { lat: 6.5244, lng: 3.3792 },
    label: "Lagos, Lagos",
    state: "Lagos",
  },
  {
    city: "Abuja",
    coordinates: { lat: 9.0765, lng: 7.3986 },
    label: "Abuja, FCT",
    state: "FCT",
  },
  {
    city: "Ibadan",
    coordinates: { lat: 7.3775, lng: 3.947 },
    label: "Ibadan, Oyo",
    state: "Oyo",
  },
  {
    city: "Port Harcourt",
    coordinates: { lat: 4.8156, lng: 7.0498 },
    label: "Port Harcourt, Rivers",
    state: "Rivers",
  },
  {
    city: "Enugu",
    coordinates: { lat: 6.4571, lng: 7.5259 },
    label: "Enugu, Enugu",
    state: "Enugu",
  },
];

type FormState = {
  bathrooms: number;
  bedrooms: number;
  cityLabel: string;
  description: string;
  location: string;
  price: string;
  status: ListingStatus;
  title: string;
  type: PropertyType;
};

const initialFormState: FormState = {
  bathrooms: 3,
  bedrooms: 3,
  cityLabel: cityOptions[0].label,
  description: "",
  location: "",
  price: "",
  status: "For Sale",
  title: "",
  type: "Apartment",
};

export function AddPropertyForm() {
  const [form, setForm] = useState<FormState>(initialFormState);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const recentProperties = useSyncExternalStore(
    subscribeToCommunityProperties,
    readCommunityProperties,
    getCommunityPropertiesServerSnapshot,
  );

  const selectedCity =
    cityOptions.find((option) => option.label === form.cityLabel) ??
    cityOptions[0];

  const estimatedPrice =
    form.price.trim() !== ""
      ? formatPrice(
          Number(form.price),
          form.status === "For Rent" ? "year" : null,
        )
      : null;

  const setField = <T extends keyof FormState>(field: T, value: FormState[T]) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    startTransition(() => {
      const nextId = `community-${Date.now()}`;
      const nextSlug = `${slugify(`${form.title}-${selectedCity.city}-${Date.now()}`)}`;
      const nextProperty: Property = {
        id: nextId,
        slug: nextSlug,
        title: form.title.trim(),
        price: Number(form.price),
        billingPeriod: form.status === "For Rent" ? "year" : null,
        location: form.location.trim(),
        city: selectedCity.city,
        state: selectedCity.state,
        type: form.type,
        status: form.status,
        bedrooms: form.bedrooms,
        bathrooms: form.bathrooms,
        area: Math.max(90, form.bedrooms * 55 + form.bathrooms * 12),
        shortDescription: form.description.trim().slice(0, 120),
        description: form.description.trim(),
        highlight: `${form.type} in ${selectedCity.city} with a ${form.bedrooms}-bed layout`,
        gallery: getDefaultGalleryForType(form.type),
        featured: false,
        yearBuilt: new Date().getFullYear(),
        amenities: [
          "Locally submitted listing",
          "Schedule-ready contact details",
          `${form.bedrooms} spacious bedroom suites`,
          "Flexible inspection support",
          selectedFiles.length > 0
            ? `${selectedFiles.length} uploaded image reference${selectedFiles.length > 1 ? "s" : ""}`
            : "Image upload simulated",
          "GMT review-ready presentation",
        ],
        agent: {
          company: "GMT Community Desk",
          email: "hello@gmthomes.co",
          initials: "GC",
          name: "GMT Community Desk",
          phone: "+234 803 520 8600",
          responseTime: "Usually responds within 30 minutes",
          role: "Listing Support",
        },
        source: "community",
        coordinates: selectedCity.coordinates,
      };

      const existingProperties = readCommunityProperties();
      const nextProperties = [nextProperty, ...existingProperties];
      writeCommunityProperties(nextProperties);
      setForm(initialFormState);
      setSelectedFiles([]);
      setSuccessMessage(
        `${nextProperty.title} was added locally and now appears in the listings page.`,
      );
    });
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
      <form
        onSubmit={handleSubmit}
        className="rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-6 shadow-[var(--shadow-card)] sm:p-8"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[color:var(--muted)]">
              New listing
            </p>
            <h2 className="mt-2 font-display text-4xl text-[color:var(--foreground)]">
              Add a property
            </h2>
          </div>
          {estimatedPrice ? (
            <div className="rounded-2xl bg-[color:var(--surface-strong)] px-4 py-3 text-sm font-semibold text-[color:var(--foreground)]">
              Price preview: {estimatedPrice}
            </div>
          ) : null}
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <label className="block space-y-2 sm:col-span-2">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--muted)]">
              Title
            </span>
            <input
              required
              value={form.title}
              onChange={(event) => setField("title", event.target.value)}
              placeholder="Example: Palm Court Duplex"
              className="w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--background)] px-4 py-3 text-sm text-[color:var(--foreground)] outline-none transition focus:border-[color:var(--accent)]"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--muted)]">
              Listing status
            </span>
            <select
              value={form.status}
              onChange={(event) =>
                setField("status", event.target.value as ListingStatus)
              }
              className="w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--background)] px-4 py-3 text-sm text-[color:var(--foreground)] outline-none transition focus:border-[color:var(--accent)]"
            >
              <option value="For Sale">For sale</option>
              <option value="For Rent">For rent</option>
            </select>
          </label>

          <label className="block space-y-2">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--muted)]">
              Property type
            </span>
            <select
              value={form.type}
              onChange={(event) =>
                setField("type", event.target.value as PropertyType)
              }
              className="w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--background)] px-4 py-3 text-sm text-[color:var(--foreground)] outline-none transition focus:border-[color:var(--accent)]"
            >
              {propertyTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-2">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--muted)]">
              Price
            </span>
            <input
              required
              min="1"
              inputMode="numeric"
              value={form.price}
              onChange={(event) =>
                setField("price", event.target.value.replace(/[^\d]/g, ""))
              }
              placeholder="95000000"
              className="w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--background)] px-4 py-3 text-sm text-[color:var(--foreground)] outline-none transition focus:border-[color:var(--accent)]"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--muted)]">
              City
            </span>
            <select
              value={form.cityLabel}
              onChange={(event) => setField("cityLabel", event.target.value)}
              className="w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--background)] px-4 py-3 text-sm text-[color:var(--foreground)] outline-none transition focus:border-[color:var(--accent)]"
            >
              {cityOptions.map((option) => (
                <option key={option.label} value={option.label}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-2 sm:col-span-2">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--muted)]">
              Location
            </span>
            <input
              required
              value={form.location}
              onChange={(event) => setField("location", event.target.value)}
              placeholder="Street, neighborhood, or estate"
              className="w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--background)] px-4 py-3 text-sm text-[color:var(--foreground)] outline-none transition focus:border-[color:var(--accent)]"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--muted)]">
              Bedrooms
            </span>
            <input
              min="1"
              max="10"
              type="number"
              value={form.bedrooms}
              onChange={(event) =>
                setField("bedrooms", Number(event.target.value || 1))
              }
              className="w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--background)] px-4 py-3 text-sm text-[color:var(--foreground)] outline-none transition focus:border-[color:var(--accent)]"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--muted)]">
              Bathrooms
            </span>
            <input
              min="1"
              max="10"
              type="number"
              value={form.bathrooms}
              onChange={(event) =>
                setField("bathrooms", Number(event.target.value || 1))
              }
              className="w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--background)] px-4 py-3 text-sm text-[color:var(--foreground)] outline-none transition focus:border-[color:var(--accent)]"
            />
          </label>

          <label className="block space-y-2 sm:col-span-2">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--muted)]">
              Description
            </span>
            <textarea
              required
              rows={6}
              value={form.description}
              onChange={(event) => setField("description", event.target.value)}
              placeholder="Describe the layout, standout features, and nearby conveniences..."
              className="w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--background)] px-4 py-3 text-sm leading-7 text-[color:var(--foreground)] outline-none transition focus:border-[color:var(--accent)]"
            />
          </label>

          <label className="block space-y-2 sm:col-span-2">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--muted)]">
              Image upload
            </span>
            <input
              multiple
              type="file"
              accept="image/*"
              onChange={(event) =>
                setSelectedFiles(
                  Array.from(event.target.files ?? []).map((file) => file.name),
                )
              }
              className="w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--background)] px-4 py-3 text-sm text-[color:var(--foreground)] outline-none transition file:mr-4 file:rounded-full file:border-0 file:bg-[color:var(--accent-strong)] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
            />
            <p className="text-sm text-[color:var(--muted)]">
              Upload is simulated for this project. Selected filenames are
              captured, while gallery imagery falls back to curated free-use
              real estate photos.
            </p>
          </label>
        </div>

        {selectedFiles.length > 0 ? (
          <div className="mt-6 flex flex-wrap gap-2">
            {selectedFiles.map((fileName) => (
              <span
                key={fileName}
                className="rounded-full bg-[color:var(--surface-strong)] px-3 py-2 text-sm text-[color:var(--foreground)]"
              >
                {fileName}
              </span>
            ))}
          </div>
        ) : null}

        {successMessage ? (
          <div className="mt-6 rounded-[1.5rem] border border-[color:color-mix(in_oklab,var(--accent)_28%,transparent)] bg-[color:color-mix(in_oklab,var(--accent)_12%,transparent)] px-4 py-4 text-sm font-medium text-[color:var(--accent-strong)]">
            {successMessage}
          </div>
        ) : null}

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <button
            disabled={isPending}
            type="submit"
            className="inline-flex items-center justify-center rounded-full bg-[color:var(--accent-strong)] px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Saving..." : "Save property"}
          </button>
          <Link
            href="/properties"
            className="inline-flex items-center justify-center rounded-full border border-[color:var(--border)] px-6 py-3 text-sm font-semibold text-[color:var(--foreground)]"
          >
            Browse all listings
          </Link>
        </div>
      </form>

      <aside className="space-y-6">
        <section className="rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-6 shadow-[var(--shadow-card)] sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[color:var(--muted)]">
            Submission tips
          </p>
          <div className="mt-5 space-y-4 text-sm leading-7 text-[color:var(--foreground)]">
            <p>Use a title that sounds like a listing someone would actually click.</p>
            <p>Lead with what matters: neighborhood, layout, standout features, and price.</p>
            <p>Submitted properties are saved in local browser storage for this demo.</p>
          </div>
        </section>

        <section className="rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-6 shadow-[var(--shadow-card)] sm:p-8">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[color:var(--muted)]">
                Recent local submissions
              </p>
              <h3 className="mt-2 font-display text-3xl text-[color:var(--foreground)]">
                Demo listings
              </h3>
            </div>
            <Link href="/properties" className="text-sm font-semibold text-[color:var(--accent)]">
              View all
            </Link>
          </div>

          <div className="mt-6 space-y-4">
            {recentProperties.length === 0 ? (
              <p className="text-sm leading-7 text-[color:var(--muted)]">
                No local submissions yet. Add a property here and it will show
                up in the listings page immediately.
              </p>
            ) : (
              recentProperties.slice(0, 3).map((property) => (
                <Link
                  key={property.id}
                  href={`/properties/${property.slug}`}
                  className="app-detail-card app-detail-card--sky block px-4 py-4 transition hover:-translate-y-0.5"
                >
                  <div className="app-detail-card__icon">
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      className="h-6 w-6 fill-none stroke-current stroke-2"
                    >
                      <path d="M3 11.5L12 4l9 7.5" />
                      <path d="M5 10.5V20h14v-9.5" />
                    </svg>
                  </div>
                  <p className="mt-5 font-semibold text-[color:var(--foreground)]">
                    {property.title}
                  </p>
                  <p className="mt-1 text-sm text-[color:var(--muted)]">
                    {property.location}, {property.city}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-[color:var(--accent)]">
                    {formatPrice(property.price, property.billingPeriod)}
                  </p>
                </Link>
              ))
            )}
          </div>
        </section>
      </aside>
    </div>
  );
}
