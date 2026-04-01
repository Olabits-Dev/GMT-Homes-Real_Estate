import { randomUUID } from "node:crypto";
import {
  isUniqueViolation,
  isUsingLocalFileStore,
  withDatabase,
} from "@/lib/database";
import { readDataFile, writeDataFile } from "@/lib/file-store";
import { hashPassword } from "@/lib/passwords";
import type { AuthUser, StoredUser } from "@/types/auth";

const usersFileName = "auth-users.json";

type DatabaseUserRow = {
  created_at: string | Date;
  email: string;
  id: string;
  name: string;
  password_hash: string;
  password_reset_token_expires_at: string | Date | null;
  password_reset_token_hash: string | null;
  password_salt: string;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function mapDatabaseUser(row: DatabaseUserRow): StoredUser {
  return {
    createdAt: new Date(row.created_at).toISOString(),
    email: row.email,
    id: row.id,
    name: row.name,
    passwordHash: row.password_hash,
    passwordResetExpiresAt: row.password_reset_token_expires_at
      ? new Date(row.password_reset_token_expires_at).toISOString()
      : null,
    passwordResetTokenHash: row.password_reset_token_hash,
    passwordSalt: row.password_salt,
  };
}

export function toPublicUser(user: StoredUser): AuthUser {
  return {
    createdAt: user.createdAt,
    email: user.email,
    id: user.id,
    name: user.name,
  };
}

export async function getUsers() {
  if (isUsingLocalFileStore()) {
    return readDataFile<StoredUser[]>(usersFileName, []);
  }

  return withDatabase(async (sql) => {
    const rows = (await sql`
      SELECT
        id,
        name,
        email,
        password_hash,
        password_reset_token_hash,
        password_reset_token_expires_at,
        password_salt,
        created_at
      FROM auth_users
      ORDER BY created_at DESC
    `) as DatabaseUserRow[];

    return rows.map(mapDatabaseUser);
  });
}

export async function findUserByEmail(email: string) {
  const normalizedEmail = normalizeEmail(email);

  if (isUsingLocalFileStore()) {
    const users = await getUsers();
    return users.find((user) => user.email === normalizedEmail) ?? null;
  }

  return withDatabase(async (sql) => {
    const rows = (await sql`
      SELECT
        id,
        name,
        email,
        password_hash,
        password_reset_token_hash,
        password_reset_token_expires_at,
        password_salt,
        created_at
      FROM auth_users
      WHERE email = ${normalizedEmail}
      LIMIT 1
    `) as DatabaseUserRow[];

    const [user] = rows;
    return user ? mapDatabaseUser(user) : null;
  });
}

export async function findUserById(userId: string) {
  if (isUsingLocalFileStore()) {
    const users = await getUsers();
    return users.find((user) => user.id === userId) ?? null;
  }

  return withDatabase(async (sql) => {
    const rows = (await sql`
      SELECT
        id,
        name,
        email,
        password_hash,
        password_reset_token_hash,
        password_reset_token_expires_at,
        password_salt,
        created_at
      FROM auth_users
      WHERE id = ${userId}
      LIMIT 1
    `) as DatabaseUserRow[];

    const [user] = rows;
    return user ? mapDatabaseUser(user) : null;
  });
}

export async function createUser(input: {
  email: string;
  name: string;
  password: string;
}) {
  const normalizedEmail = normalizeEmail(input.email);
  const { passwordHash, passwordSalt } = await hashPassword(input.password);
  const nextUser: StoredUser = {
    createdAt: new Date().toISOString(),
    email: normalizedEmail,
    id: randomUUID(),
    name: input.name.trim(),
    passwordHash,
    passwordSalt,
  };

  if (isUsingLocalFileStore()) {
    const users = await getUsers();

    if (users.some((user) => user.email === normalizedEmail)) {
      throw new Error("EMAIL_EXISTS");
    }

    await writeDataFile(usersFileName, [nextUser, ...users]);
    return toPublicUser(nextUser);
  }

  try {
    await withDatabase(async (sql) => {
      await sql`
        INSERT INTO auth_users (
          id,
          name,
          email,
          password_hash,
          password_salt,
          created_at
        )
        VALUES (
          ${nextUser.id},
          ${nextUser.name},
          ${nextUser.email},
          ${nextUser.passwordHash},
          ${nextUser.passwordSalt},
          ${nextUser.createdAt}
        )
      `;
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new Error("EMAIL_EXISTS");
    }

    throw error;
  }

  return toPublicUser(nextUser);
}

export async function updateUserPassword(userId: string, password: string) {
  const { passwordHash, passwordSalt } = await hashPassword(password);

  if (isUsingLocalFileStore()) {
    const users = await getUsers();
    const nextUsers = users.map((user) =>
      user.id === userId
        ? {
            ...user,
            passwordHash,
            passwordResetExpiresAt: null,
            passwordResetTokenHash: null,
            passwordSalt,
          }
        : user,
    );

    await writeDataFile(usersFileName, nextUsers);
    return;
  }

  await withDatabase(async (sql) => {
    await sql`
      UPDATE auth_users
      SET
        password_hash = ${passwordHash},
        password_reset_token_hash = NULL,
        password_reset_token_expires_at = NULL,
        password_salt = ${passwordSalt}
      WHERE id = ${userId}
    `;
  });
}

export async function setUserPasswordResetToken(
  userId: string,
  tokenHash: string,
  expiresAt: string,
) {
  if (isUsingLocalFileStore()) {
    const users = await getUsers();
    const nextUsers = users.map((user) =>
      user.id === userId
        ? {
            ...user,
            passwordResetExpiresAt: expiresAt,
            passwordResetTokenHash: tokenHash,
          }
        : user,
    );

    await writeDataFile(usersFileName, nextUsers);
    return;
  }

  await withDatabase(async (sql) => {
    await sql`
      UPDATE auth_users
      SET
        password_reset_token_hash = ${tokenHash},
        password_reset_token_expires_at = ${expiresAt}
      WHERE id = ${userId}
    `;
  });
}

export async function findUserByPasswordResetTokenHash(tokenHash: string) {
  if (isUsingLocalFileStore()) {
    const users = await getUsers();
    const now = Date.now();

    return (
      users.find((user) => {
        if (
          !user.passwordResetTokenHash ||
          !user.passwordResetExpiresAt ||
          user.passwordResetTokenHash !== tokenHash
        ) {
          return false;
        }

        return Date.parse(user.passwordResetExpiresAt) > now;
      }) ?? null
    );
  }

  return withDatabase(async (sql) => {
    const rows = (await sql`
      SELECT
        id,
        name,
        email,
        password_hash,
        password_reset_token_hash,
        password_reset_token_expires_at,
        password_salt,
        created_at
      FROM auth_users
      WHERE
        password_reset_token_hash = ${tokenHash}
        AND password_reset_token_expires_at > NOW()
      LIMIT 1
    `) as DatabaseUserRow[];

    const [user] = rows;
    return user ? mapDatabaseUser(user) : null;
  });
}
