import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = (await scrypt(password, salt, 64)) as Buffer;

  return {
    passwordHash: hash.toString("hex"),
    passwordSalt: salt,
  };
}

export async function verifyPassword(
  password: string,
  passwordSalt: string,
  passwordHash: string,
) {
  const incomingHash = (await scrypt(password, passwordSalt, 64)) as Buffer;
  const expectedHash = Buffer.from(passwordHash, "hex");

  if (incomingHash.length !== expectedHash.length) {
    return false;
  }

  return timingSafeEqual(incomingHash, expectedHash);
}
