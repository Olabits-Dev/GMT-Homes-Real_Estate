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
import { getBackendServiceToken } from "./lib/server-env.ts";
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

function sendJson(statusCode: number, body: unknown) {
  return Response.json(body, {
    headers: jsonHeaders,
    status: statusCode,
  });
}

async function readJsonBody<T>(request: Request) {
  const rawBody = (await request.text()).trim();

  if (!rawBody) {
    return {} as T;
  }

  return JSON.parse(rawBody) as T;
}

function isInternalRequest(request: Request) {
  return request.headers.get("x-gmt-service-token") === getBackendServiceToken();
}

function normalizeErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message.trim() !== "") {
    return error.message;
  }

  return fallback;
}

async function handleSignup(request: Request) {
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
    pushAuthError(
      errors,
      "role",
      "Choose whether this account is for buying, renting, or listing.",
    );
  }

  if (hasErrors(errors)) {
    const payload: AuthMutationResponse = {
      errors,
      message: "Please fix the highlighted fields and try again.",
    };
    return sendJson(400, payload);
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
      return sendJson(409, payload);
    }

    const user = await createUser({
      email,
      name,
      password,
      role: requestedRole,
    });

    return sendJson(200, {
      user,
    } satisfies AuthMutationResponse);
  } catch (error) {
    return sendJson(500, {
      message: normalizeErrorMessage(
        error,
        "We couldn't create your account right now. Please try again in a moment.",
      ),
    } satisfies AuthFormState);
  }
}

async function handleLogin(request: Request) {
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
    return sendJson(400, {
      errors,
      message: "Please fix the highlighted fields and try again.",
    } satisfies AuthMutationResponse);
  }

  try {
    const user = await findUserByEmail(email);

    if (!user) {
      return sendJson(401, {
        message: "We couldn't sign you in with those credentials.",
      } satisfies AuthMutationResponse);
    }

    if (!(await verifyPassword(password, user.passwordSalt, user.passwordHash))) {
      return sendJson(401, {
        errors: {
          password: ["Wrong password."],
        },
        message: "Check your password and try again.",
      } satisfies AuthMutationResponse);
    }

    return sendJson(200, {
      user: toPublicUser(user),
    } satisfies AuthMutationResponse);
  } catch (error) {
    return sendJson(500, {
      message: normalizeErrorMessage(
        error,
        "We couldn't sign you in right now. Please try again in a moment.",
      ),
    } satisfies AuthFormState);
  }
}

async function handlePasswordChange(request: Request) {
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
    return sendJson(400, {
      errors,
      message: "Please fix the highlighted fields and try again.",
    } satisfies PasswordResetFormState);
  }

  try {
    const storedUser = await findUserById(body.userId);

    if (!storedUser) {
      return sendJson(404, {
        message: "We couldn't verify your account right now. Please sign in again.",
      } satisfies PasswordResetFormState);
    }

    if (
      !(await verifyPassword(
        body.currentPassword,
        storedUser.passwordSalt,
        storedUser.passwordHash,
      ))
    ) {
      return sendJson(401, {
        errors: {
          currentPassword: ["Wrong password."],
        },
        message: "Your current password is incorrect.",
      } satisfies PasswordResetFormState);
    }

    if (
      await verifyPassword(
        body.newPassword,
        storedUser.passwordSalt,
        storedUser.passwordHash,
      )
    ) {
      return sendJson(400, {
        errors: {
          newPassword: ["Use a password different from your current one."],
        },
        message: "Choose a new password before saving.",
      } satisfies PasswordResetFormState);
    }

    await updateUserPassword(body.userId, body.newPassword);

    return sendJson(200, {
      successMessage: "Your password has been updated successfully.",
    } satisfies PasswordResetFormState);
  } catch (error) {
    return sendJson(500, {
      message: normalizeErrorMessage(
        error,
        "We couldn't update your password right now. Please try again in a moment.",
      ),
    } satisfies PasswordResetFormState);
  }
}

async function handlePasswordResetRequest(request: Request) {
  const body = await readJsonBody<PasswordResetRequest>(request);
  const email = body.email?.trim().toLowerCase() ?? "";
  const errors: ForgotPasswordFormErrors = {};

  if (!isValidEmail(email)) {
    pushForgotPasswordError(errors, "email", "Enter a valid email address.");
  }

  if (hasErrors(errors)) {
    return sendJson(400, {
      errors,
      message: "Please fix the highlighted fields and try again.",
    } satisfies ForgotPasswordFormState);
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

    return sendJson(200, {
      resetLink,
      successMessage:
        "If an account with that email exists, password reset instructions have been prepared.",
    } satisfies ForgotPasswordFormState);
  } catch (error) {
    return sendJson(500, {
      message: normalizeErrorMessage(
        error,
        "We couldn't start the password reset flow right now. Please try again in a moment.",
      ),
    } satisfies ForgotPasswordFormState);
  }
}

