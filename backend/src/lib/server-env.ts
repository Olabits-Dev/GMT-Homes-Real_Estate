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
  return getEnv("SESSION_SECRET");
}

export function getSiteUrl() {
  try {
    return new URL(getEnv("SITE_URL", getDefaultSiteUrl()));
  } catch {
    return new URL(getDefaultSiteUrl());
  }
}

export function getPasswordResetEmailConfig() {
  const host = getOptionalEnv("PASSWORD_RESET_SMTP_HOST");
  const port = getOptionalEnv("PASSWORD_RESET_SMTP_PORT");
  const user = getOptionalEnv("PASSWORD_RESET_SMTP_USER");
  const password = getOptionalEnv("PASSWORD_RESET_SMTP_PASS");
  const from = getOptionalEnv("PASSWORD_RESET_FROM_EMAIL");

  if (!host || !port || !user || !password || !from) {
    return null;
  }

  const portNumber = Number(port);

  if (!Number.isInteger(portNumber) || portNumber <= 0) {
    return null;
  }

  const secure =
    getOptionalEnv("PASSWORD_RESET_SMTP_SECURE") === "true" || portNumber === 465;

  return {
    from,
    host,
    password,
    port: portNumber,
    secure,
    user,
  };
}

export function getPasswordResetTokenTtlMinutes() {
  const rawValue = getOptionalEnv("PASSWORD_RESET_TOKEN_TTL_MINUTES");
  const parsedValue = rawValue ? Number(rawValue) : NaN;

  if (Number.isFinite(parsedValue) && parsedValue > 0) {
    return parsedValue;
  }

  return 30;
}

export function getPort() {
  const rawValue = getOptionalEnv("PORT");
  const parsedValue = rawValue ? Number(rawValue) : NaN;

  if (Number.isInteger(parsedValue) && parsedValue > 0) {
    return parsedValue;
  }

  return 4000;
}

export function getHost() {
  return getEnv(
    "HOST",
    process.env.NODE_ENV === "production" ? "0.0.0.0" : "127.0.0.1",
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
