import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { URL } from "node:url";
import { loadBackendEnv } from "./lib/load-env.ts";
import { canSendPasswordResetEmails, sendPasswordResetEmail } from "./lib/mailer.ts";
import {
  createPasswordResetExpiry,
  createPasswordResetToken,
  hashPasswordResetToken,
  buildPasswordResetUrl,
} from "./lib/password-reset.ts";
import { verifyPassword } from "./lib/passwords.ts";
import { getBackendServiceToken, getHost, getPort } from "./lib/server-env.ts";
import {
  createUser,
  findUserByEmail,
  findUserById,
  findUserByPasswordResetTokenHash,
  setUserPasswordResetToken,
  toPublicUser,
  updateUserPassword,
} from "./services/auth-store.ts";
import {
  createCommunityProperty,
  findPropertyBySlugForViewer,
  findPropertyBySlug,
  getCommunityPropertiesForAdmin,
  getAllProperties,
  getCommunityPropertiesByOwner,
  getModerationQueue,
  moderateCommunityProperty,
} from "./services/community-property-store.ts";
import {
  createInspectionBooking,
  getAllInspectionBookings,
  getInspectionBookingsByOwner,
  getInspectionBookingsByRequester,
  updateInspectionBookingStatus,
} from "./services/inspection-booking-store.ts";
import { cityOptions } from "../../shared/data/listing-options.ts";
import { propertyTypes } from "../../shared/data/property-options.ts";
import type {
  AuthFormErrors,
  AuthFormState,
  ForgotPasswordFormErrors,
  ForgotPasswordFormState,
  PasswordResetFormErrors,
  PasswordResetFormState,
  PropertyFormErrors,
  PropertyFormState,
  UserRole,
} from "../../shared/types/auth.ts";
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
  PasswordResetCompletionRequest,
  PasswordResetRequest,
  PropertiesResponse,
  PropertyResponse,
  PublishPropertyRequest,
  PublishPropertyResponse,
  SignupRequest,
  UpdateInspectionBookingRequest,
  UserResponse,
} from "../../shared/types/api.ts";
import type {
  InspectionBookingStatus,
  ListingStatus,
  PropertyModerationStatus,
  PropertyType,
} from "../../shared/types/property.ts";

loadBackendEnv();

const jsonHeaders = {
  "Content-Type": "application/json; charset=utf-8",
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function pushAuthError(
  errors: AuthFormErrors,
  field: keyof AuthFormErrors,
  message: string,
) {
  errors[field] = [...(errors[field] ?? []), message];
}

function validatePassword(password: string, errors: AuthFormErrors) {
  if (password.length < 8) {
    pushAuthError(errors, "password", "Use at least 8 characters.");
  }

  if (!/[A-Za-z]/.test(password)) {
    pushAuthError(errors, "password", "Include at least one letter.");
  }

  if (!/\d/.test(password)) {
    pushAuthError(errors, "password", "Include at least one number.");
  }
}

function normalizeRole(value: string | undefined): UserRole | null {
  return value === "buyer" ||
    value === "renter" ||
    value === "agent" ||
    value === "admin"
    ? value
    : null;
}

function canPublish(role: UserRole) {
  return role === "agent" || role === "admin";
}

function canModerate(role: UserRole) {
  return role === "admin";
}

function normalizeModerationStatus(
  value: string | undefined,
): PropertyModerationStatus | null {
  return value === "approved" || value === "rejected" || value === "pending"
    ? value
    : null;
}

function normalizeInspectionBookingStatus(
  value: string | undefined,
): InspectionBookingStatus | null {
  return value === "pending" ||
    value === "confirmed" ||
    value === "completed" ||
    value === "cancelled"
    ? value
    : null;
}

function pushPasswordResetError(
  errors: PasswordResetFormErrors,
  field: keyof PasswordResetFormErrors,
  message: string,
) {
  errors[field] = [...(errors[field] ?? []), message];
}

function validateNextPassword(
  password: string,
  errors: PasswordResetFormErrors,
) {
  if (password.length < 8) {
    pushPasswordResetError(errors, "newPassword", "Use at least 8 characters.");
  }

  if (!/[A-Za-z]/.test(password)) {
    pushPasswordResetError(
      errors,
      "newPassword",
      "Include at least one letter.",
    );
  }

  if (!/\d/.test(password)) {
    pushPasswordResetError(
      errors,
      "newPassword",
      "Include at least one number.",
    );
  }
}

function pushForgotPasswordError(
  errors: ForgotPasswordFormErrors,
  field: keyof ForgotPasswordFormErrors,
  message: string,
) {
  errors[field] = [...(errors[field] ?? []), message];
}

function pushPropertyError(
  errors: PropertyFormErrors,
  field: keyof PropertyFormErrors,
  message: string,
) {
  errors[field] = [...(errors[field] ?? []), message];
}

function hasErrors(errors: Record<string, string[] | undefined>) {
  return Object.values(errors).some((value) => (value?.length ?? 0) > 0);
}

function sendJson(
  response: ServerResponse,
  statusCode: number,
  body: unknown,
) {
  response.writeHead(statusCode, jsonHeaders);
  response.end(JSON.stringify(body));
}

async function readJsonBody<T>(request: IncomingMessage) {
  const chunks: Buffer[] = [];

  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  const rawBody = Buffer.concat(chunks).toString("utf8").trim();

  if (!rawBody) {
    return {} as T;
  }

  return JSON.parse(rawBody) as T;
}

function isInternalRequest(request: IncomingMessage) {
  return (
    request.headers["x-gmt-service-token"] === getBackendServiceToken()
  );
}

function normalizeErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message.trim() !== "") {
    return error.message;
  }

  return fallback;
}