async function handlePasswordResetComplete(request: Request) {
  const body = await readJsonBody<PasswordResetCompletionRequest>(request);
  const token = body.token?.trim() ?? "";
  const errors: PasswordResetFormErrors = {};

  if (!token) {
    return sendJson(400, {
      message: "This password reset link is invalid. Request a new one and try again.",
    } satisfies PasswordResetFormState);
  }

  validateNextPassword(body.newPassword ?? "", errors);

  if (hasErrors(errors)) {
    return sendJson(400, {
      errors,
      message: "Please fix the highlighted fields and try again.",
    } satisfies PasswordResetFormState);
  }

  try {
    const user = await findUserByPasswordResetTokenHash(
      hashPasswordResetToken(token),
    );

    if (!user) {
      return sendJson(404, {
        message:
          "This password reset link is invalid or has expired. Request a new one and try again.",
      } satisfies PasswordResetFormState);
    }

    if (
      await verifyPassword(
        body.newPassword,
        user.passwordSalt,
        user.passwordHash,
      )
    ) {
      return sendJson(400, {
        errors: {
          newPassword: ["Use a password different from your current one."],
        },
        message: "Choose a new password before saving.",
      } satisfies PasswordResetFormState);
    }

    await updateUserPassword(user.id, body.newPassword);

    return sendJson(200, {
      successMessage:
        "Your password has been reset successfully. You can now sign in with your new password.",
    } satisfies PasswordResetFormState);
  } catch (error) {
    return sendJson(500, {
      message: normalizeErrorMessage(
        error,
        "We couldn't reset your password right now. Please try again in a moment.",
      ),
    } satisfies PasswordResetFormState);
  }
}

async function handleCreateProperty(request: Request) {
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
    return sendJson(400, {
      errors,
      message: "Please fix the highlighted fields and try again.",
    } satisfies PublishPropertyResponse);
  }

  try {
    const user = await findUserById(body.userId);

    if (!user) {
      return sendJson(404, {
        message: "We couldn't verify your account right now. Please sign in again.",
      } satisfies PublishPropertyResponse);
    }

    if (!canPublish(user.role)) {
      return sendJson(403, {
        message:
          "Only agent and admin accounts can publish listings. Update your role or use inspection booking instead.",
      } satisfies PublishPropertyResponse);
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

    return sendJson(200, {
      property,
    } satisfies PublishPropertyResponse);
  } catch (error) {
    return sendJson(500, {
      message: normalizeErrorMessage(
        error,
        "We couldn't publish your property right now. Please try again in a moment.",
      ),
    } satisfies PropertyFormState);
  }
}

async function handleCreateInspectionBooking(request: Request) {
  const body = await readJsonBody<InspectionBookingRequest>(request);

  if (!body.requesterId) {
    return sendJson(400, {
      message: "Sign in before scheduling an inspection.",
    } satisfies InspectionBookingMutationResponse);
  }

  if (!isValidEmail(body.requesterEmail ?? "")) {
    return sendJson(400, {
      message: "Enter a valid contact email before scheduling.",
    } satisfies InspectionBookingMutationResponse);
  }

  if ((body.requesterPhone?.trim().length ?? 0) < 7) {
    return sendJson(400, {
      message: "Enter a valid contact phone number for the inspection request.",
    } satisfies InspectionBookingMutationResponse);
  }

  if ((body.preferredDate?.trim().length ?? 0) === 0 || !body.preferredTime?.trim()) {
    return sendJson(400, {
      message: "Choose both a preferred date and time for the inspection.",
    } satisfies InspectionBookingMutationResponse);
  }

  if ((body.message?.trim().length ?? 0) < 12) {
    return sendJson(400, {
      message: "Add a few more details so the inspection request is actionable.",
    } satisfies InspectionBookingMutationResponse);
  }

  try {
    const requester = await findUserById(body.requesterId);

    if (!requester) {
      return sendJson(404, {
        message: "We couldn't verify your account right now. Please sign in again.",
      } satisfies InspectionBookingMutationResponse);
    }

    const property = await findPropertyBySlugForViewer(body.propertySlug, requester);

    if (!property) {
      return sendJson(404, {
        message: "This listing is unavailable for booking right now.",
      } satisfies InspectionBookingMutationResponse);
    }

    if (property.ownerId && property.ownerId === requester.id) {
      return sendJson(400, {
        message: "You cannot book an inspection for your own listing.",
      } satisfies InspectionBookingMutationResponse);
    }

    const booking = await createInspectionBooking({
      message: body.message,
      preferredDate: body.preferredDate,
      preferredTime: body.preferredTime,
      property,
      requester: toPublicUser(requester),
      requesterPhone: body.requesterPhone,
    });

    return sendJson(200, {
      booking,
      message:
        "Inspection request sent. GMT Homes will use your contact details to coordinate next steps.",
    } satisfies InspectionBookingMutationResponse);
  } catch (error) {
    return sendJson(500, {
      message: normalizeErrorMessage(
        error,
        "We couldn't schedule the inspection right now. Please try again in a moment.",
      ),
    } satisfies InspectionBookingMutationResponse);
  }
}

