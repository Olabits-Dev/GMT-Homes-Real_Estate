import { loadBackendEnv } from "../lib/load-env.ts";
import {
  closeDatabaseConnection,
  ensureDatabaseReady,
  getMigrationStatus,
  withDatabase,
} from "../lib/database.ts";

loadBackendEnv();

async function run() {
  const command = process.argv[2] ?? "help";

  if (command === "help") {
    console.log("Available commands: migrate, status, summary, make-admin <email>");
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
