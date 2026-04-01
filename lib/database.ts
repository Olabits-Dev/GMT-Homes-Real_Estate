import "server-only";

import { neon } from "@neondatabase/serverless";

type SqlClient = ReturnType<typeof neon>;

let sqlClient: SqlClient | null = null;
let schemaPromise: Promise<void> | null = null;

export function getDatabaseUrl() {
  const candidates = [process.env.DATABASE_URL, process.env.POSTGRES_URL];

  for (const candidate of candidates) {
    const value = candidate?.trim();

    if (value) {
      return value;
    }
  }

  return null;
}

export function isDatabaseConfigured() {
  return getDatabaseUrl() !== null;
}

export function isUsingLocalFileStore() {
  return process.env.NODE_ENV !== "production" && !isDatabaseConfigured();
}

export function requireDatabaseUrl(context: string) {
  const databaseUrl = getDatabaseUrl();

  if (databaseUrl) {
    return databaseUrl;
  }

  throw new Error(
    `DATABASE_URL is required for ${context}. Add a Neon Postgres database in Vercel and redeploy.`,
  );
}

function getSqlClient() {
  if (!sqlClient) {
    sqlClient = neon(requireDatabaseUrl("persistent storage"));
  }

  return sqlClient;
}

async function initializeSchema() {
  const sql = getSqlClient();

  await sql`
    CREATE TABLE IF NOT EXISTS auth_users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      password_salt TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL
    )
  `;

  await sql`
    ALTER TABLE auth_users
    ADD COLUMN IF NOT EXISTS password_reset_token_hash TEXT
  `;

  await sql`
    ALTER TABLE auth_users
    ADD COLUMN IF NOT EXISTS password_reset_token_expires_at TIMESTAMPTZ
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS auth_users_password_reset_token_hash_idx
    ON auth_users (password_reset_token_hash)
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS community_properties (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      owner_id TEXT NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL,
      property_data JSONB NOT NULL
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS community_properties_owner_id_idx
    ON community_properties (owner_id)
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS community_properties_created_at_idx
    ON community_properties (created_at DESC)
  `;
}

export async function withDatabase<T>(query: (sql: SqlClient) => Promise<T>) {
  if (!schemaPromise) {
    schemaPromise = initializeSchema().catch((error) => {
      schemaPromise = null;
      throw error;
    });
  }

  await schemaPromise;
  return query(getSqlClient());
}

export function isUniqueViolation(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "23505"
  );
}
