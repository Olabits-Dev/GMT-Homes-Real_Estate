# Backend Vercel Deployment

This backend can now be imported into Vercel as a standalone project.

## Recommended Project Settings

Use these settings in the Vercel dashboard when importing the repo:

- Framework Preset: `Other`
- Root Directory: `backend`
- Include source files outside of the Root Directory: `Enabled`
- Install Command: leave default or use `npm install`
- Build Command: override it and leave it empty
- Output Directory: `public`

The `Include source files outside of the Root Directory` setting matters because the backend imports shared types and data from `../shared`.

If Vercel has already auto-filled a Build Command or Output Directory for this project, set them to the values above before redeploying.

## Runtime Shape

The Vercel entrypoint is:

- `api/index.ts`

`vercel.json` rewrites all `/api/*` requests into that single function, which then forwards them into the shared backend handler in `src/app.ts`.

`vercel.json` also forces:

- `framework: null`
- `buildCommand: ""`
- `outputDirectory: "public"`
- a rewrite from `/api/(.*)` to `/api/index?route=$1`

This keeps the backend in the `Other` framework preset, skips the package `build` script during deployment, and gives Vercel a valid `public` directory if the project still performs an output-directory check.

The backend now ships a small compatibility page at:

- `public/index.html`

That page is only there to satisfy Vercel's static output expectation for `Other` projects. The actual backend API still runs from:

- `api/index.ts`

Local development still runs through:

- `src/index.ts`

## Required Environment Variables

Add these to the backend Vercel project for `Production` and `Preview`:

- `SITE_URL`
- `BACKEND_SERVICE_TOKEN`
- `DATABASE_URL`

For Vercel deployments, `DATABASE_URL` must point to a hosted PostgreSQL database. Do not use a local value like `postgresql://...@localhost:5432/...` there because the deployed function cannot reach your laptop.

Recommended contact configuration:

- `GMT_HOMES_COMPANY_NAME`
- `GMT_HOMES_CONTACT_EMAIL`
- `GMT_HOMES_CONTACT_PHONE`
- `GMT_HOMES_CONTACT_NAME`
- `GMT_HOMES_CONTACT_INITIALS`
- `GMT_HOMES_CONTACT_ROLE`
- `GMT_HOMES_CONTACT_RESPONSE_TIME`
- `GMT_HOMES_LISTING_RESPONSE_TIME`

Optional upload capability reporting:

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

Optional password reset email support:

- `PASSWORD_RESET_SMTP_HOST`
- `PASSWORD_RESET_SMTP_PORT`
- `PASSWORD_RESET_SMTP_USER`
- `PASSWORD_RESET_SMTP_PASS`
- `PASSWORD_RESET_SMTP_SECURE`
- `PASSWORD_RESET_FROM_EMAIL`
- `PASSWORD_RESET_TOKEN_TTL_MINUTES`

## Before First Production Use

Run migrations against the production database from your local machine:

```bash
DATABASE_URL="your-production-db-url" npm run db:migrate
```

Promote your admin account:

```bash
DATABASE_URL="your-production-db-url" npm run db:make-admin -- you@example.com
```

## Frontend Pairing

After the backend is deployed, copy its deployed base URL into the frontend Vercel project as:

- `BACKEND_BASE_URL=https://gmt-homes-real-estate-backend.vercel.app`

The frontend must use the exact same:

- `BACKEND_SERVICE_TOKEN`

## Quick Verification

After deployment, test:

- `GET /api/meta/capabilities`
- `GET /api/properties`
- `POST /api/auth/login`
- `GET /` should show a simple backend status page

If auth or publishing fails, verify that:

- `DATABASE_URL` is set
- `BACKEND_SERVICE_TOKEN` matches the frontend project
- migrations have been applied
