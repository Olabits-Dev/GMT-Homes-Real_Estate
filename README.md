# GMT Homes

GMT Homes is a polished real estate platform built with Next.js App Router for GMT Software's frontend training brief. It presents a modern property-browsing experience where visitors can discover homes for rent or sale, save favorites, inspect full property details, and submit demo listings locally without a backend.

The current build goes beyond the base brief with a branded GMT Homes experience, a rotating homepage hero, locally hosted property photography, WhatsApp-first contact actions, interactive galleries, and local persistence for saved homes, theme preference, and community-added listings.

## Live Product Scope

The app currently includes:

- a full-width homepage hero with rotating property images, manual slide controls, and direct search into listings
- a GMT Homes overview section and compact market snapshot cards
- featured property cards with local housing photos
- a searchable listings page with filters for location, property type, listing status, price range, and saved-only results
- grid and list display modes for browsing listings
- dynamic property detail pages with image gallery, fullscreen lightbox, amenities, coordinates, Google Maps link, and WhatsApp contact actions
- an add-property workflow that lets users create demo listings locally and see them appear instantly in the catalog
- persistent favorites and dark mode using browser storage
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
- support for both seeded listings and user-added local listings

### `/properties/[slug]`

Each property detail page includes:

- responsive image gallery
- fullscreen lightbox with keyboard and button navigation
- price, location, status, type, and highlight information
- amenities and property facts
- WhatsApp and phone contact actions
- location coordinates and Google Maps deep link

### `/add-property`

The add-property experience includes:

- a structured listing form for title, type, status, price, city, location, bedrooms, bathrooms, and description
- simulated image upload feedback
- automatic default gallery assignment by property type
- instant local persistence using `localStorage`
- a recent local listings panel powered by browser storage

## Key Features

### Customer Experience

- editorial GMT Homes branding and sea-blue visual system
- responsive layouts across mobile, tablet, and desktop
- readable card-based UI across homepage, listings, details, and form flows
- light and dark mode support

### Property Discovery

- featured listings on the homepage
- property filtering and search
- dynamic property routes
- saved homes workflow

### Media and Visuals

- all seeded housing photos served locally from `public/properties`
- hero background slideshow on the homepage
- click-to-expand property images with fullscreen modal preview

### Local Interactivity

- favorites saved in browser storage
- theme preference saved in browser storage
- community listings saved in browser storage
- hydration-safe client state powered by `useSyncExternalStore`

## Tech Stack

- Next.js 16.2.1
- React 19.2.4
- TypeScript
- Tailwind CSS 4
- App Router
- `next/font` for typography
- browser `localStorage` for local persistence

## Project Structure

```text
app/
  add-property/
  properties/
    [slug]/
components/
  add-property-form.tsx
  app-providers.tsx
  favorite-button.tsx
  home-hero.tsx
  image-lightbox.tsx
  properties-explorer.tsx
  property-card.tsx
  property-detail-view.tsx
  property-gallery.tsx
  site-footer.tsx
  site-header.tsx
data/
  properties.ts
lib/
  browser-storage.ts
  property-utils.ts
public/
  properties/
types/
```

## Data Model and State

Seeded listing data lives in `data/properties.ts` and powers the homepage hero, featured cards, listings page, and property detail routes.

Browser-side persistence lives in `lib/browser-storage.ts` and stores:

- saved property slugs
- theme preference
- community-submitted listings

Context providers in `components/app-providers.tsx` expose favorites and theme controls across the app.

## Contact Flow

The app currently uses GMT Homes contact actions centered around WhatsApp and phone support. Seeded listings and local listings route contact interactions to the GMT Homes contact number currently configured in the property agent data and footer.

## Getting Started

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

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

### 1. Making a demo app feel real without a backend

The project brief allowed dummy data, but the experience needed to feel usable. Seeded catalog data was combined with browser persistence so users can add local listings and see them reflected in the browsing flow instantly.

### 2. Preventing hydration and external store issues

Because favorites, theme mode, and community listings depend on browser storage, the app needed hydration-safe snapshots. The current implementation uses `useSyncExternalStore` with stable server snapshots to avoid client/server mismatch issues.

### 3. Removing third-party image runtime dependency

The seeded property galleries were moved to locally hosted media under `public/properties`, which makes the showcase more reliable during development and local demos.

### 4. Keeping the UI consistent while iterating heavily

The app evolved from the original brief into a more brand-led real estate experience. Reusable card styles, shared spacing patterns, and modular components helped keep the interface coherent while homepage, listings, and property details continued to change.

## Future Improvements

- connect listings to a database or CMS
- add real authentication for buyers, renters, and agents
- support real image uploads with cloud storage
- add scheduling or inspection booking
- integrate embedded maps instead of link-out only
- add admin moderation for community-submitted listings
- deploy to Vercel

## Summary

GMT Homes now delivers a complete frontend property experience with branded presentation, interactive browsing, local media assets, persistent user actions, and a realistic no-backend demo flow that aligns closely with the work completed in this project.