async function handleSignup(request: IncomingMessage, response: ServerResponse) {
  const body = await readJsonBody<SignupRequest>(request);
  const name = body.name?.trim() ?? "";
  const email = body.email?.trim().toLowerCase() ?? "";
  const password = body.password ?? "";
  const role = normalizeRole(body.role);
  const errors: AuthFormErrors = {};

  if (name.length < 2) {
    pushAuthError(errors, "name", "Enter your full name.");
  }

  if (!isValidEmail(email)) {
    pushAuthError(errors, "email", "Enter a valid email address.");
  }

  validatePassword(password, errors);

  if (!role || role === "admin") {
    pushAuthError(errors, "role", "Choose whether this account is for buying, renting, or listing.");
  }

  if (hasErrors(errors)) {
    const payload: AuthMutationResponse = {
      errors,
      message: "Please fix the highlighted fields and try again.",
    };
    sendJson(response, 400, payload);
    return;
  }

  const requestedRole = role as Exclude<UserRole, "admin">;

  try {
    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      const payload: AuthMutationResponse = {
        errors: {
          email: ["An account with this email already exists."],
        },
        message: "Use a different email or sign in instead.",
      };
      sendJson(response, 409, payload);
      return;
    }

    const user = await createUser({
      email,
      name,
      password,
      role: requestedRole,
    });

    sendJson(response, 200, {
      user,
    } satisfies AuthMutationResponse);
  } catch (error) {
    sendJson(response, 500, {
      message: normalizeErrorMessage(
        error,
        "We couldn't create your account right now. Please try again in a moment.",
      ),
    } satisfies AuthFormState);
  }
}

async function handleLogin(request: IncomingMessage, response: ServerResponse) {
  const body = await readJsonBody<LoginRequest>(request);
  const email = body.email?.trim().toLowerCase() ?? "";
  const password = body.password ?? "";
  const errors: AuthFormErrors = {};

  if (!isValidEmail(email)) {
    pushAuthError(errors, "email", "Enter a valid email address.");
  }

  if (!password) {
    pushAuthError(errors, "password", "Enter your password.");
  }

  if (hasErrors(errors)) {
    sendJson(response, 400, {
      errors,
      message: "Please fix the highlighted fields and try again.",
    } satisfies AuthMutationResponse);
    return;
  }

  try {
    const user = await findUserByEmail(email);

    if (!user) {
      sendJson(response, 401, {
        message: "We couldn't sign you in with those credentials.",
      } satisfies AuthMutationResponse);
      return;
    }

    if (!(await verifyPassword(password, user.passwordSalt, user.passwordHash))) {
      sendJson(response, 401, {
        errors: {
          password: ["Wrong password."],
        },
        message: "Check your password and try again.",
      } satisfies AuthMutationResponse);
      return;
    }

    sendJson(response, 200, {
      user: toPublicUser(user),
    } satisfies AuthMutationResponse);
  } catch (error) {
    sendJson(response, 500, {
      message: normalizeErrorMessage(
        error,
        "We couldn't sign you in right now. Please try again in a moment.",
      ),
    } satisfies AuthFormState);
  }
}

