import type { Metadata } from "next";
import Link from "next/link";
import { InspectionBookingStatusForm } from "@/components/inspection-booking-status-form";
import { ModerationForm } from "@/components/moderation-form";
import { requireAdmin } from "@/lib/auth";
import {
  getInspectionBookingsForAdmin,
  getModerationQueueForAdmin,
} from "@/lib/community-property-store";
import { formatPrice } from "@/lib/property-utils";

export const metadata: Metadata = {
  title: "Admin",
  description: "Moderate community listings and manage inspection bookings.",
};

export default async function AdminPage() {
  const admin = await requireAdmin();
  const [moderationQueue, inspectionBookings] = await Promise.all([
    getModerationQueueForAdmin(admin.id),
    getInspectionBookingsForAdmin(admin.id),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-[2rem] border border-[color:var(--border)] bg-[linear-gradient(135deg,color-mix(in_oklab,var(--accent)_24%,transparent),color-mix(in_oklab,var(--accent-strong)_16%,transparent),var(--surface))] px-6 py-8 shadow-[var(--shadow-card)] sm:px-8 sm:py-10">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-[color:var(--muted)]">
          Admin console
        </p>
        <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <h1 className="font-display text-6xl leading-none text-[color:var(--foreground)]">
              Review listings, bookings, and marketplace activity.
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-[color:var(--muted)]">
              Signed in as {admin.name}. This workspace keeps moderation and
              scheduling close to the listing flow so approvals and inspection
              updates happen without leaving the product.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="app-detail-card app-detail-card--glass px-4 py-4">
              <p className="text-3xl font-black text-[color:var(--foreground)]">
                {moderationQueue.length}
              </p>
              <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--muted)]">
                Queue items
              </p>
            </div>
            <div className="app-detail-card app-detail-card--glass px-4 py-4">
              <p className="text-3xl font-black text-[color:var(--foreground)]">
                {
                  inspectionBookings.filter((booking) => booking.status === "pending")
                    .length
                }
              </p>
              <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--muted)]">
                Pending bookings
              </p>
            </div>
            <div className="app-detail-card app-detail-card--glass px-4 py-4">
              <p className="text-3xl font-black text-[color:var(--foreground)]">
                {inspectionBookings.length}
              </p>
              <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--muted)]">
                Total bookings
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-6 shadow-[var(--shadow-card)] sm:p-8">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[color:var(--muted)]">
                Moderation queue
              </p>
              <h2 className="mt-2 font-display text-4xl text-[color:var(--foreground)]">
                Community listings
              </h2>
            </div>
            <Link href="/properties" className="text-sm font-semibold text-[color:var(--accent)]">
              View public catalog
            </Link>
          </div>

          {moderationQueue.length === 0 ? (
            <div className="mt-8 rounded-[1.5rem] bg-[color:var(--surface-strong)] px-5 py-6 text-sm leading-7 text-[color:var(--muted)]">
              The moderation queue is clear right now.
            </div>
          ) : (
            <div className="mt-8 space-y-6">
              {moderationQueue.map((property) => (
                <article
                  key={property.id}
                  className="rounded-[1.5rem] border border-[color:var(--border)] bg-[color:var(--background)] p-5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--muted)]">
                        {property.city}, {property.state}
                      </p>
                      <h3 className="mt-2 font-display text-3xl text-[color:var(--foreground)]">
                        {property.title}
                      </h3>
                      <p className="mt-2 text-sm text-[color:var(--muted)]">
                        {property.location}
                      </p>
                      <p className="mt-3 text-sm leading-7 text-[color:var(--foreground)]">
                        {property.shortDescription}
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-lg font-black text-[color:var(--accent)]">
                        {formatPrice(property.price, property.billingPeriod)}
                      </p>
                      <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--muted)]">
                        {property.moderationStatus ?? "pending"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
                    <div className="rounded-[1.25rem] bg-[color:var(--surface)] px-4 py-4 text-sm leading-7 text-[color:var(--foreground)]">
                      <p className="font-semibold">Listing owner</p>
                      <p className="mt-2">{property.agent.name}</p>
                      <p className="text-[color:var(--muted)]">{property.agent.email}</p>
                      {property.moderationNotes ? (
                        <p className="mt-3 text-[color:var(--muted)]">
                          Current note: {property.moderationNotes}
                        </p>
                      ) : null}
                    </div>
                    <ModerationForm
                      currentStatus={property.moderationStatus ?? "pending"}
                      propertyId={property.id}
                      propertySlug={property.slug}
                    />
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-6 shadow-[var(--shadow-card)] sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[color:var(--muted)]">
            Inspection bookings
          </p>
          <h2 className="mt-2 font-display text-4xl text-[color:var(--foreground)]">
            Scheduling flow
          </h2>

          {inspectionBookings.length === 0 ? (
            <div className="mt-8 rounded-[1.5rem] bg-[color:var(--surface-strong)] px-5 py-6 text-sm leading-7 text-[color:var(--muted)]">
              Inspection requests will appear here as buyers, renters, and
              agents schedule viewings from listing pages.
            </div>
          ) : (
            <div className="mt-8 space-y-5">
              {inspectionBookings.map((booking) => (
                <article
                  key={booking.id}
                  className="rounded-[1.5rem] border border-[color:var(--border)] bg-[color:var(--background)] p-5"
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--muted)]">
                        {booking.requesterRole} request
                      </p>
                      <h3 className="font-display text-3xl text-[color:var(--foreground)]">
                        {booking.propertyTitle}
                      </h3>
                      <p className="text-sm text-[color:var(--muted)]">
                        {booking.propertyLocation}
                      </p>
                    </div>
                    <div className="grid gap-3 text-sm text-[color:var(--foreground)]">
                      <p>
                        <span className="font-semibold">Requester:</span> {booking.requesterName}
                      </p>
                      <p>
                        <span className="font-semibold">Email:</span> {booking.requesterEmail}
                      </p>
                      <p>
                        <span className="font-semibold">Phone:</span> {booking.requesterPhone}
                      </p>
                      <p>
                        <span className="font-semibold">Preferred slot:</span>{" "}
                        {booking.preferredDate} at {booking.preferredTime}
                      </p>
                      <p className="leading-7 text-[color:var(--muted)]">{booking.message}</p>
                    </div>
                    <InspectionBookingStatusForm
                      bookingId={booking.id}
                      currentStatus={booking.status}
                    />
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </div>
  );
}
