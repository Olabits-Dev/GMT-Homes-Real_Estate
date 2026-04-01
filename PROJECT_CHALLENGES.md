# GMT Homes Project Challenges and Resolutions

This document tracks the main problems we encountered while evolving GMT Homes from a frontend-first brief into a more realistic, database-backed product experience.

## 1. Moving From a Demo-Only App to Real Persistence

**Problem**

The original brief allowed dummy data, but a static catalog and browser-only listing submissions were not enough once the app started supporting real accounts, ownership, and repeat publishing.

**How We Resolved It**

We kept the seeded catalog for public browsing, then introduced a dedicated backend service with PostgreSQL as the primary store for authentication, community listings, moderation, and inspection bookings. For local development, we preserved a JSON fallback so the project can still run without a database when needed.

## 2. Making Local PostgreSQL Reliable During Development

**Problem**

Once auth, moderation, and bookings depended on PostgreSQL, local setup issues became much more visible. A missing database, schema drift, or a `DATABASE_URL` that referenced a spaced database name such as `GMT Homes` could break the app early in boot.

**How We Resolved It**

We centralized database startup in the backend, correctly decode the target database name from `DATABASE_URL`, automatically create the named localhost database when it is missing, and track schema changes through a `schema_migrations` table. We also added repo scripts for `db:migrate`, `db:status`, `db:summary`, and `db:make-admin` so setup and maintenance are predictable.

## 3. Expanding Authentication Beyond a Single Publisher Flow

**Problem**

The earlier publishing flow only really fit one kind of signed-in user. That was too narrow once the platform needed buyers, renters, agents, and admin operators to use the same product in different ways.

**How We Resolved It**

We expanded signup and session handling to support buyer, renter, agent, and admin roles. Dashboards, publishing permissions, navigation, and moderation access are now role-aware, while admin privileges are granted through trusted promotion tooling instead of public self-signup.

## 4. Adding Moderation for Community Listings

**Problem**

As soon as community submissions became persistent, the app needed a trust and safety layer. Publicly showing every new listing immediately would make quality control and approval impossible.

**How We Resolved It**

We introduced moderation states for submitted properties, restricted public listing pages to approved community listings, and built an admin console where operators can review pending submissions, approve or reject them, and leave moderation notes.

## 5. Supporting Inspection Scheduling Without Breaking Browsing

**Problem**

Users needed a way to request property visits directly from listing pages, but the request flow also had to stay visible to listing owners and admins after submission.

**How We Resolved It**

We added inspection booking directly to property detail pages for signed-in users, created backend storage for booking records and status changes, and surfaced the resulting activity in both the user dashboard and the admin console.

## 6. Supporting Real Image Uploads While Preserving Demo Safety

**Problem**

Fallback galleries were useful for demos, but they were not enough for a publishing workflow that should accept real listing photos.

**How We Resolved It**

We added Cloudinary-backed uploads for community listing images when credentials are configured, while still preserving a safe fallback image path when cloud upload is not available. This keeps the demo resilient without blocking the more realistic upload workflow.

## 7. Replacing Link-Only Maps With Embedded Context

**Problem**

Sending users out to a map provider immediately made the property experience feel less polished and less informative inside the app itself.

**How We Resolved It**

We added embedded OpenStreetMap previews to listing detail pages while keeping a deeper external map link available when users want full navigation outside the product.

## 8. Preventing Hydration Mismatch Between Server and Client

**Problem**

Theme choice, favorites, and other browser-scoped state created a mismatch risk between server-rendered output and client-rendered output.

**How We Resolved It**

We moved browser-dependent state to `useSyncExternalStore` with stable server snapshots so the first render stays aligned and the browser can hydrate safely afterward.

## 9. Avoiding External Store Snapshot Loops

**Problem**

React warned that some external store snapshots were unstable because new arrays or objects were being created repeatedly from browser storage reads.

**How We Resolved It**

We introduced cached snapshot values in the browser storage helpers so React only sees a changed reference when the underlying stored data actually changes.

## 10. Removing Fragile External Media Dependencies

**Problem**

Some early seeded property galleries depended on third-party image hosts, which led to inconsistent loading and a weaker offline or local demo experience.

**How We Resolved It**

We moved the seeded property galleries into local assets under `public/properties`, then layered the Cloudinary upload path only on top of community submissions that need real media.

## 11. Keeping the Interface Consistent While the Product Expanded

**Problem**

The app grew from a branded homepage into a larger product with listings, auth, dashboards, moderation, bookings, and management flows. Without discipline, those screens could have drifted apart visually.

**How We Resolved It**

We leaned on shared card treatments, repeated spacing patterns, consistent typography choices, and reusable UI components so the new flows still feel like the same GMT Homes product.

## 12. Preserving Responsive Quality as Signed-In Workflows Grew

**Problem**

The public navbar was simple, but the signed-in version had to fit dashboard access, publishing, admin links, saved items, sign-out, theme controls, and the active user identity. That created width pressure in account-heavy layouts.

**How We Resolved It**

We updated the authenticated header to rebalance its layout more intelligently across screen sizes, shorten the account pill when necessary, and keep the side-to-side navigation stable without affecting the underlying workflow.

## Summary

The recurring pattern across GMT Homes has been turning a polished demo into something more operational without losing approachability. The biggest gains came from adding real persistence, roles, moderation, booking, uploads, and admin tooling while continuing to protect frontend polish, browsing speed, and responsive behavior.
