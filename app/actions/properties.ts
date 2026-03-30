"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cityOptions } from "@/data/listing-options";
import { propertyTypes } from "@/data/properties";
import { requireUser } from "@/lib/auth";
import { createCommunityProperty } from "@/lib/community-property-store";
import type {
  ListingStatus,
  PropertyType,
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

function hasErrors(errors: PropertyFormErrors) {
  return Object.values(errors).some((value) => (value?.length ?? 0) > 0);
}

function isUploadedFile(value: FormDataEntryValue): value is File {
  return typeof value === "object" && "name" in value && "size" in value;
}

export async function createPropertyAction(
  _previousState: PropertyFormState,
  formData: FormData,
): Promise<PropertyFormState> {
  const user = await requireUser();
  const title = String(formData.get("title") ?? "").trim();
  const status = String(formData.get("status") ?? "") as ListingStatus;
  const type = String(formData.get("type") ?? "") as PropertyType;
  const priceValue = String(formData.get("price") ?? "").trim();
  const cityLabel = String(formData.get("cityLabel") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const bedrooms = Number(String(formData.get("bedrooms") ?? "0"));
  const bathrooms = Number(String(formData.get("bathrooms") ?? "0"));
  const description = String(formData.get("description") ?? "").trim();
  const imageNames = formData
    .getAll("images")
    .filter(isUploadedFile)
    .filter((file) => file.size > 0)
    .map((file) => file.name);
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

  const property = await createCommunityProperty(
    {
      bathrooms,
      bedrooms,
      cityLabel,
      description,
      imageNames,
      location,
      price,
      status,
      title,
      type,
    },
    user,
  );

  revalidatePath("/add-property");
  revalidatePath("/dashboard");
  revalidatePath("/properties");
  revalidatePath(`/properties/${property.slug}`);
  redirect("/dashboard?created=1");
}
