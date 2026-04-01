"use server";

import { redirect } from "next/navigation";
import {
  changeUserPassword,
  completePasswordResetFlow,
  loginUser,
  requestPasswordResetFlow,
  signupUser,
} from "@/lib/backend-client";
import { getSafeRedirectPath, requireUser } from "@/lib/auth";
import { createSession, deleteSession } from "@/lib/session";
import type {
  AuthFormErrors,
  AuthFormState,
  ForgotPasswordFormErrors,
  ForgotPasswordFormState,
  PasswordResetFormErrors,
  PasswordResetFormState,
  UserRole,
} from "@/types/auth";

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

function normalizeRole(value: string): Exclude<UserRole, "admin"> | null {
  return value === "buyer" || value === "renter" || value === "agent"
    ? value
    : null;
}

function pushPasswordResetError(
  errors: PasswordResetFormErrors,
  field: keyof PasswordResetFormErrors,
  message: string,
) {
  errors[field] = [...(errors[field] ?? []), message];
}

function validateNextPassword(
  password: string,
  errors: PasswordResetFormErrors,
) {
  if (password.length < 8) {
    pushPasswordResetError(errors, "newPassword", "Use at least 8 characters.");
  }

  if (!/[A-Za-z]/.test(password)) {
    pushPasswordResetError(
      errors,
      "newPassword",
      "Include at least one letter.",
    );
  }

  if (!/\d/.test(password)) {
    pushPasswordResetError(
      errors,
      "newPassword",
      "Include at least one number.",
    );
  }
}

function pushForgotPasswordError(
  errors: ForgotPasswordFormErrors,
  field: keyof ForgotPasswordFormErrors,
  message: string,
) {
  errors[field] = [...(errors[field] ?? []), message];
}

function hasErrors(errors: AuthFormErrors) {
  return Object.values(errors).some((value) => (value?.length ?? 0) > 0);
}

function getAuthFailureMessage(error: unknown, fallback: string) {
  if (error instanceof Error) {
    if (error.message.includes("SESSION_SECRET")) {
      return "This deployment is missing its session configuration. Add SESSION_SECRET in Vercel Production and redeploy.";
    }

    if (error.message.includes("BACKEND_BASE_URL")) {
      return "This deployment is missing its backend URL configuration. Add BACKEND_BASE_URL and redeploy.";
    }

    if (error.message.includes("BACKEND_SERVICE_TOKEN")) {
      return "This deployment is missing its backend service token configuration. Add BACKEND_SERVICE_TOKEN and redeploy.";
    }

    return error.message || fallback;
  }

  return fallback;
}

export async function signup(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const role = normalizeRole(String(formData.get("role") ?? ""));
  const nextPath = getSafeRedirectPath(String(formData.get("next") ?? ""));
  const errors: AuthFormErrors = {};

  if (name.length < 2) {
    pushError(errors, "name", "Enter your full name.");
  }

  if (!isValidEmail(email)) {
    pushError(errors, "email", "Enter a valid email address.");
  }

  validatePassword(password, errors);

  if (!role) {
    pushError(
      errors,
      "role",
      "Choose whether this account is for buying, renting, or listing.",
    );
  }

  if (confirmPassword !== password) {
    pushError(errors, "confirmPassword", "Passwords must match.");
  }

  if (hasErrors(errors)) {
    return {
      errors,
      message: "Please fix the highlighted fields and try again.",
    };
  }

  try {
    const response = await signupUser({
      email,
      name,
      password,
      role: role ?? "buyer",
    });

    if (!response.user) {
      return response;
    }

    await createSession(response.user.id);
  } catch (error) {
    console.error("Signup failed.", error);
    return {
      message: getAuthFailureMessage(
        error,
        "We couldn't create your account right now. Please try again in a moment.",
      ),
    };
  }

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

  try {
    const response = await loginUser({
      email,
      password,
    });

    if (!response.user) {
      return response;
    }

    await createSession(response.user.id);
  } catch (error) {
    console.error("Login failed.", error);
    return {
      message: getAuthFailureMessage(
        error,
        "We couldn't sign you in right now. Please try again in a moment.",
      ),
    };
  }

  redirect(nextPath);
}

export async function resetPassword(
  _previousState: PasswordResetFormState,
  formData: FormData,
): Promise<PasswordResetFormState> {
  const user = await requireUser();
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const errors: PasswordResetFormErrors = {};

  if (!currentPassword) {
    pushPasswordResetError(
      errors,
      "currentPassword",
      "Enter your current password.",
    );
  }

  validateNextPassword(newPassword, errors);

  if (confirmPassword !== newPassword) {
    pushPasswordResetError(
      errors,
      "confirmPassword",
      "Passwords must match.",
    );
  }

  if (Object.values(errors).some((value) => (value?.length ?? 0) > 0)) {
    return {
      errors,
      message: "Please fix the highlighted fields and try again.",
    };
  }

  try {
    return await changeUserPassword({
      currentPassword,
      newPassword,
      userId: user.id,
    });
  } catch (error) {
    console.error("Password reset failed.", error);
    return {
      message: getAuthFailureMessage(
        error,
        "We couldn't update your password right now. Please try again in a moment.",
      ),
    };
  }
}

export async function requestPasswordReset(
  _previousState: ForgotPasswordFormState,
  formData: FormData,
): Promise<ForgotPasswordFormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const errors: ForgotPasswordFormErrors = {};

  if (!isValidEmail(email)) {
    pushForgotPasswordError(errors, "email", "Enter a valid email address.");
  }

  if (Object.values(errors).some((value) => (value?.length ?? 0) > 0)) {
    return {
      errors,
      message: "Please fix the highlighted fields and try again.",
    };
  }

  try {
    return await requestPasswordResetFlow({ email });
  } catch (error) {
    console.error("Password reset request failed.", error);
    return {
      message: getAuthFailureMessage(
        error,
        "We couldn't start the password reset flow right now. Please try again in a moment.",
      ),
    };
  }
}

export async function completePasswordReset(
  _previousState: PasswordResetFormState,
  formData: FormData,
): Promise<PasswordResetFormState> {
  const token = String(formData.get("token") ?? "").trim();
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const errors: PasswordResetFormErrors = {};

  if (!token) {
    return {
      message: "This password reset link is invalid. Request a new one and try again.",
    };
  }

  validateNextPassword(newPassword, errors);

  if (confirmPassword !== newPassword) {
    pushPasswordResetError(
      errors,
      "confirmPassword",
      "Passwords must match.",
    );
  }

  if (Object.values(errors).some((value) => (value?.length ?? 0) > 0)) {
    return {
      errors,
      message: "Please fix the highlighted fields and try again.",
    };
  }

  try {
    return await completePasswordResetFlow({
      newPassword,
      token,
    });
  } catch (error) {
    console.error("Password reset completion failed.", error);
    return {
      message: getAuthFailureMessage(
        error,
        "We couldn't reset your password right now. Please try again in a moment.",
      ),
    };
  }
}

export async function logout() {
  await deleteSession();
  redirect("/");
}
