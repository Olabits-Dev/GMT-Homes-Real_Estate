import type { Metadata } from "next";
import Link from "next/link";
import { InspectionBookingStatusForm } from "@/components/inspection-booking-status-form";
import { requireUser } from "@/lib/auth";
import {
  getCommunityPropertiesByOwner,
  getInspectionBookingsForUser,
} from "@/lib/community-property-store";
import { formatPrice } from "@/lib/property-utils";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Manage your GMT Homes account, listings, and inspection bookings.",
};

type DashboardPageProps = {
  searchParams: Promise<{ created?: string }>;
};

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const user = await requireUser();
  const resolvedSearchParams = await searchParams;
  const canPublish = user.role === "agent" || user.role === "admin";
  const [properties, bookings] = await Promise.all([
    canPublish ? getCommunityPropertiesByOwner(user.id) : Promise.resolve([]),
    getInspectionBookingsForUser(user.id),
  ]);
  const createdBannerVisible = resolvedSearchParams.created === "1";
  const approvedListings = properties.filter(
    (property) => property.moderationStatus === "approved",
  ).length;
  const pendingListings = properties.filter(
    (property) => property.moderationStatus === "pending",
  ).length;
  const incomingBookings = bookings.filter((booking) => booking.ownerId === user.id);
  const outgoingBookings = bookings.filter((booking) => booking.requesterId === user.id);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-[2rem] border border-[color:var(--border)] bg-[linear-gradient(135deg,color-mix(in_oklab,var(--accent)_24%,transparent),color-mix(in_oklab,var(--accent-strong)_16%,transparent),var(--surface))] px-6 py-8 shadow-[var(--shadow-card)] sm:px-8 sm:py-10">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-[color:var(--muted)]">
          Account dashboard
        </p>
        <div className="mt-4 flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <h1 className="font-display text-6xl leading-none text-[color:var(--foreground)]">
              Welcome back, {user.name.split(" ")[0]}.
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-[color:var(--muted)]">
              Your role is <span className="font-semibold text-[color:var(--foreground)]">{user.role}</span>.
              GMT Homes now keeps listing, moderation, and inspection activity
              tied to the same account so your workflow stays coherent.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="app-detail-card app-detail-card--glass px-4 py-4">
              <p className="text-3xl font-black text-[color:var(--foreground)]">
                {canPublish ? properties.length : outgoingBookings.length}
              </p>
              <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--muted)]">
                {canPublish ? "Your listings" : "Bookings made"}
              </p>
            </div>
            <div className="app-detail-card app-detail-card--glass px-4 py-4">
              <p className="text-3xl font-black text-[color:var(--foreground)]">
                {canPublish ? approvedListings : incomingBookings.length}
              </p>
              <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--muted)]">
                {canPublish ? "Approved" : "Incoming"}
              </p>
            </div>
            <div className="app-detail-card app-detail-card--glass px-4 py-4">
              <p className="text-3xl font-black text-[color:var(--foreground)]">
                {canPublish ? pendingListings : bookings.filter((booking) => booking.status === "pending").length}
              </p>
              <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--muted)]">
                Pending
              </p>
            </div>
            <div className="app-detail-card app-detail-card--glass px-4 py-4">
              <p className="text-3xl font-black text-[color:var(--foreground)]">
                {bookings.length}
              </p>
              <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--muted)]">
                Total bookings
              </p>
            </div>
          </div>
        </div>
      </section>

      {createdBannerVisible ? (
        <div className="rounded-[1.5rem] border border-[color:color-mix(in_oklab,var(--accent)_28%,transparent)] bg-[color:color-mix(in_oklab,var(--accent)_12%,transparent)] px-5 py-4 text-sm font-medium text-[color:var(--accent-strong)]">
          Your property has been submitted. An admin will review it before it
          appears in the public listings directory.
        </div>
      ) : null}

      <section className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr]">
        <aside className="space-y-6">
          <div className="rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-6 shadow-[var(--shadow-card)] sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[color:var(--muted)]">
              Account details
            </p>
            <div className="mt-6 space-y-4 text-sm text-[color:var(--foreground)]">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--muted)]">
                  Name
                </p>
                <p className="mt-2 text-base font-semibold">{user.name}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--muted)]">
                  Email
                </p>
                <p className="mt-2 text-base font-semibold">{user.email}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--muted)]">
                  Role
                </p>
                <p className="mt-2 text-base font-semibold capitalize">{user.role}</p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/reset-password"
                className="inline-flex items-center rounded-full border border-[color:var(--border)] px-4 py-2 text-sm font-semibold text-[color:var(--foreground)] transition hover:-translate-y-0.5"
              >
                Reset password
              </Link>
              {user.role === "admin" ? (
                <Link
                  href="/admin"
                  className="inline-flex items-center rounded-full bg-[color:var(--accent-strong)] px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5"
                >
                  Open admin console
                </Link>
              ) : null}
            </div>
          </div>

          <div className="rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-6 shadow-[var(--shadow-card)] sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[color:var(--muted)]">
              Quick actions
            </p>
            <div className="mt-6 flex flex-col gap-3">
              {canPublish ? (
                <Link
                  href="/add-property"
                  className="inline-flex items-center justify-center rounded-full bg-[color:var(--accent-strong)] px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
                >
                  Add a property
                </Link>
              ) : (
                <Link
                  href="/properties"
                  className="inline-flex items-center justify-center rounded-full bg-[color:var(--accent-strong)] px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
                >
                  Browse listings
                </Link>
              )}
              <Link
                href="/properties"
                className="inline-flex items-center justify-center rounded-full border border-[color:var(--border)] px-5 py-3 text-sm font-semibold text-[color:var(--foreground)] transition hover:-translate-y-0.5"
              >
                Open property catalog
              </Link>
            </div>
          </div>
        </aside>

        <div className="space-y-8">
          {canPublish ? (
            <section className="rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-6 shadow-[var(--shadow-card)] sm:p-8">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-[color:var(--muted)]">
                    Your listings
                  </p>
                  <h2 className="mt-2 font-display text-4xl text-[color:var(--foreground)]">
                    Publishing pipeline
                  </h2>
                </div>
                <Link href="/add-property" className="text-sm font-semibold text-[color:var(--accent)]">
                  Add another
                </Link>
              </div>

              {properties.length === 0 ? (
                <div className="mt-8 rounded-[1.5rem] bg-[color:var(--surface-strong)] px-5 py-6">
                  <p className="text-base font-semibold text-[color:var(--foreground)]">
                    You have not published any properties yet.
                  </p>
                  <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">
                    Start with the add-property flow and your first listing will
                    enter the moderation queue from here.
                  </p>
                </div>
              ) : (
                <div className="mt-8 space-y-4">
                  {properties.map((property) => (
                    <Link
                      key={property.id}
                      href={`/properties/${property.slug}`}
                      className="block rounded-[1.5rem] border border-[color:var(--border)] bg-[color:var(--background)] px-5 py-5 transition hover:-translate-y-0.5"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--muted)]">
                            {property.city}, {property.state}
                          </p>
                          <p className="mt-2 text-2xl font-display text-[color:var(--foreground)]">
                            {property.title}
                          </p>
                          <p className="mt-2 text-sm text-[color:var(--muted)]">
                            {property.location}
                          </p>
                          <p className="mt-3 text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--muted)]">
                            {property.moderationStatus ?? "approved"}
                          </p>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="text-lg font-black text-[color:var(--accent)]">
                            {formatPrice(property.price, property.billingPeriod)}
                          </p>
                          <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--muted)]">
                            {property.status}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          ) : null}

          <section className="rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-6 shadow-[var(--shadow-card)] sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[color:var(--muted)]">
              Inspection activity
            </p>
            <h2 className="mt-2 font-display text-4xl text-[color:var(--foreground)]">
              {canPublish ? "Incoming and outgoing bookings" : "Your viewing requests"}
            </h2>

            {bookings.length === 0 ? (
              <div className="mt-8 rounded-[1.5rem] bg-[color:var(--surface-strong)] px-5 py-6">
                <p className="text-base font-semibold text-[color:var(--foreground)]">
                  No inspection activity yet.
                </p>
                <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">
                  Bookings created from property detail pages will appear here.
                </p>
              </div>
            ) : (
              <div className="mt-8 space-y-5">
                {bookings.map((booking) => {
                  const incoming = booking.ownerId === user.id;

                  return (
                    <article
                      key={booking.id}
                      className="rounded-[1.5rem] border border-[color:var(--border)] bg-[color:var(--background)] p-5"
                    >
                      <div className="flex flex-col gap-4">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--muted)]">
                            {incoming ? "Incoming booking" : "Your request"}
                          </p>
                          <p className="mt-2 text-2xl font-display text-[color:var(--foreground)]">
                            {booking.propertyTitle}
                          </p>
                          <p className="mt-2 text-sm text-[color:var(--muted)]">
                            {booking.propertyLocation}
                          </p>
                        </div>
                        <div className="grid gap-2 text-sm text-[color:var(--foreground)]">
                          <p>
                            <span className="font-semibold">Status:</span> {booking.status}
                          </p>
                          <p>
                            <span className="font-semibold">Preferred slot:</span>{" "}
                            {booking.preferredDate} at {booking.preferredTime}
                          </p>
                          <p>
                            <span className="font-semibold">
                              {incoming ? "Requester" : "Account"}:
                            </span>{" "}
                            {booking.requesterName} ({booking.requesterEmail})
                          </p>
                          <p className="leading-7 text-[color:var(--muted)]">
                            {booking.message}
                          </p>
                        </div>
                        <InspectionBookingStatusForm
                          bookingId={booking.id}
                          currentStatus={booking.status}
                        />
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </section>
    </div>
  );
}
