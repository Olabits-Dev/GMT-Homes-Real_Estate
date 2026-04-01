import { randomUUID } from "node:crypto";
import { cityOptions } from "@/data/listing-options";
import {
  getDefaultGalleryForType,
  getPropertyBySlug as getSeedPropertyBySlug,
  properties as seededProperties,
} from "@/data/properties";
import {
  isDatabaseConfigured,
  isUsingLocalFileStore,
  withDatabase,
} from "@/lib/database";
import { readDataFile, writeDataFile } from "@/lib/file-store";
import { slugify } from "@/lib/property-utils";
import { getGmtContactConfig } from "@/lib/server-env";
import type { AuthUser } from "@/types/auth";
import type { ListingStatus, Property, PropertyType } from "@/types/property";

const communityPropertiesFileName = "community-properties.json";

type DatabasePropertyRow = {
  property_data: Property | string;
};

type CommunityPropertyInput = {
  bathrooms: number;
  bedrooms: number;
  cityLabel: string;
  description: string;
  imageNames: string[];
  location: string;
  price: number;
  status: ListingStatus;
  title: string;
  type: PropertyType;
};

function sortProperties(properties: Property[]) {
  return [...properties].sort((left, right) => {
    const rightTimestamp = Date.parse(right.createdAt ?? "1970-01-01T00:00:00.000Z");
    const leftTimestamp = Date.parse(left.createdAt ?? "1970-01-01T00:00:00.000Z");
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

function parseDatabaseProperty(row: DatabasePropertyRow) {
  if (typeof row.property_data === "string") {
    return JSON.parse(row.property_data) as Property;
  }

  return row.property_data;
}

export async function getCommunityProperties() {
  if (isUsingLocalFileStore()) {
    const properties = await readDataFile<Property[]>(communityPropertiesFileName, []);
    return sortProperties(properties);
  }

  if (!isDatabaseConfigured()) {
    return [];
  }

  return withDatabase(async (sql) => {
    const rows = (await sql`
      SELECT property_data
      FROM community_properties
      ORDER BY created_at DESC
    `) as DatabasePropertyRow[];

    return rows.map(parseDatabaseProperty);
  });
}

export async function getCommunityPropertiesByOwner(ownerId: string) {
  if (isUsingLocalFileStore()) {
    const properties = await getCommunityProperties();
    return properties.filter((property) => property.ownerId === ownerId);
  }

  if (!isDatabaseConfigured()) {
    return [];
  }

  return withDatabase(async (sql) => {
    const rows = (await sql`
      SELECT property_data
      FROM community_properties
      WHERE owner_id = ${ownerId}
      ORDER BY created_at DESC
    `) as DatabasePropertyRow[];

    return rows.map(parseDatabaseProperty);
  });
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

  if (isUsingLocalFileStore()) {
    const communityProperties = await getCommunityProperties();
    return communityProperties.find((property) => property.slug === slug) ?? null;
  }

  if (!isDatabaseConfigured()) {
    return null;
  }

  return withDatabase(async (sql) => {
    const rows = (await sql`
      SELECT property_data
      FROM community_properties
      WHERE slug = ${slug}
      LIMIT 1
    `) as DatabasePropertyRow[];

    const [property] = rows;
    return property ? parseDatabaseProperty(property) : null;
  });
}

export async function createCommunityProperty(
  input: CommunityPropertyInput,
  user: AuthUser,
) {
  const gmtContact = getGmtContactConfig();
  const existingProperties = await getCommunityProperties();
  const selectedCity =
    cityOptions.find((option) => option.label === input.cityLabel) ?? cityOptions[0];
  const createdAt = new Date().toISOString();
  const existingSlugs = new Set(
    [...existingProperties, ...seededProperties].map((property) => property.slug),
  );
  const nextProperty: Property = {
    agent: {
      company: gmtContact.company,
      email: user.email,
      initials: getInitials(user.name),
      name: user.name,
      phone: gmtContact.phone,
      responseTime: gmtContact.listingResponseTime,
      role: "Listing Owner",
    },
    amenities: [
      "Authenticated community listing",
      "Schedule-ready contact details",
      `${input.bedrooms} spacious bedroom suite${input.bedrooms > 1 ? "s" : ""}`,
      "Flexible inspection support",
      input.imageNames.length > 0
        ? `${input.imageNames.length} uploaded image reference${input.imageNames.length > 1 ? "s" : ""}`
        : "Image upload simulated",
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
    gallery: getDefaultGalleryForType(input.type),
    highlight: `${input.type} in ${selectedCity.city} with a ${input.bedrooms}-bed layout`,
    id: randomUUID(),
    location: input.location.trim(),
    ownerId: user.id,
    price: input.price,
    shortDescription: input.description.trim().slice(0, 120),
    slug: createUniqueSlug(input.title, selectedCity.city, existingSlugs),
    source: "community",
    state: selectedCity.state,
    status: input.status,
    title: input.title.trim(),
    type: input.type,
    yearBuilt: new Date().getFullYear(),
  };

  if (isUsingLocalFileStore()) {
    await writeDataFile(communityPropertiesFileName, [
      nextProperty,
      ...existingProperties,
    ]);

    return nextProperty;
  }

  if (!isDatabaseConfigured()) {
    throw new Error(
      "DATABASE_URL is required for authenticated property publishing. Add a Neon Postgres database in Vercel and redeploy.",
    );
  }

  await withDatabase(async (sql) => {
    await sql`
      INSERT INTO community_properties (
        id,
        slug,
        owner_id,
        created_at,
        property_data
      )
      VALUES (
        ${nextProperty.id},
        ${nextProperty.slug},
        ${user.id},
        ${createdAt},
        ${JSON.stringify(nextProperty)}::jsonb
      )
    `;
  });

  return nextProperty;
}
