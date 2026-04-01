"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cityOptions } from "@/data/listing-options";
import { propertyTypes } from "@/data/property-options";
import { requireAdmin, requirePublisher, requireUser } from "@/lib/auth";
import { uploadPropertyImages } from "@/lib/cloudinary";
import {
  changeInspectionBookingStatus,
  createCommunityProperty,
  requestInspectionBooking,
  updateCommunityPropertyModeration,
} from "@/lib/community-property-store";
import type {
  ActionFeedbackState,
  InspectionBookingFormErrors,
  InspectionBookingFormState,
} from "@/types/property-actions";
import type {
  InspectionBookingStatus,
  ListingStatus,
  PropertyType,
  PropertyModerationStatus,
} from "@/types/property";
import type { PropertyFormErrors, PropertyFormState } from "@/types/auth";

const allowedStatuses: ListingStatus[] = ["For Rent", "For Sale"];

function pushError(
  errors: PropertyFormErrors,
  field: keyof PropertyFormErrors,
  message: string,
) {
  errors[field] = [...(errors[field] ?? []), message];
}

function pushInspectionBookingError(
  errors: InspectionBookingFormErrors,
  field: keyof InspectionBookingFormErrors,
  message: string,
) {
  errors[field] = [...(errors[field] ?? []), message];
}

function hasErrors(
  errors: PropertyFormErrors | InspectionBookingFormErrors,
) {
  return Object.values(errors).some((value) => (value?.length ?? 0) > 0);
}

function getPropertyFailureMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "We couldn't publish your property right now. Please try again in a moment.";
}

function getActionFailureMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message.trim() !== "") {
    return error.message;
  }

  return fallback;
}

function isUploadedFile(value: FormDataEntryValue): value is File {
  return typeof value === "object" && "name" in value && "size" in value;
}

function normalizeModerationStatus(
  value: string,
): PropertyModerationStatus | null {
  return value === "approved" || value === "rejected" || value === "pending"
    ? value
    : null;
}

function normalizeInspectionBookingStatus(
  value: string,
): InspectionBookingStatus | null {
  return value === "pending" ||
    value === "confirmed" ||
    value === "completed" ||
    value === "cancelled"
    ? value
    : null;
}

