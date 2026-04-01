export const userRoles = ["buyer", "renter", "agent", "admin"] as const;

export type UserRole = (typeof userRoles)[number];

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  role: UserRole;
};

export type StoredUser = AuthUser & {
  passwordHash: string;
  passwordSalt: string;
  passwordResetExpiresAt?: string | null;
  passwordResetTokenHash?: string | null;
};

export type SessionPayload = {
  userId: string;
  expiresAt: string;
};

export type AuthFormErrors = {
  confirmPassword?: string[];
  email?: string[];
  name?: string[];
  password?: string[];
  role?: string[];
};

export type AuthFormState = {
  errors?: AuthFormErrors;
  message?: string;
};

export type PropertyFormErrors = {
  bathrooms?: string[];
  bedrooms?: string[];
  cityLabel?: string[];
  description?: string[];
  location?: string[];
  price?: string[];
  status?: string[];
  title?: string[];
  type?: string[];
};

export type PropertyFormState = {
  errors?: PropertyFormErrors;
  message?: string;
};

export type PasswordResetFormErrors = {
  confirmPassword?: string[];
  currentPassword?: string[];
  newPassword?: string[];
};

export type PasswordResetFormState = {
  errors?: PasswordResetFormErrors;
  message?: string;
  successMessage?: string;
};

export type ForgotPasswordFormErrors = {
  email?: string[];
};

export type ForgotPasswordFormState = {
  errors?: ForgotPasswordFormErrors;
  message?: string;
  resetLink?: string;
  successMessage?: string;
};
