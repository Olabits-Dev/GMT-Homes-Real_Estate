"use server";

import { redirect } from "next/navigation";
import {
  createUser,
  findUserByEmail,
  findUserById,
  findUserByPasswordResetTokenHash,
  setUserPasswordResetToken,
  updateUserPassword,
} from "@/lib/auth-store";
import { getSafeRedirectPath, requireUser } from "@/lib/auth";
import { canSendPasswordResetEmails, sendPasswordResetEmail } from "@/lib/mailer";
import { verifyPassword } from "@/lib/passwords";
import {
  buildPasswordResetUrl,
  createPasswordResetExpiry,
  createPasswordResetToken,
  hashPasswordResetToken,
} from "@/lib/password-reset";
import { createSession, deleteSession } from "@/lib/session";
import type {
  AuthFormErrors,
  AuthFormState,
  ForgotPasswordFormErrors,
  ForgotPasswordFormState,
  PasswordResetFormErrors,
  PasswordResetFormState,
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

    if (error.message.includes("DATABASE_URL")) {
      return "This deployment is missing its database configuration. Add DATABASE_URL in Vercel Production and redeploy.";
    }
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

  let userId: string;

  try {
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

    userId = user.id;
    await createSession(user.id);
  } catch (error) {
    console.error("Signup failed.", error);
    return {
      message: getAuthFailureMessage(
        error,
        "We couldn't create your account right now. Please try again in a moment.",
      ),
    };
  }

  if (!userId) {
    return {
      message:
        "We couldn't create your account right now. Please try again in a moment.",
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

  let userId: string | null = null;

  try {
    const user = await findUserByEmail(email);

    if (!user) {
      return {
        message: "We couldn't sign you in with those credentials.",
      };
    }

    if (!(await verifyPassword(password, user.passwordSalt, user.passwordHash))) {
      return {
        errors: {
          password: ["Wrong password."],
        },
        message: "Check your password and try again.",
      };
    }

    userId = user.id;
    await createSession(user.id);
  } catch (error) {
    console.error("Login failed.", error);
    return {
      message: getAuthFailureMessage(
        error,
        "We couldn't sign you in right now. Please try again in a moment.",
      ),
    };
  }

  if (!userId) {
    return {
      message:
        "We couldn't sign you in right now. Please try again in a moment.",
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
    const storedUser = await findUserById(user.id);

    if (!storedUser) {
      return {
        message: "We couldn't verify your account right now. Please sign in again.",
      };
    }

    if (
      !(await verifyPassword(
        currentPassword,
        storedUser.passwordSalt,
        storedUser.passwordHash,
      ))
    ) {
      return {
        errors: {
          currentPassword: ["Wrong password."],
        },
        message: "Your current password is incorrect.",
      };
    }

    if (
      await verifyPassword(
        newPassword,
        storedUser.passwordSalt,
        storedUser.passwordHash,
      )
    ) {
      return {
        errors: {
          newPassword: ["Use a password different from your current one."],
        },
        message: "Choose a new password before saving.",
      };
    }

    await updateUserPassword(user.id, newPassword);

    return {
      successMessage: "Your password has been updated successfully.",
    };
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
    const user = await findUserByEmail(email);
    let resetLink: string | undefined;

    if (user) {
      const token = createPasswordResetToken();
      const expiresAt = createPasswordResetExpiry();
      const tokenHash = hashPasswordResetToken(token);

      await setUserPasswordResetToken(
        user.id,
        tokenHash,
        expiresAt.toISOString(),
      );

      resetLink = buildPasswordResetUrl(token);

      if (canSendPasswordResetEmails()) {
        try {
          await sendPasswordResetEmail({
            email: user.email,
            name: user.name,
            resetUrl: resetLink,
          });
          resetLink = undefined;
        } catch (error) {
          console.error("Failed to send password reset email.", error);

          if (process.env.NODE_ENV === "production") {
            resetLink = undefined;
          }
        }
      } else if (process.env.NODE_ENV === "production") {
        resetLink = undefined;
      }
    }

    return {
      resetLink,
      successMessage:
        "If an account with that email exists, password reset instructions have been prepared.",
    };
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
    const user = await findUserByPasswordResetTokenHash(
      hashPasswordResetToken(token),
    );

    if (!user) {
      return {
        message:
          "This password reset link is invalid or has expired. Request a new one and try again.",
      };
    }

    if (
      await verifyPassword(
        newPassword,
        user.passwordSalt,
        user.passwordHash,
      )
    ) {
      return {
        errors: {
          newPassword: ["Use a password different from your current one."],
        },
        message: "Choose a new password before saving.",
      };
    }

    await updateUserPassword(user.id, newPassword);

    return {
      successMessage:
        "Your password has been reset successfully. You can now sign in with your new password.",
    };
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