export async function createPropertyAction(
  _previousState: PropertyFormState,
  formData: FormData,
): Promise<PropertyFormState> {
  const user = await requirePublisher();
  const title = String(formData.get("title") ?? "").trim();
  const status = String(formData.get("status") ?? "") as ListingStatus;
  const type = String(formData.get("type") ?? "") as PropertyType;
  const priceValue = String(formData.get("price") ?? "").trim();
  const cityLabel = String(formData.get("cityLabel") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const bedrooms = Number(String(formData.get("bedrooms") ?? "0"));
  const bathrooms = Number(String(formData.get("bathrooms") ?? "0"));
  const description = String(formData.get("description") ?? "").trim();
  const files = formData
    .getAll("images")
    .filter(isUploadedFile)
    .filter((file) => file.size > 0);
  const errors: PropertyFormErrors = {};
  const price = Number(priceValue);

  if (title.length < 5) {
    pushError(errors, "title", "Use a more descriptive listing title.");
  }

  if (!allowedStatuses.includes(status)) {
    pushError(errors, "status", "Choose whether the listing is for rent or sale.");
  }

  if (!propertyTypes.includes(type)) {
    pushError(errors, "type", "Choose a valid property type.");
  }

  if (!Number.isFinite(price) || price <= 0) {
    pushError(errors, "price", "Enter a valid property price.");
  }

  if (!cityOptions.some((option) => option.label === cityLabel)) {
    pushError(errors, "cityLabel", "Choose a supported city.");
  }

  if (location.length < 5) {
    pushError(errors, "location", "Add the estate, street, or neighborhood.");
  }

  if (!Number.isInteger(bedrooms) || bedrooms < 1 || bedrooms > 10) {
    pushError(errors, "bedrooms", "Bedrooms must be between 1 and 10.");
  }

  if (!Number.isInteger(bathrooms) || bathrooms < 1 || bathrooms > 10) {
    pushError(errors, "bathrooms", "Bathrooms must be between 1 and 10.");
  }

  if (description.length < 30) {
    pushError(
      errors,
      "description",
      "Add a fuller description so buyers understand the space.",
    );
  }

  if (hasErrors(errors)) {
    return {
      errors,
      message: "Please fix the highlighted fields and try again.",
    };
  }

  try {
    const imageAssets = files.length > 0 ? await uploadPropertyImages(files) : [];
    const property = await createCommunityProperty({
      bathrooms,
      bedrooms,
      cityLabel,
      description,
      imageAssets,
      location,
      price,
      status,
      title,
      type,
      userId: user.id,
    });

    revalidatePath("/add-property");
    revalidatePath("/dashboard");
    revalidatePath("/properties");
    revalidatePath(`/properties/${property.slug}`);
    revalidatePath("/admin");
  } catch (error) {
    console.error("Property creation failed.", error);
    return {
      message: getPropertyFailureMessage(error),
    };
  }

  redirect("/dashboard?created=1");
}

export async function requestInspectionBookingAction(
  _previousState: InspectionBookingFormState,
  formData: FormData,
): Promise<InspectionBookingFormState> {
  const user = await requireUser();
  const propertyId = String(formData.get("propertyId") ?? "").trim();
  const propertySlug = String(formData.get("propertySlug") ?? "").trim();
  const propertyTitle = String(formData.get("propertyTitle") ?? "").trim();
  const preferredDate = String(formData.get("preferredDate") ?? "").trim();
  const preferredTime = String(formData.get("preferredTime") ?? "").trim();
  const requesterPhone = String(formData.get("requesterPhone") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const errors: InspectionBookingFormErrors = {};

  if (!preferredDate) {
    pushInspectionBookingError(errors, "preferredDate", "Choose a preferred inspection date.");
  }

  if (!preferredTime) {
    pushInspectionBookingError(errors, "preferredTime", "Choose a preferred inspection time.");
  }

  if (requesterPhone.length < 7) {
    pushInspectionBookingError(errors, "requesterPhone", "Enter a valid phone number.");
  }

  if (message.length < 12) {
    pushInspectionBookingError(
      errors,
      "message",
      "Add enough detail so the viewing request is actionable.",
    );
  }

  if (hasErrors(errors)) {
    return {
      errors,
      message: "Please fix the highlighted fields and try again.",
    };
  }

  try {
    await requestInspectionBooking({
      message,
      preferredDate,
      preferredTime,
      propertyId,
      propertySlug,
      propertyTitle,
      requesterEmail: user.email,
      requesterId: user.id,
      requesterName: user.name,
      requesterPhone,
    });

    revalidatePath("/dashboard");
    revalidatePath("/admin");

    return {
      successMessage:
        "Inspection request sent. GMT Homes will use your contact details to coordinate next steps.",
    };
  } catch (error) {
    console.error("Inspection booking failed.", error);
    return {
      message: getActionFailureMessage(
        error,
        "We couldn't schedule the inspection right now. Please try again in a moment.",
      ),
    };
  }
}

export async function moderatePropertyAction(
  _previousState: ActionFeedbackState,
  formData: FormData,
): Promise<ActionFeedbackState> {
  const admin = await requireAdmin();
  const propertyId = String(formData.get("propertyId") ?? "").trim();
  const propertySlug = String(formData.get("propertySlug") ?? "").trim();
  const moderationStatus = normalizeModerationStatus(
    String(formData.get("moderationStatus") ?? ""),
  );
  const moderationNotes = String(formData.get("moderationNotes") ?? "").trim();

  if (!propertyId || !moderationStatus) {
    return {
      message: "Choose a valid moderation action before saving.",
    };
  }

  try {
    await updateCommunityPropertyModeration({
      actorUserId: admin.id,
      moderationNotes,
      moderationStatus,
      propertyId,
    });

    revalidatePath("/admin");
    revalidatePath("/properties");
    revalidatePath("/dashboard");
    if (propertySlug) {
      revalidatePath(`/properties/${propertySlug}`);
    }

    return {
      successMessage:
        moderationStatus === "approved"
          ? "Listing approved and now visible in the public catalog."
          : moderationStatus === "rejected"
            ? "Listing rejected and removed from public browsing."
            : "Listing returned to the moderation queue.",
    };
  } catch (error) {
    console.error("Moderation update failed.", error);
    return {
      message: getActionFailureMessage(
        error,
        "We couldn't update that listing right now. Please try again in a moment.",
      ),
    };
  }
}

export async function updateInspectionBookingStatusAction(
  _previousState: ActionFeedbackState,
  formData: FormData,
): Promise<ActionFeedbackState> {
  const user = await requireUser();
  const bookingId = String(formData.get("bookingId") ?? "").trim();
  const status = normalizeInspectionBookingStatus(
    String(formData.get("status") ?? ""),
  );

  if (!bookingId || !status) {
    return {
      message: "Choose a valid booking status before saving.",
    };
  }

  try {
    await changeInspectionBookingStatus({
      actorUserId: user.id,
      bookingId,
      status,
    });

    revalidatePath("/dashboard");
    revalidatePath("/admin");

    return {
      successMessage: "Inspection request updated successfully.",
    };
  } catch (error) {
    console.error("Inspection booking update failed.", error);
    return {
      message: getActionFailureMessage(
        error,
        "We couldn't update that inspection request right now. Please try again in a moment.",
      ),
    };
  }
}
