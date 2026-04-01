import "server-only";

function getEnv(name: string, fallback?: string) {
  const value = process.env[name]?.trim();

  if (value) {
    return value;
  }

  if (fallback !== undefined) {
    return fallback;
  }

  throw new Error(`${name} is required.`);
}

function getOptionalEnv(name: string) {
  const value = process.env[name]?.trim();
  return value ? value : null;
}

function getDefaultSiteUrl() {
  return process.env.NODE_ENV === "production"
    ? "https://gmt-homes.vercel.app"
    : "http://localhost:3000";
}

export function getSessionSecret() {
  return getEnv(
    "SESSION_SECRET",
    process.env.NODE_ENV === "development"
      ? "gmt-local-session-secret"
      : undefined,
  );
}

export function getSiteUrl() {
  try {
    return new URL(getEnv("SITE_URL", getDefaultSiteUrl()));
  } catch {
    return new URL(getDefaultSiteUrl());
  }
}

export function getBackendBaseUrl() {
  return getEnv(
    "BACKEND_BASE_URL",
    process.env.NODE_ENV === "development"
      ? "http://127.0.0.1:4000"
      : "https://gmt-homes-real-estate-backend.vercel.app",
  );
}

export function getBackendServiceToken() {
  return getEnv(
    "BACKEND_SERVICE_TOKEN",
    process.env.NODE_ENV === "development"
      ? "gmt-local-service-token"
      : undefined,
  );
}

export function getCloudinaryConfig() {
  const cloudName = getOptionalEnv("CLOUDINARY_CLOUD_NAME");
  const apiKey = getOptionalEnv("CLOUDINARY_API_KEY");
  const apiSecret = getOptionalEnv("CLOUDINARY_API_SECRET");
  const folder = getOptionalEnv("CLOUDINARY_UPLOAD_FOLDER") ?? "gmt-homes/properties";

  if (!cloudName || !apiKey || !apiSecret) {
    return null;
  }

  return {
    apiKey,
    apiSecret,
    cloudName,
    folder,
  };
}
