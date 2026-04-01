import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { getSessionSecret } from "@/lib/server-env";
import type { SessionPayload } from "@/types/auth";

export const sessionCookieName = "gmt-session";

function encodeBase64Url(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function decodeBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(value: string) {
  return createHmac("sha256", getSessionSecret()).update(value).digest("base64url");
}

export async function encrypt(payload: SessionPayload) {
  const serializedPayload = encodeBase64Url(JSON.stringify(payload));
  const signature = sign(serializedPayload);
  return `${serializedPayload}.${signature}`;
}

export async function decrypt(session: string | undefined = "") {
  if (!session) {
    return null;
  }

  const [serializedPayload, signature] = session.split(".");

  if (!serializedPayload || !signature) {
    return null;
  }

  const expectedSignature = sign(serializedPayload);
  const providedSignature = Buffer.from(signature);
  const actualSignature = Buffer.from(expectedSignature);

  if (providedSignature.length !== actualSignature.length) {
    return null;
  }

  if (!timingSafeEqual(providedSignature, actualSignature)) {
    return null;
  }

  try {
    const payload = JSON.parse(decodeBase64Url(serializedPayload)) as SessionPayload;

    if (Date.parse(payload.expiresAt) <= Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function createSession(userId: string) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const session = await encrypt({
    expiresAt: expiresAt.toISOString(),
    userId,
  });
  const cookieStore = await cookies();

  cookieStore.set(sessionCookieName, session, {
    expires: expiresAt,
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(sessionCookieName);
}