async function handlePasswordChange(
  request: IncomingMessage,
  response: ServerResponse,
) {
  const body = await readJsonBody<PasswordChangeRequest>(request);
  const errors: PasswordResetFormErrors = {};

  if (!body.currentPassword) {
    pushPasswordResetError(
      errors,
      "currentPassword",
      "Enter your current password.",
    );
  }

  validateNextPassword(body.newPassword ?? "", errors);

  if (hasErrors(errors)) {
    sendJson(response, 400, {
      errors,
      message: "Please fix the highlighted fields and try again.",
    } satisfies PasswordResetFormState);
    return;
  }

  try {
    const storedUser = await findUserById(body.userId);

    if (!storedUser) {
      sendJson(response, 404, {
        message: "We couldn't verify your account right now. Please sign in again.",
      } satisfies PasswordResetFormState);
      return;
    }

    if (
      !(await verifyPassword(
        body.currentPassword,
        storedUser.passwordSalt,
        storedUser.passwordHash,
      ))
    ) {
      sendJson(response, 401, {
        errors: {
          currentPassword: ["Wrong password."],
        },
        message: "Your current password is incorrect.",
      } satisfies PasswordResetFormState);
      return;
    }

    if (
      await verifyPassword(
        body.newPassword,
        storedUser.passwordSalt,
        storedUser.passwordHash,
      )
    ) {
      sendJson(response, 400, {
        errors: {
          newPassword: ["Use a password different from your current one."],
        },
        message: "Choose a new password before saving.",
      } satisfies PasswordResetFormState);
      return;
    }

    await updateUserPassword(body.userId, body.newPassword);

    sendJson(response, 200, {
      successMessage: "Your password has been updated successfully.",
    } satisfies PasswordResetFormState);
  } catch (error) {
    sendJson(response, 500, {
      message: normalizeErrorMessage(
        error,
        "We couldn't update your password right now. Please try again in a moment.",
      ),
    } satisfies PasswordResetFormState);
  }
}

async function handlePasswordResetRequest(
  request: IncomingMessage,
  response: ServerResponse,
) {
  const body = await readJsonBody<PasswordResetRequest>(request);
  const email = body.email?.trim().toLowerCase() ?? "";
  const errors: ForgotPasswordFormErrors = {};

  if (!isValidEmail(email)) {
    pushForgotPasswordError(errors, "email", "Enter a valid email address.");
  }

  if (hasErrors(errors)) {
    sendJson(response, 400, {
      errors,
      message: "Please fix the highlighted fields and try again.",
    } satisfies ForgotPasswordFormState);
    return;
  }

  try {
    const user = await findUserByEmail(email);
    let resetLink: string | undefined;

    if (user) {
      const token = createPasswordResetToken();
      const expiresAt = createPasswordResetExpiry();
      const tokenHash = hashPasswordResetToken(token);

      await setUserPasswordResetToken(
        user.id,
        tokenHash,
        expiresAt.toISOString(),
      );

      resetLink = buildPasswordResetUrl(token);

      if (canSendPasswordResetEmails()) {
        try {
          await sendPasswordResetEmail({
            email: user.email,
            name: user.name,
            resetUrl: resetLink,
          });
          resetLink = undefined;
        } catch (error) {
          console.error("Failed to send password reset email.", error);

          if (process.env.NODE_ENV === "production") {
            resetLink = undefined;
          }
        }
      } else if (process.env.NODE_ENV === "production") {
        resetLink = undefined;
      }
    }

    sendJson(response, 200, {
      resetLink,
      successMessage:
        "If an account with that email exists, password reset instructions have been prepared.",
    } satisfies ForgotPasswordFormState);
  } catch (error) {
    sendJson(response, 500, {
      message: normalizeErrorMessage(
        error,
        "We couldn't start the password reset flow right now. Please try again in a moment.",
      ),
    } satisfies ForgotPasswordFormState);
  }
}

