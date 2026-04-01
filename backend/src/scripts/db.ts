import { loadBackendEnv } from "../lib/load-env.js";
import { readDataFile } from "../lib/file-store.js";
import { userRoles } from "../lib/auth-roles.js";
import {
  closeDatabaseConnection,
  ensureDatabaseReady,
  getMigrationStatus,
  withDatabase,
} from "../lib/database.js";
import type { StoredUser, UserRole } from "../../../shared/types/auth.ts";

loadBackendEnv();

function normalizeRole(role: string | null | undefined): UserRole {
  return userRoles.includes(role as UserRole) ? (role as UserRole) : "agent";
}

async function run() {
  const command = process.argv[2] ?? "help";

  if (command === "help") {
    console.log(
      "Available commands: migrate, status, summary, import-legacy-auth, make-admin <email>",
    );
    return;
  }

  if (command === "migrate") {
    await ensureDatabaseReady();
    console.log("Database migrations are up to date.");
    return;
  }

  if (command === "status") {
    const status = await getMigrationStatus();
    console.table(status);
    return;
  }

  if (command === "summary") {
    await ensureDatabaseReady();

    const [usersByRole, propertiesByStatus, bookingsByStatus] =
      await withDatabase(async (sql) =>
        Promise.all([
          sql<{ role: string; total: number }[]>`
            SELECT role, COUNT(*)::int AS total
            FROM auth_users
            GROUP BY role
            ORDER BY role ASC
          `,
          sql<{ moderation_status: string; total: number }[]>`
            SELECT moderation_status, COUNT(*)::int AS total
            FROM community_properties
            GROUP BY moderation_status
            ORDER BY moderation_status ASC
          `,
          sql<{ status: string; total: number }[]>`
            SELECT status, COUNT(*)::int AS total
            FROM inspection_bookings
            GROUP BY status
            ORDER BY status ASC
          `,
        ]),
      );

    console.log("Users by role");
    console.table(usersByRole);
    console.log("Community listings by moderation status");
    console.table(propertiesByStatus);
    console.log("Inspection bookings by status");
    console.table(bookingsByStatus);
    return;
  }

  if (command === "import-legacy-auth") {
    await ensureDatabaseReady();

    const legacyUsers = await readDataFile<StoredUser[]>("auth-users.json", []);

    if (legacyUsers.length === 0) {
      console.log("No legacy auth users were found in backend/data/auth-users.json.");
      return;
    }

    let importedCount = 0;
    let skippedCount = 0;

    for (const legacyUser of legacyUsers) {
      const rows = await withDatabase(async (sql) => sql<{ id: string }[]>`
        INSERT INTO auth_users (
          id,
          name,
          email,
          role,
          password_hash,
          password_reset_token_hash,
          password_reset_token_expires_at,
          password_salt,
          created_at
        )
        VALUES (
          ${legacyUser.id},
          ${legacyUser.name.trim()},
          ${legacyUser.email.trim().toLowerCase()},
          ${normalizeRole(legacyUser.role)},
          ${legacyUser.passwordHash},
          ${legacyUser.passwordResetTokenHash ?? null},
          ${legacyUser.passwordResetExpiresAt ?? null},
          ${legacyUser.passwordSalt},
          ${legacyUser.createdAt}
        )
        ON CONFLICT (email) DO NOTHING
        RETURNING id
      `);

      if (rows.length > 0) {
        importedCount += 1;
      } else {
        skippedCount += 1;
      }
    }

    console.log(
      `Imported ${importedCount} legacy auth user${importedCount === 1 ? "" : "s"} and skipped ${skippedCount}.`,
    );
    return;
  }

  if (command === "make-admin") {
    const email = process.argv[3]?.trim().toLowerCase();

    if (!email) {
      throw new Error("Pass the target email address. Example: npm run db:make-admin -- user@example.com");
    }

    await ensureDatabaseReady();

    const rows = await withDatabase(async (sql) => sql<{ id: string }[]>`
      UPDATE auth_users
      SET role = 'admin'
      WHERE email = ${email}
      RETURNING id
    `);

    if (rows.length === 0) {
      throw new Error(`No user with email ${email} was found.`);
    }

    console.log(`Promoted ${email} to admin.`);
    return;
  }

  throw new Error(`Unknown db command: ${command}`);
}

run()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeDatabaseConnection();
  });
