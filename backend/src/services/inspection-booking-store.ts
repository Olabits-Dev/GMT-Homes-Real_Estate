import { randomUUID } from "node:crypto";
import type { AuthUser } from "../../../shared/types/auth.ts";
import type {
  InspectionBooking,
  InspectionBookingStatus,
  Property,
} from "../../../shared/types/property.ts";
import {
  isDatabaseConfigured,
  isUsingLocalFileStore,
  withDatabase,
} from "../lib/database.js";
import { readDataFile, writeDataFile } from "../lib/file-store.js";

const bookingsFileName = "inspection-bookings.json";

type DatabaseBookingRow = {
  created_at: string | Date;
  id: string;
  message: string;
  owner_id: string | null;
  preferred_date: string | Date;
  preferred_time: string;
  property_id: string;
  property_location: string;
  property_slug: string;
  property_title: string;
  requester_email: string;
  requester_id: string;
  requester_name: string;
  requester_phone: string;
  requester_role: AuthUser["role"];
  status: InspectionBookingStatus;
};

type InspectionBookingInput = {
  message: string;
  preferredDate: string;
  preferredTime: string;
  property: Property;
  requester: AuthUser;
  requesterPhone: string;
};

function normalizeBooking(booking: InspectionBooking): InspectionBooking {
  return {
    ...booking,
    status:
      booking.status === "confirmed" ||
      booking.status === "completed" ||
      booking.status === "cancelled"
        ? booking.status
        : "pending",
  };
}

function mapDatabaseBooking(row: DatabaseBookingRow): InspectionBooking {
  return normalizeBooking({
    createdAt: new Date(row.created_at).toISOString(),
    id: row.id,
    message: row.message,
    ownerId: row.owner_id,
    preferredDate:
      typeof row.preferred_date === "string"
        ? row.preferred_date.slice(0, 10)
        : row.preferred_date.toISOString().slice(0, 10),
    preferredTime: row.preferred_time,
    propertyId: row.property_id,
    propertyLocation: row.property_location,
    propertySlug: row.property_slug,
    propertyTitle: row.property_title,
    requesterEmail: row.requester_email,
    requesterId: row.requester_id,
    requesterName: row.requester_name,
    requesterPhone: row.requester_phone,
    requesterRole: row.requester_role,
    status: row.status,
  });
}

function sortBookings(bookings: InspectionBooking[]) {
  return [...bookings].sort(
    (left, right) =>
      Date.parse(right.createdAt) - Date.parse(left.createdAt),
  );
}

async function readStoredBookings() {
  const bookings = await readDataFile<InspectionBooking[]>(bookingsFileName, []);
  return sortBookings(bookings.map(normalizeBooking));
}

export async function getInspectionBookingsByRequester(requesterId: string) {
  const bookings = isUsingLocalFileStore()
    ? await readStoredBookings()
    : !isDatabaseConfigured()
      ? []
      : await withDatabase(async (sql) => {
          const rows = (await sql`
            SELECT
              id,
              property_id,
              property_slug,
              property_title,
              property_location,
              owner_id,
              requester_id,
              requester_name,
              requester_email,
              requester_phone,
              requester_role,
              preferred_date,
              preferred_time,
              message,
              status,
              created_at
            FROM inspection_bookings
            WHERE requester_id = ${requesterId}
            ORDER BY created_at DESC
          `) as DatabaseBookingRow[];

          return rows.map(mapDatabaseBooking);
        });

  return bookings.filter((booking) => booking.requesterId === requesterId);
}

export async function getInspectionBookingsByOwner(ownerId: string) {
  const bookings = isUsingLocalFileStore()
    ? await readStoredBookings()
    : !isDatabaseConfigured()
      ? []
      : await withDatabase(async (sql) => {
          const rows = (await sql`
            SELECT
              id,
              property_id,
              property_slug,
              property_title,
              property_location,
              owner_id,
              requester_id,
              requester_name,
              requester_email,
              requester_phone,
              requester_role,
              preferred_date,
              preferred_time,
              message,
              status,
              created_at
            FROM inspection_bookings
            WHERE owner_id = ${ownerId}
            ORDER BY created_at DESC
          `) as DatabaseBookingRow[];

          return rows.map(mapDatabaseBooking);
        });

  return bookings.filter((booking) => booking.ownerId === ownerId);
}

