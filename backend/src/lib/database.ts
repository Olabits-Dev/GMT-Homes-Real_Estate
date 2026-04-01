import postgres from "postgres";
import { databaseMigrations } from "./migrations.ts";

export type SqlClient = ReturnType<typeof postgres>;

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
    `DATABASE_URL is required for ${context}. Add a PostgreSQL connection string and restart the backend.`,
  );
}

function parseDatabaseUrl(databaseUrl: string) {
  try {
    return new URL(databaseUrl);
  } catch {
    return null;
  }
}

function getDatabaseName(databaseUrl: string) {
  const parsedUrl = parseDatabaseUrl(databaseUrl);
  const pathname = parsedUrl?.pathname ?? "";
  const normalizedPathname = pathname.startsWith("/")
    ? pathname.slice(1)
    : pathname;

  return decodeURIComponent(normalizedPathname || "postgres");
}

function isLocalDatabase(databaseUrl: string) {
  const hostname = parseDatabaseUrl(databaseUrl)?.hostname ?? "";
  return hostname === "localhost" || hostname === "127.0.0.1";
}

function isDatabaseErrorCode(error: unknown, code: string) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === code
  );
}

function shouldRequireSsl(databaseUrl: string) {
  const sslMode =
    parseDatabaseUrl(databaseUrl)?.searchParams.get("sslmode")?.toLowerCase() ??
    "";

  return (
    sslMode === "require" ||
    sslMode === "verify-ca" ||
    sslMode === "verify-full"
  );
}

function formatDatabaseError(error: unknown, databaseUrl: string) {
  const databaseName = getDatabaseName(databaseUrl);

  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string"
  ) {
    if (error.code === "ECONNREFUSED") {
      return new Error(
        `Unable to reach PostgreSQL at ${parseDatabaseUrl(databaseUrl)?.host ?? "the configured host"}. Make sure Postgres is running and listening for connections.`,
      );
    }

    if (error.code === "EPERM") {
      return new Error(
        `Unable to open a PostgreSQL connection to ${parseDatabaseUrl(databaseUrl)?.host ?? "the configured host"}. Make sure the local server is reachable and that DATABASE_URL is correct.`,
      );
    }

    if (error.code === "3D000") {
      return new Error(
        `PostgreSQL is running, but the database "${databaseName}" does not exist. Create it first. If you want to keep the space in the name, use: CREATE DATABASE "${databaseName}";`,
      );
    }

    if (error.code === "28P01") {
      return new Error(
        "PostgreSQL rejected the username or password in DATABASE_URL. Check the credentials and try again.",
      );
    }

    if (error.code === "ENOTFOUND") {
      return new Error(
        `The PostgreSQL host in DATABASE_URL could not be resolved. Check the hostname in ${databaseUrl}.`,
      );
    }
  }

  if (error instanceof Error) {
    return error;
  }

  return new Error(
    "The backend could not connect to PostgreSQL. Check DATABASE_URL and your local Postgres server.",
  );
}

function getConnectionOptions(
  databaseUrl: string,
  databaseName = getDatabaseName(databaseUrl),
) {
  const parsedUrl = parseDatabaseUrl(databaseUrl);

  if (!parsedUrl) {
    return null;
  }

  const parsedPort = parsedUrl.port ? Number(parsedUrl.port) : NaN;

  return {
    database: databaseName,
    host: parsedUrl.hostname || undefined,
    password: parsedUrl.password
      ? decodeURIComponent(parsedUrl.password)
      : undefined,
    port:
      Number.isInteger(parsedPort) && parsedPort > 0 ? parsedPort : undefined,
    user: parsedUrl.username ? decodeURIComponent(parsedUrl.username) : undefined,
  };
}

function escapeIdentifier(value: string) {
  return value.replaceAll('"', '""');
}

async function resetSqlClient() {
  if (!sqlClient) {
    return;
  }

  const currentClient = sqlClient;
  sqlClient = null;
  await currentClient.end({ timeout: 5 });
}

