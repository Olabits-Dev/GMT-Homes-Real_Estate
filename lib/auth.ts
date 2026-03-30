import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { findUserById, toPublicUser } from "@/lib/auth-store";
import { decrypt, sessionCookieName } from "@/lib/session";

export const getSession = cache(async () => {
  const cookieStore = await cookies();
  const session = cookieStore.get(sessionCookieName)?.value;
  return decrypt(session);
});

export const getCurrentUser = cache(async () => {
  const session = await getSession();

  if (!session?.userId) {
    return null;
  }

  const user = await findUserById(session.userId);

  if (!user) {
    return null;
  }

  return toPublicUser(user);
});

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export function getSafeRedirectPath(value: string | null | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/dashboard";
  }

  return value;
}