async function handlePasswordResetComplete(
  request: IncomingMessage,
  response: ServerResponse,
) {
  const body = await readJsonBody<PasswordResetCompletionRequest>(request);
  const token = body.token?.trim() ?? "";
  const errors: PasswordResetFormErrors = {};

  if (!token) {
    sendJson(response, 400, {
      message: "This password reset link is invalid. Request a new one and try again.",
    } satisfies PasswordResetFormState);
    return;
  }

  validateNextPassword(body.newPassword ?? "", errors);

  if (hasErrors(errors)) {
    sendJson(response, 400, {
      errors,
      message: "Please fix the highlighted fields and try again.",
    } satisfies PasswordResetFormState);
    return;
  }

  try {
    const user = await findUserByPasswordResetTokenHash(
      hashPasswordResetToken(token),
    );

    if (!user) {
      sendJson(response, 404, {
        message:
          "This password reset link is invalid or has expired. Request a new one and try again.",
      } satisfies PasswordResetFormState);
      return;
    }

    if (
      await verifyPassword(
        body.newPassword,
        user.passwordSalt,
        user.passwordHash,
      )
    ) {
      sendJson(response, 400, {
        errors: {
          newPassword: ["Use a password different from your current one."],
        },
        message: "Choose a new password before saving.",
      } satisfies PasswordResetFormState);
      return;
    }

    await updateUserPassword(user.id, body.newPassword);

    sendJson(response, 200, {
      successMessage:
        "Your password has been reset successfully. You can now sign in with your new password.",
    } satisfies PasswordResetFormState);
  } catch (error) {
    sendJson(response, 500, {
      message: normalizeErrorMessage(
        error,
        "We couldn't reset your password right now. Please try again in a moment.",
      ),
    } satisfies PasswordResetFormState);
  }
}

async function handleCreateProperty(
  request: IncomingMessage,
  response: ServerResponse,
) {
  const body = await readJsonBody<PublishPropertyRequest>(request);
  const errors: PropertyFormErrors = {};
  const allowedStatuses: ListingStatus[] = ["For Rent", "For Sale"];

  if ((body.title?.trim().length ?? 0) < 5) {
    pushPropertyError(errors, "title", "Use a more descriptive listing title.");
  }

  if (!allowedStatuses.includes(body.status)) {
    pushPropertyError(
      errors,
      "status",
      "Choose whether the listing is for rent or sale.",
    );
  }

  if (!propertyTypes.includes(body.type as PropertyType)) {
    pushPropertyError(errors, "type", "Choose a valid property type.");
  }

  if (!Number.isFinite(body.price) || body.price <= 0) {
    pushPropertyError(errors, "price", "Enter a valid property price.");
  }

  if (!cityOptions.some((option) => option.label === body.cityLabel)) {
    pushPropertyError(errors, "cityLabel", "Choose a supported city.");
  }

  if ((body.location?.trim().length ?? 0) < 5) {
    pushPropertyError(errors, "location", "Add the estate, street, or neighborhood.");
  }

  if (!Number.isInteger(body.bedrooms) || body.bedrooms < 1 || body.bedrooms > 10) {
    pushPropertyError(errors, "bedrooms", "Bedrooms must be between 1 and 10.");
  }

  if (!Number.isInteger(body.bathrooms) || body.bathrooms < 1 || body.bathrooms > 10) {
    pushPropertyError(errors, "bathrooms", "Bathrooms must be between 1 and 10.");
  }

  if ((body.description?.trim().length ?? 0) < 30) {
    pushPropertyError(
      errors,
      "description",
      "Add a fuller description so buyers understand the space.",
    );
  }

  if (hasErrors(errors)) {
    sendJson(response, 400, {
      errors,
      message: "Please fix the highlighted fields and try again.",
    } satisfies PublishPropertyResponse);
    return;
  }

  try {
    const user = await findUserById(body.userId);

    if (!user) {
      sendJson(response, 404, {
        message: "We couldn't verify your account right now. Please sign in again.",
      } satisfies PublishPropertyResponse);
      return;
    }

    if (!canPublish(user.role)) {
      sendJson(response, 403, {
        message:
          "Only agent and admin accounts can publish listings. Update your role or use inspection booking instead.",
      } satisfies PublishPropertyResponse);
      return;
    }

    const property = await createCommunityProperty(
      {
        bathrooms: body.bathrooms,
        bedrooms: body.bedrooms,
        cityLabel: body.cityLabel,
        description: body.description,
        imageAssets: body.imageAssets ?? [],
        location: body.location,
        price: body.price,
        status: body.status,
        title: body.title,
        type: body.type,
      },
      toPublicUser(user),
    );

    sendJson(response, 200, {
      property,
    } satisfies PublishPropertyResponse);
  } catch (error) {
    sendJson(response, 500, {
      message: normalizeErrorMessage(
        error,
        "We couldn't publish your property right now. Please try again in a moment.",
      ),
    } satisfies PropertyFormState);
  }
}

