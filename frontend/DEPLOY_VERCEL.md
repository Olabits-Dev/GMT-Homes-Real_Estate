# Frontend Vercel Deployment

This frontend can be imported into Vercel as a standalone Next.js project.

## Recommended Project Settings

Use these settings in the Vercel dashboard when importing the repo:

- Framework Preset: `Next.js`
- Root Directory: `frontend`
- Include source files outside of the Root Directory: `Disabled`
- Install Command: leave default or use `npm install`
- Build Command: leave default or use `npm run build`
- Output Directory: leave empty

The frontend does not depend on `../shared`, so it does not need outside-of-root source access.

## Deploy Order

Deploy the backend project first.

You need the backend production URL before the frontend can work correctly because the frontend server actions call the backend through:

- `BACKEND_BASE_URL`

## Required Environment Variables

Add these to the frontend Vercel project for `Production`:

- `SESSION_SECRET`
- `SITE_URL`
- `BACKEND_BASE_URL`
- `BACKEND_SERVICE_TOKEN`

Optional upload support:

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `CLOUDINARY_UPLOAD_FOLDER`

## Environment Value Notes

### `SESSION_SECRET`

Use a long random secret. This signs the frontend session cookie.

If you rotate it later, existing sessions will be invalidated and users will need to sign in again.

### `SITE_URL`

Set this to the public frontend URL, for example:

- `https://your-frontend-project.vercel.app`

If you later add a custom domain, update `SITE_URL` to the custom domain and redeploy.

### `BACKEND_BASE_URL`

Set this to your deployed backend base URL, for example:

- `https://your-backend-project.vercel.app`

Do not add `/api` to the end. The frontend already calls backend API routes under that base URL.

### `BACKEND_SERVICE_TOKEN`

This must exactly match the backend Vercel project's:

- `BACKEND_SERVICE_TOKEN`

If these do not match, internal authenticated frontend-to-backend calls will fail.

### `CLOUDINARY_*`

These are optional, but real property image uploads depend on them because upload handling happens from the frontend server actions.

If they are missing, listing creation can still work, but the app will use fallback gallery behavior instead of real cloud uploads.

## Preview Environment Strategy

For `Preview`, you have two workable choices:

1. Point preview frontend deployments to the production backend temporarily.
2. Deploy a separate preview backend project and use that preview backend URL here.

If you want isolated preview testing for auth, moderation, and bookings, use a separate preview backend plus preview database.

## Backend Pairing Checklist

Before deploying the frontend, confirm the backend project already has:

- `DATABASE_URL`
- `BACKEND_SERVICE_TOKEN`
- migrations applied with `npm run db:migrate`

See [backend/DEPLOY_VERCEL.md](/Users/macbookpro/Desktop/real-estate-platform/backend/DEPLOY_VERCEL.md).

## Quick Verification

After frontend deployment, test:

- homepage load
- listings page load
- signup
- login
- dashboard load after login
- property detail page
- add-property flow
- admin page for an admin account

If frontend auth or publishing fails, verify that:

- `SITE_URL` matches the frontend deployment URL
- `BACKEND_BASE_URL` points to the deployed backend
- `BACKEND_SERVICE_TOKEN` matches the backend project
- `SESSION_SECRET` is present
- Cloudinary vars are present if you expect real uploads
