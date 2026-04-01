import "server-only";

import {
  getBackendBaseUrl,
  getBackendServiceToken,
} from "@/lib/server-env";
import type {
  AuthMutationResponse,
  BackendCapabilitiesResponse,
  InspectionBookingMutationResponse,
  InspectionBookingRequest,
  InspectionBookingsResponse,
  LoginRequest,
  ModeratePropertyRequest,
  ModeratePropertyResponse,
  PasswordChangeRequest,
  PasswordMutationResponse,
  PasswordResetCompletionRequest,
  PasswordResetRequest,
  PasswordResetRequestResponse,
  PropertiesResponse,
  PropertyResponse,
  PublishPropertyRequest,
  PublishPropertyResponse,
  SignupRequest,
  UpdateInspectionBookingRequest,
  UserResponse,
} from "@shared/types/api";

type BackendRequestOptions = {
  body?: unknown;
  internal?: boolean;
  method?: "GET" | "POST";
};

function buildBackendUrl(pathname: string) {
  const normalizedBaseUrl = getBackendBaseUrl().endsWith("/")
    ? getBackendBaseUrl()
    : `${getBackendBaseUrl()}/`;
  const normalizedPath = pathname.startsWith("/") ? pathname.slice(1) : pathname;

  return new URL(normalizedPath, normalizedBaseUrl).toString();
}

function getErrorMessage(data: unknown, fallback: string) {
  if (
    typeof data === "object" &&
    data !== null &&
    "message" in data &&
    typeof data.message === "string" &&
    data.message.trim() !== ""
  ) {
    return data.message;
  }

  return fallback;
}

async function requestBackend<T>(
  pathname: string,
  options: BackendRequestOptions = {},
) {
  const headers = new Headers({
    Accept: "application/json",
  });

  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  if (options.internal) {
    headers.set("x-gmt-service-token", getBackendServiceToken());
  }

  let response: Response;

  try {
    response = await fetch(buildBackendUrl(pathname), {
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      cache: "no-store",
      headers,
      method: options.method ?? (options.body !== undefined ? "POST" : "GET"),
    });
  } catch (error) {
    console.error("Failed to reach backend service.", error);
    throw new Error(
      "We couldn't reach the GMT Homes backend service right now. Please try again in a moment.",
    );
  }

  const rawBody = await response.text();
  let payload: unknown = {};

  if (rawBody) {
    try {
      payload = JSON.parse(rawBody) as unknown;
    } catch (error) {
      console.error("Received a non-JSON backend response.", error);
      throw new Error(
        "The GMT Homes backend returned an invalid response. Please try again in a moment.",
      );
    }
  }

  if (!response.ok) {
    if (options.internal || response.status >= 500) {
      throw new Error(
        getErrorMessage(
          payload,
          "The GMT Homes backend service is unavailable right now.",
        ),
      );
    }
  }

  return payload as T;
}

export function fetchBackendCapabilities() {
  return requestBackend<BackendCapabilitiesResponse>("/api/meta/capabilities");
}

export function signupUser(input: SignupRequest) {
  return requestBackend<AuthMutationResponse>("/api/auth/signup", {
    body: input,
    method: "POST",
  });
}

export function loginUser(input: LoginRequest) {
  return requestBackend<AuthMutationResponse>("/api/auth/login", {
    body: input,
    method: "POST",
  });
}

export function fetchUserById(userId: string) {
  return requestBackend<UserResponse>(
    `/api/internal/users/${encodeURIComponent(userId)}`,
    { internal: true },
  );
}

export function changeUserPassword(input: PasswordChangeRequest) {
  return requestBackend<PasswordMutationResponse>(
    "/api/internal/auth/password-change",
    {
      body: input,
      internal: true,
      method: "POST",
    },
  );
}

export function requestPasswordResetFlow(input: PasswordResetRequest) {
  return requestBackend<PasswordResetRequestResponse>(
    "/api/auth/password-reset/request",
    {
      body: input,
      method: "POST",
    },
  );
}

export function completePasswordResetFlow(
  input: PasswordResetCompletionRequest,
) {
  return requestBackend<PasswordMutationResponse>(
    "/api/auth/password-reset/complete",
    {
      body: input,
      method: "POST",
    },
  );
}

export async function fetchAllProperties() {
  const response = await requestBackend<PropertiesResponse>("/api/properties");
  return response.properties;
}

export async function fetchPropertyBySlug(slug: string) {
  const response = await requestBackend<PropertyResponse>(
    `/api/properties/${encodeURIComponent(slug)}`,
  );
  return response.property;
}

export async function fetchPropertyBySlugForViewer(
  slug: string,
  viewerId: string,
) {
  const response = await requestBackend<PropertyResponse>(
    `/api/internal/properties/by-slug/${encodeURIComponent(slug)}?viewerId=${encodeURIComponent(viewerId)}`,
    { internal: true },
  );
  return response.property;
}

export async function fetchPropertiesByOwner(userId: string) {
  const response = await requestBackend<PropertiesResponse>(
    `/api/internal/users/${encodeURIComponent(userId)}/properties`,
    { internal: true },
  );
  return response.properties;
}

export async function publishProperty(input: PublishPropertyRequest) {
  const response = await requestBackend<PublishPropertyResponse>(
    "/api/internal/properties",
    {
      body: input,
      internal: true,
      method: "POST",
    },
  );

  return response;
}

export async function createInspectionBooking(input: InspectionBookingRequest) {
  return requestBackend<InspectionBookingMutationResponse>(
    "/api/internal/bookings",
    {
      body: input,
      internal: true,
      method: "POST",
    },
  );
}

export async function fetchInspectionBookings(userId: string) {
  const response = await requestBackend<InspectionBookingsResponse>(
    `/api/internal/users/${encodeURIComponent(userId)}/bookings`,
    { internal: true },
  );
  return response.bookings;
}

export async function fetchAdminProperties(actorUserId: string) {
  const response = await requestBackend<PropertiesResponse>(
    `/api/internal/admin/properties?actorUserId=${encodeURIComponent(actorUserId)}`,
    { internal: true },
  );
  return response.properties;
}

export async function fetchModerationQueue(actorUserId: string) {
  const response = await requestBackend<PropertiesResponse>(
    `/api/internal/admin/properties/moderation-queue?actorUserId=${encodeURIComponent(actorUserId)}`,
    { internal: true },
  );
  return response.properties;
}

export async function moderateProperty(input: ModeratePropertyRequest) {
  return requestBackend<ModeratePropertyResponse>(
    "/api/internal/admin/properties/moderate",
    {
      body: input,
      internal: true,
      method: "POST",
    },
  );
}

export async function fetchAdminInspectionBookings(actorUserId: string) {
  const response = await requestBackend<InspectionBookingsResponse>(
    `/api/internal/admin/bookings?actorUserId=${encodeURIComponent(actorUserId)}`,
    { internal: true },
  );
  return response.bookings;
}

export async function updateInspectionBooking(input: UpdateInspectionBookingRequest) {
  return requestBackend<InspectionBookingMutationResponse>(
    "/api/internal/bookings/status",
    {
      body: input,
      internal: true,
      method: "POST",
    },
  );
}
