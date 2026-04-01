import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { fetchUserById } from "@/lib/backend-client";
import { decrypt, sessionCookieName } from "@/lib/session";
import type { UserRole } from "@/types/auth";

export const getSession = cache(async () => {
  const cookieStore = await cookies();
  const session = cookieStore.get(sessionCookieName)?.value;

  try {
    return await decrypt(session);
  } catch (error) {
    console.error("Failed to read the current session.", error);
    return null;
  }
});

export const getCurrentUser = cache(async () => {
  const session = await getSession();

  if (!session?.userId) {
    return null;
  }

  try {
    const response = await fetchUserById(session.userId);
    return response.user;
  } catch (error) {
    console.error("Failed to load the current user.", error);
    return null;
  }
});

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireRole(allowedRoles: UserRole[], redirectPath = "/dashboard") {
  const user = await requireUser();

  if (!allowedRoles.includes(user.role)) {
    redirect(redirectPath);
  }

  return user;
}

export async function requireAdmin() {
  return requireRole(["admin"], "/dashboard");
}

export async function requirePublisher() {
  return requireRole(["agent", "admin"], "/dashboard");
}

export function getSafeRedirectPath(value: string | null | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/dashboard";
  }

  return value;
}
