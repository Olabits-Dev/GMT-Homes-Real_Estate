# GMT Homes

GMT Homes is a polished real estate platform built with Next.js App Router for GMT Software's frontend training brief. It now combines a public property-browsing experience with role-aware authentication where visitors can explore listings freely, create buyer, renter, or agent accounts, sign in, access a personalized dashboard, and submit community listings through protected server actions backed by migration-aware PostgreSQL storage.

The current build goes beyond the base brief with a branded GMT Homes experience, a rotating homepage hero, locally hosted property photography, WhatsApp-first contact actions, interactive galleries, secure cookie-based sessions, PostgreSQL-backed publishing and moderation, embedded maps, inspection booking, cloud-ready image uploads for community listings, and admin tooling for migrations and account promotion.

## Live Product Scope

The app currently includes:

- a full-width homepage hero with rotating property images, manual slide controls, and direct search into listings
- a GMT Homes overview section and compact market snapshot cards
- featured property cards with local housing photos
- a searchable listings page with filters for location, property type, listing status, price range, and saved-only results
- grid and list display modes for browsing listings
- dynamic property detail pages with image gallery, fullscreen lightbox, amenities, coordinates, Google Maps link, and WhatsApp contact actions
- sign-up and sign-in flows for buyers, renters, agents, and promoted admins
- a protected dashboard for reviewing listings, bookings, and role-specific activity
- an add-property workflow that requires an agent or admin account, uploads real images to cloud storage when configured, and sends community listings through moderation before they appear in the public catalog
- an admin console for moderating submitted listings and updating inspection bookings
- embedded OpenStreetMap previews on listing pages and inspection booking directly from the property detail flow
- a space-aware authenticated header that keeps account navigation, saved items, and account actions balanced across screen sizes
- persistent favorites and dark mode using browser storage, with favorites scoped per signed-in user
- fully local seeded property media stored under `public/properties` so the core catalog does not depend on third-party image hosts at runtime

## Pages

### `/`

The homepage introduces GMT Homes with:

- a rotating image hero sourced from the property gallery set
- fixed brand messaging with manual previous and next slide controls
- direct search into the listings directory
- overview cards focused on customer value
- a live market snapshot panel
- featured property cards
- GMT Homes customer-benefit cards covering value, investment, and peace of mind

### `/properties`

The listings page includes:

- a branded header card with live listing stats
- search by location keyword
- filters for property type, status, price range, and saved homes
- grid and list view switching
- support for both seeded listings and authenticated community listings

### `/properties/[slug]`

Each property detail page includes:

- responsive image gallery
- fullscreen lightbox with keyboard and button navigation
- price, location, status, type, and highlight information
- amenities and property facts
- WhatsApp and phone contact actions
- embedded OpenStreetMap preview plus Google Maps deep link
- inspection booking for signed-in buyers, renters, and agents

### `/login`

The sign-in experience includes:

- an account login form powered by a Server Action
- validation feedback for incorrect or incomplete credentials
- redirect support back into protected flows such as `/dashboard` or `/add-property`

### `/signup`

The sign-up experience includes:

- account creation for buyers, renters, and agents
- validation for name, email, password strength, role selection, and password confirmation
- automatic session creation and redirect into the protected account workflow

### `/dashboard`

The dashboard includes:

- an authenticated account landing page
- role-aware summary cards
- listing moderation status for agents and admins
- booking activity for requesters and listing owners
- direct paths back into publishing, browsing, and admin flows

### `/add-property`

The add-property experience includes:

- a structured listing form for title, type, status, price, city, location, bedrooms, bathrooms, and description
- real cloud upload support when Cloudinary credentials are configured
- automatic fallback gallery assignment by property type when no upload is provided
- server-side validation through a protected Server Action
- authenticated publishing tied to an agent or admin account
- moderation-aware publishing before listings appear in the public catalog
- a recent account listings panel sourced from the signed-in publisher record

### `/admin`

The admin console includes:

- community listing moderation controls
- booking management for inspection requests
- a single place to review pending marketplace activity

## Key Features

