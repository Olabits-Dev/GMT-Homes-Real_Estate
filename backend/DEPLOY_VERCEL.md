# Backend Vercel Deployment

This backend can now be imported into Vercel as a standalone project.

## Recommended Project Settings

Use these settings in the Vercel dashboard when importing the repo:

- Framework Preset: `Other`
- Root Directory: `backend`
- Include source files outside of the Root Directory: `Enabled`
- Install Command: leave default or use `npm install`
- Build Command: leave empty
- Output Directory: leave empty

The `Include source files outside of the Root Directory` setting matters because the backend imports shared types and data from `../shared`.

If Vercel has already auto-filled a Build Command or Output Directory for this project, clear both values in the dashboard before redeploying.

## Runtime Shape

The Vercel entrypoint is:

- `api/[...route].ts`

It forwards all `/api/*` requests into the shared backend handler in `src/app.ts`.

`vercel.json` also forces:

- `framework: null`
- `buildCommand: null`
- `outputDirectory: null`

This prevents Vercel from treating the backend like a static-output project.

Local development still runs through:

- `src/index.ts`

## Required Environment Variables

Add these to the backend Vercel project for `Production` and `Preview`:

- `SITE_URL`
- `BACKEND_SERVICE_TOKEN`
- `DATABASE_URL`

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

- `BACKEND_BASE_URL=https://your-backend-project.vercel.app`

The frontend must use the exact same:

- `BACKEND_SERVICE_TOKEN`

## Quick Verification

After deployment, test:

- `GET /api/meta/capabilities`
- `GET /api/properties`
- `POST /api/auth/login`

If auth or publishing fails, verify that:

- `DATABASE_URL` is set
- `BACKEND_SERVICE_TOKEN` matches the frontend project
- migrations have been applied
