import { createHash, randomBytes } from "node:crypto";
import {
  getPasswordResetTokenTtlMinutes,
  getSiteUrl,
} from "@/lib/server-env";

export function createPasswordResetToken() {
  return randomBytes(32).toString("hex");
}

export function hashPasswordResetToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function createPasswordResetExpiry() {
  return new Date(Date.now() + getPasswordResetTokenTtlMinutes() * 60 * 1000);
}

export function buildPasswordResetUrl(token: string) {
  const url = new URL("/reset-password", getSiteUrl());
  url.searchParams.set("token", token);
  return url.toString();
}