### Customer Experience

- editorial GMT Homes branding and sea-blue visual system
- responsive layouts across mobile, tablet, and desktop
- readable card-based UI across homepage, listings, details, auth, dashboard, and form flows
- light and dark mode support

### Property Discovery

- featured listings on the homepage
- property filtering and search
- dynamic property routes
- saved homes workflow

### Authentication and Publishing

- buyer, renter, agent, and admin account roles
- account sign-up and sign-in flows
- cookie-based session management for authenticated routes
- protected `/dashboard`, `/add-property`, and `/admin` routes via `proxy.ts`
- server-backed community listing creation with account ownership and moderation status
- inspection booking connected to authenticated accounts
- per-user favorites storage keyed by the signed-in account

### Database and Admin Tooling

- PostgreSQL schema changes tracked through a `schema_migrations` ledger
- repo-level scripts for `db:migrate`, `db:status`, `db:summary`, and `db:make-admin`
- automatic local database bootstrap when `DATABASE_URL` points at a missing localhost database
- admin promotion support for trusted operator accounts without exposing admin self-signup

### Media and Visuals

- all seeded housing photos served locally from `public/properties`
- hero background slideshow on the homepage
- click-to-expand property images with fullscreen modal preview
- Cloudinary-backed uploads for community listing images when configured

### Local and Demo-Friendly Persistence

- favorites saved in browser storage
- theme preference saved in browser storage
- authenticated community listings persisted on the server in local JSON files for the demo environment
- hydration-safe client state powered by `useSyncExternalStore`

## Tech Stack

- Next.js 16.2.1
- React 19.2.4
- TypeScript
- Tailwind CSS 4
- App Router
- Server Actions
- `proxy.ts` route protection
- `next/font` for typography
- Node.js backend service
- browser `localStorage` for favorites and theme persistence
- PostgreSQL through `DATABASE_URL` for auth, moderation, booking, and community listing storage
- local JSON fallback for development-only auth and community listing storage when `DATABASE_URL` is omitted

## Project Structure

```text
frontend/
  app/
    actions/
    add-property/
    dashboard/
    login/
    properties/
      [slug]/
    signup/
  components/
  data/
  lib/
  public/
  types/
  proxy.ts
backend/
  src/
    lib/
    scripts/
    services/
    index.ts
  data/
shared/
  data/
  types/
```

## Data Model and State

Seeded listing data lives in `backend/data/properties.ts` and powers the homepage hero, featured cards, listings page, and property detail routes through the backend service.

Server-backed persistence now supports two environments:

- local and deployed environments can use PostgreSQL through `DATABASE_URL`
- local development can still fall back to `backend/data/auth-users.json`, `backend/data/community-properties.json`, and `backend/data/inspection-bookings.json`
- `backend/data/auth-users.example.json`, `backend/data/community-properties.example.json`, and `backend/data/inspection-bookings.example.json` are safe tracked templates
- PostgreSQL schema changes are tracked in the `schema_migrations` table and managed through the repo database scripts

The publishing flow is coordinated by:

- `backend/src/services/auth-store.ts` for account lookup and creation
- `backend/src/lib/database.ts` and `backend/src/lib/migrations.ts` for PostgreSQL connection setup and schema migration management
- `frontend/lib/session.ts` for signed cookie sessions
- `frontend/lib/auth.ts` for session-aware helpers and protected route flow
- `frontend/lib/backend-client.ts` for frontend-to-backend service calls
- `backend/src/services/community-property-store.ts` for reading and writing community listings
- `backend/src/services/inspection-booking-store.ts` for scheduling data

Browser-side persistence still lives in `frontend/lib/browser-storage.ts` and stores:

- saved property slugs
- theme preference

Context providers in `frontend/components/app-providers.tsx` expose favorites and theme controls across the app, with favorites now separated by signed-in user.

## Authentication Process

The current auth flow is intentionally lightweight and demo-friendly, but it now follows a real application structure:

1. A buyer, renter, or agent signs up on `/signup` or signs in on `/login`.
2. The form submits to a Server Action in `frontend/app/actions/auth.ts`.
3. The frontend calls the Node backend, where credentials are validated and role-aware accounts are stored in PostgreSQL when `DATABASE_URL` is configured.
4. A signed session cookie is created through `frontend/lib/session.ts`.
5. `frontend/proxy.ts` protects `/dashboard`, `/add-property`, and `/admin`, redirecting unauthenticated users to `/login`.
6. Agent and admin accounts can publish from `/add-property`, and the submission is stored in PostgreSQL when `DATABASE_URL` is configured.
7. Admins moderate submitted community listings before they appear in the public catalog.
8. Signed-in users can request inspections from property pages, and those bookings flow into dashboards and the admin console.

For local development without a database, the same flows can fall back to the gitignored `backend/data/*.json` runtime files.

## Contact Flow

The app currently uses GMT Homes contact actions centered around WhatsApp and phone support. Seeded listings use the configured GMT Homes advisor records, while authenticated community listings carry the signed-in contributor's name and email alongside the GMT Homes phone support flow.

## Getting Started

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

For the current local PostgreSQL setup, use:

```env
DATABASE_URL=postgresql://postgres:1414@localhost:5432/GMT%20Homes
```

The workspace uses separate frontend and backend env files:

- copy `frontend/.env.example` to `frontend/.env.local`
- copy `backend/.env.example` to `backend/.env.local`
- keep `SESSION_SECRET`, `BACKEND_SERVICE_TOKEN`, `SITE_URL`, and `DATABASE_URL` aligned with your local setup
- add the Cloudinary variables in `frontend/.env.local` if you want real property image uploads instead of fallback gallery images
- when `DATABASE_URL` points to local PostgreSQL, the backend will create the named database automatically on first boot if it does not exist yet
- if you want to use the development JSON fallback instead, remove `DATABASE_URL` from your local backend env file
- run `npm run db:migrate` to apply schema changes, `npm run db:status` to inspect migration state, and `npm run db:summary` to inspect current storage totals
- after creating your first admin user, run `npm run db:make-admin -- person@example.com` to promote that account into the admin console

### Backend on Vercel

The backend now uses a shared request pipeline so local development and the deployed Vercel function both execute the same application logic:

- `backend/src/app.ts` contains the shared backend request handler and route logic
- `backend/src/index.ts` starts the local Node HTTP server, converts Node requests into Web `Request` objects, and forwards them into `src/app.ts`
- `backend/api/index.ts` is the Vercel entrypoint, normalizes the rewritten `route` query into `/api/*`, and forwards that request into the same `src/app.ts` handler
- `backend/public/index.html` is a small compatibility page so Vercel still has a valid static output directory for the backend project

The backend package `build` script is now:

```bash
cd backend && npm run build
```

That command runs `tsc --noEmit -p tsconfig.json`, so it acts as a backend typecheck rather than producing a compiled server bundle.

When importing the backend as its own Vercel project:

- set the Root Directory to `backend`
- use the `Other` framework preset
- enable `Include source files outside of the Root Directory`
- override the Build Command and leave it empty
- set the Output Directory to `public`
- add the backend environment variables from `backend/.env.example`
- run `npm run db:migrate` against the production database before first real traffic

The deployed backend is configured by `backend/vercel.json` to:

- set `framework` to `null`
- keep `buildCommand` empty so Vercel does not try to run the package build as a deploy build step
- use `public` as the output directory
- rewrite `/api/*` traffic to `api/index?route=$1`

This structure keeps local development on the Node server in `backend/src/index.ts`, while production traffic runs through the Node.js Vercel function in `backend/api/index.ts` with the same core handler.

See [backend/DEPLOY_VERCEL.md](/Users/macbookpro/Desktop/real-estate-platform/backend/DEPLOY_VERCEL.md) for the exact backend dashboard settings and env checklist.

### Frontend on Vercel

The frontend can be imported separately as a Next.js project with Root Directory `frontend`.

For the safest rollout:

1. deploy the backend first
2. set the frontend project's `BACKEND_BASE_URL` to `https://gmt-homes-real-estate-backend.vercel.app`
3. use the exact same `BACKEND_SERVICE_TOKEN` value in both projects
4. set `SITE_URL` to `https://gmt-homes.vercel.app`
5. add the Cloudinary envs in the frontend project if you want real image uploads

See [frontend/DEPLOY_VERCEL.md](/Users/macbookpro/Desktop/real-estate-platform/frontend/DEPLOY_VERCEL.md) for the exact frontend dashboard settings and env checklist.

## Security Notes

- Keep real secrets in `.env.local` for local development and in Vercel Project Settings for deployed environments.
- Commit `.env.example`, `frontend/.env.example`, and `backend/.env.example`, but never commit real `.env.local` files.
- `SESSION_SECRET`, `BACKEND_SERVICE_TOKEN`, `DATABASE_URL`, `SITE_URL`, and GMT Homes contact settings are loaded from environment variables so sensitive runtime config stays out of client code.
- `backend/data/auth-users.json`, `backend/data/community-properties.json`, and `backend/data/inspection-bookings.json` are development-only runtime data files and are gitignored. The committed `*.example.json` files are the safe templates.
- If `SESSION_SECRET` is rotated, existing signed-in sessions become invalid and users must sign in again.
- Deployed auth and community submissions now expect a real database connection. If `DATABASE_URL` is missing in production, sign-in and publishing will fail safely with a configuration message.

## Available Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run db:migrate
npm run db:status
npm run db:summary
npm run db:make-admin -- you@example.com
```

## Verification

This project has been verified with:

```bash
npm run lint
npm run db:migrate
```

## Challenges Solved During the Build

### 1. Making a demo app feel real while moving beyond local files

The project brief allowed dummy data, but the experience needed to feel usable. Seeded catalog data was first combined with browser persistence, then extended into a server-backed publishing flow, and finally moved to a Vercel-compatible database path so signed-in contributors can publish reliably after deployment.

### 2. Preventing hydration and external store issues

Because favorites and theme mode depend on browser storage, the app needed hydration-safe snapshots. The current implementation uses `useSyncExternalStore` with stable server snapshots to avoid client/server mismatch issues.

### 3. Removing third-party image runtime dependency

The seeded property galleries were moved to locally hosted media under `public/properties`, which makes the showcase more reliable during development and local demos.

### 4. Keeping the UI consistent while iterating heavily

The app evolved from the original brief into a more brand-led real estate experience. Reusable card styles, shared spacing patterns, and modular components helped keep the interface coherent while homepage, listings, property details, auth, and dashboard screens continued to change.

### 5. Adding authentication without losing the fast demo workflow

The app originally treated listing submissions as browser-only state, which made ownership, access control, and repeat publishing unrealistic. The current build introduces account creation, sign-in, signed sessions, route protection, a protected dashboard, and a separate Node backend, while keeping local development simple through a JSON fallback and PostgreSQL-backed storage.

### 6. Making local PostgreSQL setup resilient

Once the app depended on PostgreSQL for auth, moderation, and bookings, local setup failures became much more visible. The current backend now supports automatic localhost database creation, migration tracking through `schema_migrations`, and repo-level admin tooling so setup and maintenance stay predictable.

### 7. Keeping signed-in navigation balanced as workflows expanded

The signed-in header had to carry more state than the public one, including dashboard access, publishing, admin links, favorites, theme, and account actions. The current navbar now rebalances those controls more gracefully across authenticated layouts so account pages stay clean without changing the underlying workflow.

## Future Improvements

- add email notifications for moderation outcomes and inspection updates
- let agents manage availability windows for inspections
- support richer map search around nearby schools, transport, and landmarks
- deploy to Vercel

## Summary

GMT Homes now delivers a complete property experience with branded presentation, interactive browsing, role-aware authentication, moderated publishing, booking, embedded maps, cloud-ready media uploads, migration-backed storage, admin tooling, protected management routes, persistent user actions, and a realistic demo-ready workflow that is much closer to a real product than the original frontend-only brief.
