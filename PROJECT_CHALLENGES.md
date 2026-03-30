# GMT Homes Project Challenges and Resolutions

This document lists the main problems we encountered while building GMT Homes and how we resolved each one during development.

## 1. Making the App Feel Real Without a Backend

**Problem**

The project brief allowed dummy data, but a static catalog alone would have felt too limited and unrealistic for a real estate platform.

**How We Resolved It**

We combined seeded property data with browser `localStorage` so users can add demo listings locally and see them appear immediately in the listings flow. This made the app feel interactive without requiring a database or API.

## 2. Hydration Mismatch Between Server and Client

**Problem**

Some UI state depended on browser-only data such as theme preference, favorites, and local listings. This caused server-rendered HTML and client-rendered HTML to fall out of sync, which led to hydration warnings.

**How We Resolved It**

We moved those browser-dependent values to `useSyncExternalStore` with stable server snapshots. That kept the first server render and first client render aligned, and then allowed the browser state to hydrate safely afterward.

## 3. Infinite Loop Warning From External Store Snapshots

**Problem**

The app showed a warning that the result of `getSnapshot` should be cached to avoid an infinite loop. This happened because fresh arrays were being returned from storage reads on each render.

**How We Resolved It**

We introduced cached snapshot values in `lib/browser-storage.ts` for favorites and community properties. That ensured React received stable references unless the stored value actually changed.

## 4. Recent UI Changes Not Showing Immediately During Development

**Problem**

At different points, Safari and the local dev flow appeared to hold on to older assets or stale UI output, which made it seem like recent changes were not applying on refresh.

**How We Resolved It**

We reduced aggressive dev caching behavior, simplified the cache strategy, and restarted the dev server when config changes were made. This made refreshes more reliable during local development.

## 5. Warning Around Custom Cache Control in Next.js

**Problem**

While trying to improve refresh reliability, a warning appeared in the terminal related to custom cache control settings.

**How We Resolved It**

We removed the problematic custom `Cache-Control` override from `next.config.ts` and kept the safer development setup instead of fighting Next.js internals.

## 6. Third-Party Housing Images Were Unreliable at Runtime

**Problem**

Some listing photos depended on external hosts, which created loading problems and reduced reliability for local demos.

**How We Resolved It**

We moved the seeded property galleries to local files under `public/properties`. This made the property catalog more stable and removed dependence on third-party image hosts for the core experience.

## 7. Certain Property Images Failed to Load

**Problem**

The Lagoon View Villa gallery was one of the first places where external image loading became visibly unreliable.

**How We Resolved It**

We replaced those images with bundled local assets and then extended the same approach across the rest of the seeded listing galleries so all main listing photos are now served locally.

## 8. Property Images Needed Better Interaction

**Problem**

Users could see property photos, but there was no stronger media interaction for examining them in detail.

**How We Resolved It**

We added a reusable lightbox experience that opens images in a fullscreen popout, supports closing cleanly, and allows navigation with buttons and keyboard controls.

## 9. Hero Text Became Hard to Read Over Rotating Background Images

**Problem**

Once the homepage hero started using dynamic slideshow images, some text became difficult to read or appeared visually lost behind the image transitions.

**How We Resolved It**

We strengthened the overlay layers, corrected stacking order, kept key copy fixed instead of sliding away, and improved the glass-card treatment around hero details so the messaging stays readable across bright and dark images.

## 10. Homepage Hero Needed Stronger Control and Better Timing

**Problem**

The first slideshow behavior switched too quickly and did not give visitors enough time to absorb the content.

**How We Resolved It**

We slowed the automatic rotation, added manual previous and next controls, and introduced a longer delay before auto-rotation resumes after a user manually changes slides.

## 11. Card Components Became Oversized During UI Iteration

**Problem**

As the design evolved, some homepage, snapshot, and listing-header cards became too large and visually heavy, especially inside constrained header sections.

**How We Resolved It**

We repeatedly refined padding, icon scale, spacing, label sizing, and overall card proportions until the compact cards fit their header areas more cleanly without affecting their content or logic.

## 12. The UI Needed Better Visual Consistency Across Pages

**Problem**

Different parts of the app initially had slightly different card treatments and visual weight, which made the experience feel less unified.

**How We Resolved It**

We created a shared mini-card styling system in `app/globals.css` and reused it across the homepage, listings page, property details, and add-property flow. That gave the interface a more consistent visual language.

## 13. Branding Needed To Feel More Like a Real Product

**Problem**

The original content and branding leaned too much toward a training project instead of a customer-facing real estate product.

**How We Resolved It**

We rewrote the homepage copy, updated GMT Homes branding and motto placement, improved customer-facing messaging, and shifted content away from describing "webpage features" toward explaining customer value and property benefits.

## 14. Contact Information Needed To Be Practical and Consistent

**Problem**

The app originally used more generic agent contact patterns, which did not reflect the preferred real contact flow.

**How We Resolved It**

We updated the app to center contact actions around WhatsApp and phone support using the configured GMT Homes contact number, and applied that consistently across property details, seeded agent data, local listing defaults, and footer touchpoints.

## 15. Responsive Layout Needed Ongoing Fine-Tuning

**Problem**

Sections like the homepage hero, snapshot cards, and listings header needed multiple layout adjustments to feel balanced across desktop and smaller screens.

**How We Resolved It**

We iterated on widths, heights, spacing, typography, and card density until the important content stayed visible within the first screen and the sections felt more proportionate across breakpoints.

## Summary

The main pattern across this project was turning a frontend-only demo into something that still feels usable, stable, and product-like. Most of the work involved balancing visual quality, runtime reliability, browser-state handling, and responsive polish without introducing backend complexity.
