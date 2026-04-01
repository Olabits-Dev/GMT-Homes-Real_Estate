import { randomUUID } from "node:crypto";
import { cityOptions } from "../lib/listing-options.js";
import type { AuthUser, UserRole } from "../../../shared/types/auth.ts";
import type {
  ListingStatus,
  Property,
  PropertyImageAsset,
  PropertyModerationStatus,
  PropertyType,
} from "../../../shared/types/property.ts";
import {
  getDefaultGalleryForType,
  getPropertyBySlug as getSeedPropertyBySlug,
  properties as seededProperties,
} from "../../data/properties.js";
import {
  isDatabaseConfigured,
  isUsingLocalFileStore,
  withDatabase,
} from "../lib/database.js";
import { readDataFile, writeDataFile } from "../lib/file-store.js";
import { slugify } from "../lib/property-utils.js";
import { getGmtContactConfig } from "../lib/server-env.js";

const communityPropertiesFileName = "community-properties.json";

type DatabasePropertyRow = {
  image_assets: PropertyImageAsset[] | string | null;
  moderation_notes: string | null;
  moderation_status: string | null;
  property_data: Property | string;
  published_at: string | Date | null;
};

type CommunityPropertyInput = {
  bathrooms: number;
  bedrooms: number;
  cityLabel: string;
  description: string;
  imageAssets?: PropertyImageAsset[];
  location: string;
  price: number;
  status: ListingStatus;
  title: string;
  type: PropertyType;
};

type PropertyViewer = Pick<AuthUser, "id" | "role">;

