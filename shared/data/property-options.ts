import type { PriceRangeOption, PropertyType } from "../types/property";

export const propertyTypes: PropertyType[] = [
  "Apartment",
  "Duplex",
  "Penthouse",
  "Studio",
  "Terrace",
  "Villa",
];

export const priceRanges: PriceRangeOption[] = [
  { value: "all", label: "Any budget" },
  { value: "under-10m", label: "Under ₦10M", max: 10_000_000 },
  { value: "10m-80m", label: "₦10M to ₦80M", min: 10_000_000, max: 80_000_000 },
  { value: "80m-180m", label: "₦80M to ₦180M", min: 80_000_000, max: 180_000_000 },
  { value: "180m-plus", label: "Above ₦180M", min: 180_000_000 },
];
