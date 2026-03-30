export type ListingStatus = "For Sale" | "For Rent";

export type PropertyType =
  | "Apartment"
  | "Duplex"
  | "Penthouse"
  | "Studio"
  | "Terrace"
  | "Villa";

export type BillingPeriod = "month" | "year" | null;

export type Agent = {
  name: string;
  role: string;
  phone: string;
  email: string;
  responseTime: string;
  company: string;
  initials: string;
};

export type Property = {
  id: string;
  slug: string;
  title: string;
  price: number;
  billingPeriod: BillingPeriod;
  location: string;
  city: string;
  state: string;
  type: PropertyType;
  status: ListingStatus;
  bedrooms: number;
  bathrooms: number;
  area: number;
  shortDescription: string;
  description: string;
  highlight: string;
  gallery: string[];
  featured: boolean;
  yearBuilt: number;
  amenities: string[];
  agent: Agent;
  source: "seed" | "community";
  coordinates: {
    lat: number;
    lng: number;
  };
};

export type PriceRangeOption = {
  value: string;
  label: string;
  min?: number;
  max?: number;
};

export type ListingFilters = {
  query: string;
  type: string;
  status: string;
  price: string;
  savedOnly: boolean;
};

