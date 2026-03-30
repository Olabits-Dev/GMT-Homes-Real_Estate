import { randomUUID } from "node:crypto";
import { readDataFile, writeDataFile } from "@/lib/file-store";
import { hashPassword } from "@/lib/passwords";
import type { AuthUser, StoredUser } from "@/types/auth";

const usersFileName = "auth-users.json";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
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
  return readDataFile<StoredUser[]>(usersFileName, []);
}

export async function findUserByEmail(email: string) {
  const normalizedEmail = normalizeEmail(email);
  const users = await getUsers();
  return users.find((user) => user.email === normalizedEmail) ?? null;
}

export async function findUserById(userId: string) {
  const users = await getUsers();
  return users.find((user) => user.id === userId) ?? null;
}

export async function createUser(input: {
  email: string;
  name: string;
  password: string;
}) {
  const users = await getUsers();
  const normalizedEmail = normalizeEmail(input.email);

  if (users.some((user) => user.email === normalizedEmail)) {
    throw new Error("EMAIL_EXISTS");
  }

  const { passwordHash, passwordSalt } = await hashPassword(input.password);
  const nextUser: StoredUser = {
    createdAt: new Date().toISOString(),
    email: normalizedEmail,
    id: randomUUID(),
    name: input.name.trim(),
    passwordHash,
    passwordSalt,
  };

  await writeDataFile(usersFileName, [nextUser, ...users]);
  return toPublicUser(nextUser);
}