async function handleCreateInspectionBooking(
  request: IncomingMessage,
  response: ServerResponse,
) {
  const body = await readJsonBody<InspectionBookingRequest>(request);

  if (!body.requesterId) {
    sendJson(response, 400, {
      message: "Sign in before scheduling an inspection.",
    } satisfies InspectionBookingMutationResponse);
    return;
  }

  if (!isValidEmail(body.requesterEmail ?? "")) {
    sendJson(response, 400, {
      message: "Enter a valid contact email before scheduling.",
    } satisfies InspectionBookingMutationResponse);
    return;
  }

  if ((body.requesterPhone?.trim().length ?? 0) < 7) {
    sendJson(response, 400, {
      message: "Enter a valid contact phone number for the inspection request.",
    } satisfies InspectionBookingMutationResponse);
    return;
  }

  if ((body.preferredDate?.trim().length ?? 0) === 0 || !body.preferredTime?.trim()) {
    sendJson(response, 400, {
      message: "Choose both a preferred date and time for the inspection.",
    } satisfies InspectionBookingMutationResponse);
    return;
  }

  if ((body.message?.trim().length ?? 0) < 12) {
    sendJson(response, 400, {
      message: "Add a few more details so the inspection request is actionable.",
    } satisfies InspectionBookingMutationResponse);
    return;
  }

  try {
    const requester = await findUserById(body.requesterId);

    if (!requester) {
      sendJson(response, 404, {
        message: "We couldn't verify your account right now. Please sign in again.",
      } satisfies InspectionBookingMutationResponse);
      return;
    }

    const property = await findPropertyBySlugForViewer(body.propertySlug, requester);

    if (!property) {
      sendJson(response, 404, {
        message: "This listing is unavailable for booking right now.",
      } satisfies InspectionBookingMutationResponse);
      return;
    }

    if (property.ownerId && property.ownerId === requester.id) {
      sendJson(response, 400, {
        message: "You cannot book an inspection for your own listing.",
      } satisfies InspectionBookingMutationResponse);
      return;
    }

    const booking = await createInspectionBooking({
      message: body.message,
      preferredDate: body.preferredDate,
      preferredTime: body.preferredTime,
      property,
      requester: toPublicUser(requester),
      requesterPhone: body.requesterPhone,
    });

    sendJson(response, 200, {
      booking,
      message:
        "Inspection request sent. GMT Homes will use your contact details to coordinate next steps.",
    } satisfies InspectionBookingMutationResponse);
  } catch (error) {
    sendJson(response, 500, {
      message: normalizeErrorMessage(
        error,
        "We couldn't schedule the inspection right now. Please try again in a moment.",
      ),
    } satisfies InspectionBookingMutationResponse);
  }
}

async function handleModerateProperty(
  request: IncomingMessage,
  response: ServerResponse,
) {
  const body = await readJsonBody<ModeratePropertyRequest>(request);
  const moderationStatus = normalizeModerationStatus(body.moderationStatus);

  if (!body.actorUserId || !body.propertyId || !moderationStatus) {
    sendJson(response, 400, {
      message: "Provide a valid property, actor, and moderation status.",
    } satisfies ModeratePropertyResponse);
    return;
  }

  try {
    const actor = await findUserById(body.actorUserId);

    if (!actor || !canModerate(actor.role)) {
      sendJson(response, 403, {
        message: "Only admin accounts can moderate community listings.",
      } satisfies ModeratePropertyResponse);
      return;
    }

    const property = await moderateCommunityProperty({
      moderationNotes: body.moderationNotes,
      moderationStatus,
      propertyId: body.propertyId,
    });

    if (!property) {
      sendJson(response, 404, {
        message: "That property could not be found for moderation.",
      } satisfies ModeratePropertyResponse);
      return;
    }

    sendJson(response, 200, {
      message:
        moderationStatus === "approved"
          ? "Listing approved and available in the public catalog."
          : moderationStatus === "rejected"
            ? "Listing rejected and hidden from public browsing."
            : "Listing moved back into the moderation queue.",
      property,
    } satisfies ModeratePropertyResponse);
  } catch (error) {
    sendJson(response, 500, {
      message: normalizeErrorMessage(
        error,
        "We couldn't update the moderation status right now. Please try again in a moment.",
      ),
    } satisfies ModeratePropertyResponse);
  }
}

