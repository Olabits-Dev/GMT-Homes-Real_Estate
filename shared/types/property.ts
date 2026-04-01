import type { UserRole } from "./auth";

export type ListingStatus = "For Sale" | "For Rent";

export type PropertyType =
  | "Apartment"
  | "Duplex"
  | "Penthouse"
  | "Studio"
  | "Terrace"
  | "Villa";

export type BillingPeriod = "month" | "year" | null;

export type PropertyModerationStatus = "pending" | "approved" | "rejected";

export type PropertyImageAsset = {
  fileName: string;
  height?: number | null;
  publicId?: string | null;
  url: string;
  width?: number | null;
};

export type InspectionBookingStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled";

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
  createdAt?: string;
  publishedAt?: string | null;
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
  ownerId?: string;
  moderationNotes?: string | null;
  moderationStatus?: PropertyModerationStatus;
  imageAssets?: PropertyImageAsset[];
  coordinates: {
    lat: number;
    lng: number;
  };
};

export type InspectionBooking = {
  createdAt: string;
  id: string;
  message: string;
  ownerId: string | null;
  preferredDate: string;
  preferredTime: string;
  propertyId: string;
  propertyLocation: string;
  propertySlug: string;
  propertyTitle: string;
  requesterEmail: string;
  requesterId: string;
  requesterName: string;
  requesterPhone: string;
  requesterRole: UserRole;
  status: InspectionBookingStatus;
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