async function handleModerateProperty(request: Request) {
  const body = await readJsonBody<ModeratePropertyRequest>(request);
  const moderationStatus = normalizeModerationStatus(body.moderationStatus);

  if (!body.actorUserId || !body.propertyId || !moderationStatus) {
    return sendJson(400, {
      message: "Provide a valid property, actor, and moderation status.",
    } satisfies ModeratePropertyResponse);
  }

  try {
    const actor = await findUserById(body.actorUserId);

    if (!actor || !canModerate(actor.role)) {
      return sendJson(403, {
        message: "Only admin accounts can moderate community listings.",
      } satisfies ModeratePropertyResponse);
    }

    const property = await moderateCommunityProperty({
      moderationNotes: body.moderationNotes,
      moderationStatus,
      propertyId: body.propertyId,
    });

    if (!property) {
      return sendJson(404, {
        message: "That property could not be found for moderation.",
      } satisfies ModeratePropertyResponse);
    }

    return sendJson(200, {
      message:
        moderationStatus === "approved"
          ? "Listing approved and available in the public catalog."
          : moderationStatus === "rejected"
            ? "Listing rejected and hidden from public browsing."
            : "Listing moved back into the moderation queue.",
      property,
    } satisfies ModeratePropertyResponse);
  } catch (error) {
    return sendJson(500, {
      message: normalizeErrorMessage(
        error,
        "We couldn't update the moderation status right now. Please try again in a moment.",
      ),
    } satisfies ModeratePropertyResponse);
  }
}

async function handleUpdateInspectionBooking(request: Request) {
  const body = await readJsonBody<UpdateInspectionBookingRequest>(request);
  const status = normalizeInspectionBookingStatus(body.status);

  if (!body.actorUserId || !body.bookingId || !status) {
    return sendJson(400, {
      message: "Provide a valid booking, actor, and booking status.",
    } satisfies InspectionBookingMutationResponse);
  }

  try {
    const actor = await findUserById(body.actorUserId);

    if (!actor) {
      return sendJson(404, {
        message: "We couldn't verify your account right now. Please sign in again.",
      } satisfies InspectionBookingMutationResponse);
    }

    const allBookings = await getAllInspectionBookings();
    const currentBooking =
      allBookings.find((booking) => booking.id === body.bookingId) ?? null;

    if (!currentBooking) {
      return sendJson(404, {
        message: "That inspection request could not be found.",
      } satisfies InspectionBookingMutationResponse);
    }

    const canManageBooking =
      canModerate(actor.role) ||
      currentBooking.ownerId === actor.id ||
      currentBooking.requesterId === actor.id;

    if (!canManageBooking) {
      return sendJson(403, {
        message: "You do not have access to update that inspection request.",
      } satisfies InspectionBookingMutationResponse);
    }

    const booking = await updateInspectionBookingStatus({
      bookingId: body.bookingId,
      status,
    });

    return sendJson(200, {
      booking: booking ?? undefined,
      message: "Inspection request updated successfully.",
    } satisfies InspectionBookingMutationResponse);
  } catch (error) {
    return sendJson(500, {
      message: normalizeErrorMessage(
        error,
        "We couldn't update that inspection request right now. Please try again in a moment.",
      ),
    } satisfies InspectionBookingMutationResponse);
  }
}