async function handleUpdateInspectionBooking(
  request: IncomingMessage,
  response: ServerResponse,
) {
  const body = await readJsonBody<UpdateInspectionBookingRequest>(request);
  const status = normalizeInspectionBookingStatus(body.status);

  if (!body.actorUserId || !body.bookingId || !status) {
    sendJson(response, 400, {
      message: "Provide a valid booking, actor, and booking status.",
    } satisfies InspectionBookingMutationResponse);
    return;
  }

  try {
    const actor = await findUserById(body.actorUserId);

    if (!actor) {
      sendJson(response, 404, {
        message: "We couldn't verify your account right now. Please sign in again.",
      } satisfies InspectionBookingMutationResponse);
      return;
    }

    const allBookings = await getAllInspectionBookings();
    const currentBooking =
      allBookings.find((booking) => booking.id === body.bookingId) ?? null;

    if (!currentBooking) {
      sendJson(response, 404, {
        message: "That inspection request could not be found.",
      } satisfies InspectionBookingMutationResponse);
      return;
    }

    const canManageBooking =
      canModerate(actor.role) ||
      currentBooking.ownerId === actor.id ||
      currentBooking.requesterId === actor.id;

    if (!canManageBooking) {
      sendJson(response, 403, {
        message: "You do not have access to update that inspection request.",
      } satisfies InspectionBookingMutationResponse);
      return;
    }

    const booking = await updateInspectionBookingStatus({
      bookingId: body.bookingId,
      status,
    });

    sendJson(response, 200, {
      booking: booking ?? undefined,
      message: "Inspection request updated successfully.",
    } satisfies InspectionBookingMutationResponse);
  } catch (error) {
    sendJson(response, 500, {
      message: normalizeErrorMessage(
        error,
        "We couldn't update that inspection request right now. Please try again in a moment.",
      ),
    } satisfies InspectionBookingMutationResponse);
  }
}

