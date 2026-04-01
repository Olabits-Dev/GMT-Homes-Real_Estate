# GMT Homes

GMT Homes is a polished real estate platform built with Next.js App Router for GMT Software's frontend training brief. It now combines a public property-browsing experience with a lightweight authentication and publishing workflow where visitors can explore listings freely, create accounts, sign in, access a publisher dashboard, and submit community listings through protected server actions.

The current build goes beyond the base brief with a branded GMT Homes experience, a rotating homepage hero, locally hosted property photography, WhatsApp-first contact actions, interactive galleries, secure cookie-based sessions, and a server-backed publishing flow for community-added listings.

## Live Product Scope

The app currently includes:

- a full-width homepage hero with rotating property images, manual slide controls, and direct search into listings
- a GMT Homes overview section and compact market snapshot cards
- featured property cards with local housing photos
- a searchable listings page with filters for location, property type, listing status, price range, and saved-only results
- grid and list display modes for browsing listings
- dynamic property detail pages with image gallery, fullscreen lightbox, amenities, coordinates, Google Maps link, and WhatsApp contact actions
- sign-up and sign-in flows for community contributors
- a protected publisher dashboard for reviewing recent submissions
- an add-property workflow that requires authentication and publishes community listings to a server-backed store so they appear instantly in the catalog
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
- location coordinates and Google Maps deep link

### `/login`

The sign-in experience includes:

- an account login form powered by a Server Action
- validation feedback for incorrect or incomplete credentials
- redirect support back into protected flows such as `/dashboard` or `/add-property`

### `/signup`

The sign-up experience includes:

- account creation for community listing contributors
- validation for name, email, password strength, and password confirmation
- automatic session creation and redirect into the protected publisher workflow

### `/dashboard`

The dashboard includes:

- an authenticated publisher landing page
- account summary cards
- a recent submission list for the signed-in user
- direct paths back into the add-property and public listings flows

### `/add-property`

The add-property experience includes:

- a structured listing form for title, type, status, price, city, location, bedrooms, bathrooms, and description
- simulated image upload feedback
- automatic default gallery assignment by property type
- server-side validation through a protected Server Action
- authenticated publishing tied to the signed-in account
- instant appearance in the public listings directory and dashboard
- a recent account listings panel sourced from the signed-in publisher record

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

- account sign-up and sign-in flows
- cookie-based session management for authenticated routes
- protected `/dashboard` and `/add-property` routes via `proxy.ts`
- server-backed community listing creation with account ownership
- per-user favorites storage keyed by the signed-in account

### Media and Visuals

- all seeded housing photos served locally from `public/properties`
- hero background slideshow on the homepage
- click-to-expand property images with fullscreen modal preview

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
- browser `localStorage` for favorites and theme persistence
- Neon Postgres for deployed auth and community listing storage
- local JSON fallback for development-only auth and community listing storage

## Project Structure

```text
app/
  actions/
  add-property/
  dashboard/
  login/
  properties/
    [slug]/
  signup/
components/
  add-property-form.tsx
  app-providers.tsx
  favorite-button.tsx
  form-submit-button.tsx
  home-hero.tsx
  image-lightbox.tsx
  login-form.tsx
  properties-explorer.tsx
  property-card.tsx
  property-detail-view.tsx
  property-gallery.tsx
  site-footer.tsx
  site-header.tsx
  signup-form.tsx
data/
  auth-users.example.json
  community-properties.example.json
  listing-options.ts
  property-options.ts
  properties.ts
lib/
  auth-store.ts
  auth.ts
  browser-storage.ts
  community-property-store.ts
  file-store.ts
  passwords.ts
  property-utils.ts
  server-env.ts
  session.ts
public/
  properties/
types/
proxy.ts
```

## Data Model and State

Seeded listing data lives in `data/properties.ts` and powers the homepage hero, featured cards, listings page, and property detail routes.