export async function handleBackendRequest(request: Request) {
  const method = request.method || "GET";
  const url = new URL(request.url);
  const pathname = url.pathname;

  try {
    if (method === "GET" && pathname === "/api/meta/capabilities") {
      return sendJson(200, {
        cloudImageUploadEnabled:
          Boolean(process.env.CLOUDINARY_CLOUD_NAME) &&
          Boolean(process.env.CLOUDINARY_API_KEY) &&
          Boolean(process.env.CLOUDINARY_API_SECRET),
        inspectionBookingEnabled: true,
        moderationEnabled: true,
        passwordResetEmailEnabled: canSendPasswordResetEmails(),
      } satisfies BackendCapabilitiesResponse);
    }

    if (method === "POST" && pathname === "/api/auth/signup") {
      return handleSignup(request);
    }

    if (method === "POST" && pathname === "/api/auth/login") {
      return handleLogin(request);
    }

    if (method === "POST" && pathname === "/api/auth/password-reset/request") {
      return handlePasswordResetRequest(request);
    }

    if (method === "POST" && pathname === "/api/auth/password-reset/complete") {
      return handlePasswordResetComplete(request);
    }

    if (method === "GET" && pathname === "/api/properties") {
      return sendJson(200, {
        properties: await getAllProperties(),
      } satisfies PropertiesResponse);
    }

    if (method === "GET" && pathname.startsWith("/api/properties/")) {
      const slug = decodeURIComponent(pathname.replace("/api/properties/", ""));
      return sendJson(200, {
        property: await findPropertyBySlug(slug),
      } satisfies PropertyResponse);
    }

    if (!pathname.startsWith("/api/internal/")) {
      return sendJson(404, {
        message: "Not found.",
      });
    }

    if (!isInternalRequest(request)) {
      return sendJson(401, {
        message:
          "BACKEND_SERVICE_TOKEN is invalid or missing. Update the shared frontend/backend service token and redeploy.",
      });
    }

    if (method === "POST" && pathname === "/api/internal/auth/password-change") {
      return handlePasswordChange(request);
    }

    if (method === "POST" && pathname === "/api/internal/properties") {
      return handleCreateProperty(request);
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
      return sendJson(200, {
        property: await findPropertyBySlugForViewer(
          slug,
          viewer ? toPublicUser(viewer) : null,
        ),
      } satisfies PropertyResponse);
    }

    if (method === "POST" && pathname === "/api/internal/bookings") {
      return handleCreateInspectionBooking(request);
    }

    if (method === "POST" && pathname === "/api/internal/bookings/status") {
      return handleUpdateInspectionBooking(request);
    }

    if (method === "GET" && pathname === "/api/internal/admin/properties") {
      const actorUserId = url.searchParams.get("actorUserId") ?? "";
      const actor = await findUserById(actorUserId);

      if (!actor || !canModerate(actor.role)) {
        return sendJson(403, {
          message: "Only admin accounts can review community listings.",
        });
      }

      return sendJson(200, {
        properties: await getCommunityPropertiesForAdmin(),
      } satisfies PropertiesResponse);
    }

    if (
      method === "GET" &&
      pathname === "/api/internal/admin/properties/moderation-queue"
    ) {
      const actorUserId = url.searchParams.get("actorUserId") ?? "";
      const actor = await findUserById(actorUserId);

      if (!actor || !canModerate(actor.role)) {
        return sendJson(403, {
          message: "Only admin accounts can review the moderation queue.",
        });
      }

      return sendJson(200, {
        properties: await getModerationQueue(),
      } satisfies PropertiesResponse);
    }

    if (method === "POST" && pathname === "/api/internal/admin/properties/moderate") {
      return handleModerateProperty(request);
    }

    if (method === "GET" && pathname === "/api/internal/admin/bookings") {
      const actorUserId = url.searchParams.get("actorUserId") ?? "";
      const actor = await findUserById(actorUserId);

      if (!actor || !canModerate(actor.role)) {
        return sendJson(403, {
          message: "Only admin accounts can review inspection bookings.",
        });
      }

      return sendJson(200, {
        bookings: await getAllInspectionBookings(),
      } satisfies InspectionBookingsResponse);
    }

    if (method === "GET" && pathname.startsWith("/api/internal/users/")) {
      const userPath = pathname.replace("/api/internal/users/", "");

      if (userPath.endsWith("/properties")) {
        const userId = decodeURIComponent(userPath.replace(/\/properties$/, ""));
        return sendJson(200, {
          properties: await getCommunityPropertiesByOwner(userId),
        } satisfies PropertiesResponse);
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

        return sendJson(200, {
          bookings,
        } satisfies InspectionBookingsResponse);
      }

      const userId = decodeURIComponent(userPath);
      const user = await findUserById(userId);
      return sendJson(200, {
        user: user ? toPublicUser(user) : null,
      } satisfies UserResponse);
    }

    return sendJson(404, {
      message: "Not found.",
    });
  } catch (error) {
    console.error("Unhandled backend request failure.", error);
    return sendJson(500, {
      message: normalizeErrorMessage(
        error,
        "The GMT Homes backend encountered an unexpected error.",
      ),
    });
  }
}
