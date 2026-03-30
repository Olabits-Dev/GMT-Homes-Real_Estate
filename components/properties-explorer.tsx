"use client";

import Link from "next/link";
import {
  startTransition,
  useDeferredValue,
  useEffect,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { filterProperties } from "@/lib/property-utils";
import { useFavorites } from "@/components/app-providers";
import { PropertyCard } from "@/components/property-card";
import { priceRanges, propertyTypes } from "@/data/properties";
import type { ListingFilters, Property } from "@/types/property";

type PropertiesExplorerProps = {
  initialFilters: ListingFilters;
  initialViewMode: "grid" | "list";
  properties: Property[];
};

export function PropertiesExplorer({
  initialFilters,
  initialViewMode,
  properties,
}: PropertiesExplorerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { favorites } = useFavorites();
  const [filters, setFilters] = useState(initialFilters);
  const [viewMode, setViewMode] = useState<"grid" | "list">(initialViewMode);
  const deferredQuery = useDeferredValue(filters.query);

  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  useEffect(() => {
    setViewMode(initialViewMode);
  }, [initialViewMode]);
  const filteredProperties = filterProperties(
    properties,
    { ...filters, query: deferredQuery },
    favorites,
  );
  const topStats = [
    {
      icon: (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-5 w-5 fill-none stroke-current stroke-2"
        >
          <path d="M4 19V5" />
          <path d="M10 19V10" />
          <path d="M16 19V7" />
          <path d="M22 19H2" />
        </svg>
      ),
      label: "All listings",
      value: properties.length.toString(),
    },
    {
      icon: (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-5 w-5 fill-none stroke-current stroke-2"
        >
          <path d="M12 21s-7-4.35-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 11c0 5.65-7 10-7 10z" />
        </svg>
      ),
      label: "Saved homes",
      value: favorites.length.toString(),
    },
    {
      icon: (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-5 w-5 fill-none stroke-current stroke-2"
        >
          <path d="M3 11.5L12 4l9 7.5" />
          <path d="M5 10.5V20h14v-9.5" />
        </svg>
      ),
      label: "For rent",
      value: properties
        .filter((property) => property.status === "For Rent")
        .length.toString(),
    },
    {
      icon: (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-5 w-5 fill-none stroke-current stroke-2"
        >
          <path d="M12 1v22" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7H14.5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
      label: "For sale",
      value: properties
        .filter((property) => property.status === "For Sale")
        .length.toString(),
    },
  ];

  const syncUrl = (
    nextFilters: ListingFilters,
    nextViewMode: "grid" | "list",
  ) => {
    const params = new URLSearchParams();

    if (nextFilters.query.trim()) {
      params.set("query", nextFilters.query.trim());
    }

    if (nextFilters.type !== "all") {
      params.set("type", nextFilters.type);
    }

    if (nextFilters.status !== "all") {
      params.set("status", nextFilters.status);
    }

    if (nextFilters.price !== "all") {
      params.set("price", nextFilters.price);
    }

    if (nextFilters.savedOnly) {
      params.set("saved", "1");
    }

    if (nextViewMode === "list") {
      params.set("view", "list");
    }

    const search = params.toString();
    startTransition(() => {
      router.replace(search ? `${pathname}?${search}` : pathname, {
        scroll: false,
      });
    });
  };

  const updateFilters = (nextFilters: ListingFilters) => {
    setFilters(nextFilters);
    syncUrl(nextFilters, viewMode);
  };

  const updateViewMode = (nextViewMode: "grid" | "list") => {
    setViewMode(nextViewMode);
    syncUrl(filters, nextViewMode);
  };

  const resetFilters = () => {
    const baseFilters: ListingFilters = {
      price: "all",
      query: "",
      savedOnly: false,
      status: "all",
      type: "all",
    };

    setFilters(baseFilters);
    setViewMode("grid");
    syncUrl(baseFilters, "grid");
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-[2rem] border border-[color:var(--border)] bg-[linear-gradient(135deg,color-mix(in_oklab,var(--accent-strong)_92%,transparent),color-mix(in_oklab,var(--accent)_78%,white_8%))] px-6 py-8 text-white shadow-[var(--shadow-card)] sm:px-8 sm:py-10">
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/75">
          Property directory
        </p>
        <div className="mt-4 flex flex-col gap-5 lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-6">
          <div className="max-w-3xl">
            <h1 className="font-display text-5xl leading-none sm:text-6xl">
              Search homes that fit your lifestyle and budget.
            </h1>
            <p className="mt-4 text-base leading-8 text-white/82">
              Use location keywords, price filters, and property types to narrow
              down homes for rent or sale. Authenticated community listings also
              appear here as soon as they are published.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:w-[30rem]">
            {topStats.map((item) => (
              <div
                key={item.label}
                className="app-detail-card app-detail-card--glass px-3 py-2.5 text-white"
              >
                <div className="app-detail-card__icon scale-[0.72] origin-top-left">
                  {item.icon}
                </div>
                <p className="mt-2 text-[1.7rem] font-black leading-none sm:text-[1.9rem]">
                  {item.value}
                </p>
                <p className="mt-1.5 text-[0.68rem] leading-none uppercase tracking-[0.1em] whitespace-nowrap text-white/78 sm:text-[0.75rem]">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[0.92fr_1.5fr]">
        <div className="rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-6 shadow-[var(--shadow-card)] sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[color:var(--muted)]">
                Filters
              </p>
              <h2 className="mt-2 font-display text-3xl text-[color:var(--foreground)]">
                Refine results
              </h2>
            </div>
            <button
              type="button"
              onClick={resetFilters}
              className="text-sm font-semibold text-[color:var(--accent)]"
            >
              Reset
            </button>
          </div>

          <div className="mt-8 space-y-5">
            <label className="block space-y-2">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--muted)]">
                Search by location
              </span>
              <input
                value={filters.query}
                onChange={(event) =>
                  updateFilters({ ...filters, query: event.target.value })
                }
                placeholder="Lekki, Abuja, Ibadan..."
                className="w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--background)] px-4 py-3 text-sm text-[color:var(--foreground)] outline-none transition focus:border-[color:var(--accent)]"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--muted)]">
                Property type
              </span>
              <select
                value={filters.type}
                onChange={(event) =>
                  updateFilters({ ...filters, type: event.target.value })
                }
                className="w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--background)] px-4 py-3 text-sm text-[color:var(--foreground)] outline-none transition focus:border-[color:var(--accent)]"
              >
                <option value="all">All types</option>
                {propertyTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-2">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--muted)]">
                Listing status
              </span>
              <select
                value={filters.status}
                onChange={(event) =>
                  updateFilters({ ...filters, status: event.target.value })
                }
                className="w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--background)] px-4 py-3 text-sm text-[color:var(--foreground)] outline-none transition focus:border-[color:var(--accent)]"
              >
                <option value="all">For rent and sale</option>
                <option value="For Rent">For rent</option>
                <option value="For Sale">For sale</option>
              </select>
            </label>

            <label className="block space-y-2">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--muted)]">
                Price range
              </span>
              <select
                value={filters.price}
                onChange={(event) =>
                  updateFilters({ ...filters, price: event.target.value })
                }
                className="w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--background)] px-4 py-3 text-sm text-[color:var(--foreground)] outline-none transition focus:border-[color:var(--accent)]"
              >
                {priceRanges.map((range) => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex items-start gap-3 rounded-2xl border border-[color:var(--border)] bg-[color:var(--background)] px-4 py-4">
              <input
                type="checkbox"
                checked={filters.savedOnly}
                onChange={(event) =>
                  updateFilters({
                    ...filters,
                    savedOnly: event.target.checked,
                  })
                }
                className="mt-1 h-4 w-4 rounded border-[color:var(--border)] text-[color:var(--accent)]"
              />
              <span className="text-sm leading-6 text-[color:var(--foreground)]">
                Show only saved properties
              </span>
            </label>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col gap-4 rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-6 shadow-[var(--shadow-card)] sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[color:var(--muted)]">
                Search results
              </p>
              <p className="mt-2 text-lg font-semibold text-[color:var(--foreground)]">
                {filteredProperties.length} properties found
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-full bg-[color:var(--surface-strong)] p-1">
              {(["grid", "list"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => updateViewMode(option)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${viewMode === option ? "bg-[color:var(--accent-strong)] text-white" : "text-[color:var(--muted)]"}`}
                >
                  {option === "grid" ? "Grid view" : "List view"}
                </button>
              ))}
            </div>
          </div>

          {filteredProperties.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-[color:var(--border)] bg-[color:var(--surface)] px-6 py-12 text-center shadow-[var(--shadow-soft)] sm:px-8">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[color:var(--muted)]">
                No matches found
              </p>
              <h3 className="mt-4 font-display text-4xl text-[color:var(--foreground)]">
                Try adjusting the filters.
              </h3>
              <p className="mt-4 text-base leading-8 text-[color:var(--muted)]">
                Broaden the price range, switch property types, or search by a
                different city.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center justify-center rounded-full bg-[color:var(--accent-strong)] px-5 py-3 text-sm font-semibold text-white"
                >
                  Clear filters
                </button>
                <Link
                  href="/add-property"
                  className="inline-flex items-center justify-center rounded-full border border-[color:var(--border)] px-5 py-3 text-sm font-semibold text-[color:var(--foreground)]"
                >
                  Add your property
                </Link>
              </div>
            </div>
          ) : (
            <div
              className={
                viewMode === "grid"
                  ? "grid gap-6 xl:grid-cols-2"
                  : "flex flex-col gap-6"
              }
            >
              {filteredProperties.map((property) => (
                <PropertyCard
                  key={`${property.source}-${property.id}`}
                  property={property}
                  viewMode={viewMode}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
