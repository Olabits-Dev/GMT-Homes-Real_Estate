import type { Metadata } from "next";
import { PropertiesExplorer } from "@/components/properties-explorer";
import { properties } from "@/data/properties";
import {
  parseFirstValue,
  parseSavedFilter,
} from "@/lib/property-utils";
import type { ListingFilters } from "@/types/property";

export const metadata: Metadata = {
  title: "Property Listings",
  description:
    "Search and filter real estate listings by location, property type, listing status, and price range.",
};

type PropertiesPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function PropertiesPage({
  searchParams,
}: PropertiesPageProps) {
  const resolvedSearchParams = await searchParams;

  const initialFilters: ListingFilters = {
    price: parseFirstValue(resolvedSearchParams.price, "all"),
    query: parseFirstValue(resolvedSearchParams.query),
    savedOnly: parseSavedFilter(resolvedSearchParams.saved),
    status: parseFirstValue(resolvedSearchParams.status, "all"),
    type: parseFirstValue(resolvedSearchParams.type, "all"),
  };

  const initialViewMode =
    parseFirstValue(resolvedSearchParams.view) === "list" ? "list" : "grid";

  return (
    <PropertiesExplorer
      properties={properties}
      initialFilters={initialFilters}
      initialViewMode={initialViewMode}
    />
  );
}

