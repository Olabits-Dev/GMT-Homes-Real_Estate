"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { createPropertyAction } from "@/app/actions/properties";
import { FormSubmitButton } from "@/components/form-submit-button";
import { cityOptions } from "@/data/listing-options";
import { propertyTypes } from "@/data/properties";
import { formatPrice } from "@/lib/property-utils";
import type { PropertyFormState } from "@/types/auth";
import type { ListingStatus, Property, PropertyType } from "@/types/property";

type FormValues = {
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

type AddPropertyFormProps = {
  recentProperties: Property[];
  viewerName: string;
};

const initialActionState: PropertyFormState = {};
const initialFormValues: FormValues = {
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

export function AddPropertyForm({
  recentProperties,
  viewerName,
}: AddPropertyFormProps) {
  const [state, formAction] = useActionState(
    createPropertyAction,
    initialActionState,
  );
  const [formValues, setFormValues] = useState<FormValues>(initialFormValues);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const estimatedPrice =
    formValues.price.trim() !== ""
      ? formatPrice(
          Number(formValues.price),
          formValues.status === "For Rent" ? "year" : null,
        )
      : null;

  const setField = <T extends keyof FormValues>(
    field: T,
    value: FormValues[T],
  ) => {
    setFormValues((current) => ({ ...current, [field]: value }));
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
      <form
        action={formAction}
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
            <p className="mt-2 text-sm text-[color:var(--muted)]">
              Publishing as {viewerName}
            </p>
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
              name="title"
              value={formValues.title}
              onChange={(event) => setField("title", event.target.value)}
              placeholder="Example: Palm Court Duplex"
              className="w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--background)] px-4 py-3 text-sm text-[color:var(--foreground)] outline-none transition focus:border-[color:var(--accent)]"
            />
            {state.errors?.title ? (
              <p className="text-sm text-[color:#b42318]">{state.errors.title[0]}</p>
            ) : null}
          </label>

          <label className="block space-y-2">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--muted)]">
              Listing status
            </span>
            <select
              name="status"
              value={formValues.status}
              onChange={(event) =>
                setField("status", event.target.value as ListingStatus)
              }
              className="w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--background)] px-4 py-3 text-sm text-[color:var(--foreground)] outline-none transition focus:border-[color:var(--accent)]"
            >
              <option value="For Sale">For sale</option>
              <option value="For Rent">For rent</option>
            </select>
            {state.errors?.status ? (
              <p className="text-sm text-[color:#b42318]">{state.errors.status[0]}</p>
            ) : null}
          </label>

          <label className="block space-y-2">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--muted)]">
              Property type
            </span>
            <select
              name="type"
              value={formValues.type}
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
            {state.errors?.type ? (
              <p className="text-sm text-[color:#b42318]">{state.errors.type[0]}</p>
            ) : null}
          </label>

          <label className="block space-y-2">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--muted)]">
              Price
            </span>
            <input
              required
              name="price"
              min="1"
              inputMode="numeric"
              value={formValues.price}
              onChange={(event) =>
                setField("price", event.target.value.replace(/[^\d]/g, ""))
              }
              placeholder="95000000"
              className="w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--background)] px-4 py-3 text-sm text-[color:var(--foreground)] outline-none transition focus:border-[color:var(--accent)]"
            />
            {state.errors?.price ? (
              <p className="text-sm text-[color:#b42318]">{state.errors.price[0]}</p>
            ) : null}
          </label>

          <label className="block space-y-2">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--muted)]">
              City
            </span>
            <select
              name="cityLabel"
              value={formValues.cityLabel}
              onChange={(event) => setField("cityLabel", event.target.value)}
              className="w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--background)] px-4 py-3 text-sm text-[color:var(--foreground)] outline-none transition focus:border-[color:var(--accent)]"
            >
              {cityOptions.map((option) => (
                <option key={option.label} value={option.label}>
                  {option.label}
                </option>
              ))}
            </select>
            {state.errors?.cityLabel ? (
              <p className="text-sm text-[color:#b42318]">{state.errors.cityLabel[0]}</p>
            ) : null}
          </label>

          <label className="block space-y-2 sm:col-span-2">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--muted)]">
              Location
            </span>
            <input
              required
              name="location"
              value={formValues.location}
              onChange={(event) => setField("location", event.target.value)}
              placeholder="Street, neighborhood, or estate"
              className="w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--background)] px-4 py-3 text-sm text-[color:var(--foreground)] outline-none transition focus:border-[color:var(--accent)]"
            />
            {state.errors?.location ? (
              <p className="text-sm text-[color:#b42318]">{state.errors.location[0]}</p>
            ) : null}
          </label>

          <label className="block space-y-2">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--muted)]">
              Bedrooms
            </span>
            <input
              name="bedrooms"
              min="1"
              max="10"
              type="number"
              value={formValues.bedrooms}
              onChange={(event) =>
                setField("bedrooms", Number(event.target.value || 1))
              }
              className="w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--background)] px-4 py-3 text-sm text-[color:var(--foreground)] outline-none transition focus:border-[color:var(--accent)]"
            />
            {state.errors?.bedrooms ? (
              <p className="text-sm text-[color:#b42318]">{state.errors.bedrooms[0]}</p>
            ) : null}
          </label>

          <label className="block space-y-2">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--muted)]">
              Bathrooms
            </span>
            <input
              name="bathrooms"
              min="1"
              max="10"
              type="number"
              value={formValues.bathrooms}
              onChange={(event) =>
                setField("bathrooms", Number(event.target.value || 1))
              }
              className="w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--background)] px-4 py-3 text-sm text-[color:var(--foreground)] outline-none transition focus:border-[color:var(--accent)]"
            />
            {state.errors?.bathrooms ? (
              <p className="text-sm text-[color:#b42318]">{state.errors.bathrooms[0]}</p>
            ) : null}
          </label>

          <label className="block space-y-2 sm:col-span-2">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--muted)]">
              Description
            </span>
            <textarea
              required
              name="description"
              rows={6}
              value={formValues.description}
              onChange={(event) => setField("description", event.target.value)}
              placeholder="Describe the layout, standout features, and nearby conveniences..."
              className="w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--background)] px-4 py-3 text-sm leading-7 text-[color:var(--foreground)] outline-none transition focus:border-[color:var(--accent)]"
            />
            {state.errors?.description ? (
              <p className="text-sm text-[color:#b42318]">{state.errors.description[0]}</p>
            ) : null}
          </label>

          <label className="block space-y-2 sm:col-span-2">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--muted)]">
              Image upload
            </span>
            <input
              name="images"
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
              Upload remains simulated for this demo. Filenames are captured for
              the submission record while gallery images still fall back to
              curated GMT Homes property photography.
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

        {state.message ? (
          <div className="mt-6 rounded-[1.5rem] border border-[color:color-mix(in_oklab,#b42318_24%,transparent)] bg-[color:color-mix(in_oklab,#b42318_10%,transparent)] px-4 py-4 text-sm text-[color:#b42318]">
            {state.message}
          </div>
        ) : null}

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <FormSubmitButton
            pendingLabel="Publishing listing..."
            className="inline-flex items-center justify-center rounded-full bg-[color:var(--accent-strong)] px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Publish property
          </FormSubmitButton>
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
            <p>Authenticated submissions are stored on the server for this demo.</p>
          </div>
        </section>

        <section className="rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-6 shadow-[var(--shadow-card)] sm:p-8">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[color:var(--muted)]">
                Your recent submissions
              </p>
              <h3 className="mt-2 font-display text-3xl text-[color:var(--foreground)]">
                Account listings
              </h3>
            </div>
            <Link href="/dashboard" className="text-sm font-semibold text-[color:var(--accent)]">
              View dashboard
            </Link>
          </div>

          <div className="mt-6 space-y-4">
            {recentProperties.length === 0 ? (
              <p className="text-sm leading-7 text-[color:var(--muted)]">
                You have not published any listings yet. Your next submission
                will appear here and in your dashboard right away.
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