function sortProperties(properties: Property[]) {
  return [...properties].sort((left, right) => {
    const rightTimestamp = Date.parse(
      right.createdAt ?? right.publishedAt ?? "1970-01-01T00:00:00.000Z",
    );
    const leftTimestamp = Date.parse(
      left.createdAt ?? left.publishedAt ?? "1970-01-01T00:00:00.000Z",
    );
    return rightTimestamp - leftTimestamp;
  });
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function createUniqueSlug(title: string, city: string, existingSlugs: Set<string>) {
  const baseSlug = slugify(`${title}-${city}`);

  if (!existingSlugs.has(baseSlug)) {
    return baseSlug;
  }

  let suffix = 2;

  while (existingSlugs.has(`${baseSlug}-${suffix}`)) {
    suffix += 1;
  }

  return `${baseSlug}-${suffix}`;
}

function normalizeModerationStatus(
  status: string | null | undefined,
): PropertyModerationStatus {
  return status === "approved" || status === "rejected" ? status : "pending";
}

function parseImageAssets(
  imageAssets: DatabasePropertyRow["image_assets"] | Property["imageAssets"],
) {
  if (!imageAssets) {
    return [];
  }

  if (typeof imageAssets === "string") {
    return JSON.parse(imageAssets) as PropertyImageAsset[];
  }

  return imageAssets;
}

function normalizeProperty(
  property: Property,
  overrides?: Partial<{
    imageAssets: PropertyImageAsset[];
    moderationNotes: string | null;
    moderationStatus: PropertyModerationStatus;
    publishedAt: string | null;
  }>,
) {
  const nextImageAssets = overrides?.imageAssets ?? property.imageAssets ?? [];
  const nextGallery =
    nextImageAssets.length > 0
      ? nextImageAssets.map((image) => image.url)
      : property.gallery;

  return {
    ...property,
    gallery: nextGallery,
    imageAssets: nextImageAssets.length > 0 ? nextImageAssets : undefined,
    moderationNotes: overrides?.moderationNotes ?? property.moderationNotes ?? null,
    moderationStatus:
      overrides?.moderationStatus ??
      property.moderationStatus ??
      (property.source === "community" ? "approved" : undefined),
    publishedAt: overrides?.publishedAt ?? property.publishedAt ?? null,
  } satisfies Property;
}

function parseDatabaseProperty(row: DatabasePropertyRow) {
  const property =
    typeof row.property_data === "string"
      ? (JSON.parse(row.property_data) as Property)
      : row.property_data;

  return normalizeProperty(property, {
    imageAssets: parseImageAssets(row.image_assets),
    moderationNotes: row.moderation_notes,
    moderationStatus: normalizeModerationStatus(row.moderation_status),
    publishedAt: row.published_at ? new Date(row.published_at).toISOString() : null,
  });
}

async function readStoredCommunityProperties() {
  const properties = await readDataFile<Property[]>(communityPropertiesFileName, []);
  return properties.map((property) => normalizeProperty(property));
}

function canViewProperty(property: Property, viewer?: PropertyViewer | null) {
  if (property.source === "seed") {
    return true;
  }

  if (property.moderationStatus === "approved") {
    return true;
  }

  if (!viewer) {
    return false;
  }

  if (viewer.role === "admin") {
    return true;
  }

  return property.ownerId === viewer.id;
}

async function getAllCommunityPropertiesInternal() {
  if (isUsingLocalFileStore()) {
    return sortProperties(await readStoredCommunityProperties());
  }

  if (!isDatabaseConfigured()) {
    return [];
  }

  return withDatabase(async (sql) => {
    const rows = (await sql`
      SELECT
        property_data,
        moderation_status,
        moderation_notes,
        published_at,
        image_assets
      FROM community_properties
      ORDER BY created_at DESC
    `) as DatabasePropertyRow[];

    return rows.map(parseDatabaseProperty);
  });
}

export async function getCommunityProperties() {
  const properties = await getAllCommunityPropertiesInternal();
  return properties.filter((property) => property.moderationStatus === "approved");
}

export async function getCommunityPropertiesByOwner(ownerId: string) {
  const properties = await getAllCommunityPropertiesInternal();
  return properties.filter((property) => property.ownerId === ownerId);
}

export async function getCommunityPropertiesForAdmin() {
  return getAllCommunityPropertiesInternal();
}

export async function getModerationQueue() {
  const properties = await getAllCommunityPropertiesInternal();
  return properties.filter((property) => property.moderationStatus !== "approved");
}

export async function getAllProperties() {
  const communityProperties = await getCommunityProperties();
  return [...communityProperties, ...seededProperties];
}

export async function findPropertyBySlug(slug: string) {
  const seedProperty = getSeedPropertyBySlug(slug);

  if (seedProperty) {
    return seedProperty;
  }

  const communityProperties = await getCommunityProperties();
  return communityProperties.find((property) => property.slug === slug) ?? null;
}

export async function findPropertyBySlugForViewer(
  slug: string,
  viewer?: PropertyViewer | null,
) {
  const seedProperty = getSeedPropertyBySlug(slug);

  if (seedProperty) {
    return seedProperty;
  }

  const communityProperties = await getAllCommunityPropertiesInternal();
  const property =
    communityProperties.find((item) => item.slug === slug) ?? null;

  if (!property || !canViewProperty(property, viewer)) {
    return null;
  }

  return property;
}

function buildModerationStatus(role: UserRole): PropertyModerationStatus {
  return role === "admin" ? "approved" : "pending";
}

export async function createCommunityProperty(
  input: CommunityPropertyInput,
  user: AuthUser,
) {
  const gmtContact = getGmtContactConfig();
  const existingProperties = await getAllCommunityPropertiesInternal();
  const selectedCity =
    cityOptions.find((option) => option.label === input.cityLabel) ?? cityOptions[0];
  const createdAt = new Date().toISOString();
  const moderationStatus = buildModerationStatus(user.role);
  const publishedAt = moderationStatus === "approved" ? createdAt : null;
  const imageAssets = input.imageAssets ?? [];
  const existingSlugs = new Set(
    [...existingProperties, ...seededProperties].map((property) => property.slug),
  );
  const nextProperty = normalizeProperty({
    agent: {
      company: gmtContact.company,
      email: user.email,
      initials: getInitials(user.name),
      name: user.name,
      phone: gmtContact.phone,
      responseTime: gmtContact.listingResponseTime,
      role: user.role === "agent" ? "Listing Agent" : "Listing Owner",
    },
    amenities: [
      "Authenticated community listing",
      "Schedule-ready contact details",
      `${input.bedrooms} spacious bedroom suite${input.bedrooms > 1 ? "s" : ""}`,
      "Flexible inspection support",
      imageAssets.length > 0
        ? `${imageAssets.length} cloud-hosted listing image${imageAssets.length > 1 ? "s" : ""}`
        : "Gallery uses GMT fallback photography until images are uploaded",
      "GMT review-ready presentation",
    ],
    area: Math.max(90, input.bedrooms * 55 + input.bathrooms * 12),
    bathrooms: input.bathrooms,
    bedrooms: input.bedrooms,
    billingPeriod: input.status === "For Rent" ? "year" : null,
    city: selectedCity.city,
    coordinates: selectedCity.coordinates,
    createdAt,
    description: input.description.trim(),
    featured: false,
    gallery:
      imageAssets.length > 0
        ? imageAssets.map((image) => image.url)
        : getDefaultGalleryForType(input.type),
    highlight: `${input.type} in ${selectedCity.city} with a ${input.bedrooms}-bed layout`,
    id: randomUUID(),
    imageAssets,
    location: input.location.trim(),
    moderationNotes:
      moderationStatus === "approved"
        ? "Auto-approved by admin publishing flow."
        : "Awaiting admin review.",
    moderationStatus,
    ownerId: user.id,
    price: input.price,
    publishedAt,
    shortDescription: input.description.trim().slice(0, 120),
    slug: createUniqueSlug(input.title, selectedCity.city, existingSlugs),
    source: "community",
    state: selectedCity.state,
    status: input.status,
    title: input.title.trim(),
    type: input.type,
    yearBuilt: new Date().getFullYear(),
  });

  if (isUsingLocalFileStore()) {
    await writeDataFile(communityPropertiesFileName, [
      nextProperty,
      ...existingProperties,
    ]);

    return nextProperty;
  }

  if (!isDatabaseConfigured()) {
    throw new Error(
      "DATABASE_URL is required for authenticated property publishing. Add a PostgreSQL connection string and restart the backend.",
    );
  }

  await withDatabase(async (sql) => {
    await sql`
      INSERT INTO community_properties (
        id,
        slug,
        owner_id,
        created_at,
        moderation_status,
        moderation_notes,
        published_at,
        image_assets,
        property_data
      )
      VALUES (
        ${nextProperty.id},
        ${nextProperty.slug},
        ${user.id},
        ${createdAt},
        ${nextProperty.moderationStatus ?? "pending"},
        ${nextProperty.moderationNotes ?? null},
        ${nextProperty.publishedAt ?? null},
        ${JSON.stringify(nextProperty.imageAssets ?? [])}::jsonb,
        ${JSON.stringify(nextProperty)}::jsonb
      )
    `;
  });

  return nextProperty;
}

export async function moderateCommunityProperty(input: {
  moderationNotes?: string;
  moderationStatus: PropertyModerationStatus;
  propertyId: string;
}) {
  const properties = await getAllCommunityPropertiesInternal();
  const currentProperty =
    properties.find((property) => property.id === input.propertyId) ?? null;

  if (!currentProperty) {
    return null;
  }

  const publishedAt =
    input.moderationStatus === "approved"
      ? currentProperty.publishedAt ?? new Date().toISOString()
      : null;
  const nextProperty = normalizeProperty(currentProperty, {
    moderationNotes: input.moderationNotes?.trim() || null,
    moderationStatus: input.moderationStatus,
    publishedAt,
  });

  if (isUsingLocalFileStore()) {
    const nextProperties = properties.map((property) =>
      property.id === currentProperty.id ? nextProperty : property,
    );
    await writeDataFile(communityPropertiesFileName, nextProperties);
    return nextProperty;
  }

  if (!isDatabaseConfigured()) {
    return null;
  }

  await withDatabase(async (sql) => {
    await sql`
      UPDATE community_properties
      SET
        moderation_status = ${nextProperty.moderationStatus ?? "pending"},
        moderation_notes = ${nextProperty.moderationNotes ?? null},
        published_at = ${nextProperty.publishedAt ?? null},
        image_assets = ${JSON.stringify(nextProperty.imageAssets ?? [])}::jsonb,
        property_data = ${JSON.stringify(nextProperty)}::jsonb
      WHERE id = ${nextProperty.id}
    `;
  });

  return nextProperty;
}