const server = createServer(async (request, response) => {
  const method = request.method ?? "GET";
  const url = new URL(request.url ?? "/", "http://127.0.0.1");
  const pathname = url.pathname;

  try {
    if (method === "GET" && pathname === "/api/meta/capabilities") {
      sendJson(response, 200, {
        cloudImageUploadEnabled:
          Boolean(process.env.CLOUDINARY_CLOUD_NAME) &&
          Boolean(process.env.CLOUDINARY_API_KEY) &&
          Boolean(process.env.CLOUDINARY_API_SECRET),
        inspectionBookingEnabled: true,
        moderationEnabled: true,
        passwordResetEmailEnabled: canSendPasswordResetEmails(),
      } satisfies BackendCapabilitiesResponse);
      return;
    }

    if (method === "POST" && pathname === "/api/auth/signup") {
      await handleSignup(request, response);
      return;
    }

    if (method === "POST" && pathname === "/api/auth/login") {
      await handleLogin(request, response);
      return;
    }

    if (method === "POST" && pathname === "/api/auth/password-reset/request") {
      await handlePasswordResetRequest(request, response);
      return;
    }

    if (method === "POST" && pathname === "/api/auth/password-reset/complete") {
      await handlePasswordResetComplete(request, response);
      return;
    }

    if (method === "GET" && pathname === "/api/properties") {
      sendJson(response, 200, {
        properties: await getAllProperties(),
      } satisfies PropertiesResponse);
      return;
    }

    if (method === "GET" && pathname.startsWith("/api/properties/")) {
      const slug = decodeURIComponent(pathname.replace("/api/properties/", ""));
      sendJson(response, 200, {
        property: await findPropertyBySlug(slug),
      } satisfies PropertyResponse);
      return;
    }

    if (!pathname.startsWith("/api/internal/")) {
      sendJson(response, 404, {
        message: "Not found.",
      });
      return;
    }

    if (!isInternalRequest(request)) {
      sendJson(response, 401, {
        message:
          "BACKEND_SERVICE_TOKEN is invalid or missing. Update the shared frontend/backend service token and redeploy.",
      });
      return;
    }

    if (method === "POST" && pathname === "/api/internal/auth/password-change") {
      await handlePasswordChange(request, response);
      return;
    }

    if (method === "POST" && pathname === "/api/internal/properties") {
      await handleCreateProperty(request, response);
      return;
    }

    if (
      method === "GET" &&
      pathname.startsWith("/api/internal/properties/by-slug/")
    ) {
      const slug = decodeURIComponent(
        pathname.replace("/api/internal/properties/by-slug/", ""),
      );
      const viewerId = url.searchParams.get("viewerId");
      const viewer = viewerId ? await findUserById(viewerId) : null;
      sendJson(response, 200, {
        property: await findPropertyBySlugForViewer(
          slug,
          viewer ? toPublicUser(viewer) : null,
        ),
      } satisfies PropertyResponse);
      return;
    }

    if (method === "POST" && pathname === "/api/internal/bookings") {
      await handleCreateInspectionBooking(request, response);
      return;
    }

    if (method === "POST" && pathname === "/api/internal/bookings/status") {
      await handleUpdateInspectionBooking(request, response);
      return;
    }

    if (method === "GET" && pathname === "/api/internal/admin/properties") {
      const actorUserId = url.searchParams.get("actorUserId") ?? "";
      const actor = await findUserById(actorUserId);

      if (!actor || !canModerate(actor.role)) {
        sendJson(response, 403, {
          message: "Only admin accounts can review community listings.",
        });
        return;
      }

      sendJson(response, 200, {
        properties: await getCommunityPropertiesForAdmin(),
      } satisfies PropertiesResponse);
      return;
    }

    if (
      method === "GET" &&
      pathname === "/api/internal/admin/properties/moderation-queue"
    ) {
      const actorUserId = url.searchParams.get("actorUserId") ?? "";
      const actor = await findUserById(actorUserId);

      if (!actor || !canModerate(actor.role)) {
        sendJson(response, 403, {
          message: "Only admin accounts can review the moderation queue.",
        });
        return;
      }

      sendJson(response, 200, {
        properties: await getModerationQueue(),
      } satisfies PropertiesResponse);
      return;
    }

    if (method === "POST" && pathname === "/api/internal/admin/properties/moderate") {
      await handleModerateProperty(request, response);
      return;
    }

    if (method === "GET" && pathname === "/api/internal/admin/bookings") {
      const actorUserId = url.searchParams.get("actorUserId") ?? "";
      const actor = await findUserById(actorUserId);

      if (!actor || !canModerate(actor.role)) {
        sendJson(response, 403, {
          message: "Only admin accounts can review inspection bookings.",
        });
        return;
      }

      sendJson(response, 200, {
        bookings: await getAllInspectionBookings(),
      } satisfies InspectionBookingsResponse);
      return;
    }

    if (method === "GET" && pathname.startsWith("/api/internal/users/")) {
      const userPath = pathname.replace("/api/internal/users/", "");

      if (userPath.endsWith("/properties")) {
        const userId = decodeURIComponent(userPath.replace(/\/properties$/, ""));
        sendJson(response, 200, {
          properties: await getCommunityPropertiesByOwner(userId),
        } satisfies PropertiesResponse);
        return;
      }

      if (userPath.endsWith("/bookings")) {
        const userId = decodeURIComponent(userPath.replace(/\/bookings$/, ""));
        const bookings = await Promise.all([
          getInspectionBookingsByRequester(userId),
          getInspectionBookingsByOwner(userId),
        ]).then(([requesterBookings, ownerBookings]) => {
          const deduped = new Map(
            [...requesterBookings, ...ownerBookings].map((booking) => [
              booking.id,
              booking,
            ]),
          );

          return Array.from(deduped.values()).sort(
            (left, right) =>
              Date.parse(right.createdAt) - Date.parse(left.createdAt),
          );
        });

        sendJson(response, 200, {
          bookings,
        } satisfies InspectionBookingsResponse);
        return;
      }

      const userId = decodeURIComponent(userPath);
      const user = await findUserById(userId);
      sendJson(response, 200, {
        user: user ? toPublicUser(user) : null,
      } satisfies UserResponse);
      return;
    }

    sendJson(response, 404, {
      message: "Not found.",
    });
  } catch (error) {
    console.error("Unhandled backend request failure.", error);
    sendJson(response, 500, {
      message: normalizeErrorMessage(
        error,
        "The GMT Homes backend encountered an unexpected error.",
      ),
    });
  }
});

const host = getHost();
const port = getPort();

server.listen(port, host, () => {
  console.log(`GMT Homes backend running on http://${host}:${port}`);
});