Server-backed persistence now supports two environments:

- production and Vercel deployments use Neon Postgres through `DATABASE_URL`
- local development can still fall back to `data/auth-users.json` and `data/community-properties.json`
- `data/auth-users.example.json` and `data/community-properties.example.json` are safe tracked templates

The publishing flow is coordinated by:

- `lib/auth-store.ts` for account lookup and creation
- `lib/database.ts` for Neon connection setup and schema bootstrapping
- `lib/session.ts` for signed cookie sessions
- `lib/auth.ts` for session-aware helpers and protected route flow
- `lib/community-property-store.ts` for reading and writing community listings
- `lib/server-env.ts` for server-only environment configuration

Browser-side persistence still lives in `lib/browser-storage.ts` and stores:

- saved property slugs
- theme preference

Context providers in `components/app-providers.tsx` expose favorites and theme controls across the app, with favorites now separated by signed-in user.

## Authentication Process

The current auth flow is intentionally lightweight and demo-friendly, but it now follows a real application structure:

1. A contributor signs up on `/signup` or signs in on `/login`.
2. The form submits to a Server Action in `app/actions/auth.ts`.
3. Credentials are validated on the server and contributor accounts are stored in Neon Postgres when `DATABASE_URL` is configured.
4. A signed session cookie is created through `lib/session.ts`.
5. `proxy.ts` protects `/dashboard` and `/add-property`, redirecting unauthenticated users to `/login`.
6. Authenticated users can publish from `/add-property`, and the submission is stored in Neon Postgres when `DATABASE_URL` is configured.
7. Published community listings immediately appear in the public listings directory and on the contributor dashboard.

For local development without a database, the same flows can fall back to the gitignored `data/*.json` runtime files.

## Contact Flow

The app currently uses GMT Homes contact actions centered around WhatsApp and phone support. Seeded listings use the configured GMT Homes advisor records, while authenticated community listings carry the signed-in contributor's name and email alongside the GMT Homes phone support flow.

## Getting Started

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

For production-like auth behavior, copy `.env.example` to `.env.local` and provide a strong `SESSION_SECRET`, a valid `DATABASE_URL`, plus the correct `SITE_URL` and GMT Homes contact values.

## Security Notes

- Keep real secrets in `.env.local` for local development and in Vercel Project Settings for deployed environments.
- Commit `.env.example`, but never commit `.env.local`, `.env.production`, or other real env files.
- `SESSION_SECRET`, `DATABASE_URL`, `SITE_URL`, and GMT Homes contact settings are loaded from environment variables so sensitive runtime config stays out of client code.
- `data/auth-users.json` and `data/community-properties.json` are development-only runtime data files and are gitignored. The committed `*.example.json` files are the safe templates.
- If `SESSION_SECRET` is rotated, existing signed-in sessions become invalid and users must sign in again.
- Deployed auth and community submissions now expect a real database connection. If `DATABASE_URL` is missing in production, sign-in and publishing will fail safely with a configuration message.

## Available Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Verification

This project has been verified with:

```bash
npm run lint
npm run build
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

The app originally treated listing submissions as browser-only state, which made ownership, access control, and repeat publishing unrealistic. The current build introduces account creation, sign-in, signed sessions, route protection, and a protected dashboard, while keeping local development simple through a JSON fallback and using Neon-backed storage for deployed environments.

## Future Improvements

- add schema migrations and admin tooling around the current Neon-backed storage
- extend authentication beyond the current publisher flow for buyers, renters, and agents
- support real image uploads with cloud storage
- add scheduling or inspection booking
- integrate embedded maps instead of link-out only
- add admin moderation for community-submitted listings
- deploy to Vercel

## Summary

GMT Homes now delivers a complete property experience with branded presentation, interactive browsing, authenticated publishing, protected contributor routes, local media assets, persistent user actions, and a realistic demo-ready workflow that is much closer to a real product than the original frontend-only brief.
