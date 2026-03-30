"use server";

import { redirect } from "next/navigation";
import { createUser, findUserByEmail } from "@/lib/auth-store";
import { getSafeRedirectPath } from "@/lib/auth";
import { verifyPassword } from "@/lib/passwords";
import { createSession, deleteSession } from "@/lib/session";
import type { AuthFormErrors, AuthFormState } from "@/types/auth";

function pushError(
  errors: AuthFormErrors,
  field: keyof AuthFormErrors,
  message: string,
) {
  errors[field] = [...(errors[field] ?? []), message];
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password: string, errors: AuthFormErrors) {
  if (password.length < 8) {
    pushError(errors, "password", "Use at least 8 characters.");
  }

  if (!/[A-Za-z]/.test(password)) {
    pushError(errors, "password", "Include at least one letter.");
  }

  if (!/\d/.test(password)) {
    pushError(errors, "password", "Include at least one number.");
  }
}

function hasErrors(errors: AuthFormErrors) {
  return Object.values(errors).some((value) => (value?.length ?? 0) > 0);
}

export async function signup(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const nextPath = getSafeRedirectPath(String(formData.get("next") ?? ""));
  const errors: AuthFormErrors = {};

  if (name.length < 2) {
    pushError(errors, "name", "Enter your full name.");
  }

  if (!isValidEmail(email)) {
    pushError(errors, "email", "Enter a valid email address.");
  }

  validatePassword(password, errors);

  if (confirmPassword !== password) {
    pushError(errors, "confirmPassword", "Passwords must match.");
  }

  if (hasErrors(errors)) {
    return {
      errors,
      message: "Please fix the highlighted fields and try again.",
    };
  }

  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    return {
      errors: {
        email: ["An account with this email already exists."],
      },
      message: "Use a different email or sign in instead.",
    };
  }

  const user = await createUser({
    email,
    name,
    password,
  });

  await createSession(user.id);
  redirect(nextPath);
}

export async function login(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const nextPath = getSafeRedirectPath(String(formData.get("next") ?? ""));
  const errors: AuthFormErrors = {};

  if (!isValidEmail(email)) {
    pushError(errors, "email", "Enter a valid email address.");
  }

  if (!password) {
    pushError(errors, "password", "Enter your password.");
  }

  if (hasErrors(errors)) {
    return {
      errors,
      message: "Please fix the highlighted fields and try again.",
    };
  }

  const user = await findUserByEmail(email);

  if (
    !user ||
    !(await verifyPassword(password, user.passwordSalt, user.passwordHash))
  ) {
    return {
      message: "We couldn't sign you in with those credentials.",
    };
  }

  await createSession(user.id);
  redirect(nextPath);
}

export async function logout() {
  await deleteSession();
  redirect("/");
}
