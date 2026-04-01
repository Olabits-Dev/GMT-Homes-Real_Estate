import type { SqlClient } from "./database.ts";

export type DatabaseMigration = {
  id: string;
  name: string;
  up: (sql: SqlClient) => Promise<void>;
};

export const databaseMigrations: DatabaseMigration[] = [
  {
    id: "001_initial_storage",
    name: "Create auth and community property storage",
    async up(sql) {
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
    },
  },
  {
    id: "002_roles_moderation_and_bookings",
    name: "Add roles, moderation metadata, and inspection bookings",
    async up(sql) {
      await sql`
        ALTER TABLE auth_users
        ADD COLUMN IF NOT EXISTS role TEXT
      `;

      await sql`
        UPDATE auth_users
        SET role = 'agent'
        WHERE role IS NULL
      `;

      await sql`
        ALTER TABLE auth_users
        ALTER COLUMN role SET DEFAULT 'agent'
      `;

      await sql`
        ALTER TABLE auth_users
        ALTER COLUMN role SET NOT NULL
      `;

      await sql`
        CREATE INDEX IF NOT EXISTS auth_users_role_idx
        ON auth_users (role)
      `;

      await sql`
        ALTER TABLE community_properties
        ADD COLUMN IF NOT EXISTS moderation_status TEXT
      `;

      await sql`
        ALTER TABLE community_properties
        ADD COLUMN IF NOT EXISTS moderation_notes TEXT
      `;

      await sql`
        ALTER TABLE community_properties
        ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ
      `;

      await sql`
        ALTER TABLE community_properties
        ADD COLUMN IF NOT EXISTS image_assets JSONB
      `;

      await sql`
        UPDATE community_properties
        SET moderation_status = 'approved'
        WHERE moderation_status IS NULL
      `;

      await sql`
        UPDATE community_properties
        SET published_at = created_at
        WHERE moderation_status = 'approved' AND published_at IS NULL
      `;

      await sql`
        ALTER TABLE community_properties
        ALTER COLUMN moderation_status SET DEFAULT 'pending'
      `;

      await sql`
        CREATE INDEX IF NOT EXISTS community_properties_moderation_status_idx
        ON community_properties (moderation_status)
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS inspection_bookings (
          id TEXT PRIMARY KEY,
          property_id TEXT NOT NULL,
          property_slug TEXT NOT NULL,
          property_title TEXT NOT NULL,
          property_location TEXT NOT NULL,
          owner_id TEXT REFERENCES auth_users(id) ON DELETE SET NULL,
          requester_id TEXT NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
          requester_name TEXT NOT NULL,
          requester_email TEXT NOT NULL,
          requester_phone TEXT NOT NULL,
          requester_role TEXT NOT NULL,
          preferred_date DATE NOT NULL,
          preferred_time TEXT NOT NULL,
          message TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending',
          created_at TIMESTAMPTZ NOT NULL
        )
      `;

      await sql`
        CREATE INDEX IF NOT EXISTS inspection_bookings_owner_id_idx
        ON inspection_bookings (owner_id)
      `;

      await sql`
        CREATE INDEX IF NOT EXISTS inspection_bookings_requester_id_idx
        ON inspection_bookings (requester_id)
      `;

      await sql`
        CREATE INDEX IF NOT EXISTS inspection_bookings_status_idx
        ON inspection_bookings (status)
      `;

      await sql`
        CREATE INDEX IF NOT EXISTS inspection_bookings_created_at_idx
        ON inspection_bookings (created_at DESC)
      `;
    },
  },
];
