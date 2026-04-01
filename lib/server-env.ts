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

function getDefaultSiteUrl() {
  return process.env.NODE_ENV === "production"
    ? "https://gmt-homes.vercel.app"
    : "http://localhost:3000";
}

export function getSessionSecret() {
  return getEnv("SESSION_SECRET");
}

export function getSiteUrl() {
  try {
    return new URL(getEnv("SITE_URL", getDefaultSiteUrl()));
  } catch {
    return new URL(getDefaultSiteUrl());
  }
}

export function getGmtContactConfig() {
  return {
    company: getEnv("GMT_HOMES_COMPANY_NAME", "GMT Homes"),
    email: getEnv("GMT_HOMES_CONTACT_EMAIL", "hello@gmthomes.co"),
    initials: getEnv("GMT_HOMES_CONTACT_INITIALS", "GO"),
    listingResponseTime: getEnv(
      "GMT_HOMES_LISTING_RESPONSE_TIME",
      "Usually responds within 30 minutes",
    ),
    name: getEnv("GMT_HOMES_CONTACT_NAME", "Grace Olanrewaju"),
    phone: getEnv("GMT_HOMES_CONTACT_PHONE", "+234 803 520 8600"),
    responseTime: getEnv(
      "GMT_HOMES_CONTACT_RESPONSE_TIME",
      "Usually responds within 20 minutes",
    ),
    role: getEnv("GMT_HOMES_CONTACT_ROLE", "Lead Property Advisor"),
  };
}