export async function getAllInspectionBookings() {
  if (isUsingLocalFileStore()) {
    return readStoredBookings();
  }

  if (!isDatabaseConfigured()) {
    return [];
  }

  return withDatabase(async (sql) => {
    const rows = (await sql`
      SELECT
        id,
        property_id,
        property_slug,
        property_title,
        property_location,
        owner_id,
        requester_id,
        requester_name,
        requester_email,
        requester_phone,
        requester_role,
        preferred_date,
        preferred_time,
        message,
        status,
        created_at
      FROM inspection_bookings
      ORDER BY created_at DESC
    `) as DatabaseBookingRow[];

    return rows.map(mapDatabaseBooking);
  });
}

export async function createInspectionBooking(input: InspectionBookingInput) {
  const nextBooking: InspectionBooking = {
    createdAt: new Date().toISOString(),
    id: randomUUID(),
    message: input.message.trim(),
    ownerId: input.property.ownerId ?? null,
    preferredDate: input.preferredDate,
    preferredTime: input.preferredTime,
    propertyId: input.property.id,
    propertyLocation: `${input.property.location}, ${input.property.city}`,
    propertySlug: input.property.slug,
    propertyTitle: input.property.title,
    requesterEmail: input.requester.email,
    requesterId: input.requester.id,
    requesterName: input.requester.name,
    requesterPhone: input.requesterPhone.trim(),
    requesterRole: input.requester.role,
    status: "pending",
  };

  if (isUsingLocalFileStore()) {
    const bookings = await readStoredBookings();
    await writeDataFile(bookingsFileName, [nextBooking, ...bookings]);
    return nextBooking;
  }

  if (!isDatabaseConfigured()) {
    throw new Error(
      "DATABASE_URL is required for inspection bookings. Add a PostgreSQL connection string and restart the backend.",
    );
  }

  await withDatabase(async (sql) => {
    await sql`
      INSERT INTO inspection_bookings (
        id,
        property_id,
        property_slug,
        property_title,
        property_location,
        owner_id,
        requester_id,
        requester_name,
        requester_email,
        requester_phone,
        requester_role,
        preferred_date,
        preferred_time,
        message,
        status,
        created_at
      )
      VALUES (
        ${nextBooking.id},
        ${nextBooking.propertyId},
        ${nextBooking.propertySlug},
        ${nextBooking.propertyTitle},
        ${nextBooking.propertyLocation},
        ${nextBooking.ownerId},
        ${nextBooking.requesterId},
        ${nextBooking.requesterName},
        ${nextBooking.requesterEmail},
        ${nextBooking.requesterPhone},
        ${nextBooking.requesterRole},
        ${nextBooking.preferredDate},
        ${nextBooking.preferredTime},
        ${nextBooking.message},
        ${nextBooking.status},
        ${nextBooking.createdAt}
      )
    `;
  });

  return nextBooking;
}

export async function updateInspectionBookingStatus(input: {
  bookingId: string;
  status: InspectionBookingStatus;
}) {
  if (isUsingLocalFileStore()) {
    const bookings = await readStoredBookings();
    const nextBookings = bookings.map((booking) =>
      booking.id === input.bookingId
        ? {
            ...booking,
            status: input.status,
          }
        : booking,
    );
    await writeDataFile(bookingsFileName, nextBookings);
    return nextBookings.find((booking) => booking.id === input.bookingId) ?? null;
  }

  if (!isDatabaseConfigured()) {
    return null;
  }

  return withDatabase(async (sql) => {
    const rows = (await sql`
      UPDATE inspection_bookings
      SET status = ${input.status}
      WHERE id = ${input.bookingId}
      RETURNING
        id,
        property_id,
        property_slug,
        property_title,
        property_location,
        owner_id,
        requester_id,
        requester_name,
        requester_email,
        requester_phone,
        requester_role,
        preferred_date,
        preferred_time,
        message,
        status,
        created_at
    `) as DatabaseBookingRow[];

    const [booking] = rows;
    return booking ? mapDatabaseBooking(booking) : null;
  });
}
