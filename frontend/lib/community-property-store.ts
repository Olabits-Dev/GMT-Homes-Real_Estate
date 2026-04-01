import "server-only";

import {
  createInspectionBooking,
  fetchAdminInspectionBookings,
  fetchAdminProperties,
  fetchAllProperties,
  fetchInspectionBookings,
  fetchModerationQueue,
  fetchPropertiesByOwner,
  fetchPropertyBySlug,
  fetchPropertyBySlugForViewer,
  moderateProperty,
  publishProperty,
  updateInspectionBooking,
} from "@/lib/backend-client";
import type {
  InspectionBooking,
  InspectionBookingStatus,
  Property,
  PropertyModerationStatus,
} from "@/types/property";

type CommunityPropertyInput = {
  bathrooms: number;
  bedrooms: number;
  cityLabel: string;
  description: string;
  imageAssets?: Property["imageAssets"];
  location: string;
  price: number;
  status: Property["status"];
  title: string;
  type: Property["type"];
  userId: string;
};

export async function getAllProperties() {
  return fetchAllProperties();
}

export async function getCommunityProperties() {
  const properties = await fetchAllProperties();
  return properties.filter((property) => property.source === "community");
}

export async function findPropertyBySlug(slug: string, viewerId?: string | null) {
  if (viewerId) {
    return fetchPropertyBySlugForViewer(slug, viewerId);
  }

  return fetchPropertyBySlug(slug);
}

export async function getCommunityPropertiesByOwner(ownerId: string) {
  return fetchPropertiesByOwner(ownerId);
}

export async function getCommunityPropertiesForAdmin(actorUserId: string) {
  return fetchAdminProperties(actorUserId);
}

export async function getModerationQueueForAdmin(actorUserId: string) {
  return fetchModerationQueue(actorUserId);
}

export async function createCommunityProperty(input: CommunityPropertyInput) {
  const response = await publishProperty(input);

  if (!response.property) {
    throw new Error(
      response.message ??
        "We couldn't publish your property right now. Please try again in a moment.",
    );
  }

  return response.property;
}

export async function updateCommunityPropertyModeration(input: {
  actorUserId: string;
  moderationNotes?: string;
  moderationStatus: PropertyModerationStatus;
  propertyId: string;
}) {
  const response = await moderateProperty(input);

  if (!response.property) {
    throw new Error(
      response.message ??
        "We couldn't update that listing right now. Please try again in a moment.",
    );
  }

  return response.property;
}

export async function requestInspectionBooking(input: {
  message: string;
  preferredDate: string;
  preferredTime: string;
  propertyId: string;
  propertySlug: string;
  propertyTitle: string;
  requesterEmail: string;
  requesterId: string;
  requesterName: string;
  requesterPhone: string;
}) {
  const response = await createInspectionBooking(input);

  if (!response.booking) {
    throw new Error(
      response.message ??
        "We couldn't schedule the inspection right now. Please try again in a moment.",
    );
  }

  return response.booking;
}

export async function getInspectionBookingsForUser(userId: string) {
  return fetchInspectionBookings(userId);
}

export async function getInspectionBookingsForAdmin(actorUserId: string) {
  return fetchAdminInspectionBookings(actorUserId);
}

export async function changeInspectionBookingStatus(input: {
  actorUserId: string;
  bookingId: string;
  status: InspectionBookingStatus;
}) {
  const response = await updateInspectionBooking(input);

  if (!response.booking) {
    throw new Error(
      response.message ??
        "We couldn't update that inspection request right now. Please try again in a moment.",
    );
  }

  return response.booking as InspectionBooking;
}
