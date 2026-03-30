import { priceRanges } from "@/data/properties";
import type { BillingPeriod, ListingFilters, Property } from "@/types/property";

export function formatPrice(price: number, billingPeriod: BillingPeriod) {
  const amount = new Intl.NumberFormat("en-NG", {
    currency: "NGN",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(price);

  if (!billingPeriod) {
    return amount;
  }

  return `${amount}/${billingPeriod}`;
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("en-NG").format(value);
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function parseFirstValue(
  value: string | string[] | undefined,
  fallback = "",
) {
  if (Array.isArray(value)) {
    return value[0] ?? fallback;
  }

  return value ?? fallback;
}

export function parseSavedFilter(value: string | string[] | undefined) {
  const parsed = parseFirstValue(value).toLowerCase();
  return parsed === "1" || parsed === "true" || parsed === "yes";
}

export function filterProperties(
  properties: Property[],
  filters: ListingFilters,
  savedSlugs: string[] = [],
) {
  const activeRange = priceRanges.find((range) => range.value === filters.price);
  const normalizedQuery = filters.query.trim().toLowerCase();

  return properties.filter((property) => {
    if (filters.savedOnly && !savedSlugs.includes(property.slug)) {
      return false;
    }

    if (filters.type !== "all" && property.type !== filters.type) {
      return false;
    }

    if (filters.status !== "all" && property.status !== filters.status) {
      return false;
    }

    if (activeRange?.min !== undefined && property.price < activeRange.min) {
      return false;
    }

    if (activeRange?.max !== undefined && property.price > activeRange.max) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    const haystack = [
      property.title,
      property.location,
      property.city,
      property.state,
      property.shortDescription,
      property.type,
      property.status,
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalizedQuery);
  });
}