async function ensureLocalDatabaseExists(databaseUrl: string) {
  if (!isLocalDatabase(databaseUrl)) {
    return false;
  }

  const databaseName = getDatabaseName(databaseUrl);

  if (!databaseName || databaseName === "postgres") {
    return false;
  }

  const adminConnectionOptions = getConnectionOptions(databaseUrl, "postgres");

  if (!adminConnectionOptions) {
    return false;
  }

  const adminClient = postgres({
    ...adminConnectionOptions,
    connect_timeout: 10,
    idle_timeout: 20,
    max: 1,
    prepare: false,
    ssl: false,
  });

  try {
    const rows = await adminClient<{ datname: string }[]>`
      SELECT datname
      FROM pg_database
      WHERE datname = ${databaseName}
      LIMIT 1
    `;

    if (rows.length === 0) {
      await adminClient.unsafe(
        `CREATE DATABASE "${escapeIdentifier(databaseName)}"`,
      );
    }

    return true;
  } catch (error) {
    if (isDatabaseErrorCode(error, "42P04")) {
      return true;
    }

    throw error;
  } finally {
    await adminClient.end({ timeout: 5 });
  }
}

function getSqlClient() {
  if (!sqlClient) {
    const databaseUrl = requireDatabaseUrl("persistent storage");
    const connectionOptions = getConnectionOptions(databaseUrl);

    sqlClient = connectionOptions
      ? postgres({
          ...connectionOptions,
          connect_timeout: 10,
          idle_timeout: 20,
          max: 5,
          prepare: false,
          ssl: isLocalDatabase(databaseUrl)
            ? false
            : shouldRequireSsl(databaseUrl)
              ? "require"
              : undefined,
        })
      : postgres(databaseUrl, {
          connect_timeout: 10,
          idle_timeout: 20,
          max: 5,
          prepare: false,
          ssl: isLocalDatabase(databaseUrl)
            ? false
            : shouldRequireSsl(databaseUrl)
              ? "require"
              : undefined,
        });
  }

  return sqlClient;
}

async function ensureMigrationsTable(sql: SqlClient) {
  await sql`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at TIMESTAMPTZ NOT NULL
    )
  `;
}

async function getAppliedMigrationIds(sql: SqlClient) {
  await ensureMigrationsTable(sql);

  const rows = await sql<{ id: string }[]>`
    SELECT id
    FROM schema_migrations
    ORDER BY applied_at ASC
  `;

  return new Set(rows.map((row) => row.id));
}

async function runPendingMigrations(sql: SqlClient) {
  const appliedMigrationIds = await getAppliedMigrationIds(sql);

  for (const migration of databaseMigrations) {
    if (appliedMigrationIds.has(migration.id)) {
      continue;
    }

    await sql.begin(async (transaction) => {
      const tx = transaction as unknown as SqlClient;
      await migration.up(tx);
      await tx`
        INSERT INTO schema_migrations (id, name, applied_at)
        VALUES (${migration.id}, ${migration.name}, ${new Date().toISOString()})
      `;
    });
  }
}

async function initializeSchemaWithLocalBootstrap(databaseUrl: string) {
  try {
    await runPendingMigrations(getSqlClient());
  } catch (error) {
    if (isDatabaseErrorCode(error, "3D000")) {
      await resetSqlClient();
      await ensureLocalDatabaseExists(databaseUrl);
      await runPendingMigrations(getSqlClient());
      return;
    }

    throw error;
  }
}

export async function ensureDatabaseReady() {
  if (!schemaPromise) {
    const databaseUrl = requireDatabaseUrl("persistent storage");

    schemaPromise = initializeSchemaWithLocalBootstrap(databaseUrl).catch(
      (error) => {
        schemaPromise = null;
        throw formatDatabaseError(error, databaseUrl);
      },
    );
  }

  await schemaPromise;
}

export async function getMigrationStatus() {
  const databaseUrl = requireDatabaseUrl("persistent storage");

  if (isLocalDatabase(databaseUrl)) {
    await ensureLocalDatabaseExists(databaseUrl);
  }

  const sql = getSqlClient();
  const appliedMigrationIds = await getAppliedMigrationIds(sql);

  return databaseMigrations.map((migration) => ({
    applied: appliedMigrationIds.has(migration.id),
    id: migration.id,
    name: migration.name,
  }));
}

export async function closeDatabaseConnection() {
  schemaPromise = null;
  await resetSqlClient();
}

export async function withDatabase<T>(query: (sql: SqlClient) => Promise<T>) {
  await ensureDatabaseReady();

  try {
    return await query(getSqlClient());
  } catch (error) {
    throw formatDatabaseError(error, requireDatabaseUrl("persistent storage"));
  }
}

export function isUniqueViolation(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "23505"
  );
}
